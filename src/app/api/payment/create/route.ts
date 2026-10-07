import { NextResponse } from 'next/server';
import { createQrisTransaction, getMidtransConfig } from '@/lib/payment/midtransService';
import { saveTransaction } from '@/lib/payment/paymentRepository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nominalIDR = parseInt(body.nominalIDR, 10);

    if (isNaN(nominalIDR) || nominalIDR < 10000) {
      return NextResponse.json(
        { error: 'Nominal pembayaran minimal Rp 10.000.' },
        { status: 400 }
      );
    }

    const multiplier = Math.floor(nominalIDR / 10000);
    const virtualCashAmount = multiplier * 1000000;

    const orderId = `TRD-QRS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const qrisRes = await createQrisTransaction({
      orderId,
      grossAmount: nominalIDR,
      customerName: body.customerName || 'Member TradingSims',
    });

    if (!qrisRes.success) {
      return NextResponse.json(
        { error: qrisRes.message || 'Gagal membuat QRIS Midtrans.' },
        { status: 500 }
      );
    }

    // Simpan ke repository
    saveTransaction({
      orderId,
      grossAmount: nominalIDR,
      virtualCashAmount,
      status: 'PENDING',
      paymentType: 'qris',
      qrString: qrisRes.qrString,
      qrImageUrl: qrisRes.qrImageUrl,
      createdAt: new Date().toISOString(),
      expiresAt: qrisRes.expiresAt,
    });

    const config = getMidtransConfig();

    return NextResponse.json({
      success: true,
      orderId,
      grossAmount: nominalIDR,
      virtualCashAmount,
      qrString: qrisRes.qrString,
      qrImageUrl: qrisRes.qrImageUrl,
      expiresAt: qrisRes.expiresAt,
      isConfigured: !!config.serverKey,
      isSimulator: qrisRes.isSimulator,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
