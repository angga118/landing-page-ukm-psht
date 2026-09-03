import { SignJWT, jwtVerify } from 'jose';
import { jsonError } from './helpers.js';

const COOKIE_NAME = 'psht_session';
const MAX_AGE = 60 * 60 * 24; // 24h

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function signSession(user) {
  const secret = getSecret();
  const token = await new SignJWT({ id: user.id, username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  return token;
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

function buildCookie(token, opts = {}) {
  const secureFlag = process.env.VERCEL ? '; Secure' : '';
  const maxAgePart = opts.clear ? '; Max-Age=0' : `; Max-Age=${MAX_AGE}`;
  const expiresPart = opts.clear ? '; Expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
  // HttpOnly, Path=/, SameSite=Lax
  return `${COOKIE_NAME}=${token}${maxAgePart}${expiresPart}; Path=/; HttpOnly; SameSite=Lax${secureFlag}`;
}

export function setSessionCookie(res, token) {
  const cookie = buildCookie(token, { clear: false });
  const prev = res.getHeader ? res.getHeader('Set-Cookie') : null;
  if (prev) {
    if (Array.isArray(prev)) {
      res.setHeader('Set-Cookie', [...prev, cookie]);
    } else {
      res.setHeader('Set-Cookie', [prev, cookie]);
    }
  } else {
    res.setHeader('Set-Cookie', cookie);
  }
}

export function clearSessionCookie(res) {
  const cookie = buildCookie('', { clear: true });
  const prev = res.getHeader ? res.getHeader('Set-Cookie') : null;
  if (prev) {
    if (Array.isArray(prev)) {
      res.setHeader('Set-Cookie', [...prev, cookie]);
    } else {
      res.setHeader('Set-Cookie', [prev, cookie]);
    }
  } else {
    res.setHeader('Set-Cookie', cookie);
  }
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx < 0) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

export async function requireAuth(req, res) {
  const cookieHeader = req.headers.cookie || req.headers.Cookie || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    jsonError(res, 'Unauthorized', 401);
    return null;
  }
  const payload = await verifySession(token);
  if (!payload) {
    jsonError(res, 'Unauthorized', 401);
    return null;
  }
  return payload;
}
