import { NextRequest, NextResponse } from 'next/server';
import { changeUserPasswordAsync, getUserByEmailAsync, getUserPortfolioAsync } from '@/lib/server/portfolioStorage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, confirmPassword } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normEmail)) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return NextResponse.json({ success: false, error: 'Password baru minimal 4 karakter' }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Konfirmasi password baru tidak cocok' }, { status: 400 });
    }

    const result = await changeUserPasswordAsync(normEmail, newPassword);
    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui password' }, { status: 500 });
    }

    const portfolio = await getUserPortfolioAsync({ userId: result.user.id, email: normEmail });

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diperbarui! Silakan masuk menggunakan password baru Anda.',
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: 'member',
        provider: 'email',
        createdAt: result.user.createdAt,
      },
      portfolio,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
