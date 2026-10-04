<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        // Fetch categories
        $stmtCat = $pdo->query("SELECT * FROM `categories` ORDER BY `id` ASC");
        $categories = $stmtCat->fetchAll();

        // Fetch all dishes
        $stmtDishes = $pdo->query("SELECT * FROM `dishes` WHERE `is_available` = 1 ORDER BY `id` ASC");
        $dishes = $stmtDishes->fetchAll();

        // Group dishes by category_id or category slug
        $dishesByCat = [];
        foreach ($dishes as $d) {
            $opts = [];
            if (!empty($d['options'])) {
                $decoded = json_decode($d['options'], true);
                if (is_array($decoded)) $opts = $decoded;
            }

            $dishObj = [
                'id' => (string)($d['item_id'] ? $d['item_id'] : $d['id']),
                'db_id' => (int)$d['id'],
                'category_id' => (int)$d['category_id'],
                'category' => $d['category'],
                'title' => $d['title'],
                'description' => $d['description'] ?: '',
                'price' => (float)$d['price'],
                'image' => $d['image'] ?: 'img/menu_items/1.jpg',
                'options' => $opts
            ];

            $catKey = $d['category_id'] ? (string)$d['category_id'] : $d['category'];
            if (!isset($dishesByCat[$catKey])) {
                $dishesByCat[$catKey] = [];
            }
            $dishesByCat[$catKey][] = $dishObj;
        }

        // Map categories with their associated dishes (1-to-many relationship)
        $formattedCategories = array_map(function($cat) use ($dishesByCat) {
            $catIdKey = (string)$cat['id'];
            $catSlugKey = $cat['slug'];

            $catDishes = $dishesByCat[$catIdKey] ?? ($dishesByCat[$catSlugKey] ?? []);

            return [
                'id' => (int)$cat['id'],
                'slug' => $cat['slug'],
                'name' => $cat['name'],
                'icon' => $cat['icon'] ?: '✨',
                'image' => $cat['image'] ?: ($catDishes[0]['image'] ?? ''),
                'dishes_count' => count($catDishes),
                'dishes' => $catDishes
            ];
        }, $categories);

        echo json_encode([
            'status' => 'success',
            'categories' => $formattedCategories
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
}
