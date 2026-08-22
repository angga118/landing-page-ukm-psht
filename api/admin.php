<?php
// admin.php - CRUD /admin/*

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function handleAdmin(string $path, string $method): void {
    $pdo = getPDO();

    // Guard - already checked in index except login
    if (empty($_SESSION['user'])) {
        jsonError('Unauthorized', 401);
    }

    // GET /admin/stats
    if ($path === '/admin/stats' && $method === 'GET') {
        try {
            $counts = [];
            foreach (['pengurus', 'prestasi', 'galeri'] as $tbl) {
                $stmt = $pdo->query("SELECT COUNT(*) AS c FROM `$tbl`");
                $row = $stmt->fetch();
                $counts[$tbl] = (int)$row['c'];
            }
            jsonSuccess(['counts' => $counts]);
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // Singleton content handlers
    if ($path === '/admin/content/hero' && $method === 'POST') {
        $data = getRequestData();
        $judul = trim($data['judul'] ?? '');
        $tagline = trim($data['tagline'] ?? '');
        $teks_tombol = trim($data['teks_tombol'] ?? '');
        $link_tombol = trim($data['link_tombol'] ?? '');

        // foto_background upload
        $foto = handleUpload('foto_background', 'hero');
        // alternative field name 'foto' ?
        if ($foto === null && isset($_FILES['foto'])) {
            $foto = handleUpload('foto', 'hero');
        }

        try {
            $stmt = $pdo->query("SELECT id, foto_background FROM hero ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();

            if ($existing) {
                $oldFoto = $existing['foto_background'];
                // if no new foto, keep old
                $newFoto = $foto ?? $oldFoto;
                if ($foto !== null && !empty($oldFoto) && $oldFoto !== $newFoto) {
                    deleteOldFile($oldFoto);
                }
                // Use values if provided, otherwise keep old
                // Fetch full row for fallback
                $stmt2 = $pdo->prepare("SELECT judul, tagline, teks_tombol, link_tombol FROM hero WHERE id = ?");
                $stmt2->execute([$existing['id']]);
                $old = $stmt2->fetch();
                $finalJudul = $judul !== '' ? $judul : $old['judul'];
                $finalTagline = $tagline !== '' ? $tagline : $old['tagline'];
                $finalTeks = $teks_tombol !== '' ? $teks_tombol : $old['teks_tombol'];
                $finalLink = $link_tombol !== '' ? $link_tombol : $old['link_tombol'];

                $upd = $pdo->prepare("UPDATE hero SET judul=?, tagline=?, foto_background=?, teks_tombol=?, link_tombol=? WHERE id=?");
                $upd->execute([$finalJudul, $finalTagline, $newFoto, $finalTeks, $finalLink, $existing['id']]);
                $stmt = $pdo->prepare("SELECT id, judul, tagline, foto_background, teks_tombol, link_tombol FROM hero WHERE id=?");
                $stmt->execute([$existing['id']]);
                jsonSuccess($stmt->fetch());
            } else {
                // Insert - require judul? allow empty but provide default
                $ins = $pdo->prepare("INSERT INTO hero (judul, tagline, foto_background, teks_tombol, link_tombol) VALUES (?,?,?,?,?)");
                $ins->execute([$judul, $tagline, $foto ?? '', $teks_tombol, $link_tombol]);
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, judul, tagline, foto_background, teks_tombol, link_tombol FROM hero WHERE id=?");
                $stmt->execute([$id]);
                jsonSuccess($stmt->fetch());
            }
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    if ($path === '/admin/content/sejarah' && $method === 'POST') {
        $data = getRequestData();
        $konten = trim($data['konten'] ?? '');
        $foto = handleUpload('foto', 'sejarah');

        try {
            $stmt = $pdo->query("SELECT id, foto FROM sejarah ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();
            if ($existing) {
                $oldFoto = $existing['foto'];
                $newFoto = $foto ?? $oldFoto;
                if ($foto !== null && !empty($oldFoto) && $oldFoto !== $newFoto) {
                    deleteOldFile($oldFoto);
                }
                $stmt2 = $pdo->prepare("SELECT konten FROM sejarah WHERE id=?");
                $stmt2->execute([$existing['id']]);
                $old = $stmt2->fetch();
                $finalKonten = $konten !== '' ? $konten : $old['konten'];

                $upd = $pdo->prepare("UPDATE sejarah SET konten=?, foto=? WHERE id=?");
                $upd->execute([$finalKonten, $newFoto, $existing['id']]);
                $stmt = $pdo->prepare("SELECT id, konten, foto FROM sejarah WHERE id=?");
                $stmt->execute([$existing['id']]);
                jsonSuccess($stmt->fetch());
            } else {
                $ins = $pdo->prepare("INSERT INTO sejarah (konten, foto) VALUES (?,?)");
                $ins->execute([$konten, $foto ?? '']);
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, konten, foto FROM sejarah WHERE id=?");
                $stmt->execute([$id]);
                jsonSuccess($stmt->fetch());
            }
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    if ($path === '/admin/content/kontak' && $method === 'POST') {
        $data = getRequestData();
        // Accept JSON or POST
        $whatsapp = trim($data['whatsapp'] ?? '');
        $email = trim($data['email'] ?? '');
        $alamat = trim($data['alamat'] ?? '');
        $jadwal_latihan = trim($data['jadwal_latihan'] ?? '');
        $instagram = trim($data['instagram'] ?? '');
        $maps_embed = trim($data['maps_embed'] ?? '');

        try {
            $stmt = $pdo->query("SELECT id FROM kontak ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();
            if ($existing) {
                $upd = $pdo->prepare("UPDATE kontak SET whatsapp=?, email=?, alamat=?, jadwal_latihan=?, instagram=?, maps_embed=? WHERE id=?");
                $upd->execute([$whatsapp, $email, $alamat, $jadwal_latihan, $instagram, $maps_embed, $existing['id']]);
                $stmt = $pdo->prepare("SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak WHERE id=?");
                $stmt->execute([$existing['id']]);
                jsonSuccess($stmt->fetch());
            } else {
                $ins = $pdo->prepare("INSERT INTO kontak (whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed) VALUES (?,?,?,?,?,?)");
                $ins->execute([$whatsapp, $email, $alamat, $jadwal_latihan, $instagram, $maps_embed]);
                $id = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT id, whatsapp, email, alamat, jadwal_latihan, instagram, maps_embed FROM kontak WHERE id=?");
                $stmt->execute([$id]);
                jsonSuccess($stmt->fetch());
            }
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // Resource CRUD: pengurus, prestasi, galeri
    $resources = ['pengurus', 'prestasi', 'galeri'];

    // GET /admin/{resource}
    if ($method === 'GET' && preg_match('#^/admin/(pengurus|prestasi|galeri)$#', $path, $m)) {
        $res = $m[1];
        try {
            if ($res === 'pengurus') {
                $stmt = $pdo->query("SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus ORDER BY urutan ASC, id ASC");
            } elseif ($res === 'prestasi') {
                $stmt = $pdo->query("SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi ORDER BY urutan ASC, id ASC");
            } else {
                $stmt = $pdo->query("SELECT id, foto, kategori, urutan FROM galeri ORDER BY urutan ASC, id ASC");
            }
            jsonSuccess($stmt->fetchAll());
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // POST /admin/{resource}  create/update
    if ($method === 'POST' && preg_match('#^/admin/(pengurus|prestasi|galeri)$#', $path, $m)) {
        $res = $m[1];
        $data = getRequestData();
        $id = isset($data['id']) && $data['id'] !== '' ? (int)$data['id'] : null;

        try {
            if ($res === 'pengurus') {
                $nama = trim($data['nama'] ?? '');
                $jabatan = trim($data['jabatan'] ?? '');
                $periode = trim($data['periode'] ?? '');
                $errors = [];
                if ($nama === '') $errors['nama'] = 'Nama wajib diisi';
                if ($jabatan === '') $errors['jabatan'] = 'Jabatan wajib diisi';
                if (!empty($errors)) jsonError('Validasi gagal', 422, $errors);

                $foto = handleUpload('foto', 'pengurus');

                if ($id) {
                    $stmt = $pdo->prepare("SELECT foto FROM pengurus WHERE id=?");
                    $stmt->execute([$id]);
                    $old = $stmt->fetch();
                    if (!$old) jsonError('Data tidak ditemukan', 404);
                    $newFoto = $foto ?? $old['foto'];
                    if ($foto !== null && !empty($old['foto']) && $old['foto'] !== $newFoto) {
                        deleteOldFile($old['foto']);
                    }
                    $upd = $pdo->prepare("UPDATE pengurus SET nama=?, jabatan=?, foto=?, periode=? WHERE id=?");
                    $upd->execute([$nama, $jabatan, $newFoto, $periode, $id]);
                    $stmt = $pdo->prepare("SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus WHERE id=?");
                    $stmt->execute([$id]);
                    jsonSuccess($stmt->fetch());
                } else {
                    // get max urutan
                    $stmt = $pdo->query("SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM pengurus");
                    $nxt = (int)$stmt->fetch()['nxt'];
                    $ins = $pdo->prepare("INSERT INTO pengurus (nama, jabatan, foto, periode, urutan) VALUES (?,?,?,?,?)");
                    $ins->execute([$nama, $jabatan, $foto ?? '', $periode, $nxt]);
                    $newId = $pdo->lastInsertId();
                    $stmt = $pdo->prepare("SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus WHERE id=?");
                    $stmt->execute([$newId]);
                    jsonSuccess($stmt->fetch());
                }
            } elseif ($res === 'prestasi') {
                $nama_lomba = trim($data['nama_lomba'] ?? '');
                $tingkat = trim($data['tingkat'] ?? '');
                $tahun = trim($data['tahun'] ?? '');
                $errors = [];
                if ($nama_lomba === '') $errors['nama_lomba'] = 'Nama lomba wajib diisi';
                if ($tingkat === '') $errors['tingkat'] = 'Tingkat wajib diisi';
                if ($tahun === '') $errors['tahun'] = 'Tahun wajib diisi';
                elseif (!preg_match('/^\d{4}$/', $tahun)) $errors['tahun'] = 'Tahun harus 4 digit';
                if (!empty($errors)) jsonError('Validasi gagal', 422, $errors);

                $foto = handleUpload('foto', 'prestasi');

                if ($id) {
                    $stmt = $pdo->prepare("SELECT foto FROM prestasi WHERE id=?");
                    $stmt->execute([$id]);
                    $old = $stmt->fetch();
                    if (!$old) jsonError('Data tidak ditemukan', 404);
                    $newFoto = $foto ?? $old['foto'];
                    if ($foto !== null && !empty($old['foto']) && $old['foto'] !== $newFoto) {
                        deleteOldFile($old['foto']);
                    }
                    $upd = $pdo->prepare("UPDATE prestasi SET nama_lomba=?, tingkat=?, tahun=?, foto=? WHERE id=?");
                    $upd->execute([$nama_lomba, $tingkat, $tahun, $newFoto, $id]);
                    $stmt = $pdo->prepare("SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi WHERE id=?");
                    $stmt->execute([$id]);
                    jsonSuccess($stmt->fetch());
                } else {
                    $stmt = $pdo->query("SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM prestasi");
                    $nxt = (int)$stmt->fetch()['nxt'];
                    $ins = $pdo->prepare("INSERT INTO prestasi (nama_lomba, tingkat, tahun, foto, urutan) VALUES (?,?,?,?,?)");
                    $ins->execute([$nama_lomba, $tingkat, $tahun, $foto ?? '', $nxt]);
                    $newId = $pdo->lastInsertId();
                    $stmt = $pdo->prepare("SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi WHERE id=?");
                    $stmt->execute([$newId]);
                    jsonSuccess($stmt->fetch());
                }
            } else { // galeri
                $kategori = trim($data['kategori'] ?? '');
                $foto = handleUpload('foto', 'galeri');

                if ($id) {
                    $stmt = $pdo->prepare("SELECT foto FROM galeri WHERE id=?");
                    $stmt->execute([$id]);
                    $old = $stmt->fetch();
                    if (!$old) jsonError('Data tidak ditemukan', 404);
                    // if no new foto keep old
                    $newFoto = $foto ?? $old['foto'];
                    if ($foto !== null && !empty($old['foto']) && $old['foto'] !== $newFoto) {
                        deleteOldFile($old['foto']);
                    }
                    // at least foto must exist after update
                    if (empty($newFoto)) jsonError('Validasi gagal', 422, ['foto' => 'Foto wajib diisi']);
                    $upd = $pdo->prepare("UPDATE galeri SET foto=?, kategori=? WHERE id=?");
                    $upd->execute([$newFoto, $kategori, $id]);
                    $stmt = $pdo->prepare("SELECT id, foto, kategori, urutan FROM galeri WHERE id=?");
                    $stmt->execute([$id]);
                    jsonSuccess($stmt->fetch());
                } else {
                    if ($foto === null) jsonError('Validasi gagal', 422, ['foto' => 'Foto wajib diisi']);
                    $stmt = $pdo->query("SELECT COALESCE(MAX(urutan),0)+1 AS nxt FROM galeri");
                    $nxt = (int)$stmt->fetch()['nxt'];
                    $ins = $pdo->prepare("INSERT INTO galeri (foto, kategori, urutan) VALUES (?,?,?)");
                    $ins->execute([$foto, $kategori, $nxt]);
                    $newId = $pdo->lastInsertId();
                    $stmt = $pdo->prepare("SELECT id, foto, kategori, urutan FROM galeri WHERE id=?");
                    $stmt->execute([$newId]);
                    jsonSuccess($stmt->fetch());
                }
            }
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // POST /admin/{resource}/delete
    if ($method === 'POST' && preg_match('#^/admin/(pengurus|prestasi|galeri)/delete$#', $path, $m)) {
        $res = $m[1];
        $input = getJsonInput();
        if (empty($input) && !empty($_POST)) $input = $_POST;
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) jsonError('Validasi gagal', 422, ['id' => 'ID wajib diisi']);

        try {
            $stmt = $pdo->prepare("SELECT foto FROM `$res` WHERE id=?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) jsonError('Data tidak ditemukan', 404);
            // delete file
            if (!empty($row['foto'])) deleteOldFile($row['foto']);
            $del = $pdo->prepare("DELETE FROM `$res` WHERE id=?");
            $del->execute([$id]);
            jsonSuccess(['ok' => true]);
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // POST /admin/{resource}/reorder
    if ($method === 'POST' && preg_match('#^/admin/(pengurus|prestasi|galeri)/reorder$#', $path, $m)) {
        $res = $m[1];
        $input = getJsonInput();
        if (empty($input) && !empty($_POST)) $input = $_POST;
        // Support JSON string for ids if sent as form
        $ids = $input['ids'] ?? null;
        if (is_string($ids)) {
            $decoded = json_decode($ids, true);
            if (json_last_error() === JSON_ERROR_NONE) $ids = $decoded;
        }
        if (!is_array($ids) || empty($ids)) {
            jsonError('Validasi gagal', 422, ['ids' => 'ids harus array tidak kosong']);
        }
        // Validate all integers
        $clean = [];
        foreach ($ids as $v) {
            $int = (int)$v;
            if ($int <= 0) jsonError('Validasi gagal', 422, ['ids' => 'ids harus berisi ID valid']);
            $clean[] = $int;
        }

        try {
            $pdo->beginTransaction();
            foreach ($clean as $idx => $id) {
                $stmt = $pdo->prepare("UPDATE `$res` SET urutan=? WHERE id=?");
                $stmt->execute([$idx + 1, $id]);
            }
            $pdo->commit();
            // return list ordered
            if ($res === 'pengurus') {
                $stmt = $pdo->query("SELECT id, nama, jabatan, foto, periode, urutan FROM pengurus ORDER BY urutan ASC, id ASC");
            } elseif ($res === 'prestasi') {
                $stmt = $pdo->query("SELECT id, nama_lomba, tingkat, tahun, foto, urutan FROM prestasi ORDER BY urutan ASC, id ASC");
            } else {
                $stmt = $pdo->query("SELECT id, foto, kategori, urutan FROM galeri ORDER BY urutan ASC, id ASC");
            }
            jsonSuccess($stmt->fetchAll());
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    jsonError('Endpoint tidak ditemukan', 404);
}
