import { NextRequest, NextResponse } from 'next/server';

const PYTHON_AGENT_URL = process.env.PYTHON_AGENT_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = req.nextUrl.searchParams.get('action') || 'analyze';

    const targetEndpoint = action === 'reflect' ? `${PYTHON_AGENT_URL}/api/reflect` : `${PYTHON_AGENT_URL}/api/analyze`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout for LLM

    try {
      const response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `Python Backend Error (${response.status}): ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (err: any) {
      clearTimeout(timeout);
      // Fallback jika backend Python lokal belum dinyalakan
      return NextResponse.json(
        {
          status: 'fallback',
          ticker: body.ticker || 'BBCA',
          message: 'Backend Python OODA Agent belum berjalan di port 8000. Silakan jalankan uvicorn app.main:app.',
          decision: {
            analisis_teknikal: 'Price action berada di rentang konsolidasi 5 hari perdagangan.',
            korelasi_memori: 'Backend offline: Memori ChromaDB tidak dapat diakses secara lokal.',
            keputusan: 'HOLD',
            target_price: 0,
            stop_loss: 0,
            alasan_eksekusi: 'Sistem standby menunggu koneksi server Python.',
          },
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action') || 'status';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${PYTHON_AGENT_URL}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const isOnline = response.ok;
      return NextResponse.json({
        status: isOnline ? 'online' : 'unreachable',
        backendUrl: PYTHON_AGENT_URL,
        timestamp: new Date().toISOString(),
      });
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({
        status: 'offline',
        backendUrl: PYTHON_AGENT_URL,
        message: 'Python Backend Standby at port 8000',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
