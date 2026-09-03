import { query, execute } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError, getRequestData, getJsonInput } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';
import { deleteImage } from '@ukmpsht/api-lib/blob';

const allowed = new Set(['pengurus', 'prestasi', 'galeri']);

function getResource(req) {
  if (req.query && req.query.resource) {
    const v = req.query.resource;
    return Array.isArray(v) ? v[0] : v;
  }
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('admin');
    if (idx >= 0 && parts[idx + 1]) {
      const r = parts[idx + 1];
      if (allowed.has(r)) return r;
    }
    return null;
  } catch {
    return null;
  }
}

async function getInput(req) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('application/json')) {
    return await getJsonInput(req);
  }
  const data = await getRequestData(req);
  if (data && typeof data === 'object' && 'fields' in data) {
    return data.fields;
  }
  return data || {};
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    const user = await requireAuth(req, res);
    if (!user) return;

    const resource = getResource(req);
    if (!resource || !allowed.has(resource)) {
      return jsonError(res, 'Endpoint tidak ditemukan', 404);
    }

    const input = await getInput(req);
    // also fallback to req.body if still empty (guard: req.body is a throwing getter on Vercel)
    let id = input.id;
    let body;
    try { body = req.body; } catch { body = undefined; }
    if ((id === undefined || id === '') && body && typeof body === 'object' && body.id !== undefined) {
      id = body.id;
    }
    const intId = parseInt(id, 10);
    if (!intId || intId <= 0) {
      return jsonError(res, 'Validasi gagal', 422, { id: 'ID wajib diisi' });
    }

    const rows = await query(`SELECT foto FROM \`${resource}\` WHERE id=?`, [intId]);
    const row = rows[0];
    if (!row) return jsonError(res, 'Data tidak ditemukan', 404);

    if (row.foto) {
      await deleteImage(row.foto);
    }
    await execute(`DELETE FROM \`${resource}\` WHERE id=?`, [intId]);
    return jsonSuccess(res, { ok: true });
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
