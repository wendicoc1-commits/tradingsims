import { NextResponse } from 'next/server';
import { getTransaction, markTransactionPaid } from '@/lib/payment/paymentRepository';
import { getMidtransConfig } from '@/lib/payment/midtransService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const config = getMidtransConfig();
    // Proteksi: Larang simulasi pembayaran jika berada di lingkungan Production
    if (process.env.NODE_ENV === 'production' || config.isProduction) {
      return NextResponse.json(
        { error: 'Simulasi tidak diizinkan di mode Production. Harap selesaikan pembayaran via QRIS resmi.' },
        { status: 403 }
      );
    }

    const record = getTransaction(orderId);
    if (!record) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updated = markTransactionPaid(orderId, {
      transaction_status: 'settlement',
      simulator_trigger: true,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Simulasi pembayaran Sandbox berhasil diselesaikan.',
      record: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memproses simulasi pembayaran' }, { status: 500 });
  }
}
