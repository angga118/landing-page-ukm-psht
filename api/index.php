<?php
// index.php - front controller

// Session
session_start();

// CORS longgar sebagai jaring pengaman
require_once __DIR__ . '/helpers.php';
ensureCors();

// Handle preflight
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Error handling global
set_exception_handler(function ($e) {
    // Log maybe
    jsonError('Terjadi kesalahan server', 500);
});

// Parse path setelah /api
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
// Normalize: find position of /api
$pos = strpos($requestUri, '/api');
if ($pos === false) {
    jsonError('Endpoint tidak ditemukan', 404);
}
$path = substr($requestUri, $pos + 4); // after /api
if ($path === '' || $path === false) $path = '/';
if ($path[0] !== '/') $path = '/' . $path;
// Remove trailing slash except root
if (strlen($path) > 1) {
    $path = rtrim($path, '/');
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Routing
try {
    // Content publik
    if (strpos($path, '/content/') === 0) {
        require_once __DIR__ . '/content.php';
        handleContent($path, $method);
        exit;
    }

    // Auth endpoints
    if (in_array($path, ['/admin/login', '/admin/logout', '/admin/me'], true)) {
        require_once __DIR__ . '/auth.php';
        handleAuth($path, $method);
        exit;
    }

    // Admin CRUD + stats + singleton content
    if (strpos($path, '/admin/') === 0) {
        require_once __DIR__ . '/admin.php';
        handleAdmin($path, $method);
        exit;
    }

    jsonError('Endpoint tidak ditemukan', 404);
} catch (Throwable $ex) {
    // If already sent response via jsonSuccess/jsonError exit, this won't run
    // For unexpected errors
    if (!headers_sent()) {
        jsonError('Terjadi kesalahan server', 500);
    }
}
