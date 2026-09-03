import { query } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError, getJsonInput, getRequestData } from '@ukmpsht/api-lib/helpers';
import { signSession, setSessionCookie } from '@ukmpsht/api-lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }

    let input = {};
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct.includes('multipart/form-data')) {
      const result = await getRequestData(req);
      input = result.fields || {};
    } else {
      input = await getJsonInput(req);
    }

    const username = (input.username ?? '').toString().trim();
    const password = input.password ?? '';

    const errors = {};
    if (username === '') errors.username = 'Username wajib diisi';
    if (password === '' || password == null) errors.password = 'Password wajib diisi';
    if (Object.keys(errors).length) {
      return jsonError(res, 'Validasi gagal', 422, errors);
    }

    let userRow = null;
    try {
      const rows = await query('SELECT id, username, password_hash, role FROM admin_user WHERE username = ? LIMIT 1', [username]);
      userRow = rows[0] || null;
    } catch (e) {
      console.error(e);
      return jsonError(res, 'Terjadi kesalahan server', 500);
    }

    let ok = false;
    if (userRow && userRow.password_hash) {
      let hash = userRow.password_hash;
      // bcryptjs handles $2a$, $2b$ but PHP uses $2y$, convert
      if (hash.startsWith('$2y$')) hash = '$2a$' + hash.slice(4);
      try {
        ok = await bcrypt.compare(password, hash);
      } catch {
        ok = false;
      }
    }

    if (!userRow || !ok) {
      await new Promise((r) => setTimeout(r, 1000));
      return jsonError(res, 'Username atau password salah', 401);
    }

    const user = { id: Number(userRow.id), username: userRow.username, role: userRow.role };
    const token = await signSession(user);
    setSessionCookie(res, token);
    return jsonSuccess(res, { user });
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
