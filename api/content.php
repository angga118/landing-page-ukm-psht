<?php
// content.php - endpoint publik /content/*

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function handleContent(string $path, string $method): void {
    if ($method !== 'GET') {
        jsonError('Method tidak diizinkan', 404);
    }

    $pdo = getPDO();

    try {
        switch ($path) {
            case '/content/hero':
                $stmt = $pdo->query("SELECT id, judul, tagline, foto_background, teks_tombol, link_tombol FROM hero ORDER BY id DESC LIMIT 1");
                $row = $stmt->fetch();
                if (!$row) {
                    jsonSuccess(new stdClass());
                } else {
                    jsonSuccess($row);
                }
                break;

            case '/content/sejarah':
                $stmt = $pdo->query("SELECT id, konten, foto FROM sejarah ORDER BY id DESC LIMIT 1");
                $row = $stmt->fetch();
                if (!$row) {
                    jsonSuccess(new stdClass());
                } else {
                    jsonSuccess($row);
                }
                break;

            case '/content/pengurus':
                $stmt = $pdo->query("SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus ORDER BY urutan ASC, id ASC");
                $rows = $stmt->fetchAll();
                jsonSuccess($rows);
                break;

            case '/content/prestasi':
                $stmt = $pdo->query("SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi ORDER BY urutan ASC, id ASC");
                $rows = $stmt->fetchAll();
                jsonSuccess($rows);
                break;

            case '/content/galeri':
                $stmt = $pdo->query("SELECT id, foto, kategori, urutan FROM galeri ORDER BY urutan ASC, id ASC");
                $rows = $stmt->fetchAll();
                jsonSuccess($rows);
                break;

            case '/content/kontak':
                $stmt = $pdo->query("SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak ORDER BY id DESC LIMIT 1");
                $row = $stmt->fetch();
                if (!$row) {
                    jsonSuccess(new stdClass());
                } else {
                    jsonSuccess($row);
                }
                break;

            default:
                jsonError('Endpoint tidak ditemukan', 404);
        }
    } catch (PDOException $e) {
        jsonError('Terjadi kesalahan server', 500);
    }
}
