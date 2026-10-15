import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'tradesim_admin_session';
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 jam

// Secret internal untuk HMAC signature: Gunakan environment variable.
// Jika tidak dikonfigurasi, gunakan ephemeral secret acak (mencegah attacker memalsukan token via known secret).
const EPHEMERAL_SECRET = crypto.randomBytes(32).toString('hex');
const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || EPHEMERAL_SECRET;

// Kredensial Admin Server-Side
export function getAdminCredentials() {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SECURITY ERROR] ADMIN_PASSWORD belum disetel di server environment variables!');
    }
  }

  return {
    username: (process.env.ADMIN_USER || 'admin').trim(),
    password: configuredPassword || '',
  };
}

/**
 * Verifikasi kredensial admin secara timing-safe untuk mencegah timing attacks
 */
export function verifyAdminCredentials(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  const creds = getAdminCredentials();

  // Wajib memiliki password konfigurasi yang valid (minimal 6 karakter)
  if (!creds.password || creds.password.length < 6) {
    console.error('[SECURITY REJECT] Login admin ditolak: ADMIN_PASSWORD belum disetel dengan aman di environment variables.');
    return false;
  }

  const cleanUser = user.trim().toLowerCase();
  const validUser = creds.username.toLowerCase();
  const altUser = 'admin@tradesim.id';

  const userMatches = cleanUser === validUser || cleanUser === altUser;
  if (!userMatches) return false;

  const passBuffer = Buffer.from(pass);
  const targetBuffer = Buffer.from(creds.password);

  if (passBuffer.length !== targetBuffer.length) {
    // Tetap lakukan komparasi dummy agar durasi eksekusi konstan (mencegah timing attack)
    crypto.timingSafeEqual(passBuffer, passBuffer);
    return false;
  }

  return crypto.timingSafeEqual(passBuffer, targetBuffer);
}

/**
 * Membuat token sesi admin yang ditandatangani HMAC-SHA256
 */
export function createAdminSessionToken(username: string): string {
  const timestamp = Date.now().toString();
  const payload = `${timestamp}.${username}`;
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Memvalidasi keabsahan token sesi admin
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestampStr, username, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) return false;

  // Cek masa kedaluwarsa sesi
  const now = Date.now();
  if (now < timestamp || now - timestamp > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const payload = `${timestampStr}.${username}`;
  const expectedHmac = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex');

  const providedBuf = Buffer.from(providedHmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (providedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Helper untuk mendapatkan cookie store secara aman di Next.js 14, 15, dan 16
 */
async function getSafeCookieStore() {
  try {
    const c = cookies();
    return c instanceof Promise ? await c : c;
  } catch {
    return null;
  }
}

/**
 * Verifikasi sesi admin dari NextRequest atau cookies headers
 */
export async function verifyAdminSession(req?: NextRequest): Promise<boolean> {
  try {
    // 1. Cek dari request cookie langsung jika NextRequest diberikan
    if (req) {
      const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (cookieVal && verifyAdminSessionToken(cookieVal)) {
        return true;
      }

      // Cek header internal x-admin-secret untuk internal cron/jobs jika ada
      const headerSecret = req.headers.get('x-admin-secret');
      if (headerSecret && headerSecret === ADMIN_SECRET) {
        return true;
      }
    }

    // 2. Cek dari cookies() store Next.js
    const cookieStore = await getSafeCookieStore();
    if (cookieStore) {
      const cookieVal = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      if (cookieVal && verifyAdminSessionToken(cookieVal)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Throw error jika pemanggil bukan admin yang sah (digunakan di Server Actions)
 */
export async function requireAdminSession(): Promise<void> {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    throw new Error('Akses Ditolak: Anda harus login sebagai administrator.');
  }
}
