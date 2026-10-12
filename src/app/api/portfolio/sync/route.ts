import { NextRequest, NextResponse } from 'next/server';
import {
  saveUserPortfolio,
  getUserPortfolioAsync,
  resetUserPortfolio,
  getUserByEmailAsync,
  registerOrUpdateUser
} from '@/lib/server/portfolioStorage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ALLOWED_CASH = 100_000_000_000; // Maksimal Rp 100 Miliar untuk mencegah overflow/injeksi angka ekstrim

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawEmail = searchParams.get('email');
    const rawUserId = searchParams.get('userId');

    let email = rawEmail ? rawEmail.trim().toLowerCase() : undefined;
    const userId = rawUserId ? rawUserId.trim() : undefined;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diberikan' }, { status: 400 });
    }

    if (email && !email.includes('@')) {
      email = `${email}@tradingsims.my.id`;
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    const portfolio = await getUserPortfolioAsync({ email, userId });

    return NextResponse.json({
      success: true,
      portfolio: portfolio || null,
      isNew: !portfolio,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data portofolio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
    }

    const {
      email: rawEmail,
      userId: rawUserId,
      cash,
      realizedPL,
      holdings,
      orders,
      conditionalOrders,
      dividends,
      lastUpdated
    } = body || {};

    let email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : undefined;
    const userId = typeof rawUserId === 'string' ? rawUserId.trim() : (email ? `usr-${email.replace(/[^a-z0-9]/g, '')}` : undefined);

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diisi' }, { status: 400 });
    }

    if (email && !email.includes('@')) {
      email = `${email}@tradingsims.my.id`;
    }

    // Ambil data portofolio eksisting untuk mempertahankan saldo & posisi jika payload tidak lengkap
    const currentPortfolio = await getUserPortfolioAsync({ email, userId });

    // Validasi & Sanitasi Batas Finansial:
    const sanitizedCash = typeof cash === 'number' && Number.isFinite(cash)
      ? Math.max(0, Math.min(cash, MAX_ALLOWED_CASH))
      : (typeof currentPortfolio?.cash === 'number' ? currentPortfolio.cash : 0);

    const sanitizedRealizedPL = typeof realizedPL === 'number' && Number.isFinite(realizedPL)
      ? realizedPL
      : (typeof currentPortfolio?.realizedPL === 'number' ? currentPortfolio.realizedPL : 0);

    // Batasi ukuran array untuk mencegah serangan Denial of Service (Payload Bloat)
    const sanitizedHoldings = Array.isArray(holdings)
      ? holdings.slice(0, 300)
      : (Array.isArray(currentPortfolio?.holdings) ? currentPortfolio.holdings : []);
    const sanitizedOrders = Array.isArray(orders)
      ? orders.slice(0, 500)
      : (Array.isArray(currentPortfolio?.orders) ? currentPortfolio.orders : []);
    const sanitizedConditional = Array.isArray(conditionalOrders)
      ? conditionalOrders.slice(0, 100)
      : (Array.isArray(currentPortfolio?.conditionalOrders) ? currentPortfolio.conditionalOrders : []);
    const sanitizedDividends = Array.isArray(dividends)
      ? dividends.slice(0, 200)
      : (Array.isArray(currentPortfolio?.dividends) ? currentPortfolio.dividends : []);

    if (email) {
      const existing = await getUserByEmailAsync(email);
      if (!existing) {
        registerOrUpdateUser(email, undefined, email.split('@')[0]);
      }
    }

    const finalHoldings = sanitizedHoldings;
    const finalCash = sanitizedCash;

    // 1. Simpan langsung ke Supabase Cloud (public.app_users dan public.user_portfolios)
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    const supabase = getSupabaseServerClient();
    if (supabase && email) {
      try {
        const updatedAtIso = new Date().toISOString();
        const effectiveUserId = userId || `usr-${email.replace(/[^a-z0-9]/g, '')}`;

        // A. Pastikan user tersimpan di public.app_users
        await supabase.from('app_users').upsert({
          id: effectiveUserId,
          email: email.toLowerCase(),
          full_name: email.split('@')[0],
          role: 'member',
          provider: 'email',
          password_hash: 'synced_session',
          created_at: updatedAtIso,
        }, { onConflict: 'email' });

        // B. Simpan data portofolio ke public.user_portfolios
        await supabase.from('user_portfolios').upsert({
          user_id: effectiveUserId,
          email: email.toLowerCase(),
          cash: finalCash,
          realized_pl: sanitizedRealizedPL,
          holdings: finalHoldings,
          orders: sanitizedOrders,
          conditional_orders: sanitizedConditional,
          dividends: sanitizedDividends,
          last_updated: typeof lastUpdated === 'number' ? lastUpdated : Date.now(),
          updated_at: updatedAtIso,
        }, { onConflict: 'user_id' });
      } catch (cloudErr) {
        console.error('[SUPABASE DIRECT UPSERT ERROR]', cloudErr);
      }
    }

    const saved = saveUserPortfolio(
      { email, userId },
      {
        cash: finalCash,
        realizedPL: sanitizedRealizedPL,
        holdings: finalHoldings,
        orders: sanitizedOrders,
        conditionalOrders: sanitizedConditional,
        dividends: sanitizedDividends,
        lastUpdated: typeof lastUpdated === 'number' ? lastUpdated : Date.now(),
      }
    );

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui portofolio' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wipeAll = searchParams.get('wipeAll') === 'true';

    if (wipeAll) {
      const { wipeAllAccountsAndPortfolios } = await import('@/lib/server/portfolioStorage');
      const result = await wipeAllAccountsAndPortfolios();
      return NextResponse.json({
        success: true,
        wiped: true,
        result,
        timestamp: Date.now(),
      });
    }

    const rawEmail = searchParams.get('email');
    const rawUserId = searchParams.get('userId');

    const email = rawEmail ? rawEmail.trim().toLowerCase() : undefined;
    const userId = rawUserId ? rawUserId.trim() : undefined;

    const nominalParam = parseInt(searchParams.get('nominal') || '0', 10);
    const nominal = Number.isFinite(nominalParam) && nominalParam >= 0 && nominalParam <= MAX_ALLOWED_CASH
      ? nominalParam
      : 0;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diisi' }, { status: 400 });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    const reset = resetUserPortfolio({ email, userId }, nominal);
    return NextResponse.json({
      success: reset,
      cash: nominal,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Gagal mereset portofolio' }, { status: 500 });
  }
}
