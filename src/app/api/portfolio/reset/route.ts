import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // no body provided
    }

    const resetNominal = typeof body.nominal === 'number' && body.nominal >= 0 ? body.nominal : 100000000;

    // Reset di Supabase jika terkonfigurasi
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      try {
        // Bersihkan seluruh holdings & orders
        await supabase.from('holdings').delete().neq('symbol', 'DUMMY_NEVER_MATCHES');
        await supabase.from('orders').delete().neq('type', 'DUMMY_NEVER_MATCHES');

        // Reset saldo kas pada tabel portfolios
        await supabase.from('portfolios').update({
          cash: resetNominal,
          realized_pl: 0,
          updated_at: new Date().toISOString(),
        }).neq('id', '00000000-0000-0000-0000-000000000000');

        // Reset saldo kas pada tabel users
        await supabase.from('users').update({
          cash_balance: resetNominal,
          updated_at: new Date().toISOString(),
        }).neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err: any) {
        console.error('[RESET API SUPABASE ERROR]', err);
      }
    }

    return NextResponse.json({
      success: true,
      nominal: resetNominal,
      message: `Semua akun dan portofolio berhasil di-reset kembali ke kondisi awal murni (Kas: Rp ${resetNominal.toLocaleString('id-ID')}, 0 Saham, 0 Koin Crypto).`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mereset portofolio' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
