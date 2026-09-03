import { jsonSuccess, jsonError } from '@ukmpsht/api-lib/helpers';
import { clearSessionCookie } from '@ukmpsht/api-lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    clearSessionCookie(res);
    return jsonSuccess(res, { ok: true });
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
