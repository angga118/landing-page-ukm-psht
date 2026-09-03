import { query, execute } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError, getRequestData, getJsonInput } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';
import { saveImage, deleteImage } from '@ukmpsht/api-lib/blob';
import { sniffMime } from '@ukmpsht/api-lib/mime';

function getType(req) {
  if (req.query && req.query.type) {
    const v = req.query.type;
    return Array.isArray(v) ? v[0] : v;
  }
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1];
  } catch {
    return null;
  }
}

async function normalizeRequest(req) {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('multipart/form-data')) {
    const result = await getRequestData(req);
    // result is {fields, files}
    return { fields: result.fields || {}, files: result.files || {} };
  }
  if (ct.includes('application/json')) {
    const data = await getJsonInput(req);
    return { fields: data, files: {} };
  }
  if (ct.includes('application/x-www-form-urlencoded')) {
    const data = await getRequestData(req);
    // getRequestData returns object for urlencoded
    const fields = data && data.fields ? data.fields : data;
    return { fields: fields || {}, files: {} };
  }
  // fallback try json
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
    if (req.method !== 'POST') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    const user = await requireAuth(req, res);
    if (!user) return;

    const type = getType(req);
    if (!['hero', 'sejarah', 'kontak'].includes(type)) {
      return jsonError(res, 'Endpoint tidak ditemukan', 404);
    }

    const { fields, files } = await normalizeRequest(req);

    if (type === 'hero') {
      const judul = (fields.judul ?? '').toString().trim();
      const tagline = (fields.tagline ?? '').toString().trim();

      let fotoUrl = null;
      let fotoFieldName = null;
      if (files['foto_background'] && files['foto_background'].buffer && files['foto_background'].buffer.length > 0) {
        fotoFieldName = 'foto_background';
        const buf = files['foto_background'].buffer;
        if (files['foto_background'].truncated || buf.length > 2 * 1024 * 1024) {
          return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Ukuran file maksimal 2MB' });
        }
        const mime = sniffMime(buf);
        if (!mime) {
          return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Format harus JPG, PNG, atau WebP' });
        }
        try {
          const saved = await saveImage(buf, mime, 'hero');
          fotoUrl = saved.url;
        } catch (e) {
          if (e.code === 'FILE_TOO_LARGE') return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Ukuran file maksimal 2MB' });
          if (e.code === 'INVALID_MIME') return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Format harus JPG, PNG, atau WebP' });
          throw e;
        }
      } else if (files['foto'] && files['foto'].buffer && files['foto'].buffer.length > 0) {
        fotoFieldName = 'foto';
        const buf = files['foto'].buffer;
        if (files['foto'].truncated || buf.length > 2 * 1024 * 1024) {
          return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Ukuran file maksimal 2MB' });
        }
        const mime = sniffMime(buf);
        if (!mime) {
          return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Format harus JPG, PNG, atau WebP' });
        }
        try {
          const saved = await saveImage(buf, mime, 'hero');
          fotoUrl = saved.url;
        } catch (e) {
          if (e.code === 'FILE_TOO_LARGE') return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Ukuran file maksimal 2MB' });
          if (e.code === 'INVALID_MIME') return jsonError(res, 'Validasi gagal', 422, { [fotoFieldName]: 'Format harus JPG, PNG, atau WebP' });
          throw e;
        }
      }

      const existingRows = await query('SELECT id, foto_background FROM hero ORDER BY id DESC LIMIT 1');
      const existing = existingRows[0];
      if (existing) {
        const oldFoto = existing.foto_background;
        const newFoto = fotoUrl ?? oldFoto;
        if (fotoUrl !== null && oldFoto && oldFoto !== newFoto) {
          await deleteImage(oldFoto);
        }
        const oldRows = await query('SELECT judul, tagline FROM hero WHERE id = ?', [existing.id]);
        const old = oldRows[0] || { judul: '', tagline: '' };
        const finalJudul = judul !== '' ? judul : old.judul;
        const finalTagline = tagline !== '' ? tagline : old.tagline;
        await execute('UPDATE hero SET judul=?, tagline=?, foto_background=? WHERE id=?', [finalJudul, finalTagline, newFoto, existing.id]);
        const rows = await query('SELECT id, judul, tagline, foto_background FROM hero WHERE id=?', [existing.id]);
        return jsonSuccess(res, rows[0]);
      } else {
        const result = await execute('INSERT INTO hero (judul, tagline, foto_background) VALUES (?,?,?)', [judul, tagline, fotoUrl ?? '']);
        const id = result.insertId;
        const rows = await query('SELECT id, judul, tagline, foto_background FROM hero WHERE id=?', [id]);
        return jsonSuccess(res, rows[0]);
      }
    }

    if (type === 'sejarah') {
      const konten = (fields.konten ?? '').toString().trim();
      let fotoUrl = null;
      if (files['foto'] && files['foto'].buffer && files['foto'].buffer.length > 0) {
        const buf = files['foto'].buffer;
        if (files['foto'].truncated || buf.length > 2 * 1024 * 1024) {
          return jsonError(res, 'Validasi gagal', 422, { foto: 'Ukuran file maksimal 2MB' });
        }
        const mime = sniffMime(buf);
        if (!mime) {
          return jsonError(res, 'Validasi gagal', 422, { foto: 'Format harus JPG, PNG, atau WebP' });
        }
        try {
          const saved = await saveImage(buf, mime, 'sejarah');
          fotoUrl = saved.url;
        } catch (e) {
          if (e.code === 'FILE_TOO_LARGE') return jsonError(res, 'Validasi gagal', 422, { foto: 'Ukuran file maksimal 2MB' });
          if (e.code === 'INVALID_MIME') return jsonError(res, 'Validasi gagal', 422, { foto: 'Format harus JPG, PNG, atau WebP' });
          throw e;
        }
      }

      const existingRows = await query('SELECT id, foto FROM sejarah ORDER BY id DESC LIMIT 1');
      const existing = existingRows[0];
      if (existing) {
        const oldFoto = existing.foto;
        const newFoto = fotoUrl ?? oldFoto;
        if (fotoUrl !== null && oldFoto && oldFoto !== newFoto) {
          await deleteImage(oldFoto);
        }
        const oldRows = await query('SELECT konten FROM sejarah WHERE id=?', [existing.id]);
        const old = oldRows[0] || { konten: '' };
        const finalKonten = konten !== '' ? konten : old.konten;
        await execute('UPDATE sejarah SET konten=?, foto=? WHERE id=?', [finalKonten, newFoto, existing.id]);
        const rows = await query('SELECT id, konten, foto FROM sejarah WHERE id=?', [existing.id]);
        return jsonSuccess(res, rows[0]);
      } else {
        const result = await execute('INSERT INTO sejarah (konten, foto) VALUES (?,?)', [konten, fotoUrl ?? '']);
        const id = result.insertId;
        const rows = await query('SELECT id, konten, foto FROM sejarah WHERE id=?', [id]);
        return jsonSuccess(res, rows[0]);
      }
    }

    if (type === 'kontak') {
      const whatsapp = (fields.whatsapp ?? '').toString().trim();
      const email = (fields.email ?? '').toString().trim();
      const alamat = (fields.alamat ?? '').toString().trim();
      const jadwal_latihan = (fields.jadwal_latihan ?? '').toString().trim();
      const instagram = (fields.instagram ?? '').toString().trim();
      const maps_embed = (fields.maps_embed ?? '').toString().trim();

      const existingRows = await query('SELECT id FROM kontak ORDER BY id DESC LIMIT 1');
      const existing = existingRows[0];
      if (existing) {
        await execute('UPDATE kontak SET whatsapp=?, email=?, alamat=?, jadwal_latihan=?, instagram=?, maps_embed=? WHERE id=?', [whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed, existing.id]);
        const rows = await query('SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak WHERE id=?', [existing.id]);
        return jsonSuccess(res, rows[0]);
      } else {
        const result = await execute('INSERT INTO kontak (whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed) VALUES (?,?,?,?,?,?)', [whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed]);
        const id = result.insertId;
        const rows = await query('SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak WHERE id=?', [id]);
        return jsonSuccess(res, rows[0]);
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
