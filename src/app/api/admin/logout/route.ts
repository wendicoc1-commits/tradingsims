import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/server/adminAuth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Sesi administrator berhasil diakhiri.',
  });

  // Hapus cookie sesi admin
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
