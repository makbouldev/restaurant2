<?php
// Script to migrate and setup Neon PostgreSQL database
header('Content-Type: text/plain; charset=utf-8');

$neon_dsn = "pgsql:host=ep-wandering-hall-baveek4a.c-8.eu-central-1.aws.neon.tech;port=5432;dbname=neondb;sslmode=require;options='endpoint=ep-wandering-hall-baveek4a'";
$neon_user = "neondb_owner";
$neon_pass = "npg_rMZSmVv9TKt1";

echo "=== Connexion à Neon PostgreSQL... ===\n";
try {
    $pg = new PDO($neon_dsn, $neon_user, $neon_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    echo "[OK] Connecté à Neon avec succès !\n\n";
} catch (Exception $e) {
    echo "[ERREUR] Connexion échouée : " . $e->getMessage() . "\n";
    exit();
}

// 1. Création des tables PostgreSQL
echo "=== Création des tables... ===\n";

$tables_sql = "
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '✨',
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) UNIQUE NOT NULL,
    category_id INT,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    image VARCHAR(255),
    options JSONB DEFAULT '[]'::jsonb,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    cmd_id VARCHAR(50) UNIQUE NOT NULL,
    date_str VARCHAR(100),
    time_str VARCHAR(50),
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT,
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(100) DEFAULT 'Paiement à la livraison (Espèces)',
    status VARCHAR(50) DEFAULT 'pending',
    channel VARCHAR(50) DEFAULT 'online',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    res_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(120),
    date_str VARCHAR(100),
    time_str VARCHAR(50),
    guests_count INT NOT NULL DEFAULT 2,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    channel VARCHAR(50) DEFAULT 'online',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
";

try {
    $pg->exec($tables_sql);
    echo "[OK] Tables créées dans Neon !\n\n";
} catch (Exception $e) {
    echo "[ERREUR] Création des tables : " . $e->getMessage() . "\n";
    exit();
}

// 2. Migration des catégories depuis MySQL local vers Neon
echo "=== Migration des Catégories depuis MySQL local... ===\n";
try {
    $mysql = new PDO("mysql:host=localhost;dbname=restaurant_menu;charset=utf8mb4", "root", "");
    
    $cats = $mysql->query("SELECT * FROM categories")->fetchAll();
    $catStmt = $pg->prepare("INSERT INTO categories (id, slug, name, icon, image) 
                             VALUES (:id, :slug, :name, :icon, :image) 
                             ON CONFLICT (slug) DO UPDATE 
                             SET name = EXCLUDED.name, icon = EXCLUDED.icon, image = EXCLUDED.image");
    
    foreach ($cats as $c) {
        $catStmt->execute([
            ':id' => $c['id'],
            ':slug' => $c['slug'],
            ':name' => $c['name'],
            ':icon' => $c['icon'],
            ':image' => $c['image']
        ]);
    }
    echo "[OK] " . count($cats) . " catégories migrées vers Neon !\n\n";

    // 3. Migration des plats (dishes)
    echo "=== Migration des Plats depuis MySQL local... ===\n";
    $dishes = $mysql->query("SELECT * FROM dishes")->fetchAll();
    $dishStmt = $pg->prepare("INSERT INTO dishes (item_id, category_id, category, title, description, price, image, options, is_available) 
                              VALUES (:item_id, :category_id, :category, :title, :description, :price, :image, :options, :is_available) 
                              ON CONFLICT (item_id) DO UPDATE 
                              SET category_id = EXCLUDED.category_id,
                                  category = EXCLUDED.category,
                                  title = EXCLUDED.title,
                                  description = EXCLUDED.description,
                                  price = EXCLUDED.price,
                                  image = EXCLUDED.image,
                                  options = EXCLUDED.options,
                                  is_available = EXCLUDED.is_available");
    
    foreach ($dishes as $d) {
        $optsJson = $d['options'] ?: '[]';
        // Validate JSON
        json_decode($optsJson);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $optsJson = '[]';
        }
        $dishStmt->execute([
            ':item_id' => $d['item_id'] ?: ('dish_' . $d['id']),
            ':category_id' => $d['category_id'],
            ':category' => $d['category'],
            ':title' => $d['title'],
            ':description' => $d['description'],
            ':price' => $d['price'],
            ':image' => $d['image'],
            ':options' => $optsJson,
            ':is_available' => (bool)$d['is_available']
        ]);
    }
    echo "[OK] " . count($dishes) . " plats migrés vers Neon !\n\n";

    // 4. Mettre à jour les séquences PostgreSQL (pour que les auto-increment fonctionnent bien)
    $pg->exec("SELECT setval(pg_get_serial_sequence('categories', 'id'), coalesce(max(id), 1)) FROM categories;");
    $pg->exec("SELECT setval(pg_get_serial_sequence('dishes', 'id'), coalesce(max(id), 1)) FROM dishes;");

    echo "=== MIGRATION TERMINÉE AVEC SUCCÈS SUR NEON ! ===\n";

} catch (Exception $e) {
    echo "[AVERTISSEMENT] Erreur lors de la copie MySQL -> Neon : " . $e->getMessage() . "\n";
}
