import { NextRequest, NextResponse } from 'next/server';
import { resetUserPortfolio, getUserByEmailAsync } from '@/lib/server/portfolioStorage';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Format JSON tidak valid' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined;
    const userId = typeof body.userId === 'string' ? body.userId.trim() : undefined;
    const resetNominal = typeof body.nominal === 'number' && body.nominal >= 0 ? body.nominal : 100_000_000;

    // Proteksi Keamanan: Wajib menyertakan identitas pengguna untuk reset portofolio pribadi.
    // Menolak keras penghapusan masal tanpa target pengguna (Mencegah DoS / Global Data Wipeout).
    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'Identitas pengguna (email atau userId) wajib disertakan untuk melakukan reset.' },
        { status: 400 }
      );
    }

    // 1. Reset di memori & server storage khusus untuk akun ini
    resetUserPortfolio({ email, userId }, resetNominal);

    // 2. Reset di Supabase Cloud (Khusus untuk baris data akun pengguna ini)
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        if (userId) {
          await supabase.from('holdings').delete().eq('user_id', userId);
          await supabase.from('orders').delete().eq('user_id', userId);
          await supabase.from('user_portfolios').update({
            cash: resetNominal,
            realized_pl: 0,
            holdings: [],
            orders: [],
            conditional_orders: [],
            dividends: [],
            last_updated: Date.now(),
            updated_at: new Date().toISOString(),
          }).eq('user_id', userId);
        } else if (email) {
          await supabase.from('user_portfolios').update({
            cash: resetNominal,
            realized_pl: 0,
            holdings: [],
            orders: [],
            conditional_orders: [],
            dividends: [],
            last_updated: Date.now(),
            updated_at: new Date().toISOString(),
          }).eq('email', email);
        }
      } catch (dbErr) {
        console.warn('[RESET API SUPABASE WARN]', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      nominal: resetNominal,
      message: `Portofolio akun ${email || userId} berhasil di-reset kembali ke saldo awal (Kas: Rp ${resetNominal.toLocaleString('id-ID')}).`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses reset portofolio' },
      { status: 500 }
    );
  }
}

// Blokir mutlak request GET untuk mencegah accidental web crawler reset
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed. Gunakan metode POST dengan autentikasi yang valid.' },
    { status: 405 }
  );
}
