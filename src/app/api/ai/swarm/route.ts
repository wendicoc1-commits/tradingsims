import { NextRequest, NextResponse } from 'next/server';
import { runSwarmSimulation, PRESET_SCENARIOS } from '@/lib/hedgefund/swarmSimulationEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'BBCA';
    const scenario = searchParams.get('scenario') || 'rate_hike_50bps';
    const price = searchParams.get('price') ? Number(searchParams.get('price')) : undefined;
    const count = searchParams.get('count') ? Number(searchParams.get('count')) : 50;

    const result = await runSwarmSimulation(symbol, scenario, price, count);

    return NextResponse.json({
      ok: true,
      data: result,
      presets: PRESET_SCENARIOS,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('[API /api/ai/swarm] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Gagal menjalankan simulasi Swarm Intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const symbol = body.symbol || 'BBCA';
    const scenario = body.scenario || body.customScenario || 'rate_hike_50bps';
    const price = typeof body.price === 'number' ? body.price : undefined;
    const count = typeof body.count === 'number' ? Math.min(100, Math.max(20, body.count)) : 50;

    const result = await runSwarmSimulation(symbol, scenario, price, count);

    return NextResponse.json({
      ok: true,
      data: result,
      presets: PRESET_SCENARIOS,
    });
  } catch (err: any) {
    console.error('[API /api/ai/swarm POST] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Gagal menjalankan simulasi Swarm Intelligence' },
      { status: 500 }
    );
  }
}
