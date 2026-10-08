import { NextRequest, NextResponse } from 'next/server';
import { registerOrUpdateUser, getUserPortfolio } from '@/lib/server/portfolioStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json({ success: false, error: 'Password minimal 4 karakter' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();
    const user = registerOrUpdateUser(normEmail, password, fullName);
    const portfolio = getUserPortfolio({ userId: user.id, email: normEmail });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'member',
        provider: 'email',
        createdAt: user.createdAt,
      },
      portfolio,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal mendaftar' }, { status: 500 });
  }
}
