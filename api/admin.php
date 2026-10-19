<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 1. Initialiser ou mettre à jour les tables dans Neon (PostgreSQL) et MySQL
try {
    if ($db_driver === 'pgsql') {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                msg_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(120) NOT NULL,
                email VARCHAR(120) NOT NULL,
                phone VARCHAR(50),
                subject VARCHAR(150),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'unread',
                created_at BIGINT NOT NULL
            );
            -- Assurer que la table admins a toutes les colonnes nécessaires
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS email VARCHAR(120) DEFAULT 'emma.johnson@flavorist.ma';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS phone VARCHAR(50) DEFAULT '+212 661-998877';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS full_name VARCHAR(120) DEFAULT 'Emma Johnson';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_title VARCHAR(120) DEFAULT 'Chef Exécutif & Admin Système';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT 'Chef de Cuisine & Gestionnaire Général de Flavorist Restaurant.';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80';
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT TRUE;
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS login_alerts_enabled BOOLEAN DEFAULT TRUE;
            ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ");
    } else {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                msg_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(120) NOT NULL,
                email VARCHAR(120) NOT NULL,
                phone VARCHAR(50),
                subject VARCHAR(150),
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'unread',
                created_at BIGINT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
    }

    // Assurer qu'il y a un compte admin
    $chk = $pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
    if ($chk == 0) {
        $defaultHash = password_hash('Flavorist2026@Pass', PASSWORD_DEFAULT);
        $ins = $pdo->prepare("INSERT INTO admins (username, email, phone, full_name, role_title, bio, password_hash, two_fa_enabled, login_alerts_enabled)
                              VALUES (:username, :email, :phone, :full_name, :role_title, :bio, :password_hash, :two_fa, :login_alerts)");
        $ins->execute([
            ':username' => 'admin',
            ':email' => 'emma.johnson@flavorist.ma',
            ':phone' => '+212 661-998877',
            ':full_name' => 'Emma Johnson',
            ':role_title' => 'Chef Exécutif & Admin Système',
            ':bio' => 'Chef de Cuisine & Gestionnaire Général de Flavorist Restaurant.',
            ':password_hash' => $defaultHash,
            ':two_fa' => $db_driver === 'pgsql' ? true : 1,
            ':login_alerts' => $db_driver === 'pgsql' ? true : 1
        ]);
    }

    // Assurer les settings par défaut (sociaux, restaurant info)
    $chkSettings = $pdo->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
    if ($chkSettings == 0) {
        $defaultSettings = [
            'instagram' => 'https://instagram.com/flavorist.maroc',
            'facebook' => 'https://facebook.com/flavorist.official',
            'tiktok' => 'https://tiktok.com/@flavorist_maroc',
            'whatsapp' => 'https://wa.me/212661998877',
            'website' => 'https://flavorist.ma',
            'maps' => 'https://maps.google.com/?q=flavorist+rabat',
            'restaurant_name' => 'Foores Gastronomie',
            'restaurant_phone' => '+212 522 22 33 44',
            'restaurant_address' => '123 Rue Gourmande, Casablanca',
            'opening_hours' => 'Lun - Dim: 12h00 - 23h30'
        ];
        $stIns = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (:k, :v)");
        foreach ($defaultSettings as $k => $v) {
            $stIns->execute([':k' => $k, ':v' => $v]);
        }
    }
} catch (Exception $e) {
    // Si déjà configuré ou erreur mineure
}

switch ($method) {
    case 'GET':
        try {
            $admin = $pdo->query("SELECT id, username, email, phone, full_name, role_title, bio, avatar_url, two_fa_enabled, login_alerts_enabled, last_login FROM admins ORDER BY id ASC LIMIT 1")->fetch();
            
            $stRows = $pdo->query("SELECT setting_key, setting_value FROM site_settings")->fetchAll();
            $settings = [];
            foreach ($stRows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }

            echo json_encode([
                'status' => 'success',
                'admin' => $admin ?: [
                    'full_name' => 'Emma Johnson',
                    'email' => 'emma.johnson@flavorist.ma',
                    'phone' => '+212 661-998877',
                    'role_title' => 'Chef Exécutif & Admin Système',
                    'bio' => 'Chef de Cuisine & Gestionnaire Général de Flavorist Restaurant.',
                    'two_fa_enabled' => true,
                    'login_alerts_enabled' => true
                ],
                'settings' => $settings
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
    case 'PUT':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) $input = $_POST;

            // 1. Mise à jour de l'admin
            $adminFields = [];
            $adminParams = [];

            if (isset($input['full_name'])) {
                $adminFields[] = "full_name = :full_name";
                $adminParams[':full_name'] = $input['full_name'];
            }
            if (isset($input['email'])) {
                $adminFields[] = "email = :email";
                $adminParams[':email'] = $input['email'];
            }
            if (isset($input['phone'])) {
                $adminFields[] = "phone = :phone";
                $adminParams[':phone'] = $input['phone'];
            }
            if (isset($input['role_title'])) {
                $adminFields[] = "role_title = :role_title";
                $adminParams[':role_title'] = $input['role_title'];
            }
            if (isset($input['bio'])) {
                $adminFields[] = "bio = :bio";
                $adminParams[':bio'] = $input['bio'];
            }
            if (isset($input['avatar_url'])) {
                $adminFields[] = "avatar_url = :avatar_url";
                $adminParams[':avatar_url'] = $input['avatar_url'];
            }
            if (isset($input['two_fa_enabled'])) {
                $adminFields[] = "two_fa_enabled = :two_fa";
                $adminParams[':two_fa'] = ($db_driver === 'pgsql') ? ($input['two_fa_enabled'] ? 'true' : 'false') : ($input['two_fa_enabled'] ? 1 : 0);
            }
            if (isset($input['login_alerts_enabled'])) {
                $adminFields[] = "login_alerts_enabled = :login_alerts";
                $adminParams[':login_alerts'] = ($db_driver === 'pgsql') ? ($input['login_alerts_enabled'] ? 'true' : 'false') : ($input['login_alerts_enabled'] ? 1 : 0);
            }

            // Gestion du changement de mot de passe
            if (!empty($input['new_password'])) {
                if (!empty($input['current_password'])) {
                    $cur = $pdo->query("SELECT password_hash FROM admins ORDER BY id ASC LIMIT 1")->fetchColumn();
                    if ($cur && !password_verify($input['current_password'], $cur)) {
                        http_response_code(400);
                        echo json_encode(['status' => 'error', 'message' => 'Mot de passe actuel incorrect']);
                        exit();
                    }
                }
                $adminFields[] = "password_hash = :pwd_hash";
                $adminParams[':pwd_hash'] = password_hash($input['new_password'], PASSWORD_DEFAULT);
            }

            if (!empty($adminFields)) {
                $sql = "UPDATE admins SET " . implode(', ', $adminFields) . " WHERE id = (SELECT id FROM admins ORDER BY id ASC LIMIT 1)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($adminParams);
            }

            // 2. Mise à jour des réseaux sociaux et settings du restaurant
            if (isset($input['settings']) && is_array($input['settings'])) {
                foreach ($input['settings'] as $k => $v) {
                    if ($db_driver === 'pgsql') {
                        $sStmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value, updated_at) 
                                                VALUES (:k, :v, NOW()) 
                                                ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()");
                    } else {
                        $sStmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) 
                                                VALUES (:k, :v) 
                                                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                    }
                    $sStmt->execute([':k' => $k, ':v' => (string)$v]);
                }
            }

            echo json_encode(['status' => 'success', 'message' => 'Paramètres et sécurité enregistrés dans Neon PostgreSQL !']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;
}
