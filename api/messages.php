<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf8mb4');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC");
            $messages = $stmt->fetchAll();

            $formatted = array_map(function($m) {
                return [
                    'id' => $m['msg_id'],
                    'msgId' => $m['msg_id'],
                    'db_id' => (int)$m['id'],
                    'name' => $m['name'],
                    'email' => $m['email'],
                    'phone' => $m['phone'] ?: '',
                    'subject' => $m['subject'] ?: 'Demande de contact',
                    'message' => $m['message'],
                    'status' => $m['status'],
                    'createdAt' => (int)$m['created_at']
                ];
            }, $messages);

            echo json_encode(['status' => 'success', 'messages' => $formatted], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) $input = $_POST;

            $msgId = $input['msgId'] ?? ('#MSG-' . rand(100, 999));
            $name = $input['name'] ?? 'Client Anonyme';
            $email = $input['email'] ?? '';
            $phone = $input['phone'] ?? '';
            $subject = $input['subject'] ?? 'Formulaire de contact';
            $message = $input['message'] ?? '';
            $status = 'unread';
            $createdAt = !empty($input['createdAt']) ? (int)$input['createdAt'] : (time() * 1000);

            $stmt = $pdo->prepare("
                INSERT INTO messages (msg_id, name, email, phone, subject, message, status, created_at)
                VALUES (:msg_id, :name, :email, :phone, :subject, :message, :status, :created_at)
            ");
            $stmt->execute([
                ':msg_id' => $msgId,
                ':name' => $name,
                ':email' => $email,
                ':phone' => $phone,
                ':subject' => $subject,
                ':message' => $message,
                ':status' => $status,
                ':created_at' => $createdAt
            ]);

            echo json_encode(['status' => 'success', 'message' => 'Message envoyé avec succès !', 'msgId' => $msgId]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) $input = $_POST;

            $msgId = $input['msgId'] ?? $input['id'] ?? '';
            $status = $input['status'] ?? 'read';

            if (!$msgId) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'msgId requis']);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE messages SET status = :status WHERE msg_id = :msg_id");
            $stmt->execute([':status' => $status, ':msg_id' => $msgId]);

            echo json_encode(['status' => 'success', 'message' => 'Statut du message mis à jour']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        try {
            $msgId = $_GET['id'] ?? $_GET['msgId'] ?? '';
            if (!$msgId) {
                $input = json_decode(file_get_contents('php://input'), true);
                $msgId = $input['id'] ?? $input['msgId'] ?? '';
            }

            if (!$msgId) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'msgId requis']);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM messages WHERE msg_id = :msg_id");
            $stmt->execute([':msg_id' => $msgId]);

            echo json_encode(['status' => 'success', 'message' => 'Message supprimé']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;
}
