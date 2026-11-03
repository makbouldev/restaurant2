<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf8mb4');

$range = $_GET['range'] ?? 'this-week';

try {
    $now = time();
    $startOfToday = strtotime('today midnight');
    $startOfWeek = strtotime('monday this week midnight');
    $startOfMonth = strtotime('first day of this month midnight');

    // 0. Pre-load dish metadata
    $allDishesQuery = $pdo->query("SELECT title, price, image FROM dishes ORDER BY id ASC")->fetchAll();
    $dishMetaMap = [];
    foreach ($allDishesQuery as $d) {
        $dishMetaMap[$d['title']] = [
            'price' => (float)$d['price'],
            'image' => $d['image'] ?: 'img/menu_items/1.jpg'
        ];
    }

    // 1. Fetch Orders and Reservations for the entire month in 2 quick queries
    $ordersStmt = $pdo->prepare("SELECT * FROM orders WHERE created_at >= :minTs ORDER BY id DESC");
    $ordersStmt->execute([':minTs' => $startOfMonth * 1000]);
    $allOrders = $ordersStmt->fetchAll();

    $resStmt = $pdo->prepare("SELECT * FROM reservations WHERE created_at >= :minTs ORDER BY id DESC");
    $resStmt->execute([':minTs' => $startOfMonth * 1000]);
    $allReservations = $resStmt->fetchAll();

    function computeRangeMetrics($rKey, $orders, $reservations, $dishMetaMap, $allDishesQuery) {
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

        if ($rKey === 'today') {
            $chartLabels = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
            $ordersPerInterval = array_fill(0, count($chartLabels), 0);
            $revenuePerInterval = array_fill(0, count($chartLabels), 0);
        } elseif ($rKey === 'this-month') {
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

            $items = [];
            if (!empty($o['items_json'])) {
                $decoded = is_string($o['items_json']) ? json_decode($o['items_json'], true) : $o['items_json'];
                if (is_array($decoded)) $items = $decoded;
            }

            foreach ($items as $it) {
                $title = $it['title'] ?? 'Plat';
                $qty = (int)($it['quantity'] ?? 1);
                $itPrice = (float)($it['price'] ?? ($dishMetaMap[$title]['price'] ?? 0));
                $itImg = $dishMetaMap[$title]['image'] ?? ($it['image'] ?? 'img/menu_items/1.jpg');

                if (!isset($dishSalesCount[$title])) {
                    $dishSalesCount[$title] = [
                        'title' => $title,
                        'count' => 0,
                        'revenue' => 0,
                        'image' => $itImg,
                        'price' => $itPrice
                    ];
                }
                $dishSalesCount[$title]['count'] += $qty;
                $dishSalesCount[$title]['revenue'] += ($qty * $itPrice);
            }

            if (!empty($o['created_at'])) {
                $ts = (int)$o['created_at'];
                if ($ts > 1000000000000) $ts = (int)($ts / 1000);

                if ($rKey === 'today') {
                    $hour = (int)date('G', $ts);
                    $idx = min(7, max(0, intval(($hour - 8) / 2)));
                    if ($hour >= 8 && $idx >= 0 && $idx < 8) {
                        $ordersPerInterval[$idx]++;
                        $revenuePerInterval[$idx] += $price;
                    }
                } elseif ($rKey === 'this-month') {
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

        // Reservations calculation
        $totalReservations = count($reservations);
        $pendingReservations = 0;
        $resaPerInterval = array_fill(0, count($chartLabels), 0);
        $occupancyPerInterval = array_fill(0, count($chartLabels), 0);

        foreach ($reservations as $r) {
            if (($r['status'] ?? 'pending') === 'pending') $pendingReservations++;
            if (!empty($r['created_at'])) {
                $ts = (int)$r['created_at'];
                if ($ts > 1000000000000) $ts = (int)($ts / 1000);

                if ($rKey === 'today') {
                    $hour = (int)date('G', $ts);
                    $idx = min(7, max(0, intval(($hour - 8) / 2)));
                    if ($hour >= 8 && $idx >= 0 && $idx < 8) {
                        $resaPerInterval[$idx]++;
                        $occupancyPerInterval[$idx] = min(100, $occupancyPerInterval[$idx] + 15);
                    }
                } elseif ($rKey === 'this-month') {
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

        // Top dishes
        usort($dishSalesCount, function($a, $b) { return $b['count'] - $a['count']; });
        $topDishes = array_slice(array_values($dishSalesCount), 0, 6);
        $soldTitles = array_column($topDishes, 'title');
        foreach ($allDishesQuery as $sd) {
            if (count($topDishes) >= 6) break;
            if (!in_array($sd['title'], $soldTitles)) {
                $topDishes[] = [
                    'title' => $sd['title'],
                    'count' => 0,
                    'revenue' => 0,
                    'image' => $sd['image'] ?: 'img/menu_items/1.jpg',
                    'price' => (float)$sd['price']
                ];
                $soldTitles[] = $sd['title'];
            }
        }

        $totRev = $totalRevenue ?: 1;
        $channels = [
            'totalRevenue' => $totalRevenue,
            'surPlace' => [
                'count' => $channelStats['sur-place']['count'],
                'revenue' => $channelStats['sur-place']['revenue'],
                'pct' => round(($channelStats['sur-place']['revenue'] / $totRev) * 100)
            ],
            'online' => [
                'count' => $channelStats['online']['count'],
                'revenue' => $channelStats['online']['revenue'],
                'pct' => round(($channelStats['online']['revenue'] / $totRev) * 100)
            ],
            'takeaway' => [
                'count' => $channelStats['takeaway']['count'],
                'revenue' => $channelStats['takeaway']['revenue'],
                'pct' => round(($channelStats['takeaway']['revenue'] / $totRev) * 100)
            ],
            'avgDeliveryTicket' => $channelStats['online']['count'] > 0 ? round($channelStats['online']['revenue'] / $channelStats['online']['count'], 2) : 0,
            'avgDeliveryTime' => $channelStats['online']['count'] > 0 ? '25 min' : '-'
        ];

        return [
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
            'channels' => $channels,
            'topDishes' => $topDishes
        ];
    }

    // Split orders and reservations into intervals in-memory
    $todayOrders = array_values(array_filter($allOrders, fn($o) => ((int)($o['created_at'] > 1e12 ? $o['created_at']/1000 : $o['created_at'])) >= $startOfToday));
    $todayResa = array_values(array_filter($allReservations, fn($r) => ((int)($r['created_at'] > 1e12 ? $r['created_at']/1000 : $r['created_at'])) >= $startOfToday));

    $weekOrders = array_values(array_filter($allOrders, fn($o) => ((int)($o['created_at'] > 1e12 ? $o['created_at']/1000 : $o['created_at'])) >= $startOfWeek));
    $weekResa = array_values(array_filter($allReservations, fn($r) => ((int)($r['created_at'] > 1e12 ? $r['created_at']/1000 : $r['created_at'])) >= $startOfWeek));

    $resultToday = computeRangeMetrics('today', $todayOrders, $todayResa, $dishMetaMap, $allDishesQuery);
    $resultWeek = computeRangeMetrics('this-week', $weekOrders, $weekResa, $dishMetaMap, $allDishesQuery);
    $resultMonth = computeRangeMetrics('this-month', $allOrders, $allReservations, $dishMetaMap, $allDishesQuery);

    $currentResult = ($range === 'today') ? $resultToday : (($range === 'this-month') ? $resultMonth : $resultWeek);

    echo json_encode([
        'status' => 'success',
        'range' => $range,
        'kpi' => $currentResult['kpi'],
        'chart' => $currentResult['chart'],
        'reservationsChart' => $currentResult['reservationsChart'],
        'channels' => $currentResult['channels'],
        'topDishes' => $currentResult['topDishes'],
        'allRanges' => [
            'today' => $resultToday,
            'this-week' => $resultWeek,
            'this-month' => $resultMonth
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
