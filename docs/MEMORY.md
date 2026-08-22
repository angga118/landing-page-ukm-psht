# MEMORY — Catatan Perubahan Proyek Landing Page UKM PSHT

> **File memori persisten.** Setiap perubahan pada proyek WAJIB dicatat di sini
> agar sesi kerja berikutnya punya konteks tanpa harus menggali ulang kode.
> Format: entri per tanggal, diubah paling atas.

---

## Info Operasional

| Item | Nilai |
|---|---|
| URL dev (frontend) | http://localhost:5173 (`npm run dev` di `my-react/`) |
| URL admin | http://localhost:5173/admin |
| Backend | XAMPP Apache + MySQL **wajib aktif** (`api/`, dilayani di `/landing-page-ukmpsht/api`) |
| Database | `ukmpsht` — jika belum ada, import `database/schema.sql` |
| Kredensial admin | `admin` / `admin1922` |
| Stack frontend | React 19 + Vite + Tailwind CSS v4 (`my-react/`) |
| Build produksi | `npm run build` → `my-react/dist/` |
| Kontrak API | `docs/API_CONTRACT.md` (jangan ubah sepihak) |

---

## Log Perubahan

### 2026-08-22 — Sesi besar: setup, perbaikan bug, poles UI/UX, tes E2E

1. **Setup database** — Import `database/schema.sql` ke MySQL: DB `ukmpsht` dibuat
   (7 tabel + seed). Sebelumnya API 500 karena DB belum ada.

2. **Fix bug hero kehilangan foto** (`src/landing/LandingPage.jsx`) — Data API dengan
   `foto_background:""` menimpa aset lokal fallback. Sekarang di-merge; field kosong
   tidak lagi menimpa aset lokal.

3. **Batch perbaikan UI/UX (hasil review desain)**:
   - Focus keyboard: utilitas `.focus-ring` / `.focus-ring-light` di `index.css`,
     diterapkan ke semua elemen interaktif landing + admin.
   - Seragam warna: admin `gray-*` → `neutral-*`; token semantik
     `--color-success-*` / `--color-danger-*` ditambahkan di `@theme`;
     teks kecil kontras rendah dinaikkan ke `neutral-400`.
   - Nav bawah admin mobile kini mencakup semua 7 halaman.
   - Reorder: drag handle ⠿ terlihat (hanya handle yang draggable), aria-label ↑/↓,
     toast "Urutan disimpan" per-klik dihapus.
   - Toast: `role`/`aria-live` + tombol tutup manual; ConfirmModal & Lightbox:
     Escape + focus trap + restore fokus.
   - Cleanup: hapus `App.css` mati, preview gambar admin pakai SmartImage,
     `fetchPriority="high"` di hero, Logo pakai token warna.

4. **Fix teks input tak terlihat** (`index.css`) — Akar masalah: `body { color:#f5f5f5 }`
   (tema gelap landing) diwarisi form control di kartu putih admin. Solusi: aturan global
   `input/select/textarea { color: var(--color-ink-900) }` + placeholder abu terbaca.

5. **Toggle mata password** (`LoginPage.jsx`) — Tombol show/hide password dengan
   aria-label dinamis, tidak memicu submit.

6. **Link "Admin" diskret di footer** (`Footer.jsx`) — Teks kecil redup di baris
   copyright, hover emas, menuju `/admin`.

7. **Perubahan kredensial** — Hint "Default: admin / admin123" dihapus dari login;
   password admin diganti `admin123` → **`admin1922`** (bcrypt). Disinkronkan ke:
   DB `admin_user`, seed `database/schema.sql`, dan `docs/API_CONTRACT.md`.

8. **Logout → langsung landing page** (`Layout.jsx`) — Versi awal (`await logout()`
   lalu `navigate('/')`) kalah race melawan guard `RequireAuth` yang menendang ke
   `/admin/login`. Versi final deterministik: `navigate('/')` DULU, baru bersihkan
   sesi via `await logout()` dalam try/catch.

9. **Logo diganti gambar asli** (`Logo.jsx`) — Monogram SVG diganti `<img>` dari
   `public/logopsht.png`. Catatan: file awal disiapkan sebagai `.jpg` lau diganti
   pengguna menjadi `.png`; path kode sudah menyesuaikan. Ukuran: navbar `h-14`
   (56px), footer `h-12` (48px), `object-contain`.

10. **Link "Lihat Website" di admin** (`Layout.jsx`) — Globe icon di bawah sidebar +
    drawer mobile, buka landing page di tab baru (`target="_blank"`).

11. **Tombol "Bergabung Sekarang" dihapus** — CTA hero jadi kondisional
    (`{data?.teks_tombol && ...}` di `Hero.jsx`); nilai dikosongkan di DB (`hero`),
    fallback `data.js`, dan seed `schema.sql`. Untuk mengaktifkan lagi: isi kolom
    "Teks Tombol" di menu Beranda admin panel.

12. **Tes E2E menyeluruh — SEMUA LOLOS**: DB & seed utuh; 6 endpoint publik 200;
    auth lengkap (401 password salah, logout mematikan sesi); CRUD round-trip
    create/update/reorder/delete; upload JPEG tersimpan & terlayani (Apache + proxy
    Vite); file palsu (.jpg berisi teks) ditolak 422 oleh validasi finfo; delete
    record ikut menghapus file fisik; frontend & build produksi bersih.

---
