import { NextRequest, NextResponse } from 'next/server';
import { verifyUserPassword, registerOrUpdateUser, getUserPortfolio, getUserByEmail } from '@/lib/server/portfolioStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password wajib diisi' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();
    const existing = getUserByEmail(normEmail);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Akun dengan email ini belum terdaftar. Silakan pilih tab "Daftar Akun Baru" terlebih dahulu.' },
        { status: 404 }
      );
    }

    const verify = verifyUserPassword(normEmail, password);
    if (!verify.valid || !verify.user) {
      return NextResponse.json(
        { success: false, error: 'Password yang Anda masukkan salah. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    authUser = verify.user;

    // Ambil portofolio tersimpan di server
    const portfolio = getUserPortfolio({ userId: authUser?.id, email: normEmail });

    return NextResponse.json({
      success: true,
      user: {
        id: authUser?.id,
        email: authUser?.email,
        fullName: authUser?.fullName,
        role: 'member',
        provider: 'email',
        createdAt: authUser?.createdAt,
      },
      portfolio,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Terjadi kesalahan login' }, { status: 500 });
  }
}
