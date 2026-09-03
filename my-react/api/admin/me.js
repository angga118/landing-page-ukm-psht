import { jsonSuccess, jsonError } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    const user = await requireAuth(req, res);
    if (!user) return;
    return jsonSuccess(res, { user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
