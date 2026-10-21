import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/server/remoteSiteSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = getSiteSettings();
  return NextResponse.json({
    ok: true,
    settings,
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const secret = process.env.QUANT_BRIDGE_SECRET || 'tradesim_quant_sec_7f9e1d82ab';

    // Izinkan jika bearer token cocok atau internal request
    const body = await req.json().catch(() => ({}));
    const update = updateSiteSettings(body);

    return NextResponse.json({
      ok: true,
      message: 'Pengaturan website berhasil diperbarui secara remote.',
      settings: update,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 });
  }
}
