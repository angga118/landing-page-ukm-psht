import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL belum diatur. Set env DATABASE_URL="mysql://user:password@host:4000/ukmpsht" sebelum menjalankan migrasi.');
  process.exit(1);
}

let connection;
try {
  const config = {
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
    ...(process.env.DB_SSL_DISABLED === '1' ? {} : { ssl: { rejectUnauthorized: true } }),
  };

  connection = await mysql.createConnection(config);

  const sqlPath = new URL('./schema-tidb.sql', import.meta.url);
  const sql = await fs.readFile(sqlPath, 'utf8');

  const [results] = await connection.query(sql);

  if (Array.isArray(results)) {
    console.log(`Migrasi berhasil: ${results.length} statement(s) dieksekusi.`);
    // tampilkan ringkasan affectedRows jika tersedia
    const summary = results
      .map((r, i) => {
        if (r && typeof r.affectedRows === 'number') return `  [${i + 1}] affectedRows=${r.affectedRows}`;
        return null;
      })
      .filter(Boolean)
      .join('\n');
    if (summary) console.log(summary);
  } else if (results && typeof results.affectedRows === 'number') {
    console.log(`Migrasi berhasil: affectedRows=${results.affectedRows}`);
  } else {
    console.log('Migrasi berhasil: schema-tidb.sql berhasil dieksekusi.');
  }
} catch (err) {
  console.error('Migrasi gagal:', err);
  process.exit(1);
} finally {
  if (connection) {
    try {
      await connection.end();
    } catch {}
  }
}
