import { NextResponse } from 'next/server';
import { getTransaction, markTransactionPaid } from '@/lib/payment/paymentRepository';
import { queryMidtransStatus, getMidtransConfig } from '@/lib/payment/midtransService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId parameter is required' }, { status: 400 });
    }

    let record = getTransaction(orderId);

    if (!record) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const config = getMidtransConfig();

    // Jika masih pending dan Server Key Midtrans ada, lakukan verifikasi langsung ke server Midtrans (Active Re-check)
    if (record.status === 'PENDING' && config.serverKey) {
      const midtransData = await queryMidtransStatus(orderId);
      const isSettled =
        midtransData.transactionStatus === 'settlement' ||
        (midtransData.transactionStatus === 'capture' && midtransData.fraudStatus === 'accept');

      if (isSettled) {
        record = markTransactionPaid(orderId, midtransData.raw);
      } else if (midtransData.transactionStatus === 'expire' || midtransData.transactionStatus === 'cancel') {
        record.status = 'EXPIRED';
      }
    }

    return NextResponse.json({
      orderId: record.orderId,
      status: record.status, // 'PENDING' | 'PAID' | 'EXPIRED'
      grossAmount: record.grossAmount,
      virtualCashAmount: record.virtualCashAmount,
      paidAt: record.paidAt || null,
      expiresAt: record.expiresAt,
      isConfigured: !!config.serverKey,
      isProduction: config.isProduction,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
