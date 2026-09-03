# Database UKM PSHT

Dokumen ini menjelaskan penggunaan file schema untuk lingkungan pengembangan lokal dan produksi.

## Ringkasan File

- **`schema.sql`** — untuk **XAMPP / MySQL lokal (dev)**. Berisi `CREATE DATABASE`, `USE ukmpsht`, dan seed data lengkap. Cocok untuk import via phpMyAdmin atau `mysql` CLI di lingkungan lokal.
- **`schema-tidb.sql` + `migrate.js`** — untuk **TiDB Cloud Starter (produksi Vercel)**. `schema-tidb.sql` adalah versi tanpa `CREATE DATABASE`/`USE`/`SET NAMES` yang dioptimalkan untuk TiDB (MySQL-compatible, managed). `migrate.js` adalah skrip Node.js ESM untuk mengeksekusi schema tersebut ke cluster TiDB.

## Prasyarat Produksi

- Database `ukmpsht` **harus dibuat terlebih dahulu** di dashboard TiDB Cloud (TiDB Serverless) sebelum migrasi. File `schema-tidb.sql` tidak mengandung `CREATE DATABASE` atau `USE`.
- Pastikan `DATABASE_URL` tersedia (format: `mysql://user:password@host:4000/ukmpsht?sslaccept=strict`). TiDB Cloud membutuhkan koneksi TLS.

## Cara Pakai

### Lokal (XAMPP)

Import `schema.sql` via phpMyAdmin atau CLI:

```bash
mysql -u root < database/schema.sql
```

### Produksi — TiDB Cloud (Vercel)

Jalankan dari **root repo**:

```bash
DATABASE_URL="mysql://user:password@gateway01.xxx.tidbcloud.com:4000/ukmpsht?sslaccept=strict" node database/migrate.js
```

Opsi tanpa SSL (hanya untuk debug lokal, tidak disarankan untuk produksi):

```bash
DB_SSL_DISABLED=1 DATABASE_URL="mysql://user:password@host:4000/ukmpsht" node database/migrate.js
```

Skrip `migrate.js` menggunakan `mysql2/promise` dengan `multipleStatements: true` dan mengeksekusi seluruh isi `schema-tidb.sql` sebagai satu query (aman untuk string yang mengandung `;`).

## Catatan

- Seed `admin_user` menggunakan hash bcrypt `$2y$` — jangan diubah manual.
- `SET FOREIGN_KEY_CHECKS=0/1` tetap dipertahankan (didukung TiDB).
- Jangan menjalankan `migrate.js` tanpa `DATABASE_URL` — skrip akan keluar dengan pesan error.
