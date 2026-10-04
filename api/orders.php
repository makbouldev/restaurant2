<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM `orders` ORDER BY `id` DESC");
            $orders = $stmt->fetchAll();

            $formattedOrders = array_map(function($o) {
                $items = [];
                if (!empty($o['items_json'])) {
                    $decoded = json_decode($o['items_json'], true);
                    if (is_array($decoded)) $items = $decoded;
                }

                $itemsSummary = implode(', ', array_map(function($i) {
                    return ($i['quantity'] ?? 1) . 'x ' . ($i['title'] ?? 'Article');
                }, $items));

                return [
                    'id' => $o['cmd_id'],
                    'cmdId' => $o['cmd_id'],
                    'db_id' => (int)$o['id'],
                    'date' => $o['date_str'] ?: date('d/m/Y'),
                    'time' => $o['time_str'] ?: date('H:i'),
                    'customer' => [
                        'name' => $o['customer_name'],
                        'phone' => $o['customer_phone'],
                        'address' => $o['customer_address']
                    ],
                    'items' => $items,
                    'itemsSummary' => $itemsSummary,
                    'total' => (float)$o['total_price'],
                    'paymentMethod' => $o['payment_method'],
                    'status' => $o['status'],
                    'channel' => $o['channel'],
                    'createdAt' => (int)$o['created_at']
                ];
            }, $orders);

            echo json_encode(['status' => 'success', 'orders' => $formattedOrders], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) $input = $_POST;

        $cmdId = $input['cmdId'] ?? $input['id'] ?? ('#CMD-' . rand(1000, 9999));
        $dateStr = $input['date'] ?? date('j F Y');
        $timeStr = $input['time'] ?? date('H:i');
        $customer = $input['customer'] ?? [];
        $name = trim($customer['name'] ?? $input['customer_name'] ?? 'Client Anonyme');
        $phone = trim($customer['phone'] ?? $input['customer_phone'] ?? '');
        $address = trim($customer['address'] ?? $input['customer_address'] ?? 'Casablanca');
        $items = $input['items'] ?? [];
        $total = floatval($input['total'] ?? 0);
        $payment = $input['paymentMethod'] ?? 'Paiement à la livraison (Espèces)';
        $status = $input['status'] ?? 'pending';
        $channel = $input['channel'] ?? 'online';
        $createdAt = intval($input['createdAt'] ?? (time() * 1000));

        $itemsJson = is_string($items) ? $items : json_encode($items, JSON_UNESCAPED_UNICODE);

        try {
            $stmt = $pdo->prepare("INSERT INTO `orders` 
                (`cmd_id`, `date_str`, `time_str`, `customer_name`, `customer_phone`, `customer_address`, `items_json`, `total_price`, `payment_method`, `status`, `channel`, `created_at`)
                VALUES (:cmd_id, :date_str, :time_str, :customer_name, :customer_phone, :customer_address, :items_json, :total_price, :payment_method, :status, :channel, :created_at)
                ON DUPLICATE KEY UPDATE
                `customer_name` = VALUES(`customer_name`),
                `customer_phone` = VALUES(`customer_phone`),
                `customer_address` = VALUES(`customer_address`),
                `items_json` = VALUES(`items_json`),
                `total_price` = VALUES(`total_price`),
                `status` = VALUES(`status`)");

            $stmt->execute([
                'cmd_id' => $cmdId,
                'date_str' => $dateStr,
                'time_str' => $timeStr,
                'customer_name' => $name,
                'customer_phone' => $phone,
                'customer_address' => $address,
                'items_json' => $itemsJson,
                'total_price' => $total,
                'payment_method' => $payment,
                'status' => $status,
                'channel' => $channel,
                'created_at' => $createdAt
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Commande enregistrée dans MySQL avec succès !',
                'cmdId' => $cmdId
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
    case 'PATCH':
        $input = json_decode(file_get_contents('php://input'), true);
        $cmdId = $input['cmdId'] ?? $input['id'] ?? '';
        $newStatus = $input['status'] ?? 'confirmed';

        if (empty($cmdId)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CMD ID requis']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("UPDATE `orders` SET `status` = :status WHERE `cmd_id` = :cmd_id");
            $stmt->execute(['status' => $newStatus, 'cmd_id' => $cmdId]);

            echo json_encode(['status' => 'success', 'message' => 'Statut commande mis à jour !']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $cmdId = $_GET['id'] ?? '';
        if (empty($cmdId)) {
            $input = json_decode(file_get_contents('php://input'), true);
            $cmdId = $input['cmdId'] ?? $input['id'] ?? '';
        }

        if (empty($cmdId)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'CMD ID requis']);
            exit();
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM `orders` WHERE `cmd_id` = :cmd_id");
            $stmt->execute(['cmd_id' => $cmdId]);

            echo json_encode(['status' => 'success', 'message' => 'Commande supprimée avec succès']);
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
