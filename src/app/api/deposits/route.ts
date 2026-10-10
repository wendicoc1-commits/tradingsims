import { NextRequest, NextResponse } from 'next/server';
import { submitDepositTicket, getPendingDeposits } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
    const { userId, userEmail, senderName, senderBank, nominalPay, virtualCashAmount, proofImage, notes } = body;

    if (!senderName || !nominalPay || !virtualCashAmount) {
      return NextResponse.json(
        { success: false, error: 'Data formulir tidak lengkap' },
        { status: 400 }
      );
    }

    const result = await submitDepositTicket({
      userId,
      userEmail,
      senderName,
      senderBank: senderBank || 'QRIS',
      nominalPay: Number(nominalPay),
      virtualCashAmount: Number(virtualCashAmount),
      proofImage,
      notes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[/api/deposits POST error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
