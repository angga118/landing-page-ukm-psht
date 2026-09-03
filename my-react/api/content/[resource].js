import { query } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError } from '@ukmpsht/api-lib/helpers';

const allowed = new Set(['hero', 'sejarah', 'pengurus', 'prestasi', 'galeri', 'kontak']);

function getResource(req) {
  if (req.query && req.query.resource) {
    const v = req.query.resource;
    return Array.isArray(v) ? v[0] : v;
  }
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const parts = url.pathname.split('/').filter(Boolean);
    // expect .../api/content/{resource}
    const idx = parts.indexOf('content');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    const resource = getResource(req);
    if (!resource || !allowed.has(resource)) {
      return jsonError(res, 'Endpoint tidak ditemukan', 404);
    }

    if (resource === 'hero') {
      const rows = await query('SELECT id, judul, tagline, foto_background FROM hero ORDER BY id DESC LIMIT 1');
      const row = rows[0];
      if (!row) return jsonSuccess(res, {});
      return jsonSuccess(res, row);
    }
    if (resource === 'sejarah') {
      const rows = await query('SELECT id, konten, foto FROM sejarah ORDER BY id DESC LIMIT 1');
      const row = rows[0];
      if (!row) return jsonSuccess(res, {});
      return jsonSuccess(res, row);
    }
    if (resource === 'pengurus') {
      const rows = await query('SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus ORDER BY urutan ASC, id ASC');
      return jsonSuccess(res, rows);
    }
    if (resource === 'prestasi') {
      const rows = await query('SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi ORDER BY urutan ASC, id ASC');
      return jsonSuccess(res, rows);
    }
    if (resource === 'galeri') {
      const rows = await query('SELECT id, foto, kategori, urutan FROM galeri ORDER BY urutan ASC, id ASC');
      return jsonSuccess(res, rows);
    }
    if (resource === 'kontak') {
      const rows = await query('SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak ORDER BY id DESC LIMIT 1');
      const row = rows[0];
      if (!row) return jsonSuccess(res, {});
      return jsonSuccess(res, row);
    }

    return jsonError(res, 'Endpoint tidak ditemukan', 404);
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
