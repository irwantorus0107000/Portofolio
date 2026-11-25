import { NextResponse } from 'next/server';
import { createSession, getAdminPassword, isSameOrigin, passwordsMatch, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/admin-auth.mjs';

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Asal permintaan tidak diizinkan.' }, { status: 403 });
  }
  const password = getAdminPassword();
  if (!password) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD harus dikonfigurasi minimal 16 karakter di server.' }, { status: 503 });
  }
  const body = await request.json();
  if (!passwordsMatch(body.password, password)) {
    return NextResponse.json({ error: 'Password salah! Coba lagi.' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, createSession(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return response;
}

export async function DELETE(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Asal permintaan tidak diizinkan.' }, { status: 403 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
