import { query, getPoolInstance } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError, getJsonInput, getRequestData } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';

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
    if (idx >= 0 && parts[idx + 1] && allowed.has(parts[idx + 1])) return parts[idx + 1];
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
  if (data && typeof data === 'object' && 'fields' in data) return data.fields;
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
    let ids = input.ids;

    // Support JSON string for ids if sent as form
    if (typeof ids === 'string') {
      try {
        const decoded = JSON.parse(ids);
        ids = decoded;
      } catch {}
    }

    // Also support if body had ids as string via multipart field JSON
    if (!Array.isArray(ids) || ids.length === 0) {
      return jsonError(res, 'Validasi gagal', 422, { ids: 'ids harus array tidak kosong' });
    }

    const clean = [];
    for (const v of ids) {
      const int = parseInt(v, 10);
      if (!int || int <= 0) {
        return jsonError(res, 'Validasi gagal', 422, { ids: 'ids harus berisi ID valid' });
      }
      clean.push(int);
    }

    const pool = getPoolInstance();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let idx = 0; idx < clean.length; idx++) {
        const id = clean[idx];
        await conn.execute(`UPDATE \`${resource}\` SET urutan=? WHERE id=?`, [idx + 1, id]);
      }
      await conn.commit();
    } catch (e) {
      try {
        await conn.rollback();
      } catch {}
      throw e;
    } finally {
      conn.release();
    }

    let rows;
    if (resource === 'pengurus') {
      rows = await query('SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus ORDER BY urutan ASC, id ASC');
    } else if (resource === 'prestasi') {
      rows = await query('SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi ORDER BY urutan ASC, id ASC');
    } else {
      rows = await query('SELECT id, foto, kategori, urutan FROM galeri ORDER BY urutan ASC, id ASC');
    }
    return jsonSuccess(res, rows);
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
