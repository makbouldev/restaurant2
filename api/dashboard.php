<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf8mb4');

try {
    // 1. Récupérer les commandes
    $ordersStmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
    $orders = $ordersStmt->fetchAll();

    $totalOrders = count($orders);
    $totalRevenue = 0;
    $pendingOrders = 0;
    $cookingOrders = 0;
    $completedOrders = 0;
    $dishSalesCount = [];

    // Données par jour (pour le graphe de la semaine)
    $daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    $ordersPerDay = [0, 0, 0, 0, 0, 0, 0];
    $revenuePerDay = [0, 0, 0, 0, 0, 0, 0];

    foreach ($orders as $o) {
        $price = (float)$o['total_price'];
        $totalRevenue += $price;

        $st = strtolower($o['status'] ?? 'pending');
        if ($st === 'pending') $pendingOrders++;
        elseif ($st === 'cooking') $cookingOrders++;
        elseif ($st === 'completed' || $st === 'confirmed') $completedOrders++;

        // Compter les plats vendus à partir de items_json
        $items = [];
        if (!empty($o['items_json'])) {
            $decoded = is_string($o['items_json']) ? json_decode($o['items_json'], true) : $o['items_json'];
            if (is_array($decoded)) $items = $decoded;
        }

        foreach ($items as $it) {
            $title = $it['title'] ?? 'Plat';
            $qty = (int)($it['quantity'] ?? 1);
            $itPrice = (float)($it['price'] ?? 0);
            if (!isset($dishSalesCount[$title])) {
                $dishSalesCount[$title] = ['title' => $title, 'count' => 0, 'revenue' => 0];
            }
            $dishSalesCount[$title]['count'] += $qty;
            $dishSalesCount[$title]['revenue'] += ($qty * $itPrice);
        }

        // Calcul du jour de la semaine si createdAt timestamp disponible
        if (!empty($o['created_at'])) {
            $ts = (int)$o['created_at'];
            if ($ts > 1000000000000) $ts = (int)($ts / 1000); // si millisecondes
            $dayIdx = (int)date('N', $ts) - 1; // 0 for Monday to 6 for Sunday
            if ($dayIdx >= 0 && $dayIdx < 7) {
                $ordersPerDay[$dayIdx]++;
                $revenuePerDay[$dayIdx] += $price;
            }
        }
    }

    $avgTicket = ($totalOrders > 0) ? round($totalRevenue / $totalOrders, 2) : 0;

    // 2. Récupérer les réservations
    $resStmt = $pdo->query("SELECT * FROM reservations ORDER BY id DESC");
    $reservations = $resStmt->fetchAll();
    $totalReservations = count($reservations);
    $pendingReservations = 0;
    foreach ($reservations as $r) {
        if (($r['status'] ?? 'pending') === 'pending') $pendingReservations++;
    }

    // 3. Top plats triés par quantité vendue
    usort($dishSalesCount, function($a, $b) {
        return $b['count'] - $a['count'];
    });
    $topDishes = array_slice($dishSalesCount, 0, 5);

    // 4. Si aucune commande n'a encore été enregistrée, afficher les plats du menu avec 0 ventes
    if (empty($topDishes)) {
        $sampleDishes = $pdo->query("SELECT title, price FROM dishes ORDER BY id ASC LIMIT 5")->fetchAll();
        foreach ($sampleDishes as $sd) {
            $topDishes[] = [
                'title' => $sd['title'],
                'count' => 0,
                'revenue' => 0
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'kpi' => [
            'orders' => $totalOrders,
            'reservations' => $totalReservations,
            'revenue' => $totalRevenue,
            'avgTicket' => $avgTicket,
            'pendingOrders' => $pendingOrders,
            'cookingOrders' => $cookingOrders,
            'completedOrders' => $completedOrders,
            'pendingReservations' => $pendingReservations
        ],
        'chart' => [
            'labels' => $daysOfWeek,
            'orders' => $ordersPerDay,
            'revenue' => $revenuePerDay
        ],
        'topDishes' => $topDishes
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
