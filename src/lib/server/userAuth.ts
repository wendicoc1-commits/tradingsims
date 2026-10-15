import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const MEMBER_COOKIE_NAME = 'tradesim_member_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 hari

// Secret internal untuk HMAC signature token member
const EPHEMERAL_USER_SECRET = crypto.randomBytes(32).toString('hex');
const USER_SESSION_SECRET = process.env.USER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || EPHEMERAL_USER_SECRET;

export interface AuthenticatedMember {
  userId: string;
  email: string;
}

/**
 * Membuat token sesi member yang ditandatangani HMAC-SHA256
 * Format: timestamp.userId.email.hmac
 */
export function createMemberSessionToken(userId: string, email: string): string {
  const timestamp = Date.now().toString();
  const cleanEmail = email.trim().toLowerCase();
  const cleanUserId = userId.trim();
  const payload = `${timestamp}.${cleanUserId}.${cleanEmail}`;
  const hmac = crypto.createHmac('sha256', USER_SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

/**
 * Memvalidasi token sesi member secara timing-safe
 */
export function verifyMemberSessionToken(token: string | undefined | null): AuthenticatedMember | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [timestampStr, userId, email, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return null;

  const now = Date.now();
  if (now < timestamp || now - timestamp > SESSION_MAX_AGE_SECONDS * 1000) {
    return null; // Token kedaluwarsa
  }

  const payload = `${timestampStr}.${userId}.${email}`;
  const expectedHmac = crypto.createHmac('sha256', USER_SESSION_SECRET).update(payload).digest('hex');

  const providedBuf = Buffer.from(providedHmac);
  const expectedBuf = Buffer.from(expectedHmac);

  if (providedBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(providedBuf, expectedBuf)) return null;

  return { userId, email };
}

/**
 * Mengambil member yang terotentikasi dari cookie atau Authorization header
 */
export function getAuthenticatedMember(req: NextRequest): AuthenticatedMember | null {
  try {
    // 1. Cek dari Cookie HTTP-only
    const cookieToken = req.cookies.get(MEMBER_COOKIE_NAME)?.value;
    if (cookieToken) {
      const auth = verifyMemberSessionToken(cookieToken);
      if (auth) return auth;
    }

    // 2. Cek dari Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      const auth = verifyMemberSessionToken(bearerToken);
      if (auth) return auth;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Menempelkan cookie sesi member ke NextResponse
 */
export function attachMemberSessionCookie(res: NextResponse, userId: string, email: string): void {
  const token = createMemberSessionToken(userId, email);
  res.cookies.set(MEMBER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

/**
 * Menghapus cookie sesi member saat logout
 */
export function removeMemberSessionCookie(res: NextResponse): void {
  res.cookies.set(MEMBER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
