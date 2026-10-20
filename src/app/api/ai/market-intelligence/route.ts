import { NextResponse } from 'next/server';
import fallbackIntel from '@/data/live_market_intelligence.json';

const QUANT_BRIDGE_URL = process.env.QUANT_BRIDGE_URL || 'http://127.0.0.1:8002';
const QUANT_BRIDGE_SECRET = process.env.QUANT_BRIDGE_SECRET || 'tradesim_quant_sec_7f9e1d82ab';

export async function GET() {
  try {
    // 1. Coba ambil intel terbaru dari Quant Bridge 24/7 di VPS
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
      const res = await fetch(`${QUANT_BRIDGE_URL}/api/quant/csuite/latest`, {
        headers: { Authorization: `Bearer ${QUANT_BRIDGE_SECRET}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && data.brief) {
          return NextResponse.json({
            success: true,
            source: 'VPS_QUANT_BRIDGE_24_7',
            brief: data.brief,
          });
        }
      }
    } catch {
      // Fallback ke file data JSON jika bridge belum sinkron
    }

    return NextResponse.json({
      success: true,
      source: 'LOCAL_EDGE_PERSISTENT_INTEL',
      brief: fallbackIntel,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      source: 'STATIC_FALLBACK',
      brief: fallbackIntel,
    });
  }
}
