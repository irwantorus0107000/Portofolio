import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'portfolio_admin';
export const SESSION_SECONDS = 8 * 60 * 60;

export function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length >= 16 ? password : null;
}

export function passwordsMatch(candidate, password) {
  if (typeof candidate !== 'string') return false;
  const hash = (value) => createHash('sha256').update(value, 'utf8').digest();
  return timingSafeEqual(hash(candidate), hash(password));
}

function sign(payload, password) {
  return createHmac('sha256', password).update(payload).digest('hex');
}

export function createSession(password) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${expires}.${randomBytes(32).toString('hex')}`;
  return `${payload}.${sign(payload, password)}`;
}

export function isValidSession(token, password) {
  if (typeof token !== 'string' || !password) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{64}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const expires = Number(parts[0]);
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(`${parts[0]}.${parts[1]}`, password), 'hex');
  return timingSafeEqual(expected, Buffer.from(parts[2], 'hex'));
}

export function isSameOrigin(request) {
  return request.headers.get('origin') === request.nextUrl.origin;
}

export function authorizeMutation(request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: 'Asal permintaan tidak diizinkan.' }, { status: 403 });
  }
  const password = getAdminPassword();
  if (!password) {
    return Response.json({ error: 'ADMIN_PASSWORD belum dikonfigurasi dengan aman.' }, { status: 503 });
  }
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value, password)) {
    return Response.json({ error: 'Silakan masuk sebagai admin.' }, { status: 401 });
  }
  return null;
}
