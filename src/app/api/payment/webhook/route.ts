import { NextResponse } from 'next/server';
import { verifyMidtransSignature } from '@/lib/payment/midtransService';
import { markTransactionPaid, getTransaction } from '@/lib/payment/paymentRepository';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = payload;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // 1. Verifikasi tanda tangan digital Midtrans
    const isValid = verifyMidtransSignature({
      order_id,
      status_code,
      gross_amount,
      signature_key,
    });

    if (!isValid) {
      console.warn(`[MIDTRANS WEBHOOK REJECTED] Invalid signature for order: ${order_id}`);
      return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
    }

    // 2. Evaluasi status transaksi
    // Transaksi sukses di Midtrans jika transaction_status === 'settlement' atau ('capture' && fraud_status === 'accept')
    const isPaid =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && (!fraud_status || fraud_status === 'accept'));

    if (isPaid) {
      const updated = markTransactionPaid(order_id, payload);
      console.log(`[MIDTRANS WEBHOOK SUCCESS] Order ${order_id} marked as PAID. Saldo: +Rp ${updated?.virtualCashAmount}`);
    } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
      const existing = getTransaction(order_id);
      if (existing) existing.status = 'EXPIRED';
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Webhook processed successfully',
    });
  } catch (err: any) {
    console.error('[MIDTRANS WEBHOOK ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
