<?php
require_once __DIR__ . '/db.php';
header('Content-Type: text/plain; charset=utf-8');

echo "=== Seeding Demo Orders & Reservations to Neon Cloud ===\n";

// 1. Initial Orders
$initialOrders = [
    [
        'cmd_id' => 'CMD-8943',
        'date_str' => date('j F Y'),
        'time_str' => 'Il y a 2 min',
        'customer_name' => 'Yassine Amrani',
        'customer_phone' => '+212 661-892341',
        'customer_address' => '14 Av. Hassan II, Apt 5, Casa',
        'items_json' => json_encode([
            ['title' => 'Pizza Pepperoni Truffée', 'quantity' => 1, 'price' => 95],
            ['title' => 'Mojito Passion Artisanal', 'quantity' => 1, 'price' => 35]
        ]),
        'total_price' => 130.00,
        'payment_method' => 'Paiement à la livraison (Espèces)',
        'status' => 'pending',
        'channel' => 'online',
        'created_at' => time() * 1000 - 120000
    ],
    [
        'cmd_id' => 'CMD-8942',
        'date_str' => date('j F Y'),
        'time_str' => 'Il y a 5 min',
        'customer_name' => 'Sur Place (Table #04)',
        'customer_phone' => '+212 600-000000',
        'customer_address' => 'Table #04',
        'items_json' => json_encode([
            ['title' => 'Creamy Garlic Parmesan Pasta', 'quantity' => 1, 'price' => 105],
            ['title' => 'Mojito Passion Artisanal', 'quantity' => 2, 'price' => 35]
        ]),
        'total_price' => 175.00,
        'payment_method' => 'Carte Bancaire CMI',
        'status' => 'cooking',
        'channel' => 'sur-place',
        'created_at' => time() * 1000 - 300000
    ],
    [
        'cmd_id' => 'CMD-8941',
        'date_str' => date('j F Y'),
        'time_str' => 'Il y a 10 min',
        'customer_name' => 'À Emporter (Comptoir)',
        'customer_phone' => '+212 611-223344',
        'customer_address' => 'Comptoir Retrait',
        'items_json' => json_encode([
            ['title' => 'Double Angus Cheeseburger', 'quantity' => 2, 'price' => 100],
            ['title' => 'Molten Lava Cake', 'quantity' => 1, 'price' => 45]
        ]),
        'total_price' => 245.00,
        'payment_method' => 'Espèces Comptoir',
        'status' => 'completed',
        'channel' => 'takeaway',
        'created_at' => time() * 1000 - 600000
    ],
    [
        'cmd_id' => 'CMD-8940',
        'date_str' => date('j F Y'),
        'time_str' => 'Il y a 18 min',
        'customer_name' => 'Omar Tazi',
        'customer_phone' => '+212 612-998877',
        'customer_address' => 'Res. Les Lilyas, Apt 14, Gauthier, Casa',
        'items_json' => json_encode([
            ['title' => 'Pizza Margherita Supreme', 'quantity' => 1, 'price' => 75],
            ['title' => 'Pizza Pepperoni Truffée', 'quantity' => 1, 'price' => 95]
        ]),
        'total_price' => 170.00,
        'payment_method' => 'Paiement à la livraison',
        'status' => 'cooking',
        'channel' => 'online',
        'created_at' => time() * 1000 - 1080000
    ]
];

$orderStmt = $pdo->prepare("
    INSERT INTO orders (cmd_id, date_str, time_str, customer_name, customer_phone, customer_address, items_json, total_price, payment_method, status, channel, created_at)
    VALUES (:cmd_id, :date_str, :time_str, :customer_name, :customer_phone, :customer_address, :items_json, :total_price, :payment_method, :status, :channel, :created_at)
    " . ($db_driver === 'pgsql' ? "ON CONFLICT (cmd_id) DO NOTHING" : "ON DUPLICATE KEY UPDATE id=id") . "
");

foreach ($initialOrders as $o) {
    $orderStmt->execute([
        ':cmd_id' => $o['cmd_id'],
        ':date_str' => $o['date_str'],
        ':time_str' => $o['time_str'],
        ':customer_name' => $o['customer_name'],
        ':customer_phone' => $o['customer_phone'],
        ':customer_address' => $o['customer_address'],
        ':items_json' => $o['items_json'],
        ':total_price' => $o['total_price'],
        ':payment_method' => $o['payment_method'],
        ':status' => $o['status'],
        ':channel' => $o['channel'],
        ':created_at' => $o['created_at']
    ]);
}
echo "[OK] Commandes initiales insérées avec succès !\n";

// 2. Initial Reservations
$initialResas = [
    [
        'res_id' => '#RES-7095',
        'name' => 'Karim El Amrani',
        'phone' => '+212 661-889922',
        'email' => 'k.amrani@gmail.com',
        'date_str' => 'Aujourd\'hui, 20:30',
        'time_str' => '20:30',
        'guests_count' => 4,
        'notes' => 'Anniversaire de mariage 🎂 Table romantique souhaitée en Zone VIP.',
        'status' => 'pending',
        'channel' => 'online',
        'created_at' => time() * 1000 - 480000
    ],
    [
        'res_id' => '#RES-7094',
        'name' => 'Sarah Mansouri',
        'phone' => '+212 663-445566',
        'email' => 'sarah.m@outlook.com',
        'date_str' => 'Aujourd\'hui, 21:00',
        'time_str' => '21:00',
        'guests_count' => 2,
        'notes' => 'Près du chauffage extérieur S.V.P.',
        'status' => 'confirmed',
        'channel' => 'online',
        'created_at' => time() * 1000 - 1500000
    ],
    [
        'res_id' => '#RES-7093',
        'name' => 'Youssef Bennani',
        'phone' => '+212 670-112233',
        'email' => 'y.bennani@tech.ma',
        'date_str' => 'Aujourd\'hui, 19:45',
        'time_str' => '19:45',
        'guests_count' => 6,
        'notes' => 'Dîner d\'équipe entreprise.',
        'status' => 'seated',
        'channel' => 'online',
        'created_at' => time() * 1000 - 3600000
    ]
];

$resaStmt = $pdo->prepare("
    INSERT INTO reservations (res_id, name, phone, email, date_str, time_str, guests_count, notes, status, channel, created_at)
    VALUES (:res_id, :name, :phone, :email, :date_str, :time_str, :guests_count, :notes, :status, :channel, :created_at)
    " . ($db_driver === 'pgsql' ? "ON CONFLICT (res_id) DO NOTHING" : "ON DUPLICATE KEY UPDATE id=id") . "
");

foreach ($initialResas as $r) {
    $resaStmt->execute([
        ':res_id' => $r['res_id'],
        ':name' => $r['name'],
        ':phone' => $r['phone'],
        ':email' => $r['email'],
        ':date_str' => $r['date_str'],
        ':time_str' => $r['time_str'],
        ':guests_count' => $r['guests_count'],
        ':notes' => $r['notes'],
        ':status' => $r['status'],
        ':channel' => $r['channel'],
        ':created_at' => $r['created_at']
    ]);
}
echo "[OK] Réservations initiales insérées avec succès !\n";

// 3. Initial Messages
$initialMessages = [
    [
        'msg_id' => '#MSG-501',
        'name' => 'Hamza Chraibi',
        'email' => 'hamza.chraibi@gmail.com',
        'phone' => '+212 665 11 22 33',
        'subject' => 'Privatisation pour Événement',
        'message' => 'Bonjour, nous souhaitons privatiser la terrasse du restaurant pour un cocktail dînatoire d\'entreprise le 15 du mois prochain pour environ 40 personnes. Pourriez-vous nous envoyer un devis ?',
        'status' => 'unread',
        'created_at' => time() * 1000 - 3600000
    ],
    [
        'msg_id' => '#MSG-502',
        'name' => 'Nadia Filali',
        'email' => 'nadia.filali@yahoo.fr',
        'phone' => '+212 661 44 55 66',
        'subject' => 'Demande d\'information Menu Végétarien',
        'message' => 'Bonjour le chef, je prévois un dîner chez vous ce weekend avec des amis qui ne mangent pas de gluten. Avez-vous des alternatives sans gluten pour les pâtes ? Merci d\'avance.',
        'status' => 'read',
        'created_at' => time() * 1000 - 86400000
    ]
];

$msgStmt = $pdo->prepare("
    INSERT INTO messages (msg_id, name, email, phone, subject, message, status, created_at)
    VALUES (:msg_id, :name, :email, :phone, :subject, :message, :status, :created_at)
    " . ($db_driver === 'pgsql' ? "ON CONFLICT (msg_id) DO NOTHING" : "ON DUPLICATE KEY UPDATE id=id") . "
");

foreach ($initialMessages as $m) {
    $msgStmt->execute([
        ':msg_id' => $m['msg_id'],
        ':name' => $m['name'],
        ':email' => $m['email'],
        ':phone' => $m['phone'],
        ':subject' => $m['subject'],
        ':message' => $m['message'],
        ':status' => $m['status'],
        ':created_at' => $m['created_at']
    ]);
}
echo "[OK] Messages de contact insérés avec succès !\n";
echo "=== SEEDING TERMINE SUR NEON ! ===\n";
