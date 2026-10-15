import { NextRequest, NextResponse } from 'next/server';
import { submitDepositTicket, getPendingDeposits } from '@/app/admin/actions';
import { verifyAdminSession } from '@/lib/server/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Sesi administrator diperlukan.' }, { status: 401 });
    }

    const deposits = await getPendingDeposits();
    return NextResponse.json({ success: true, deposits });
  } catch (err: any) {
    console.error('[/api/deposits GET error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, userId, userEmail, senderName, senderBank, nominalPay, proofImage, notes } = body;

    const payNum = Number(nominalPay);
    if (!senderName || !payNum || isNaN(payNum) || payNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Data formulir tidak lengkap atau nominal bayar tidak valid' },
        { status: 400 }
      );
    }

    if (payNum < 10000) {
      return NextResponse.json(
        { success: false, error: 'Nominal transfer minimal Rp 10.000' },
        { status: 400 }
      );
    }

    // 🛡️ KALKULASI SERVER-SIDE KETAT (Rasio Resmi 1:100):
    // Setiap Rp 10.000 uang asli = Rp 1.000.000 saldo kas virtual
    // Menolak injeksi angka fiktif virtualCashAmount dari client!
    const multiplier = Math.floor(payNum / 10000);
    const verifiedVirtualCashAmount = multiplier * 1000000;

    const result = await submitDepositTicket({
      ticketId,
      userId,
      userEmail,
      senderName,
      senderBank: senderBank || 'QRIS',
      nominalPay: payNum,
      virtualCashAmount: verifiedVirtualCashAmount,
      proofImage,
      notes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[/api/deposits POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
