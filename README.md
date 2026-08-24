# UKM PSHT UPN "Veteran" Jawa Timur — Landing Page

Landing page resmi Unit Kegiatan Mahasiswa **Persaudaraan Setia Hati Terate (PSHT)** UPN "Veteran" Jawa Timur. Dibangun menggunakan **React (Vite)** untuk frontend, dilengkapi **dashboard admin** untuk mengelola konten (foto, sejarah, pengurus, prestasi, galeri, kontak) tanpa perlu mengubah kode program.

🔗 **Repository:** https://github.com/angga118/landing-page-ukm-psht

---

## ✨ Fitur

### Landing Page (Public)
- Hero section dengan foto kegiatan & Call-to-Action "Bergabung Sekarang"
- Section Sejarah, Ketua/Pengurus, Prestasi, Galeri, dan Kontak
- Navigasi responsif (desktop & mobile, dengan hamburger menu)
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
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Backend/API | PHP |
| Database | MySQL (XAMPP) |

---

## 📁 Struktur Folder

```
landing-page-ukm-psht/
├── api/                    # Backend PHP (REST API)
│   ├── index.php           # Front controller & routing
│   ├── auth.php            # Login/logout/session admin
│   ├── content.php         # Endpoint publik (GET konten)
│   ├── admin.php           # CRUD admin (hero, sejarah, pengurus, prestasi, galeri, kontak)
│   ├── db.php              # Koneksi PDO ke MySQL
│   ├── helpers.php         # Helper JSON response, CORS, dsb
│   └── uploads/            # Folder hasil upload foto
├── database/
│   └── schema.sql          # Skema tabel + seed data awal (termasuk 1 akun admin)
├── docs/
│   ├── API_CONTRACT.md     # Kontrak endpoint API (source of truth FE ↔ BE)
│   └── MEMORY.md           # Catatan progres/keputusan project
└── my-react/               # Frontend React (Vite)
    ├── public/
    └── src/
        ├── landing/        # Komponen & halaman landing page publik
        ├── admin/          # Komponen, halaman, dan context dashboard admin
        ├── lib/            # Util & helper (mis. wrapper fetch API)
        └── assets/
```

---

## 🚀 Instalasi & Menjalankan Project

### Prasyarat
- [Node.js](https://nodejs.org) (v18+ disarankan) untuk frontend
- [XAMPP](https://www.apachefriends.org) (Apache + MySQL/PHP) untuk backend

### 1. Clone repository
```bash
git clone https://github.com/angga118/landing-page-ukm-psht.git
cd landing-page-ukm-psht
```

### 2. Setup Backend & Database
1. Jalankan **Apache** dan **MySQL** melalui XAMPP Control Panel.
2. Buat database dengan mengimport `database/schema.sql` ke phpMyAdmin (skema ini otomatis membuat database `ukmpsht`, seluruh tabel, dan seed data awal termasuk satu akun admin).
3. Salin/letakkan folder `api/` ke dalam `htdocs` XAMPP (mis. `htdocs/landing-page-ukm-psht/api`), atau sesuaikan virtual host sesuai kebutuhan.
4. Cek konfigurasi koneksi database di `api/config.php` (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`) dan sesuaikan bila kredensial MySQL kamu berbeda dari default XAMPP.

### 3. Setup Frontend (React)
```bash
cd my-react
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`. Saat development, request ke `/api` di-proxy oleh Vite ke backend PHP (lihat `vite.config.js`) — pastikan path proxy-nya sesuai dengan lokasi `api/` di XAMPP.

### 4. Login Admin
Gunakan akun admin dari seed data `database/schema.sql` untuk masuk ke dashboard admin (`/admin` di frontend). Untuk keamanan, segera ganti password default setelah login pertama.

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

## 📄 Dokumentasi

- [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) — kontrak/spesifikasi endpoint API antara frontend dan backend.
- [`docs/MEMORY.md`](./docs/MEMORY.md) — catatan progres dan keputusan teknis selama pengembangan.

---

## 🤝 Kontribusi

Pull request dipersilakan untuk perbaikan atau penambahan fitur. Untuk perubahan besar, mohon buka issue terlebih dahulu untuk didiskusikan.

---

## 📜 Lisensi

Project ini dibuat untuk keperluan internal UKM PSHT UPN "Veteran" Jawa Timur.
