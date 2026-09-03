import { query } from '@ukmpsht/api-lib/db';
import { jsonSuccess, jsonError } from '@ukmpsht/api-lib/helpers';
import { requireAuth } from '@ukmpsht/api-lib/auth';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return jsonError(res, 'Method tidak diizinkan', 404);
    }
    const user = await requireAuth(req, res);
    if (!user) return;

    const counts = {};
    for (const tbl of ['pengurus', 'prestasi', 'galeri']) {
      const rows = await query(`SELECT COUNT(*) AS c FROM \`${tbl}\``);
      counts[tbl] = Number(rows[0]?.c ?? 0);
    }
    return jsonSuccess(res, { counts });
  } catch (e) {
    console.error(e);
    return jsonError(res, 'Terjadi kesalahan server', 500);
  }
}
