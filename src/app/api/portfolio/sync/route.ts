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

    const email = rawEmail ? rawEmail.trim().toLowerCase() : undefined;
    const userId = rawUserId ? rawUserId.trim() : undefined;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diberikan' }, { status: 400 });
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

    const { email: rawEmail, userId: rawUserId, cash, realizedPL, holdings, orders, conditionalOrders, dividends, lastUpdated } = body;

    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : undefined;
    const userId = typeof rawUserId === 'string' ? rawUserId.trim() : undefined;

    if (!email && !userId) {
      return NextResponse.json({ success: false, error: 'Email atau userId wajib diisi' }, { status: 400 });
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    // Ambil data portofolio eksisting untuk mempertahankan saldo & posisi jika payload tidak lengkap
    const currentPortfolio = await getUserPortfolioAsync({ email, userId });

    // Validasi & Sanitasi Batas Finansial:
    // Jika cash tidak valid / tidak disertakan, pertahankan saldo eksisting agar tidak ter-reset ke 100M!
    const sanitizedCash = typeof cash === 'number' && Number.isFinite(cash)
      ? Math.max(0, Math.min(cash, MAX_ALLOWED_CASH))
      : (typeof currentPortfolio?.cash === 'number' ? currentPortfolio.cash : 100_000_000);

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

    let finalHoldings = sanitizedHoldings;

    // 2. Proteksi Saldo Arbitrer:
    // Jika ada portofolio eksisting dan selisih cash melompat naik drastis (> Rp 1 Miliar) tanpa adanya order jual baru,
    // tolak kenaikan saldo liar untuk menjaga integritas kompetisi & simulasi pasar
    let finalCash = sanitizedCash;
    if (currentPortfolio && typeof currentPortfolio.cash === 'number') {
      const cashDelta = sanitizedCash - currentPortfolio.cash;
      if (cashDelta > 1_000_000_000 && sanitizedOrders.length === (currentPortfolio.orders?.length || 0)) {
        finalCash = currentPortfolio.cash; // Pertahankan saldo sah
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
      success: saved,
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
