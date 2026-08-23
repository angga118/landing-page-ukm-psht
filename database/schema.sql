-- schema.sql untuk UKM PSHT Landing Page
-- DB: ukmpsht, charset utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS `ukmpsht` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ukmpsht`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `admin_user`;
DROP TABLE IF EXISTS `hero`;
DROP TABLE IF EXISTS `sejarah`;
DROP TABLE IF EXISTS `pengurus`;
DROP TABLE IF EXISTS `prestasi`;
DROP TABLE IF EXISTS `galeri`;
DROP TABLE IF EXISTS `kontak`;

-- hero
CREATE TABLE `hero` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL DEFAULT '',
  `tagline` VARCHAR(500) NOT NULL DEFAULT '',
  `foto_background` VARCHAR(512) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sejarah
CREATE TABLE `sejarah` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `konten` TEXT NOT NULL,
  `foto` VARCHAR(512) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- pengurus
CREATE TABLE `pengurus` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `jabatan` VARCHAR(255) NOT NULL,
  `foto` VARCHAR(512) NOT NULL DEFAULT '',
  `periode` VARCHAR(100) NOT NULL DEFAULT '',
  `urutan` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- prestasi
CREATE TABLE `prestasi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_lomba` VARCHAR(255) NOT NULL,
  `tingkat` VARCHAR(100) NOT NULL,
  `tahun` VARCHAR(10) NOT NULL,
  `foto` VARCHAR(512) NOT NULL DEFAULT '',
  `urutan` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- galeri
CREATE TABLE `galeri` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `foto` VARCHAR(512) NOT NULL DEFAULT '',
  `kategori` VARCHAR(100) NOT NULL DEFAULT '',
  `urutan` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- kontak
CREATE TABLE `kontak` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `whatsapp` VARCHAR(100) NOT NULL DEFAULT '',
  `email` VARCHAR(255) NOT NULL DEFAULT '',
  `alamat` TEXT NOT NULL,
  `jadwal_latihan` VARCHAR(255) NOT NULL DEFAULT '',
  `instagram` VARCHAR(255) NOT NULL DEFAULT '',
  `maps_embed` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- admin_user
CREATE TABLE `admin_user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed data

INSERT INTO `hero` (`judul`, `tagline`, `foto_background`) VALUES
("UKM PSHT UPN \"Veteran\" Jawa Timur", "Tangguh Dalam Aksi, Unggul Dalam Prestasi", "");

INSERT INTO `sejarah` (`konten`, `foto`) VALUES
("Persaudaraan Setia Hati Terate (PSHT) didirikan pada tahun 1922 di Desa Pilangbango, Madiun oleh Ki Hadjar Hardjo Oetomo, dan kemudian dikembangkan secara luas mulai tahun 1925 di Surabaya oleh R. Hadisoebroto bersama para pendahulu lainnya. PSHT tumbuh sebagai organisasi pencak silat yang mengajarkan tidak hanya teknik bela diri, tetapi juga budi pekerti luhur, persaudaraan, dan kepedulian sosial. Dengan falsafah \"Manusia dapat dihancurkan, manusia dapat dimatikan, tetapi manusia tidak dapat dikalahkan selama manusia itu setia pada hatinya sendiri\", PSHT berkembang menjadi salah satu perguruan pencak silat terbesar di Indonesia.\n\nUKM PSHT di UPN \"Veteran\" Jawa Timur hadir sebagai wadah pembinaan mahasiswa yang ingin melestarikan budaya pencak silat sekaligus membentuk karakter tangguh, disiplin, dan berprestasi. Berdiri sejak awal 2000-an atas inisiatif mahasiswa pecinta silat, UKM ini secara rutin menggelar latihan mingguan, penataran materi ke-SH-an, serta kegiatan sosial seperti bakti desa dan pengabdian masyarakat. Dengan dukungan universitas dan pengurus cabang PSHT Kota Surabaya, UKM PSHT UPN Jatim terus mencetak kader yang unggul dalam akademik maupun kejuaraan pencak silat.\n\nHingga kini, UKM PSHT UPN \"Veteran\" Jawa Timur aktif berpartisipasi dalam berbagai kejuaraan tingkat regional hingga nasional, serta menjadi ruang persaudaraan bagi mahasiswa dari berbagai jurusan. Nilai persaudaraan, kekeluargaan, dan nasionalisme menjadi landasan utama dalam setiap kegiatan. Melalui latihan yang konsisten dan pembinaan mental yang kuat, UKM ini berkomitmen melahirkan pendekar yang tidak hanya berprestasi di gelanggang, tetapi juga bermanfaat bagi masyarakat.", "");

INSERT INTO `kontak` (`whatsapp`, `email`, `alamat`, `jadwal_latihan`, `instagram`, `maps_embed`) VALUES
("6281234567890", "ukm.psht@upnjatim.ac.id", "Jl. Rungkut Madya No.1, Gn. Anyar, Kec. Gn. Anyar, Surabaya, Jawa Timur 60294 - Gedung UKM Lt.2, UPN \"Veteran\" Jawa Timur", "Senin & Kamis, 16.00 - 18.00 WIB (Lapangan Merdeka UPN Jatim) | Sabtu, 07.00 - 09.00 WIB (Latihan Alam)", "@psht_upnjatim", "");

INSERT INTO `pengurus` (`nama`, `jabatan`, `foto`, `periode`, `urutan`) VALUES
("Budi Santoso, S.T.", "Ketua Umum", "", "2024/2025", 1),
("Siti Aminah", "Wakil Ketua", "", "2024/2025", 2),
("Rizky Pratama", "Sekretaris", "", "2024/2025", 3),
("Dewi Lestari", "Bendahara", "", "2024/2025", 4);

INSERT INTO `prestasi` (`nama_lomba`, `tingkat`, `tahun`, `foto`, `urutan`) VALUES
("Kejuaraan Pencak Silat Piala Rektor UPN Jatim", "Regional", "2024", "", 1),
("Porprov Jawa Timur Cabor Pencak Silat Kelas C", "Provinsi", "2023", "", 2),
("Kejuaraan Nasional PSHT Antar Cabang", "Nasional", "2023", "", 3),
("Surabaya Martial Arts Festival - Seni Tunggal", "Regional", "2024", "", 4);

INSERT INTO `galeri` (`foto`, `kategori`, `urutan`) VALUES
("", "Latihan", 1),
("", "Kejuaraan", 2),
("", "Latihan", 3),
("", "Kegiatan", 4),
("", "Kejuaraan", 5),
("", "Kegiatan", 6);

INSERT INTO `admin_user` (`username`, `password_hash`, `role`) VALUES
("admin", "$2y$10$BXekNaMHSAN1M2w1zOxcaeJD6P11O/1dCiFmqyh2dj5dIh0oosYZC", "admin");

SET FOREIGN_KEY_CHECKS=1;
