<?php
// config.php - kredensial DB + konstanta

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'ukmpsht');
define('DB_USER', 'root');
define('DB_PASS', ''); // XAMPP default root tanpa password
define('DB_CHARSET', 'utf8mb4');

// Upload constants
define('UPLOAD_MAX_SIZE', 2 * 1024 * 1024); // 2 MB
define('UPLOAD_ALLOWED_MIMES', [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
]);
