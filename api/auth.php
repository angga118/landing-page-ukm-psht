<?php
// auth.php - login/logout/me + guard session

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

function handleAuth(string $path, string $method): void {
    $pdo = getPDO();

    // POST /admin/login
    if ($path === '/admin/login') {
        if ($method !== 'POST') {
            jsonError('Method tidak diizinkan', 404);
        }
        $input = getJsonInput();
        // fallback to POST if json empty (support form)
        if (empty($input) && !empty($_POST)) {
            $input = $_POST;
        }
        $username = trim($input['username'] ?? '');
        $password = $input['password'] ?? '';

        $errors = [];
        if ($username === '') $errors['username'] = 'Username wajib diisi';
        if ($password === '') $errors['password'] = 'Password wajib diisi';
        if (!empty($errors)) {
            jsonError('Validasi gagal', 422, $errors);
        }

        try {
            $stmt = $pdo->prepare("SELECT id, username, password_hash, role FROM admin_user WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            if (!$user || !password_verify($password, $user['password_hash'])) {
                // sleep 1s on failure if needed
                sleep(1);
                jsonError('Username atau password salah', 401);
            }

            // success - set session
            session_regenerate_id(true);
            $_SESSION['user'] = [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
            ];
            jsonSuccess(['user' => $_SESSION['user']]);
        } catch (PDOException $e) {
            jsonError('Terjadi kesalahan server', 500);
        }
    }

    // POST /admin/logout
    if ($path === '/admin/logout') {
        if ($method !== 'POST') {
            jsonError('Method tidak diizinkan', 404);
        }
        // clear session
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        jsonSuccess(['ok' => true]);
    }

    // GET /admin/me
    if ($path === '/admin/me') {
        if ($method !== 'GET') {
            jsonError('Method tidak diizinkan', 404);
        }
        if (empty($_SESSION['user'])) {
            jsonError('Unauthorized', 401);
        }
        jsonSuccess(['user' => $_SESSION['user']]);
    }

    jsonError('Endpoint tidak ditemukan', 404);
}
