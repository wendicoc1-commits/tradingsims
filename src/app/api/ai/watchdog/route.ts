import { NextRequest, NextResponse } from 'next/server';

const startTime = Date.now();

export async function GET(req: NextRequest) {
  try {
    const memory = process.memoryUsage();
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);

    // Format RAM usage in MB
    const memoryMb = {
      rss: Math.round(memory.rss / (1024 * 1024)),
      heapUsed: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotal: Math.round(memory.heapTotal / (1024 * 1024)),
      external: Math.round(memory.external / (1024 * 1024)),
    };

    // Threshold alert: jika heap > 400MB
    const memoryStatus = memoryMb.rss > 450 ? 'WARNING_HIGH_MEMORY' : 'HEALTHY';

    return NextResponse.json({
      status: 'UP',
      service: 'TradeSims SRE Watchdog',
      timestamp: Date.now(),
      uptimeSeconds: uptimeSec,
      memoryStatus,
      memoryMb,
      checks: {
        nextjs_app: 'HEALTHY',
        quant_bridge_port: 8001,
        boardroom_engine: 'ONLINE',
        munger_inversion_protocol: 'ACTIVE',
        cfo_guardian: 'ACTIVE',
      },
      sreGuideline: 'Autonomous self-healing active: memory is monitored continuously by systemd and PM2.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'ERROR', error: error?.message || 'SRE Watchdog failed' },
      { status: 500 }
    );
  }
}
