# API Contract — UKM PSHT Landing Page

Single source of truth untuk frontend (`my-react/`) dan backend (`api/`).
Semua lane WAJIB mengikuti dokumen ini. Jika ada kebutuhan yang tidak tercakup,
jangan mengubah kontrak sepihak — laporkan ke orchestrator.

## 1. Konvensi Umum

- Base URL: `/api` (dev: di-proxy Vite ke `http://localhost/landing-page-ukmpsht/api`).
- Semua response JSON dengan envelope:

```json
{ "success": true,  "data": { } }
{ "success": false, "message": "Pesan error", "errors": { "field": "alasan" } }
```

- HTTP status sesuai: 200 OK, 401 belum login, 403 forbidden, 404 tidak ada, 422 validasi, 500 server.
- **Semua operasi tulis memakai POST** (bukan PUT/PATCH/DELETE) agar multipart upload aman di PHP.
- Auth: PHP session (cookie `PHPSESSID`, `credentials: 'include'`). Karena dev lewat proxy Vite = same-origin, tidak butuh CORS khusus; backend tetap mengirim header CORS longgar sebagai jaring pengaman.

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
- Format valid: JPG, PNG, WebP — cek via `finfo`, bukan sekadar ekstensi.
- Maksimal **2 MB**.
- Disimpan ke `api/uploads/{resource}/{randomslug}.{ext}` (folder dibuat otomatis).
- Ganti foto lama saat update → hapus file lama jika terpakai.
- Nilai yang disimpan DB & dikembalikan API: `/api/uploads/{resource}/{namafile}`.

## 6. Database (MySQL, XAMPP)

- Nama DB: **`ukmpsht`**, charset `utf8mb4_unicode_ci`. Dibuat oleh `database/schema.sql`.
- Tabel: `hero`, `sejarah`, `pengurus`, `prestasi`, `galeri`, `kontak`, `admin_user`
  (kolom sesuai PRD §9 + kolom `urutan` INT untuk pengurus/prestasi/galeri).
- Seed: 1 baris hero/sejarah/kontak berisi teks default PRD, beberapa contoh
  pengurus/prestasi/galeri bertema PSHT, dan admin:
  - username `admin`, password `admin1922` (hash bcrypt).

## 7. Struktur Folder Backend

```
api/
├── index.php        # front controller (parse path setelah /api)
├── config.php       # kredensial DB + konstanta
├── db.php           # koneksi PDO
├── helpers.php      # envelope json, validasi, upload
├── auth.php         # login/logout/me + guard session
├── content.php      # endpoint publik /content/*
├── admin.php        # CRUD /admin/*
└── uploads/         # hasil upload (dilayani Apache)
database/
└── schema.sql       # DDL + seed
```

## 8. Konvensi Frontend

- Wrapper fetch: `my-react/src/lib/api.js` → `api.get/post/delete`, throw `ApiError(status, message, errors)`.
- Routing sudah terpasang: `/` → `src/landing/LandingPage.jsx`, `/admin/*` → `src/admin/AdminApp.jsx`.
  Lane hanya mengisi folder masing-masing; **jangan ubah** `main.jsx`, `App.jsx`,
  `vite.config.js`, `package.json`, atau folder lane lain.
- Landing page harus tetap tampil walau API mati: pakai data fallback lokal
  (bentuk sama dengan kontrak) sebagai initial state.
