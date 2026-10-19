<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT d.*, c.id AS cat_db_id, c.name AS category_name, c.icon AS category_icon, c.image AS category_image 
                                 FROM dishes d 
                                 LEFT JOIN categories c ON (d.category_id = c.id OR d.category = c.slug) 
                                 WHERE d.is_available IS TRUE 
                                 ORDER BY d.id ASC");
            $dishes = $stmt->fetchAll();

            $formattedDishes = array_map(function($d) {
                $opts = [];
                if (!empty($d['options'])) {
                    $decoded = is_string($d['options']) ? json_decode($d['options'], true) : $d['options'];
                    if (is_array($decoded)) {
                        $opts = $decoded;
                    }
                }

                return [
                    'id' => (string)($d['item_id'] ? $d['item_id'] : $d['id']),
                    'db_id' => (int)$d['id'],
                    'category_id' => (int)($d['category_id'] ?: $d['cat_db_id']),
                    'category' => $d['category'],
                    'category_name' => $d['category_name'] ?: $d['category'],
                    'category_icon' => $d['category_icon'] ?: '✨',
                    'title' => $d['title'],
                    'description' => $d['description'] ?: '',
                    'price' => (float)$d['price'],
                    'image' => $d['image'] ?: 'img/menu_items/1.jpg',
                    'options' => $opts
                ];
            }, $dishes);

            echo json_encode(['status' => 'success', 'dishes' => $formattedDishes], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? 'pastas');
        $categoryId = intval($input['category_id'] ?? 0);
        $description = trim($input['description'] ?? '');
        $price = floatval($input['price'] ?? 0);
        $image = trim($input['image'] ?? '');
        $itemId = trim($input['id'] ?? '');
        $options = $input['options'] ?? [];

        if (empty($title) || $price <= 0) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Titre et prix obligatoires']);
            exit();
        }

        // If category_id not passed, find it from categories table
        if ($categoryId <= 0) {
            $stmtFindCat = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug LIMIT 1");
            $stmtFindCat->execute(['slug' => $category]);
            $catRow = $stmtFindCat->fetch();
            if ($catRow) {
                $categoryId = (int)$catRow['id'];
            }
        }

        if (empty($itemId)) {
            $itemId = 'dish_' . time() . '_' . rand(100, 999);
        }

        $optionsJson = is_string($options) ? $options : json_encode($options, JSON_UNESCAPED_UNICODE);

        try {
            if ($db_driver === 'pgsql') {
                $sql = "INSERT INTO dishes (item_id, category_id, title, category, description, price, image, options, is_available)
                        VALUES (:item_id, :category_id, :title, :category, :description, :price, :image, :options, TRUE)
                        ON CONFLICT (item_id) DO UPDATE SET
                        category_id = EXCLUDED.category_id,
                        title = EXCLUDED.title,
                        category = EXCLUDED.category,
                        description = EXCLUDED.description,
                        price = EXCLUDED.price,
                        image = EXCLUDED.image,
                        options = EXCLUDED.options,
                        is_available = TRUE,
                        updated_at = CURRENT_TIMESTAMP";
            } else {
                $sql = "INSERT INTO dishes (item_id, category_id, title, category, description, price, image, options, is_available)
                        VALUES (:item_id, :category_id, :title, :category, :description, :price, :image, :options, 1)
                        ON DUPLICATE KEY UPDATE
                        category_id = VALUES(category_id),
                        title = VALUES(title),
                        category = VALUES(category),
                        description = VALUES(description),
                        price = VALUES(price),
                        image = VALUES(image),
                        options = VALUES(options),
                        is_available = 1";
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'item_id' => $itemId,
                'category_id' => $categoryId,
                'title' => $title,
                'category' => $category,
                'description' => $description,
                'price' => $price,
                'image' => $image,
                'options' => $optionsJson
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Plat enregistré avec succès !',
                'id' => $itemId
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? '';
        }

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID plat requis']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM dishes WHERE item_id = :id OR id = :id_num");
            $stmt->execute(['id' => $id, 'id_num' => intval($id)]);

            echo json_encode(['status' => 'success', 'message' => 'Plat supprimé avec succès']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
        break;
}
