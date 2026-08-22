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
├── api/            # Backend PHP (REST API)
├── database/       # Skema & migrasi database MySQL
├── docs/           # Dokumentasi tambahan (PRD, dsb)
└── my-react/       # Frontend React (Vite)
    ├── public/
    └── src/
```

---

## 🚀 Instalasi & Menjalankan Project

### Prasyarat
- [Node.js](https://nodejs.org) (untuk frontend)
- [XAMPP](https://www.apachefriends.org) (untuk PHP & MySQL)

### 1. Clone repository
```bash
git clone https://github.com/angga118/landing-page-ukm-psht.git
cd landing-page-ukm-psht
```

### 2. Setup Frontend (React)
```bash
cd my-react
npm install
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

### 3. Setup Backend & Database
1. Jalankan **Apache** dan **MySQL** melalui XAMPP Control Panel
2. Import skema database dari folder `database/` ke phpMyAdmin
3. Sesuaikan konfigurasi koneksi database di folder `api/`

---

## 📄 Dokumentasi

Product Requirements Document (PRD) lengkap tersedia di folder [`docs/`](./docs).

---

## 🤝 Kontribusi

Pull request dipersilakan untuk perbaikan atau penambahan fitur. Untuk perubahan besar, mohon buka issue terlebih dahulu untuk didiskusikan.

---

## 📜 Lisensi

Project ini dibuat untuk keperluan internal UKM PSHT UPN "Veteran" Jawa Timur.
