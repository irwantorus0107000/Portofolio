import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import {
  authorizeMutation,
  createSession,
  isValidSession,
  passwordsMatch,
  SESSION_COOKIE,
} from '../src/lib/admin-auth.mjs';
import { isValidContentFilename } from '../src/lib/content-filename.mjs';

const password = 'example-test-password-only';

test('admin sessions reject incorrect passwords, altered tokens, expired tokens and rotated passwords', () => {
  const token = createSession(password);
  assert.equal(passwordsMatch(password, password), true);
  assert.equal(passwordsMatch('incorrect', password), false);
  assert.equal(isValidSession(token, password), true);
  assert.equal(isValidSession(token, 'another-test-password'), false);
  assert.equal(isValidSession(`${token.slice(0, -1)}z`, password), false);
  const payload = `1.${'a'.repeat(64)}`;
  const signature = createHmac('sha256', password).update(payload).digest('hex');
  assert.equal(isValidSession(`${payload}.${signature}`, password), false);
});

test('mutations require same-origin requests and a valid server session', () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  try {
    process.env.ADMIN_PASSWORD = password;
    const request = (origin, token) => ({
      headers: new Headers({ origin }),
      nextUrl: new URL('http://localhost:3000/api/config'),
      cookies: { get: (name) => name === SESSION_COOKIE && token ? { value: token } : undefined },
    });
    const token = createSession(password);
    assert.equal(authorizeMutation(request('http://localhost:3000', null)).status, 401);
    assert.equal(authorizeMutation(request('https://example.com', token)).status, 403);
    assert.equal(authorizeMutation(request('http://localhost:3000', token)), null);
    delete process.env.ADMIN_PASSWORD;
    assert.equal(authorizeMutation(request('http://localhost:3000', token)).status, 503);
  } finally {
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
  }
});

test('content filenames cannot escape the content directory', () => {
  for (const filename of ['kerja-1.md', 'sertifikat_123.md']) {
    assert.equal(isValidContentFilename(filename), true);
  }
  for (const filename of ['../config.json', '..\\config.md', '/tmp/file.md', 'foo/bar.md', 'file.md.txt', '', null]) {
    assert.equal(isValidContentFilename(filename), false);
  }
});
