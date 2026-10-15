import { NextRequest, NextResponse } from 'next/server';
import {
  verifyUserPasswordAsync,
  registerOrUpdateUser,
  getUserPortfolioAsync,
  getUserByEmailAsync
} from '@/lib/server/portfolioStorage';

// Rate Limiter Sederhana In-Memory untuk Login Member
interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const memberLoginAttempts = new Map<string, LoginAttempt>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown-ip';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = memberLoginAttempts.get(ip);
  if (!record) return { allowed: true, remaining: MAX_ATTEMPTS };

  if (record.lockedUntil && now < record.lockedUntil) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    memberLoginAttempts.delete(ip);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = memberLoginAttempts.get(ip);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    memberLoginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

function clearRateLimit(ip: string) {
  memberLoginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: `Terlalu banyak percobaan login gagal. Demi keamanan akun, coba lagi dalam ${rateLimit.retryAfterSeconds} detik.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds || 60) } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Password wajib diisi' }, { status: 400 });
    }

    const normEmail = email.trim().toLowerCase();
    const existing = await getUserByEmailAsync(normEmail);
    let authUser: any = null;

    if (!existing) {
      const existingPortfolio = await getUserPortfolioAsync({ email: normEmail });
      if (existingPortfolio) {
        // Portofolio dari sinkronisasi perangkat sudah ada, daftarkan akun sekarang dengan password yang diinput
        authUser = registerOrUpdateUser(normEmail, password, normEmail.split('@')[0]);
      } else {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { success: false, error: 'Akun dengan email ini belum terdaftar. Silakan pilih tab "Daftar Akun Baru" terlebih dahulu.' },
          { status: 404 }
        );
      }
    } else {
      const verify = await verifyUserPasswordAsync(normEmail, password);
      if (!verify.valid || !verify.user) {
        recordFailedAttempt(ip);
        const rem = checkRateLimit(ip).remaining;
        return NextResponse.json(
          { success: false, error: `Password yang Anda masukkan salah. (Sisa percobaan: ${rem}). Jika lupa password, gunakan tab Ubah Password.` },
          { status: 401 }
        );
      }
      authUser = verify.user;
    }

    // Login sukses: hapus counter kegagalan
    clearRateLimit(ip);

    // Ambil portofolio tersimpan di cloud Supabase atau server
    const portfolio = await getUserPortfolioAsync({ userId: authUser?.id, email: normEmail });

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
