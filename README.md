# UKM PSHT UPN "Veteran" Jawa Timur — Landing Page

Landing page resmi Unit Kegiatan Mahasiswa **Persaudaraan Setia Hati Terate (PSHT)** UPN "Veteran" Jawa Timur. Dibangun menggunakan **React (Vite)** untuk frontend, dilengkapi **dashboard admin** untuk mengelola konten (foto, sejarah, pengurus, prestasi, galeri, kontak) tanpa perlu mengubah kode program.

🔗 **Repository:** https://github.com/angga118/landing-page-ukm-psht

---

## ✨ Fitur

### Landing Page (Public)
- Hero section dengan foto kegiatan & Call-to-Action "Bergabung Sekarang"
- Section Sejarah, Ketua/Pengurus, Prestasi, Galeri, dan Kontak
- Navigasi responsif (desktop & mobile, dengan hamburger menu)
- Halaman 404 kustom & Error Boundary
- Fully responsive — mobile, tablet, dan desktop

### Dashboard Admin
- Autentikasi login khusus admin
- Kelola konten Beranda (Hero), Sejarah, Pengurus, Prestasi, Galeri, dan Kontak
- Upload & atur foto (galeri, prestasi, pengurus)
- Antarmuka mobile-friendly untuk update konten cepat dari HP

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend/API | PHP (REST API tanpa framework) |
| Database | MySQL (via XAMPP) |

---

## 📁 Struktur Folder

```
landing-page-ukm-psht/
├── api/                    # Backend PHP (REST API)
│   ├── index.php           # Front controller & routing
│   ├── auth.php            # Login/logout/session admin
│   ├── content.php         # Endpoint publik (GET konten)
│   ├── admin.php           # CRUD admin (hero, sejarah, pengurus, prestasi, galeri, kontak)
│   ├── db.php               # Koneksi PDO ke MySQL
│   ├── config.php          # Kredensial DB (host, user, pass, dsb)
│   ├── helpers.php         # Helper JSON response, CORS, dsb
│   └── uploads/             # Folder hasil upload foto
├── database/
│   └── schema.sql          # Skema tabel + seed data awal (termasuk 1 akun admin)
├── docs/
│   ├── API_CONTRACT.md     # Kontrak endpoint API (source of truth FE ↔ BE)
│   └── MEMORY.md           # Catatan progres/keputusan project
└── my-react/                # Frontend React (Vite)
    ├── public/
    ├── vite.config.js      # Konfigurasi dev-server + proxy ke backend PHP
    └── src/
        ├── landing/         # Komponen & halaman landing page publik
        ├── admin/           # Komponen, halaman, dan context dashboard admin
        ├── lib/              # Util & helper (mis. wrapper fetch API)
        └── assets/
```

---

## 🚀 Instalasi & Menjalankan Project

### Prasyarat
- [Node.js](https://nodejs.org) v18+ untuk frontend
- [XAMPP](https://www.apachefriends.org) (Apache + MySQL/PHP 8+) untuk backend

### 1. Clone repository

```bash
git clone https://github.com/angga118/landing-page-ukm-psht.git
cd landing-page-ukm-psht
```

### 2. Setup Backend & Database

1. Jalankan **Apache** dan **MySQL** melalui XAMPP Control Panel.
2. Buat database dengan meng-import `database/schema.sql` ke phpMyAdmin (skema ini otomatis membuat database `ukmpsht`, seluruh tabel, dan seed data awal termasuk satu akun admin).
3. Salin folder `api/` ke dalam `htdocs` XAMPP dengan nama folder **`landing-page-ukmpsht`** (tanpa tanda hubung/dash), sehingga hasil akhirnya:

   ```
   C:\xampp\htdocs\landing-page-ukmpsht\api\
   ```

   > ⚠️ **Penting — sumber error "Cannot connect to API" paling umum:** nama folder di `htdocs` **harus persis** `landing-page-ukmpsht` (tanpa dash), karena proxy dev di `my-react/vite.config.js` sudah di-hardcode mengarah ke path tersebut:
   > ```js
   > rewrite: (path) => path.replace(/^\/api/, '/landing-page-ukmpsht/api'),
   > ```
   > Kalau kamu menaruh folder dengan nama lain (misalnya `landing-page-ukm-psht`, sesuai nama repo), frontend akan gagal konek ke backend. Ada dua cara mengatasinya — pilih salah satu:
   > - **Opsi A (disarankan, tanpa edit kode):** rename/salin folder `api/` di `htdocs` menjadi `landing-page-ukmpsht`.
   > - **Opsi B:** biarkan nama folder sesuai repo, lalu ubah baris `rewrite` di `my-react/vite.config.js` agar sesuai path folder kamu di `htdocs`.

4. Cek konfigurasi koneksi database di `api/config.php` (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`) dan sesuaikan bila kredensial MySQL kamu berbeda dari default XAMPP (`root` tanpa password).

### 3. Setup Frontend (React)

```bash
cd my-react
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Saat development, request ke `/api` di-*proxy* oleh Vite ke backend PHP (lihat `vite.config.js`) — pastikan path proxy-nya sesuai dengan lokasi folder `api/` di XAMPP (lihat peringatan di atas).

### 4. Login Admin

Gunakan akun admin dari seed data `database/schema.sql` untuk masuk ke dashboard admin (`/admin` di frontend). Untuk keamanan, **segera ganti password default** setelah login pertama.

---

## 📜 Skrip NPM (`my-react/`)

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan dev server (`http://localhost:5173`) dengan hot-reload |
| `npm run build` | Build production ke `my-react/dist/` |
| `npm run preview` | Preview hasil build production secara lokal |
| `npm run lint` | Menjalankan ESLint pada seluruh source |

---

## 🔌 API

Backend menyediakan REST API sederhana dengan prefix `/api`, contoh:

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/content/{resource}` | Ambil konten publik (`hero`, `sejarah`, `pengurus`, `prestasi`, `galeri`, `kontak`) |
| POST | `/api/admin/login` | Login admin |
| POST | `/api/admin/logout` | Logout admin |
| GET | `/api/admin/me` | Cek sesi admin aktif |
| GET/POST | `/api/admin/{resource}` | List / create / update konten (butuh sesi admin) |
| POST | `/api/admin/{resource}/delete` | Hapus data |
| POST | `/api/admin/{resource}/reorder` | Atur ulang urutan data |

Detail lengkap request/response tiap endpoint ada di [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md).

---

## 🩹 Troubleshooting

**"Cannot connect to API: Was there a typo in the url or port?" saat `npm run dev`**
Hampir selalu disebabkan oleh mismatch nama folder di `htdocs` vs target proxy di `vite.config.js`. Lihat peringatan di bagian [Setup Backend & Database](#2-setup-backend--database) langkah 3.

**Frontend berjalan tapi data tidak muncul / error 500 dari API**
- Pastikan Apache & MySQL di XAMPP Control Panel berstatus hijau/aktif.
- Cek `api/config.php` — kredensial DB harus cocok dengan MySQL yang kamu jalankan.
- Pastikan database `ukmpsht` sudah ter-import dari `database/schema.sql`.

**Error CORS di console browser**
- Pastikan kamu mengakses frontend dari `http://localhost:5173` (bukan membuka `index.html` langsung dari file explorer), agar proxy Vite berfungsi.

**Upload foto gagal**
- Pastikan folder `api/uploads/` ada dan bisa ditulis (writable) oleh Apache.
- Ukuran file maksimal 2 MB, format yang didukung: JPG, PNG, WebP (lihat `api/config.php`).

---

## 📄 Dokumentasi

- [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) — kontrak/spesifikasi endpoint API antara frontend dan backend.
- [`docs/MEMORY.md`](./docs/MEMORY.md) — catatan progres dan keputusan teknis selama pengembangan.

---

## 🤝 Kontribusi

Pull request dipersilakan untuk perbaikan atau penambahan fitur. Untuk perubahan besar, mohon buka issue terlebih dahulu untuk didiskusikan.

---

## 📜 Lisensi

Project ini dibuat untuk keperluan internal UKM PSHT UPN "Veteran" Jawa Timur.
