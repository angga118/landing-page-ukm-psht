import heroBg from '../assets/hero.png'

// Fallback content — bentuk persis sama dengan respons /content/* (lihat docs/API_CONTRACT.md).
// Digunakan sebagai initial state agar halaman tetap tampil sempurna walau API mati.
// Field gambar (foto*) dikosongkan agar SmartImage menampilkan placeholder bergaya;
// kecuali hero yang memakai aset lokal (hero.png) agar tampilan hero selalu utuh.

export const FALLBACK_CONTENT = {
  hero: {
    id: 1,
    judul: "UKM PSHT UPN 'Veteran' Jawa Timur",
    tagline: 'Tangguh Dalam Aksi, Unggul Dalam Prestasi',
    foto_background: heroBg,
  },

  sejarah: {
    id: 1,
    konten: `Persaudaraan Setia Hati Terate (PSHT) merupakan organisasi pencak silat tertua di Indonesia yang lahir pada tahun 1922 di Madiun, Jawa Timur, atas gagasan Ki Ageng Soerodiwiryo. Semangat persaudaraan, disiplin, dan kejujuran yang dibangun sejak awal menjadi ruh yang terus dipegang teguh oleh setiap warga PSHT di manapun berada, termasuk di lingkungan kampus.

Unit Kegiatan Mahasiswa PSHT UPN "Veteran" Jawa Timur didirikan sebagai wadah bagi mahasiswa yang ingin menekuni pencak silat sekaligus mengasah karakter melalui latihan fisik, mental, dan spiritual. Di bawah bimbingan pelatih bersertifikat, anggota rutin berlatih teknik bela diri, jurus, serta nilai-nilai kekeluargaan yang menjadi identitas organisasi.

Hingga kini, UKM PSHT UPN "Veteran" Jatim telah mencetak generasi mahasiswa yang tidak hanya tangguh di gelanggang, tetapi juga aktif meraih prestasi akademik dan kegiatan kemahasiswaan. Kebersamaan antarwarga menjadi pondasi utama dalam menjaga nama baik almamater dan persaudaraan.`,
    foto: '',
  },

  pengurus: [
    { id: 1, nama: 'Rangga Pratama', jabatan: 'Ketua Umum', foto: '', periode: '2024–2025', urutan: 1 },
    { id: 2, nama: 'Dewi Anggraini', jabatan: 'Wakil Ketua Umum', foto: '', periode: '2024–2025', urutan: 2 },
    { id: 3, nama: 'Bayu Setiawan', jabatan: 'Sekretaris Umum', foto: '', periode: '2024–2025', urutan: 3 },
    { id: 4, nama: 'Siti Maharani', jabatan: 'Bendahara Umum', foto: '', periode: '2024–2025', urutan: 4 },
    { id: 5, nama: 'Eko Saputro', jabatan: 'Koordinator Latihan', foto: '', periode: '2024–2025', urutan: 5 },
    { id: 6, nama: 'Nur Fadillah', jabatan: 'Koordinator Humas', foto: '', periode: '2024–2025', urutan: 6 },
  ],

  prestasi: [
    { id: 1, nama_lomba: 'POPMA UPN — Tanding Kelas B', tingkat: 'Perguruan Tinggi', tahun: 2023, foto: '', urutan: 1 },
    { id: 2, nama_lomba: 'Festival Silat Nusantara', tingkat: 'Regional', tahun: 2023, foto: '', urutan: 2 },
    { id: 3, nama_lomba: 'Kejuaraan Silat Antar-Perguruan', tingkat: 'Nasional', tahun: 2022, foto: '', urutan: 3 },
    { id: 4, nama_lomba: 'Turnamen Silat Merdeka Cup', tingkat: 'Regional', tahun: 2024, foto: '', urutan: 4 },
    { id: 5, nama_lomba: 'Seni Tunggal Putra', tingkat: 'Nasional', tahun: 2024, foto: '', urutan: 5 },
    { id: 6, nama_lomba: 'Ganda Putra', tingkat: 'Provinsi', tahun: 2023, foto: '', urutan: 6 },
    { id: 7, nama_lomba: 'Tanding Kelas B', tingkat: 'Regional', tahun: 2022, foto: '', urutan: 7 },
    { id: 8, nama_lomba: 'Seni Ganda', tingkat: 'Nasional', tahun: 2021, foto: '', urutan: 8 },
  ],

  galeri: [
    { id: 1, foto: '', kategori: 'Latihan', urutan: 1 },
    { id: 2, foto: '', kategori: 'Kejuaraan', urutan: 2 },
    { id: 3, foto: '', kategori: 'Upacara', urutan: 3 },
    { id: 4, foto: '', kategori: 'Kegiatan', urutan: 4 },
    { id: 5, foto: '', kategori: 'Latihan', urutan: 5 },
    { id: 6, foto: '', kategori: 'Kejuaraan', urutan: 6 },
    { id: 7, foto: '', kategori: 'Kegiatan', urutan: 7 },
    { id: 8, foto: '', kategori: 'Upacara', urutan: 8 },
  ],

  kontak: {
    id: 1,
    whatsapp: '6281234567890',
    email: 'ukmpsht@upnjatim.ac.id',
    alamat:
      "Sekretariat UKM PSHT, Kampus UPN 'Veteran' Jawa Timur, Jl. Raya Rungkut Madya, Gunung Anyar, Surabaya 60294",
    jadwal_latihan: "Selasa & Jumat\n16.00–18.00 WIB\nLapangan Olahraga UPN 'Veteran' Jatim",
    instagram: 'ukmpsht_upnvjt',
    maps_embed: 'https://www.google.com/maps?q=UPN%20Veteran%20Jawa%20Timur&output=embed',
  },
}

// Bangun link WhatsApp dari nomor (menangani format dengan/tanpa awalan 0 atau +62).
export function waLink(number) {
  if (!number) return 'https://wa.me/6281234567890'
  const clean = String(number).replace(/[^0-9]/g, '')
  const norm = clean.startsWith('0') ? '62' + clean.slice(1) : clean.startsWith('62') ? clean : '62' + clean
  return `https://wa.me/${norm}`
}
