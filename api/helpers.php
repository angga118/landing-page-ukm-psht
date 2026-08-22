<?php
// helpers.php - envelope json, validasi, upload

function jsonSuccess($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(string $message, int $status = 400, $errors = null): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    $payload = ['success' => false, 'message' => $message];
    if ($errors !== null) {
        $payload['errors'] = $errors;
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        // Try to handle case where input is form-data but caller expects json
        return [];
    }
    return is_array($data) ? $data : [];
}

function getRequestData(): array {
    $ct = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($ct, 'application/json') !== false) {
        return getJsonInput();
    }
    // For multipart/form-data or x-www-form-urlencoded, use $_POST
    // But also try json fallback if $_POST empty
    if (!empty($_POST)) {
        return $_POST;
    }
    $json = getJsonInput();
    return $json;
}

function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        jsonError('Unauthorized', 401);
    }
    return $_SESSION['user'];
}

function handleUpload(string $field, string $resource): ?string {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonError('Gagal upload file', 422, [$field => 'Error upload: ' . $file['error']]);
    }

    if ($file['size'] > UPLOAD_MAX_SIZE) {
        jsonError('Validasi gagal', 422, [$field => 'Ukuran file maksimal 2MB']);
    }

    // Validate MIME via finfo
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if ($mime === false) {
        jsonError('Validasi gagal', 422, [$field => 'Tidak dapat membaca tipe file']);
    }
    if (!isset(UPLOAD_ALLOWED_MIMES[$mime])) {
        jsonError('Validasi gagal', 422, [$field => 'Format harus JPG, PNG, atau WebP']);
    }
    $ext = UPLOAD_ALLOWED_MIMES[$mime];

    // Ensure directory exists
    $dir = __DIR__ . '/uploads/' . $resource;
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0775, true) && !is_dir($dir)) {
            jsonError('Gagal menyimpan file', 500);
        }
    }

    // Random slug
    $random = bin2hex(random_bytes(16));
    $filename = $random . '.' . $ext;
    $dest = $dir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        jsonError('Gagal menyimpan file', 500);
    }

    // Return path as per contract: /api/uploads/{resource}/{file}
    return '/api/uploads/' . $resource . '/' . $filename;
}

function deleteOldFile(?string $path): void {
    if (empty($path)) return;
    // Only delete if path starts with /api/uploads/
    if (strpos($path, '/api/uploads/') !== 0) return;
    // Convert to filesystem path: __DIR__ . substr(path, 4)
    $full = __DIR__ . substr($path, 4); // /api = 4 chars
    if (is_file($full)) {
        @unlink($full);
    }
}

function ensureCors(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Vary: Origin');
}
