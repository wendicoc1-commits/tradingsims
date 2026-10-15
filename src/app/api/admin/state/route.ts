import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/server/adminAuth';
import { getTradingAdminState } from '@/lib/server/steyerAdminState';
import {
  approveDeposit,
  rejectDeposit,
  createDepositRequest,
  resetMemberPassword,
  resetMemberAccountToZero,
  deleteMemberAccount,
} from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi administrator diperlukan untuk melihat data ini.' },
        { status: 401 }
      );
    }

    const state = await getTradingAdminState();
    return NextResponse.json(state);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to load trading admin state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Akses ditolak. Sesi administrator diperlukan untuk mengeksekusi aksi ini.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'deposit_approve') {
      const res = await approveDeposit(body.depositId);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === 'deposit_reject') {
      const res = await rejectDeposit(
        body.depositId,
        body.reason || 'Bukti transfer tidak valid atau dana belum masuk'
      );
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === 'deposit_create') {
      const res = await createDepositRequest(
        body.userId,
        Number(body.amount) || 0,
        body.paymentMethod || 'QRIS'
      );
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === 'member_reset_password') {
      const res = await resetMemberPassword(body.userId, body.newPassword);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === 'member_reset_zero') {
      const res = await resetMemberAccountToZero(body.userId);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (action === 'member_delete') {
      const res = await deleteMemberAccount(body.userId);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Mutation error' },
      { status: 500 }
    );
  }
}
