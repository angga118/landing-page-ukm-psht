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

### 2026-09-02 — Fix flash hero.png sebelum foto upload tampil

1. **Masalah**: Saat reload beranda, hero sempat menampilkan `hero.png` (aset lokal
   fallback) lalu berganti ke foto yang di-upload dari admin — terlihat "blink" dua gambar.

2. **Akar masalah**: Initial state `FALLBACK_CONTENT.hero.foto_background` memakai
   `heroBg` (hero.png), sehingga hero langsung render hero.png sebelum API selesai
   dimuat dan menggantinya dengan foto upload.

3. **Perbaikan**:
   - `src/landing/data.js`: `FALLBACK_CONTENT.hero.foto_background` dikosongkan (`''`).
   - `src/landing/LandingPage.jsx`: tambah state `contentReady` (true setelah fetch
     konten selesai, sukses ATAU gagal). Foto hero dihitung: selama belum siap →
     kosong (tampil gradien dasar, tanpa flash); setelah siap → foto upload admin,
     atau fallback `heroBg` bila tidak ada foto. `heroBg` diimpor langsung di
     `LandingPage.jsx`.

4. **Perilaku akhir**: Reload → hero tampil gradien sesaat → langsung foto upload
   (tanpa hero.png di antaranya). Jika tidak ada foto upload → hero.png. Jika API
   mati (offline) → hero.png (fallback tetap jalan).

5. **Verifikasi**: `npm run build` sukses (60 modul, bundle 275 KB). Warning
   `%VITE_SITE_URL%` pre-existing (env saat deploy, lihat entri 2026-09-02).

6. **Catatan deploy**: Pengguna melihat versi **Vercel** — perubahan kode TIDAK
   otomatis aktif sampai `git push` + redeploy. `public/sw.js` cache version di-bump
   `psht-offline-v1` → `psht-offline-v2` agar bundle JS lama (yang masih flash) tidak
   tersaji stale dari service worker cache-first.

7. **Deploy langsung via CLI (tanpa GitHub)** — Project Vercel produksi yang benar
   adalah **`ukmpsht`** (https://ukmpsht.vercel.app), team `psht2`, dengan env vars
   lengkap (`DATABASE_URL`, `JWT_SECRET`, `VITE_SITE_URL`, Blob). Deploy:
   `vercel link --project ukmpsht --yes` lalu `vercel deploy --prod --yes` dari
   `my-react/`. Perbaikan flash hero sudah ter-deploy ke `ukmpsht` (bundle
   `index-DuBZA1k3.js`), API `/api/content/hero` sukses dengan foto Blob.

8. **Project `my-react` (prj_CtjFEEzzbD1sB5ucssunDPHgBe6s) TIDAK dipakai** — dibuat
   tidak sengaja oleh `vercel link` saat project belum ter-link; tidak punya env vars.
   Bisa dihapus dari dashboard Vercel agar tidak membingungkan.

### 2026-09-02 — Migrasi deploy ke Vercel (Node.js API + TiDB + Blob)

1. **Keputusan**: backend PHP (`api/`) ditulis ulang menjadi **Vercel Functions (Node.js)** di `my-react/api/`; database pindah ke **TiDB Cloud Starter** (MySQL-compatible, free); upload pindah ke **Vercel Blob** (public); auth PHP session → **JWT (jose)** di cookie `psht_session` (HttpOnly, SameSite=Lax, Secure di produksi).

2. **Struktur baru** (`my-react/api/`): package lokal `@ukmpsht/api-lib` (`_lib/`: db, auth, blob, helpers, mime) + 9 route functions (`content/[resource]`, `admin/login|logout|me|stats`, `admin/content/[type]`, `admin/[resource]`, `admin/[resource]/delete|reorder`). `vercel.json` (framework vite, SPA rewrite). Root directory Vercel = `my-react`.

3. **Database**: `database/schema-tidb.sql` (tanpa CREATE DATABASE/USE) + `database/migrate.js` (mysql2, multipleStatements). Jalankan: `DATABASE_URL="mysql://..." node database/migrate.js`. DB `ukmpsht` dibuat dulu di dashboard TiDB.

4. **Upload**: produksi → Vercel Blob (URL absolut disimpan di DB); dev tanpa token → fallback filesystem `my-react/api/uploads/` (sudah di-gitignore). Validasi magic bytes (JPG/PNG/WebP) + maks 2MB (busboy).

5. **Frontend**: BASE `/api` tetap (same-origin). `index.html` placeholder domain → `%VITE_SITE_URL%` (set env saat build). `api.delete` di `src/lib/api.js` dead code (semua tulis POST) — dibiarkan.

6. **Env vars produksi**: `DATABASE_URL`, `JWT_SECRET`, `VITE_SITE_URL`; Blob via OIDC (store terhubung) atau `BLOB_READ_WRITE_TOKEN`.

7. **Verifikasi**: smoke test 6/6 + E2E handler-level 17/17 PASS vs MySQL lokal (login benar/salah, cookie auth, CRUD, reorder, delete, stats, upload fallback). Gate Oracle Fase 1 & 3 approve-with-changes, remediation selesai.

8. **Catatan deploy**: PHP `api/` root repo dipertahankan untuk dev XAMPP. `vite.config.js` masih proxy ke PHP (dev-against-PHP sampai cutover). Kredensial admin tetap `admin` / `admin1922`.

### 2026-08-24 — Tambahan ringan beban-nol: 404, ErrorBoundary, PWA-lite, OG image, share

1. **Route 404** (`src/pages/NotFoundPage.jsx` + catch-all `path="*"` PALING AKHIR di
   `App.jsx`) — URL salah tidak lagi render kosong; tema gelap-emas konsisten,
   tombol "Kembali ke Beranda".

2. **ErrorBoundary** (`src/components/ErrorBoundary.jsx`) — dibungkus di `main.jsx`
   di atas `BrowserRouter`, menangkap juga kegagalan chunk lazy admin. Fallback kartu
   gelap + tombol "Muat Ulang Halaman"; error hanya ke console.

3. **Skip-to-content** — link fokusabel pertama di landing ("Langsung ke konten utama"),
   visually-hidden sampai `:focus-visible`; `<main id="konten-utama" tabIndex={-1}>`;
   utilitas `.skip-link` di `index.css`.

4. **Tombol "Bagikan" native** (`Footer.jsx`) — `navigator.share` dengan feature-detect;
   fallback clipboard + toast self-contained "Link disalin" (pola toast existing karena
   ToastProvider hanya ada di subtree admin).

5. **PWA-lite tanpa service worker** — `public/manifest.json` (standalone, #050505,
   lang id); ikon `icons/icon-192.png` & `icon-512.png` digenerate dari `logopsht.png`
   via System.Drawing; `index.html` + link manifest + apple-touch-icon.

6. **OG image 1200×630** — sumber desain `public/og-image.html` (Cinzel via Google
   Fonts, glow emas, grain) → screenshot headless Edge (`--window-size=1200,630
   --virtual-time-budget=10000`) → flatten JPG q90 `public/og-image.jpg` (76 KB).
   `index.html`: `og:image` → og-image.jpg, `twitter:card` → `summary_large_image`.

7. **PENTING saat deploy**: canonical, `og:url`, `og:image`, JSON-LD masih memakai
   placeholder `https://domain-produksi.contoh/` — WAJIB diganti domain asli.

8. **Verifikasi**: build sukses; bundle JS 275 KB (gzip ±85 KB, naik ~6 KB untuk semua
   fitur baru); manifest/ikon/og-image.jpg ter-copy ke `dist/`. Zero dependency baru.
   Catatan: og-image.jpg belum diverifikasi visual oleh agen (model tak bisa baca gambar)
   — cek manual bila perlu.

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

11. **Tombol "Bergabung Sekarang" dihapus** — CTA hero kini statis ("Gabung Sekarang"
    → WhatsApp kontak). Kolom `teks_tombol` & `link_tombol` sudah di-DROP dari DB
    (`hero`), dibersihkan dari `schema.sql`, API (`admin.php`, `content.php`),
    form admin (`HeroPage.jsx`), dan `data.js`.

12. **Tes E2E menyeluruh — SEMUA LOLOS**: DB & seed utuh; 6 endpoint publik 200;
    auth lengkap (401 password salah, logout mematikan sesi); CRUD round-trip
    create/update/reorder/delete; upload JPEG tersimpan & terlayani (Apache + proxy
    Vite); file palsu (.jpg berisi teks) ditolak 422 oleh validasi finfo; delete
    record ikut menghapus file fisik; frontend & build produksi bersih.

---
