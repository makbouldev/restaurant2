<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf8mb4');

$range = $_GET['range'] ?? 'this-week';

try {
    // Current timestamp & boundaries
    $now = time();
    $startOfToday = strtotime('today midnight');
    $startOfWeek = strtotime('monday this week midnight');
    $startOfMonth = strtotime('first day of this month midnight');

    $minTs = 0;
    if ($range === 'today') {
        $minTs = $startOfToday * 1000;
    } elseif ($range === 'this-week') {
        $minTs = $startOfWeek * 1000;
    } elseif ($range === 'this-month') {
        $minTs = $startOfMonth * 1000;
    }

    // 1. Fetch Orders
    if ($minTs > 0) {
        $ordersStmt = $pdo->prepare("SELECT * FROM orders WHERE created_at >= :minTs ORDER BY id DESC");
        $ordersStmt->execute([':minTs' => $minTs]);
    } else {
        $ordersStmt = $pdo->query("SELECT * FROM orders ORDER BY id DESC");
    }
    $orders = $ordersStmt->fetchAll();

    $totalOrders = count($orders);
    $totalRevenue = 0;
    $pendingOrders = 0;
    $cookingOrders = 0;
    $completedOrders = 0;
    $dishSalesCount = [];

    $channelStats = [
        'sur-place' => ['count' => 0, 'revenue' => 0],
        'online' => ['count' => 0, 'revenue' => 0],
        'takeaway' => ['count' => 0, 'revenue' => 0]
    ];

    // Chart labels depending on range
    if ($range === 'today') {
        $chartLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
        $ordersPerInterval = array_fill(0, count($chartLabels), 0);
        $revenuePerInterval = array_fill(0, count($chartLabels), 0);
    } elseif ($range === 'this-month') {
        $chartLabels = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
        $ordersPerInterval = [0, 0, 0, 0];
        $revenuePerInterval = [0, 0, 0, 0];
    } else {
        $chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        $ordersPerInterval = [0, 0, 0, 0, 0, 0, 0];
        $revenuePerInterval = [0, 0, 0, 0, 0, 0, 0];
    }

    foreach ($orders as $o) {
        $price = (float)$o['total_price'];
        $totalRevenue += $price;

        $st = strtolower($o['status'] ?? 'pending');
        if ($st === 'pending') $pendingOrders++;
        elseif ($st === 'cooking') $cookingOrders++;
        elseif ($st === 'completed' || $st === 'confirmed') $completedOrders++;

        $ch = strtolower($o['channel'] ?? 'online');
        if ($ch === 'sur-place' || $ch === 'dine-in') {
            $channelStats['sur-place']['count']++;
            $channelStats['sur-place']['revenue'] += $price;
        } elseif ($ch === 'takeaway' || $ch === 'comptoir') {
            $channelStats['takeaway']['count']++;
            $channelStats['takeaway']['revenue'] += $price;
        } else {
            $channelStats['online']['count']++;
            $channelStats['online']['revenue'] += $price;
        }

        // Top sold dishes from items_json
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

        // Interval distribution
        if (!empty($o['created_at'])) {
            $ts = (int)$o['created_at'];
            if ($ts > 1000000000000) $ts = (int)($ts / 1000);

            if ($range === 'today') {
                $hour = (int)date('G', $ts);
                $idx = min(7, max(0, intval(($hour - 8) / 2)));
                if ($hour >= 8 && $idx >= 0 && $idx < 8) {
                    $ordersPerInterval[$idx]++;
                    $revenuePerInterval[$idx] += $price;
                }
            } elseif ($range === 'this-month') {
                $dayOfMonth = (int)date('j', $ts);
                $idx = min(3, intval(($dayOfMonth - 1) / 7));
                $ordersPerInterval[$idx]++;
                $revenuePerInterval[$idx] += $price;
            } else {
                $dayIdx = (int)date('N', $ts) - 1;
                if ($dayIdx >= 0 && $dayIdx < 7) {
                    $ordersPerInterval[$dayIdx]++;
                    $revenuePerInterval[$dayIdx] += $price;
                }
            }
        }
    }

    $avgTicket = ($totalOrders > 0) ? round($totalRevenue / $totalOrders, 2) : 0;

    // 2. Fetch Reservations
    if ($minTs > 0) {
        $resStmt = $pdo->prepare("SELECT * FROM reservations WHERE created_at >= :minTs ORDER BY id DESC");
        $resStmt->execute([':minTs' => $minTs]);
    } else {
        $resStmt = $pdo->query("SELECT * FROM reservations ORDER BY id DESC");
    }
    $reservations = $resStmt->fetchAll();
    $totalReservations = count($reservations);
    $pendingReservations = 0;

    $resaPerInterval = array_fill(0, count($chartLabels), 0);
    $occupancyPerInterval = array_fill(0, count($chartLabels), 0);

    foreach ($reservations as $r) {
        if (($r['status'] ?? 'pending') === 'pending') $pendingReservations++;

        if (!empty($r['created_at'])) {
            $ts = (int)$r['created_at'];
            if ($ts > 1000000000000) $ts = (int)($ts / 1000);

            if ($range === 'today') {
                $hour = (int)date('G', $ts);
                $idx = min(7, max(0, intval(($hour - 8) / 2)));
                if ($hour >= 8 && $idx >= 0 && $idx < 8) {
                    $resaPerInterval[$idx]++;
                    $occupancyPerInterval[$idx] = min(100, $occupancyPerInterval[$idx] + 15);
                }
            } elseif ($range === 'this-month') {
                $dayOfMonth = (int)date('j', $ts);
                $idx = min(3, intval(($dayOfMonth - 1) / 7));
                $resaPerInterval[$idx]++;
                $occupancyPerInterval[$idx] = min(100, $occupancyPerInterval[$idx] + 15);
            } else {
                $dayIdx = (int)date('N', $ts) - 1;
                if ($dayIdx >= 0 && $dayIdx < 7) {
                    $resaPerInterval[$dayIdx]++;
                    $occupancyPerInterval[$dayIdx] = min(100, $occupancyPerInterval[$dayIdx] + 15);
                }
            }
        }
    }

    $overallOccupancy = $totalReservations > 0 ? min(100, round(($totalReservations / 20) * 100)) : 0;

    // 3. Top Dishes Leaderboard
    usort($dishSalesCount, function($a, $b) {
        return $b['count'] - $a['count'];
    });
    $topDishes = array_slice($dishSalesCount, 0, 6);

    // If no dish sales yet, list dishes from menu with 0 sales
    if (empty($topDishes)) {
        $sampleDishes = $pdo->query("SELECT title, price FROM dishes ORDER BY id ASC LIMIT 6")->fetchAll();
        foreach ($sampleDishes as $sd) {
            $topDishes[] = [
                'title' => $sd['title'],
                'count' => 0,
                'revenue' => 0
            ];
        }
    }

    // 4. Sales Channels Breakdown Percentages
    $surPlacePct = $totalRevenue > 0 ? round(($channelStats['sur-place']['revenue'] / $totalRevenue) * 100) : 0;
    $onlinePct = $totalRevenue > 0 ? round(($channelStats['online']['revenue'] / $totalRevenue) * 100) : 0;
    $takeawayPct = $totalRevenue > 0 ? round(($channelStats['takeaway']['revenue'] / $totalRevenue) * 100) : 0;

    // Delivery metrics
    $deliveryOrdersCount = $channelStats['online']['count'];
    $deliveryRev = $channelStats['online']['revenue'];
    $avgDeliveryTicket = $deliveryOrdersCount > 0 ? round($deliveryRev / $deliveryOrdersCount, 2) : 0;

    echo json_encode([
        'status' => 'success',
        'range' => $range,
        'kpi' => [
            'orders' => $totalOrders,
            'reservations' => $totalReservations,
            'revenue' => $totalRevenue,
            'avgTicket' => $avgTicket,
            'occupancyRate' => $overallOccupancy,
            'pendingOrders' => $pendingOrders,
            'cookingOrders' => $cookingOrders,
            'completedOrders' => $completedOrders,
            'pendingReservations' => $pendingReservations
        ],
        'chart' => [
            'labels' => $chartLabels,
            'orders' => $ordersPerInterval,
            'revenue' => $revenuePerInterval
        ],
        'reservationsChart' => [
            'labels' => $chartLabels,
            'tables' => $resaPerInterval,
            'occupancy' => $occupancyPerInterval
        ],
        'channels' => [
            'totalRevenue' => $totalRevenue,
            'surPlace' => [
                'count' => $channelStats['sur-place']['count'],
                'revenue' => $channelStats['sur-place']['revenue'],
                'pct' => $surPlacePct
            ],
            'online' => [
                'count' => $channelStats['online']['count'],
                'revenue' => $channelStats['online']['revenue'],
                'pct' => $onlinePct
            ],
            'takeaway' => [
                'count' => $channelStats['takeaway']['count'],
                'revenue' => $channelStats['takeaway']['revenue'],
                'pct' => $takeawayPct
            ],
            'avgDeliveryTicket' => $avgDeliveryTicket,
            'avgDeliveryTime' => $deliveryOrdersCount > 0 ? '25 min' : '-'
        ],
        'topDishes' => $topDishes
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
