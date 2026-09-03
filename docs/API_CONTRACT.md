# API Contract — UKM PSHT Landing Page

Single source of truth untuk frontend (`my-react/`) dan backend (`api/`).
Semua lane WAJIB mengikuti dokumen ini. Jika ada kebutuhan yang tidak tercakup,
jangan mengubah kontrak sepihak — laporkan ke orchestrator.

## 1. Konvensi Umum

- Base URL: `/api` (dev: di-proxy Vite ke XAMPP PHP; produksi: dilayani Vercel Functions di `my-react/api/`).
- Semua response JSON dengan envelope:

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Pesan error", "errors": { "field": "alasan" } }
```

- HTTP status sesuai: 200 OK, 401 belum login, 403 forbidden, 404 tidak ada, 422 validasi, 500 server.
- **Semua operasi tulis memakai POST** (bukan PUT/PATCH/DELETE) agar multipart upload aman.
- Auth: JWT (HS256) di cookie `psht_session` (HttpOnly, SameSite=Lax, Secure di produksi), `credentials: 'include'`. Same-origin di Vercel → tidak butuh CORS.

## 2. Endpoint Publik (tanpa login)

| Method | Path | Data |
|---|---|---|
| GET | `/content/hero` | `{ id, judul, tagline, foto_background }` |
| GET | `/content/sejarah` | `{ id, konten, foto }` |
| GET | `/content/pengurus` | `[ { id, nama, jabatan, foto, periode, urutan } ]` (urut `urutan`) |
| GET | `/content/prestasi` | `[ { id, nama_lomba, tingkat, tahun, foto, urutan } ]` |
| GET | `/content/galeri` | `[ { id, foto, kategori, urutan } ]` |
| GET | `/content/kontak` | `{ id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed }` |

- Field gambar (`foto*`) berisi **path mulai dari `/api/uploads/...`** — langsung dipakai di `<img src>`.
  Path relatif dari root domain ini bekerja di dev (proxy Vite) maupun produksi (same-origin Apache).
- Jika tabel kosong, kembalikan array/object kosong (bukan 404).

## 3. Autentikasi Admin

| Method | Path | Body | Data |
|---|---|---|---|
| POST | `/admin/login` | JSON `{ username, password }` | `{ user: { id, username, role } }` |
| POST | `/admin/logout` | — | `{ ok: true }` |
| GET | `/admin/me` | — | `{ user: { id, username, role } }` atau 401 |

- Password disimpan `password_hash()` bcrypt. Login gagal → 401 + message "Username atau password salah".
- Rate limit sederhana opsional (sleep 1s pada gagal).

## 4. CRUD Admin (wajib session; tanpa session → 401)

Pola seragam untuk resource `pengurus`, `prestasi`, `galeri`:

| Method | Path | Body | Fungsi |
|---|---|---|---|
| GET | `/admin/{resource}` | — | List semua (urut `urutan`) |
| POST | `/admin/{resource}` | multipart/form-data | Create; jika ada field `id` → Update |
| POST | `/admin/{resource}/delete` | JSON `{ id }` | Delete |
| POST | `/admin/{resource}/reorder` | JSON `{ ids: [3,1,2] }` | Set `urutan` sesuai posisi array |

Field per resource (multipart):

- `pengurus`: `nama`*, `jabatan`*, `periode`, `foto` (file), `id` (opsional = update)
- `prestasi`: `nama_lomba`*, `tingkat`*, `tahun`*, `foto` (file), `id`
- `galeri`: `kategori`, `foto` (file, wajib saat create), `id`

### Konten tunggal (singleton)

| Method | Path | Body |
|---|---|---|
| POST | `/admin/content/hero` | multipart/JSON: `judul`, `tagline`, `foto_background` (file) |
| POST | `/admin/content/sejarah` | multipart/JSON: `konten`, `foto` (file) |
| POST | `/admin/content/kontak` | JSON: `whatsapp`, `email`, `alamat`, `jadwal_latihan`, `instagram`, `maps_embed` |

Response: object konten terbaru (bentuk sama dengan endpoint publik).

### Statistik

| Method | Path | Data |
|---|---|---|
| GET | `/admin/stats` | `{ counts: { pengurus, prestasi, galeri } }` |

## 5. Upload Gambar

- Field file: `foto` / `foto_background`.
- Format valid: JPG, PNG, WebP — cek via magic bytes (bukan sekadar ekstensi).
- Maksimal **2 MB**.
- Produksi: disimpan ke **Vercel Blob** (public), nilai yang disimpan DB & dikembalikan API adalah **URL absolut** `https://<store>.public.blob.vercel-storage.com/...`.
- Dev (tanpa token Blob): fallback ke filesystem `my-react/api/uploads/{resource}/{slug}.{ext}`, nilai = path relatif `/api/uploads/...`.
- Ganti foto lama saat update → hapus file lama (Blob `del()` / unlink lokal) jika nilai lama URL absolut atau path `/api/uploads/`.
- Frontend memakai nilai field langsung di `<img src>` (URL absolut maupun path relatif sama-sama didukung).

## 6. Database (TiDB Cloud, MySQL-compatible)

- Nama DB: **`ukmpsht`**, charset `utf8mb4_unicode_ci`. Dibuat via dashboard TiDB Cloud Starter.
- Migrasi: `database/schema-tidb.sql` + `database/migrate.js` (lihat `database/README.md`).
- Tabel: `hero`, `sejarah`, `pengurus`, `prestasi`, `galeri`, `kontak`, `admin_user`
  (kolom sesuai PRD §9 + kolom `urutan` INT untuk pengurus/prestasi/galeri).
- Seed: 1 baris hero/sejarah/kontak berisi teks default PRD, beberapa contoh
  pengurus/prestasi/galeri bertema PSHT, dan admin:
  - username `admin`, password `admin1922` (hash bcrypt `$2y$`, diverifikasi `bcryptjs`).

## 7. Struktur Folder Backend (Vercel Functions)

```
my-react/
├── api/                    # Vercel Functions (Node.js, ESM) — route /api/*
│   ├── _lib/               # package lokal @ukmpsht/api-lib (db, auth, blob, helpers, mime)
│   ├── content/[resource].js
│   └── admin/
│       ├── login.js, logout.js, me.js, stats.js
│       ├── content/[type].js
│       ├── [resource].js
│       └── [resource]/delete.js, [resource]/reorder.js
├── vercel.json             # framework vite, SPA rewrite
└── ...
database/
├── schema.sql              # XAMPP/MySQL lokal (dev)
├── schema-tidb.sql         # TiDB Cloud (produksi)
└── migrate.js              # skrip migrasi TiDB
```

> Backend PHP lama (`api/` di root repo) dipertahankan hanya untuk dev XAMPP.

## 8. Konvensi Frontend

- Wrapper fetch: `my-react/src/lib/api.js` → `api.get/post/delete`, throw `ApiError(status, message, errors)`.
- Routing sudah terpasang: `/` → `src/landing/LandingPage.jsx`, `/admin/*` → `src/admin/AdminApp.jsx`.
  Lane hanya mengisi folder masing-masing; **jangan ubah** `main.jsx`, `App.jsx`,
  `vite.config.js`, `package.json`, atau folder lane lain.
- Landing page harus tetap tampil walau API mati: pakai data fallback lokal
  (bentuk sama dengan kontrak) sebagai initial state.
