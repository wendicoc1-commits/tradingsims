import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminCredentials, 
  createAdminSessionToken, 
  verifyAdminSession,
  ADMIN_COOKIE_NAME 
} from '@/lib/server/adminAuth';

// In-Memory Rate Limiter untuk Mencegah Serangan Brute-Force pada Login Admin
interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const LOCKOUT_MS = 15 * 60 * 1000; // Lockout 15 menit jika gagal 5x

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown-ip';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  // Jika akun sedang dikunci sementara
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // Reset window jika waktu sudah lewat
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
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
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

function clearRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function GET(req: NextRequest) {
  const authenticated = await verifyAdminSession(req);
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Terlalu banyak percobaan login gagal. Demi keamanan, akses diblokir selama ${rateLimit.retryAfterSeconds} detik.` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds || 60) }
        }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Format body request tidak valid' }, { status: 400 });
    }

    const { username = '', password = '' } = body;
    const cleanUser = String(username).trim();
    const cleanPass = String(password);

    if (!cleanUser || !cleanPass) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(cleanUser, cleanPass);

    if (!isValid) {
      recordFailedAttempt(ip);
      const remaining = checkRateLimit(ip).remaining;
      return NextResponse.json(
        { 
          success: false, 
          error: `Kredensial tidak valid: Username atau password salah! (Sisa percobaan: ${remaining})` 
        },
        { status: 401 }
      );
    }

    // Sukses: Bersihkan riwayat kegagalan dan buat token sesi aman
    clearRateLimit(ip);
    const sessionToken = createAdminSessionToken(cleanUser);

    const response = NextResponse.json({
      success: true,
      message: 'Autentikasi administrator berhasil diverifikasi.',
    });

    // Pasang HTTP-Only Cookie yang terlindungi dari XSS / manipulasi client
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 jam
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Terjadi kesalahan sistem login' }, { status: 500 });
  }
}
