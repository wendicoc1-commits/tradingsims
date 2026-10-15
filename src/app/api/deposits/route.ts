import { NextRequest, NextResponse } from 'next/server';
import { submitDepositTicket, getPendingDeposits } from '@/app/admin/actions';
import { verifyAdminSession } from '@/lib/server/adminAuth';

export const dynamic = 'force-dynamic';

// Rate Limiter In-Memory: Maksimal 5 pengajuan tiket per 10 menit per IP
const depositRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkDepositRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = depositRateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    depositRateLimitMap.set(ip, { count: 1, resetTime: now + 10 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count += 1;
  return true;
}

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
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown-client';
    if (!checkDepositRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak pengajuan tiket deposit. Demi keamanan antrean, coba lagi dalam beberapa menit.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
    }

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

    // Maksimal nominal per transaksi 10 Miliar untuk mencegah overflow integer
    if (payNum > 10_000_000_000) {
      return NextResponse.json(
        { success: false, error: 'Nominal melebihi batas transaksi maksimal.' },
        { status: 400 }
      );
    }

    // Batasi ukuran bukti transfer (maksimal ~5MB base64 string)
    if (typeof proofImage === 'string' && proofImage.length > 7_000_000) {
      return NextResponse.json(
        { success: false, error: 'Ukuran foto bukti transfer terlalu besar. Maksimal 5MB.' },
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
      userId: typeof userId === 'string' ? userId.trim() : undefined,
      userEmail: typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : undefined,
      senderName: String(senderName).trim().slice(0, 100),
      senderBank: String(senderBank || 'QRIS').trim().slice(0, 50),
      nominalPay: payNum,
      virtualCashAmount: verifiedVirtualCashAmount,
      proofImage,
      notes: typeof notes === 'string' ? notes.trim().slice(0, 500) : undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[/api/deposits POST error]', err);
    return NextResponse.json({ success: false, error: err?.message || 'Gagal memproses tiket deposit' }, { status: 500 });
  }
}
