<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM `reservations` ORDER BY `id` DESC");
            $reservations = $stmt->fetchAll();

            $formatted = array_map(function($r) {
                return [
                    'id' => $r['res_id'],
                    'resId' => $r['res_id'],
                    'db_id' => (int)$r['id'],
                    'name' => $r['name'],
                    'phone' => $r['phone'],
                    'email' => $r['email'],
                    'date' => $r['date_str'],
                    'time' => $r['time_str'],
                    'people' => (int)$r['guests_count'],
                    'notes' => $r['notes'],
                    'status' => $r['status'],
                    'channel' => $r['channel'],
                    'createdAt' => (int)$r['created_at']
                ];
            }, $reservations);

            echo json_encode(['status' => 'success', 'reservations' => $formatted], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) $input = $_POST;

        $resId = $input['resId'] ?? $input['id'] ?? ('#RES-' . rand(1000, 9999));
        $name = trim($input['name'] ?? 'Client');
        $phone = trim($input['phone'] ?? '');
        $email = trim($input['email'] ?? '');
        $dateStr = $input['date'] ?? 'Aujourd\'hui';
        $timeStr = $input['time'] ?? '19:30';
        $people = intval($input['people'] ?? 2);
        $notes = trim($input['notes'] ?? '');
        $status = $input['status'] ?? 'pending';
        $channel = $input['channel'] ?? 'online';
        $createdAt = intval($input['createdAt'] ?? (time() * 1000));

        try {
            $stmt = $pdo->prepare("INSERT INTO `reservations`
                (`res_id`, `name`, `phone`, `email`, `date_str`, `time_str`, `guests_count`, `notes`, `status`, `channel`, `created_at`)
                VALUES (:res_id, :name, :phone, :email, :date_str, :time_str, :guests_count, :notes, :status, :channel, :created_at)
                ON DUPLICATE KEY UPDATE
                `name` = VALUES(`name`),
                `phone` = VALUES(`phone`),
                `email` = VALUES(`email`),
                `date_str` = VALUES(`date_str`),
                `time_str` = VALUES(`time_str`),
                `guests_count` = VALUES(`guests_count`),
                `notes` = VALUES(`notes`),
                `status` = VALUES(`status`)");

            $stmt->execute([
                'res_id' => $resId,
                'name' => $name,
                'phone' => $phone,
                'email' => $email,
                'date_str' => $dateStr,
                'time_str' => $timeStr,
                'guests_count' => $people,
                'notes' => $notes,
                'status' => $status,
                'channel' => $channel,
                'created_at' => $createdAt
            ]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Réservation enregistrée dans MySQL !',
                'resId' => $resId
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $resId = $_GET['id'] ?? '';
        if (empty($resId)) {
            $input = json_decode(file_get_contents('php://input'), true);
            $resId = $input['resId'] ?? $input['id'] ?? '';
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM `reservations` WHERE `res_id` = :res_id");
            $stmt->execute(['res_id' => $resId]);
            echo json_encode(['status' => 'success', 'message' => 'Réservation supprimée']);
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
