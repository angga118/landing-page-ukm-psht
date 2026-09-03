import mysql from 'mysql2/promise';
import { attachDatabasePool } from '@vercel/functions';

let pool = null;

function getPool() {
  if (pool) return pool;
  if (globalThis._pshtPool) {
    pool = globalThis._pshtPool;
    return pool;
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  const config = {
    uri: url,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    idleTimeout: 300000,
    enableKeepAlive: true,
  };
  if (process.env.DB_SSL_DISABLED !== '1') {
    config.ssl = { rejectUnauthorized: true };
  }
  const p = mysql.createPool(config);
  try {
    attachDatabasePool(p);
  } catch (_) {
    // attachDatabasePool may not be available in local dev without Vercel env
  }
  pool = p;
  globalThis._pshtPool = p;
  return p;
}

export function getPoolInstance() {
  return getPool();
}

export async function query(sql, params) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

export async function execute(sql, params) {
  const p = getPool();
  const [result] = await p.execute(sql, params);
  return result;
}
