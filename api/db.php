<?php
// Unified Database Connection: Neon PostgreSQL (Cloud) with Local MySQL fallback
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$pdo = null;
$db_driver = 'pgsql'; // 'pgsql' or 'mysql'

// Neon PostgreSQL Cloud Credentials
$neon_host = 'ep-wandering-hall-baveek4a.c-8.eu-central-1.aws.neon.tech';
$neon_user = 'neondb_owner';
$neon_pass = 'npg_rMZSmVv9TKt1';
$neon_name = 'neondb';
$neon_endpoint = 'ep-wandering-hall-baveek4a';

$env_db_url = getenv('DATABASE_URL') ?: getenv('DATABASE_URL_POOLED');
if (!empty($env_db_url)) {
    $parsed = parse_url($env_db_url);
    if (!empty($parsed['host'])) {
        $neon_host = $parsed['host'];
        $host_parts = explode('.', $parsed['host']);
        if (!empty($host_parts[0])) {
            $neon_endpoint = str_replace('-pooler', '', $host_parts[0]);
        }
    }
    if (!empty($parsed['user'])) $neon_user = $parsed['user'];
    if (!empty($parsed['pass'])) $neon_pass = $parsed['pass'];
    if (!empty($parsed['path'])) $neon_name = ltrim($parsed['path'], '/');
}

try {
    // 1. Try Neon Cloud Database First
    $dsn = "pgsql:host=$neon_host;port=5432;dbname=$neon_name;sslmode=require;options='endpoint=$neon_endpoint'";
    $pdo = new PDO($dsn, $neon_user, $neon_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);
    $db_driver = 'pgsql';
} catch (Exception $e) {
    // 2. Fallback to Local MySQL if offline
    try {
        $mysql_host = 'localhost';
        $mysql_user = 'root';
        $mysql_pass = '';
        $mysql_name = 'restaurant_menu';
        
        $pdo = new PDO("mysql:host=$mysql_host;dbname=$mysql_name;charset=utf8mb4", $mysql_user, $mysql_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $db_driver = 'mysql';
    } catch (Exception $ex) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur de connexion aux bases de données : ' . $e->getMessage() . ' / ' . $ex->getMessage()
        ]);
        exit();
    }
}
