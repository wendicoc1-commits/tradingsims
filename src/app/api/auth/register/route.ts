import { NextRequest, NextResponse } from 'next/server';
import { registerOrUpdateUser, getUserPortfolioAsync, getUserByEmailAsync } from '@/lib/server/portfolioStorage';

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
    const existing = await getUserByEmailAsync(normEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email ini sudah terdaftar sebagai Member. Silakan masuk (login) menggunakan password Anda.' },
        { status: 409 }
      );
    }

    const user = registerOrUpdateUser(normEmail, password, fullName);

    // Langsung tulis akun ke Supabase Cloud (public.app_users & public.user_portfolios)
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('app_users').upsert({
          id: user.id,
          email: normEmail,
          password_hash: user.passwordHash,
          full_name: user.fullName,
          role: 'member',
          provider: 'email',
          created_at: user.createdAt,
        }, { onConflict: 'email' });

        await supabase.from('user_portfolios').upsert({
          user_id: user.id,
          email: normEmail,
          cash: 100_000_000,
          realized_pl: 0,
          holdings: [],
          orders: [],
          conditional_orders: [],
          dividends: [],
          last_updated: Date.now(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      } catch (supErr) {
        console.error('[REGISTER SUPABASE WRITE ERROR]', supErr);
      }
    }

    const portfolio = await getUserPortfolioAsync({ userId: user.id, email: normEmail });

    const { attachMemberSessionCookie, createMemberSessionToken } = await import('@/lib/server/userAuth');
    const memberToken = createMemberSessionToken(user.id, normEmail);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'member',
        provider: 'email',
        createdAt: user.createdAt,
      },
      token: memberToken,
      portfolio,
    });

    attachMemberSessionCookie(response, user.id, normEmail);
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Gagal mendaftar' }, { status: 500 });
  }
}
