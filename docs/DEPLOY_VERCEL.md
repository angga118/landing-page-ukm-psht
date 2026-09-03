# Panduan Deploy ke Vercel — UKM PSHT Landing Page

Panduan lengkap untuk men-deploy aplikasi (frontend React + API Node.js + database TiDB + upload Vercel Blob) ke Vercel. Semua akun yang dibutuhkan **gratis, tanpa kartu kredit**.

> **Penting:** Backend PHP lama (`api/` di root repo) **tidak** ikut ter-deploy. Vercel hanya memakai folder `my-react/` (Root Directory), termasuk API Node.js baru di `my-react/api/`.

---

## Prasyarat

| Akun | URL | Catatan |
|---|---|---|
| GitHub | https://github.com | Repo `angga118/landing-page-ukm-psht` sudah ada |
| TiDB Cloud | https://tidbcloud.com | Database produksi (MySQL-compatible, free 5 GiB) |
| Vercel | https://vercel.com | Hosting (free) |

---

## Langkah 1 — Setup Database TiDB Cloud

1. Daftar/login di https://tidbcloud.com (bisa pakai akun Google/GitHub).
2. Klik **Create Cluster** → pilih **Serverless (Starter)**.
   - Region: pilih **Singapore (ap-southeast-1)** — terdekat dengan Indonesia.
   - Password: buat password kuat, simpan baik-baik.
3. Tunggu cluster aktif (beberapa menit).
4. Buat database `ukmpsht`:
   - Buka tab **Chat2Query / SQL Editor**, jalankan:
     ```sql
     CREATE DATABASE ukmpsht CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
5. Ambil **connection string**:
   - Klik cluster → **Connect** → pilih **General** / **MySQL**.
   - Salin string format:
     ```
     mysql://<prefix>.root:<password>@<host>:4000/ukmpsht
     ```
     Contoh: `mysql://2xKf3abc.root:Passw0rd123@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/ukmpsht`
   - String ini = **`DATABASE_URL`**.

## Langkah 2 — Jalankan Migrasi Database

Dari **root repo** di komputer kamu (butuh Node.js 18+):

```bash
DATABASE_URL="mysql://<prefix>.root:<password>@<host>:4000/ukmpsht" node database/migrate.js
```

Jika berhasil akan muncul `Migrasi berhasil: ...`. Skrip ini membuat 7 tabel + seed data (termasuk akun admin `admin` / `admin1922`).

> Jika koneksi gagal karena SSL, pastikan string sudah benar. Jangan pakai `DB_SSL_DISABLED=1` di produksi.

## Langkah 3 — Commit & Push ke GitHub

```bash
git add -A
git commit -m "Migrasi backend ke Vercel Functions (Node.js) + TiDB + Blob"
git push origin main
```

## Langkah 4 — Deploy ke Vercel (Dashboard)

1. Buka https://vercel.com → **Add New → Project**.
2. Pilih repo `angga118/landing-page-ukm-psht` → **Import**.
3. **Root Directory**: pilih **`my-react`** (penting!).
   - Framework akan terdeteksi otomatis: **Vite**.
   - Build Command: `npm run build` (otomatis dari `vercel.json`).
   - Output Directory: `dist` (otomatis).
4. **Environment Variables** (tab Environment Variables):
   | Nama | Nilai |
   |---|---|
   | `DATABASE_URL` | Connection string TiDB dari Langkah 1 |
   | `JWT_SECRET` | String acak panjang. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `VITE_SITE_URL` | Domain nanti, mis. `https://landing-page-ukm-psht.vercel.app` (bisa diisi setelah deploy pertama, lalu redeploy) |
5. **Buat Blob Store** (untuk upload foto):
   - Tab **Storage** → **Create Blob Store** → pilih project ini.
   - Vercel otomatis menyuntikkan `VERCEL_OIDC_TOKEN` + `BLOB_STORE_ID` ke environment — tidak perlu set manual.
6. Klik **Deploy**. Tunggu build selesai (1–3 menit).

## Langkah 5 — Validasi Setelah Deploy

1. Buka URL site (mis. `https://landing-page-ukm-psht.vercel.app`):
   - Landing page tampil dengan data dari database (hero, sejarah, pengurus, dll).
2. Cek API publik di browser:
   - `https://<domain>/api/content/hero` → harus JSON `{"success":true,"data":{...}}`
   - `https://<domain>/api/content/pengurus` → array JSON.
3. Login admin: buka `https://<domain>/admin` → `admin` / `admin1922`.
   - **Segera ganti password** (tidak ada menu ganti password di dashboard — update via SQL di TiDB, atau hubungi pengembang).
4. Tes upload foto (Hero/Sejarah/Pengurus/Prestasi/Galeri) → foto tersimpan di Blob dan tampil.
5. Cek source halaman: canonical/og:url sudah pakai domain asli (bukan `%VITE_SITE_URL%`). Jika masih placeholder, set `VITE_SITE_URL` lalu **redeploy** (Deployments → ⋯ → Redeploy).

---

## Update Aplikasi di Kemudian Hari

Setiap push ke `main` otomatis memicu deploy baru di Vercel. Tidak perlu langkah manual.

---

## Troubleshooting

| Gejala | Penyebab | Solusi |
|---|---|---|
| Semua `/api/*` balas 500 "Terjadi kesalahan server" | `DATABASE_URL` salah / belum diset | Cek Environment Variables, pastikan string TiDB benar |
| Upload foto 500 "Penyimpanan gambar belum dikonfigurasi (Vercel Blob)" | Blob store belum dibuat/dihubungkan | Buat Blob Store di tab Storage, lalu redeploy |
| Login gagal terus | `JWT_SECRET` belum diset | Set `JWT_SECRET` (string acak), redeploy |
| Halaman source masih ada `%VITE_SITE_URL%` | `VITE_SITE_URL` belum diset saat build | Set env var lalu redeploy |
| `/admin` atau route lain 404 | Root Directory salah | Pastikan Root Directory = `my-react` |
| API 500 hanya di produksi, lokal aman | Symlink `@ukmpsht/api-lib` tidak ter-bundle | Tambahkan di `vercel.json`: `"functions": { "api/**/*.js": { "includeFiles": "api/_lib/**" } }`, redeploy |
| Data lama (foto) dari XAMPP tidak muncul | Path `/api/uploads/...` lama tidak ada di Vercel | Upload ulang foto via dashboard admin |

---

## Arsitektur Ringkas

```
Browser → Vercel (same-origin)
  ├── /            → static React (my-react/dist)
  ├── /api/*       → Vercel Functions (my-react/api/*.js)
  │                  ├── DB: TiDB Cloud (DATABASE_URL)
  │                  ├── Auth: JWT cookie psht_session (JWT_SECRET)
  │                  └── Upload: Vercel Blob (OIDC auto)
  └── /admin       → dashboard admin (React)
```

Referensi teknis: `docs/API_CONTRACT.md`, `docs/MEMORY.md`, `database/README.md`.