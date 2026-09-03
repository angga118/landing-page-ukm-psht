import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { sniffMime, extForMime } from './mime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function hasBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) return true;
  return false;
}

export async function saveImage(buffer, mime, resource) {
  if (!buffer || buffer.length === 0) {
    return { url: null };
  }
  // enforce 2MB (should be checked by caller, but guard here)
  if (buffer.length > 2 * 1024 * 1024) {
    const err = new Error('FILE_TOO_LARGE');
    err.code = 'FILE_TOO_LARGE';
    throw err;
  }
  let sniffed = sniffMime(buffer);
  // if sniff fails, try provided mime but still validate? spec says sniff only
  // If sniffed is null, we consider invalid
  if (!sniffed) {
    const err = new Error('INVALID_MIME');
    err.code = 'INVALID_MIME';
    throw err;
  }
  const ext = extForMime(sniffed);
  if (!ext) {
    const err = new Error('INVALID_MIME');
    err.code = 'INVALID_MIME';
    throw err;
  }

  if (hasBlobToken()) {
    try {
      const { put } = await import('@vercel/blob');
      const random = crypto.randomBytes(16).toString('hex');
      const pathname = `uploads/${resource}/${random}.${ext}`;
      // put expects pathname and body. addRandomSuffix true to ensure uniqueness
      const result = await put(pathname, buffer, {
        access: 'public',
        addRandomSuffix: true,
        contentType: sniffed,
      });
      return { url: result.url };
    } catch (e) {
      // if blob fails, fallback to local? For now rethrow? But per spec fallback only when no token.
      throw e;
    }
  }

  // Local fallback (dev only — Vercel function FS is read-only)
  if (process.env.VERCEL) {
    const err = new Error('BLOB_NOT_CONFIGURED: Vercel Blob token tidak ditemukan. Hubungkan Blob store atau set BLOB_READ_WRITE_TOKEN.');
    err.code = 'BLOB_NOT_CONFIGURED';
    throw err;
  }
  const random = crypto.randomBytes(16).toString('hex');
  const filename = `${random}.${ext}`;
  // uploads dir: my-react/api/uploads/{resource}
  const dir = path.join(__dirname, '..', 'uploads', resource);
  await fs.mkdir(dir, { recursive: true });
  const dest = path.join(dir, filename);
  await fs.writeFile(dest, buffer);
  const url = `/api/uploads/${resource}/${filename}`;
  return { url };
}

export async function deleteImage(url) {
  if (!url) return;
  if (typeof url !== 'string') return;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const { del } = await import('@vercel/blob');
      await del(url);
    } catch (_) {
      // ignore
    }
    return;
  }
  if (url.startsWith('/api/uploads/')) {
    const relative = url.replace(/^\/api\//, ''); // uploads/...
    const fullPath = path.join(__dirname, '..', relative);
    try {
      await fs.unlink(fullPath);
    } catch (_) {
      // ignore not found
    }
  }
}
