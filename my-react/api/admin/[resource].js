import { query, execute } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError, getRequestData, getJsonInput } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';
import { saveImage, deleteImage } from '@ukmpsht/api-lib/blob';
import { sniffMime } from '@ukmpsht/api-lib/mime';

const allowed = new Set(['pengurus', 'prestasi', 'galeri']);

function getResource(req) {
  if (req.query && req.query.resource) {
    const v = req.query.resource;
    return Array.isArray(v) ? v[0] : v;
  }
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const parts = url.pathname.split('/').filter(Boolean);
    // /api/admin/{resource}
    const idx = parts.indexOf('admin');
    if (idx >= 0 && parts[idx + 1]) {
      const r = parts[idx + 1];
      if (allowed.has(r)) return r;
    }
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

async function normalizeRequest(req) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('multipart/form-data')) {
    const result = await getRequestData(req);
    return { fields: result.fields || {}, files: result.files || {} };
  }
  if (ct.includes('application/json')) {
    const data = await getJsonInput(req);
    return { fields: data, files: {} };
  }
  if (ct.includes('application/x-www-form-urlencoded')) {
    const data = await getRequestData(req);
    const fields = data && data.fields ? data.fields : data;
    return { fields: fields || {}, files: {} };
  }
  try {
    const data = await getJsonInput(req);
    if (data && Object.keys(data).length) return { fields: data, files: {} };
  } catch {}
  try {
    const alt = await getRequestData(req);
    if (alt && alt.fields) return { fields: alt.fields, files: alt.files || {} };
    if (alt && typeof alt === 'object') return { fields: alt, files: {} };
  } catch {}
  return { fields: {}, files: {} };
}

export default async function handler(req, res) {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const resource = getResource(req);
    if (!resource || !allowed.has(resource)) {
      return jsonError(res, 'Endpoint tidak ditemukan', 404);
    }

    // GET list
    if (req.method === 'GET') {
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
    }

    if (req.method === 'POST') {
      const { fields, files } = await normalizeRequest(req);
      const idRaw = fields.id;
      const id = idRaw !== undefined && idRaw !== '' && idRaw !== null ? parseInt(idRaw, 10) : null;
      const hasId = id !== null && !isNaN(id) && id > 0;

      if (resource === 'pengurus') {
        const nama = (fields.nama ?? '').toString().trim();
        const jabatan = (fields.jabatan ?? '').toString().trim();
        const periode = (fields.periode ?? '').toString().trim();
        const errors = {};
        if (nama === '') errors.nama = 'Nama wajib diisi';
        if (jabatan === '') errors.jabatan = 'Jabatan wajib diisi';
        if (Object.keys(errors).length) return jsonError(res, 'Validasi gagal', 422, errors);

        let fotoUrl = null;
        if (files['foto'] && files['foto'].buffer && files['foto'].buffer.length > 0) {
          const buf = files['foto'].buffer;
          if (files['foto'].truncated || buf.length > 2 * 1024 * 1024) {
            return jsonError(res, 'Validasi gagal', 422, { foto: 'Ukuran file maksimal 2MB' });
          }
          const mime = sniffMime(buf);
          if (!mime) return jsonError(res, 'Validasi gagal', 422, { foto: 'Format harus JPG, PNG, atau WebP' });
          const saved = await saveImage(buf, mime, 'pengurus');
          fotoUrl = saved.url;
        }

        if (hasId) {
          const oldRows = await query('SELECT foto FROM pengurus WHERE id=?', [id]);
          const old = oldRows[0];
          if (!old) return jsonError(res, 'Data tidak ditemukan', 404);
          const newFoto = fotoUrl ?? old.foto;
          if (fotoUrl !== null && old.foto && old.foto !== newFoto) {
            await deleteImage(old.foto);
          }
          await execute('UPDATE pengurus SET nama=?, jabatan=?, foto=?, periode=? WHERE id=?', [nama, jabatan, newFoto, periode, id]);
          const rows = await query('SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus WHERE id=?', [id]);
          return jsonSuccess(res, rows[0]);
        } else {
          const nxtRows = await query('SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM pengurus');
          const nxt = Number(nxtRows[0].nxt);
          const result = await execute('INSERT INTO pengurus (nama, jabatan, foto, periode, urutan) VALUES (?,?,?,?,?)', [nama, jabatan, fotoUrl ?? '', periode, nxt]);
          const newId = result.insertId;
          const rows = await query('SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus WHERE id=?', [newId]);
          return jsonSuccess(res, rows[0]);
        }
      }

      if (resource === 'prestasi') {
        const nama_lomba = (fields.nama_lomba ?? '').toString().trim();
        const tingkat = (fields.tingkat ?? '').toString().trim();
        const tahun = (fields.tahun ?? '').toString().trim();
        const errors = {};
        if (nama_lomba === '') errors.nama_lomba = 'Nama lomba wajib diisi';
        if (tingkat === '') errors.tingkat = 'Tingkat wajib diisi';
        if (tahun === '') errors.tahun = 'Tahun wajib diisi';
        else if (!/^\d{4}$/.test(tahun)) errors.tahun = 'Tahun harus 4 digit';
        if (Object.keys(errors).length) return jsonError(res, 'Validasi gagal', 422, errors);

        let fotoUrl = null;
        if (files['foto'] && files['foto'].buffer && files['foto'].buffer.length > 0) {
          const buf = files['foto'].buffer;
          if (files['foto'].truncated || buf.length > 2 * 1024 * 1024) {
            return jsonError(res, 'Validasi gagal', 422, { foto: 'Ukuran file maksimal 2MB' });
          }
          const mime = sniffMime(buf);
          if (!mime) return jsonError(res, 'Validasi gagal', 422, { foto: 'Format harus JPG, PNG, atau WebP' });
          const saved = await saveImage(buf, mime, 'prestasi');
          fotoUrl = saved.url;
        }

        if (hasId) {
          const oldRows = await query('SELECT foto FROM prestasi WHERE id=?', [id]);
          const old = oldRows[0];
          if (!old) return jsonError(res, 'Data tidak ditemukan', 404);
          const newFoto = fotoUrl ?? old.foto;
          if (fotoUrl !== null && old.foto && old.foto !== newFoto) {
            await deleteImage(old.foto);
          }
          await execute('UPDATE prestasi SET nama_lomba=?, tingkat=?, tahun=?, foto=? WHERE id=?', [nama_lomba, tingkat, tahun, newFoto, id]);
          const rows = await query('SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi WHERE id=?', [id]);
          return jsonSuccess(res, rows[0]);
        } else {
          const nxtRows = await query('SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM prestasi');
          const nxt = Number(nxtRows[0].nxt);
          const result = await execute('INSERT INTO prestasi (nama_lomba, tingkat, tahun, foto, urutan) VALUES (?,?,?,?,?)', [nama_lomba, tingkat, tahun, fotoUrl ?? '', nxt]);
          const newId = result.insertId;
          const rows = await query('SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi WHERE id=?', [newId]);
          return jsonSuccess(res, rows[0]);
        }
      }

      if (resource === 'galeri') {
        const kategori = (fields.kategori ?? '').toString().trim();
        let fotoUrl = null;
        if (files['foto'] && files['foto'].buffer && files['foto'].buffer.length > 0) {
          const buf = files['foto'].buffer;
          if (files['foto'].truncated || buf.length > 2 * 1024 * 1024) {
            return jsonError(res, 'Validasi gagal', 422, { foto: 'Ukuran file maksimal 2MB' });
          }
          const mime = sniffMime(buf);
          if (!mime) return jsonError(res, 'Validasi gagal', 422, { foto: 'Format harus JPG, PNG, atau WebP' });
          const saved = await saveImage(buf, mime, 'galeri');
          fotoUrl = saved.url;
        }

        if (hasId) {
          const oldRows = await query('SELECT foto FROM galeri WHERE id=?', [id]);
          const old = oldRows[0];
          if (!old) return jsonError(res, 'Data tidak ditemukan', 404);
          const newFoto = fotoUrl ?? old.foto;
          if (fotoUrl !== null && old.foto && old.foto !== newFoto) {
            await deleteImage(old.foto);
          }
          if (!newFoto) return jsonError(res, 'Validasi gagal', 422, { foto: 'Foto wajib diisi' });
          await execute('UPDATE galeri SET foto=?, kategori=? WHERE id=?', [newFoto, kategori, id]);
          const rows = await query('SELECT id, foto, kategori, urutan FROM galeri WHERE id=?', [id]);
          return jsonSuccess(res, rows[0]);
        } else {
          if (fotoUrl === null) return jsonError(res, 'Validasi gagal', 422, { foto: 'Foto wajib diisi' });
          const nxtRows = await query('SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM galeri');
          const nxt = Number(nxtRows[0].nxt);
          const result = await execute('INSERT INTO galeri (foto, kategori, urutan) VALUES (?,?,?)', [fotoUrl, kategori, nxt]);
          const newId = result.insertId;
          const rows = await query('SELECT id, foto, kategori, urutan FROM galeri WHERE id=?', [newId]);
          return jsonSuccess(res, rows[0]);
        }
      }
    }

    return jsonError(res, 'Endpoint tidak ditemukan', 404);
  } catch (e) {
    console.error(e);
    if (e.code === 'BLOB_NOT_CONFIGURED') {
      return jsonError(res, 'Penyimpanan gambar belum dikonfigurasi (Vercel Blob)', 500);
    }
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
