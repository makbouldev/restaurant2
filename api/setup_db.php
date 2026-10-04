<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf8mb4');

try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    // 1. Create categories table
    $pdo->exec("DROP TABLE IF EXISTS `categories`");
    $pdo->exec("CREATE TABLE `categories` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `slug` VARCHAR(50) NOT NULL UNIQUE,
        `name` VARCHAR(100) NOT NULL,
        `icon` VARCHAR(50) DEFAULT '✨',
        `image` VARCHAR(255) DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // 2. Create dishes table with Relational Foreign Key (1-to-many relationship)
    $pdo->exec("DROP TABLE IF EXISTS `dishes`");
    $pdo->exec("CREATE TABLE `dishes` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `item_id` VARCHAR(50) NOT NULL UNIQUE,
        `category_id` INT NOT NULL,
        `category` VARCHAR(50) NOT NULL,
        `title` VARCHAR(150) NOT NULL,
        `description` TEXT NULL,
        `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        `image` VARCHAR(255) NULL,
        `options` LONGTEXT NULL,
        `is_available` TINYINT(1) NOT NULL DEFAULT 1,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (`category_id`),
        INDEX (`category`),
        CONSTRAINT `fk_dishes_categories` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // 3. Create orders table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `orders` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `cmd_id` VARCHAR(50) NOT NULL UNIQUE,
        `date_str` VARCHAR(100) NULL,
        `time_str` VARCHAR(50) NULL,
        `customer_name` VARCHAR(120) NOT NULL,
        `customer_phone` VARCHAR(50) NOT NULL,
        `customer_address` TEXT NULL,
        `items_json` LONGTEXT NOT NULL,
        `total_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        `payment_method` VARCHAR(100) DEFAULT 'Paiement à la livraison (Espèces)',
        `status` VARCHAR(50) DEFAULT 'pending',
        `channel` VARCHAR(50) DEFAULT 'online',
        `created_at` BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // 4. Create reservations table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `reservations` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `res_id` VARCHAR(50) NOT NULL UNIQUE,
        `name` VARCHAR(120) NOT NULL,
        `phone` VARCHAR(50) NOT NULL,
        `email` VARCHAR(120) NULL,
        `date_str` VARCHAR(100) NULL,
        `time_str` VARCHAR(50) NULL,
        `guests_count` INT NOT NULL DEFAULT 2,
        `notes` TEXT NULL,
        `status` VARCHAR(50) DEFAULT 'pending',
        `channel` VARCHAR(50) DEFAULT 'online',
        `created_at` BIGINT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Seed Categories
    $categories = [
        ['slug' => 'pastas', 'name' => 'Pâtes', 'icon' => '🍝'],
        ['slug' => 'burgers', 'name' => 'Burgers', 'icon' => '🍔'],
        ['slug' => 'pizzas', 'name' => 'Pizzas', 'icon' => '🍕'],
        ['slug' => 'grillades', 'name' => 'Grillades & Viandes', 'icon' => '🥩'],
        ['slug' => 'salades', 'name' => 'Salades Fraîches', 'icon' => '🥗'],
        ['slug' => 'boissons', 'name' => 'Boissons & Smoothies', 'icon' => '🥤'],
        ['slug' => 'desserts', 'name' => 'Desserts & Glaces', 'icon' => '🍨']
    ];

    $stmtCat = $pdo->prepare("INSERT INTO `categories` (`slug`, `name`, `icon`) VALUES (:slug, :name, :icon)");
    $catSlugToId = [];
    foreach ($categories as $c) {
        $stmtCat->execute($c);
        $catSlugToId[$c['slug']] = (int)$pdo->lastInsertId();
    }

    // Seed 36 Real Dishes with Options
    $dishes = [
        // --- PASTAS (5) ---
        [
            "item_id" => "1",
            "title" => "Tagliatelle aux Truffes Noires",
            "category" => "pastas",
            "description" => "Pâtes fraîches avec crème de truffe noire d'Alba et copeaux de parmesan Vache di Bruno.",
            "price" => 110,
            "image" => "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Format Portion", "values" => ["Portion Normale 🍝", "Grande Portion Gourmet 🍝"]],
                ["name" => "Sauce / Crème", "values" => ["Crème Truffe Noire 🍄", "Tomate San Marzano 🍅", "Pesto Basilic 🌿"]],
                ["name" => "Extra Fromage", "values" => ["Parmesan Affiné 🧀", "Burrata Crémeuse 🧀", "Sans Fromage 🛑"]]
            ]
        ],
        [
            "item_id" => "2",
            "title" => "Creamy Garlic Parmesan Pasta",
            "category" => "pastas",
            "description" => "Pâtes artisanales avec crème fraîche, ail rôti et parmesan affiné 24 mois.",
            "price" => 85,
            "image" => "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Format Portion", "values" => ["Portion Normale 🍝", "Grande Portion Gourmet 🍝"]],
                ["name" => "Sauce", "values" => ["Crème Ail & Parmesan 🧄", "Crème Truffe 🍄", "Tomate Basilic 🍅"]],
                ["name" => "Extra Fromage", "values" => ["Parmesan Affiné 🧀", "Sans Fromage 🛑"]]
            ]
        ],
        [
            "item_id" => "3",
            "title" => "Penne Arrabiata al Burrata",
            "category" => "pastas",
            "description" => "Penne à la sauce tomate épicée San Marzano, piment d'Espelette et Burrata crémeuse.",
            "price" => 90,
            "image" => "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Niveau de Piment", "values" => ["Piquant Moyen 🌶️", "Très Piquant 🔥", "Doux Sans Piment 🛑"]],
                ["name" => "Format Portion", "values" => ["Portion Normale 🍝", "Grande Portion Gourmet 🍝"]],
                ["name" => "Fromage Extra", "values" => ["Burrata Crémeuse 🧀", "Parmesan 🧀"]]
            ]
        ],
        [
            "item_id" => "4",
            "title" => "Spaghetti Carbonara Tradizionale",
            "category" => "pastas",
            "description" => "Spaghetti artisanaux, guanciale croustillant, jaune d'œuf et pecorino romano.",
            "price" => 95,
            "image" => "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Format Portion", "values" => ["Portion Normale 🍝", "Grande Portion Gourmet 🍝"]],
                ["name" => "Fromage", "values" => ["Pecorino Romano 🧀", "Parmesan Affiné 🧀"]]
            ]
        ],
        [
            "item_id" => "5",
            "title" => "Linguine Frutti di Mare",
            "category" => "pastas",
            "description" => "Linguine aux fruits de mer frais, crevettes royales, moules et calamars sautés au vin blanc.",
            "price" => 130,
            "image" => "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce de cuisson", "values" => ["Sauce Vin Blanc & Ail 🍷", "Sauce Tomate San Marzano 🍅"]],
                ["name" => "Niveau Piment", "values" => ["Légèrement Piquant 🌶️", "Doux 🛑"]]
            ]
        ],

        // --- BURGERS (5) ---
        [
            "item_id" => "6",
            "title" => "Double Angus Cheeseburger",
            "category" => "burgers",
            "description" => "Double steak de bœuf Black Angus grillé, cheddar fondu et oignons caramélisés.",
            "price" => 95,
            "image" => "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce au choix", "values" => ["Sauce Algérienne 🌶️", "Sauce Biggy Burger 🍯", "Sauce Blanche Ail 🥣", "Sauce BBQ Fumé 🔥"]],
                ["name" => "Cuisson Viande", "values" => ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"]],
                ["name" => "Formule Menu", "values" => ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"]]
            ]
        ],
        [
            "item_id" => "7",
            "title" => "Crispy Chicken & Bacon Burger",
            "category" => "burgers",
            "description" => "Filet de poulet croustillant pané aux épices, bacon doré, salade iceberg et mayo piquante.",
            "price" => 80,
            "image" => "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce au choix", "values" => ["Mayo Piquante 🌶️", "Sauce Honey Mustard 🍯", "Sauce Blanche Ail 🥣"]],
                ["name" => "Piment", "values" => ["Épicé 🌶️", "Doux 🛑"]],
                ["name" => "Formule Menu", "values" => ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"]]
            ]
        ],
        [
            "item_id" => "8",
            "title" => "Smokey BBQ Bacon Burger",
            "category" => "burgers",
            "description" => "Steak Angus 180g, bacon de bœuf fumé, sauce BBQ maison et cheddar blanc affiné.",
            "price" => 90,
            "image" => "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce", "values" => ["Sauce BBQ Fumé 🔥", "Sauce Biggy Burger 🍯", "Sauce Algérienne 🌶️"]],
                ["name" => "Cuisson Viande", "values" => ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"]],
                ["name" => "Formule Menu", "values" => ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"]]
            ]
        ],
        [
            "item_id" => "9",
            "title" => "Truffle Mushroom Burger",
            "category" => "burgers",
            "description" => "Steak Angus, poêlée de champignons sauvages, émulsion à la truffe et emmental suisse.",
            "price" => 105,
            "image" => "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce / Émulsion", "values" => ["Émulsion à la Truffe 🍄", "Sauce Blanche Ail 🥣"]],
                ["name" => "Cuisson Viande", "values" => ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"]],
                ["name" => "Formule Menu", "values" => ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"]]
            ]
        ],
        [
            "item_id" => "10",
            "title" => "Veggie Avocado Gourmet Burger",
            "category" => "burgers",
            "description" => "Galette de quinoa et légumes grillés, guacamole maison, tomates séchées et roquette.",
            "price" => 70,
            "image" => "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce", "values" => ["Guacamole Maison 🥑", "Sauce Blanche Ail 🥣", "Sauce Pesto 🌿"]],
                ["name" => "Formule Menu", "values" => ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"]]
            ]
        ],

        // --- PIZZAS (5) ---
        [
            "item_id" => "11",
            "title" => "Pizza Margherita Supreme",
            "category" => "pizzas",
            "description" => "Pâte napolitaine maturée 48h, sauce tomate San Marzano, mozzarella fior di latte et basilic.",
            "price" => 65,
            "image" => "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Taille / Format", "values" => ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"]],
                ["name" => "Sauce de Base", "values" => ["Sauce Tomate San Marzano 🍅", "Crème Fraîche Onctueuse 🥛"]],
                ["name" => "Sauce Piquante", "values" => ["Sauce Harissa Maison 🌶️", "Huile Pimentée 🫒", "Sans Piment 🛑"]]
            ]
        ],
        [
            "item_id" => "12",
            "title" => "Pizza Quattro Formaggi",
            "category" => "pizzas",
            "description" => "Mozzarella, gorgonzola AOP, taleggio et parmesan râpé avec filet de miel.",
            "price" => 85,
            "image" => "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Taille / Format", "values" => ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"]],
                ["name" => "Sauce de Base", "values" => ["Crème Fraîche Onctueuse 🥛", "Sauce Tomate San Marzano 🍅"]],
                ["name" => "Finition Miel", "values" => ["Avec Filet de Miel 🍯", "Sans Miel 🛑"]]
            ]
        ],
        [
            "item_id" => "13",
            "title" => "Pizza Pepperoni & Jalapeño",
            "category" => "pizzas",
            "description" => "Sauce tomate piquante, mozzarella, tranches de pepperoni croustillant et jalapeños.",
            "price" => 80,
            "image" => "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Taille / Format", "values" => ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"]],
                ["name" => "Piment", "values" => ["Avec Jalapeños 🌶️", "Très Piquant 🔥", "Doux 🛑"]],
                ["name" => "Sauce de Base", "values" => ["Sauce Tomate Piquante 🍅", "Crème Fraîche 🥛"]]
            ]
        ],
        [
            "item_id" => "14",
            "title" => "Pizza Truffe & Champignons",
            "category" => "pizzas",
            "description" => "Crème de truffe, champignons de paris sautés, mozzarella fior di latte et roquette.",
            "price" => 110,
            "image" => "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Taille / Format", "values" => ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"]],
                ["name" => "Sauce de Base", "values" => ["Crème de Truffe 🍄", "Sauce Tomate 🍅"]]
            ]
        ],
        [
            "item_id" => "15",
            "title" => "Pizza Frutti di Mare",
            "category" => "pizzas",
            "description" => "Crevettes fraîches, calamars, ail rôti, persil frais et sauce tomate basilic.",
            "price" => 120,
            "image" => "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Taille / Format", "values" => ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"]],
                ["name" => "Sauce de Base", "values" => ["Sauce Tomate Basilic 🍅", "Crème Fraîche 🥛"]],
                ["name" => "Sauce Piquante", "values" => ["Huile Pimentée 🫒", "Harissa Maison 🌶️", "Sans Piment 🛑"]]
            ]
        ],

        // --- GRILLADES (5) ---
        [
            "item_id" => "16",
            "title" => "Entrecôte Grillée Sauce Poivre",
            "category" => "grillades",
            "description" => "Pièce de bœuf tendre grillée au feu de bois, sauce au poivre vert frais et frites maison.",
            "price" => 160,
            "image" => "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Cuisson Viande", "values" => ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"]],
                ["name" => "Sauce au choix", "values" => ["Sauce Poivre Vert 🫛", "Sauce Champignons Truffée 🍄", "Sauce Béarnaise 🥣"]],
                ["name" => "Accompagnement", "values" => ["Frites Maison 🍟", "Riz Basmati Parfumé 🍚", "Légumes Grillés 🥦"]]
            ]
        ],
        [
            "item_id" => "17",
            "title" => "Pavé de Saumon Grillé",
            "category" => "grillades",
            "description" => "Saumon atlantique grillé au bois de hêtre, servi avec légumes de saison croquants.",
            "price" => 140,
            "image" => "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce au choix", "values" => ["Sauce Citron & Aneth 🍋", "Sauce Béarnaise 🥣", "Beurre Blanc 🧈"]],
                ["name" => "Accompagnement", "values" => ["Légumes Grillés 🥦", "Riz Basmati Parfumé 🍚", "Frites Maison 🍟"]]
            ]
        ],
        [
            "item_id" => "18",
            "title" => "Brochettes d'Agneau Mariné",
            "category" => "grillades",
            "description" => "Tendres morceaux d'agneau marinés aux épices marocaines, grillés sur charbon vif.",
            "price" => 130,
            "image" => "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Accompagnement", "values" => ["Riz Basmati 🍚", "Frites Maison 🍟", "Salade Marocaine 🥗"]],
                ["name" => "Sauce Piquante", "values" => ["Harissa Maison 🌶️", "Sauce Blanche Ail 🥣", "Sans Piment 🛑"]]
            ]
        ],
        [
            "item_id" => "19",
            "title" => "Mix Grill Gastronomique (2 pers.)",
            "category" => "grillades",
            "description" => "Plateau royal : entrecôte, brochettes d'agneau, côtelettes et filet de poulet grillé.",
            "price" => 280,
            "image" => "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauces incluses", "values" => ["Trio de Sauces (Poivre, Harissa, Blanche) 🥣", "Sauce BBQ Fumé 🔥"]],
                ["name" => "Accompagnement Mix", "values" => ["Duo Frites & Riz 🍟🍚", "Frites & Légumes 🍟🥦"]]
            ]
        ],
        [
            "item_id" => "20",
            "title" => "Côtelettes d'Agneau au Romarin",
            "category" => "grillades",
            "description" => "Côtelettes d'agneau juteuses grillées au romarin et à l'huile d'olive extra vierge.",
            "price" => 150,
            "image" => "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Cuisson Viande", "values" => ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"]],
                ["name" => "Accompagnement", "values" => ["Légumes Grillés 🥦", "Frites Maison 🍟", "Riz 🍚"]]
            ]
        ],

        // --- SALADES (5) ---
        [
            "item_id" => "21",
            "title" => "Salade Burrata & Tomates Rôties",
            "category" => "salades",
            "description" => "Burrata crémeuse de Pouille, tomates cerises confites, pesto de basilic frais et pignons rôtis.",
            "price" => 85,
            "image" => "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce / Assaisonnement", "values" => ["Pesto Basilic 🌿", "Vinaigrette Balsamique 🍇", "Huile d'Olive Extra 🫒"]]
            ]
        ],
        [
            "item_id" => "22",
            "title" => "Salade Caesar Poulet Grillé",
            "category" => "salades",
            "description" => "Cœur de romaine, filet de poulet grillé, croûtons à l'ail, parmesan et sauce Caesar maison.",
            "price" => 75,
            "image" => "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce Caesar", "values" => ["Sauce Caesar Originale 🥣", "Vinaigrette Légère 🥗"]],
                ["name" => "Extra Fromage", "values" => ["Copeaux de Parmesan 🧀", "Sans Fromage 🛑"]]
            ]
        ],
        [
            "item_id" => "23",
            "title" => "Salade Quinoa & Avocat Detox",
            "category" => "salades",
            "description" => "Quinoa bio, morceaux d'avocat crémeux, grenades, edamame et vinaigrette au citron vert.",
            "price" => 70,
            "image" => "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Vinaigrette", "values" => ["Vinaigrette Citron Vert & Miel 🍋", "Huile d'Olive & Citron 🫒"]]
            ]
        ],
        [
            "item_id" => "24",
            "title" => "Salade Chèvre Chaud & Miel",
            "category" => "salades",
            "description" => "Toast de chèvre chaud fondant, miel de fleurs, noix croquantes et jeunes pousses.",
            "price" => 80,
            "image" => "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Assaisonnement", "values" => ["Sauce Miel & Moutarde 🍯", "Vinaigrette Balsamique 🍇"]]
            ]
        ],
        [
            "item_id" => "25",
            "title" => "Salade Saumon Avocat Gourmet",
            "category" => "salades",
            "description" => "Tranches de saumon fumé norvégien, avocat, mangue fraîche, sésame et vinaigrette passion.",
            "price" => 95,
            "image" => "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce au choix", "values" => ["Vinaigrette Fruit de la Passion 🥭", "Sauce Sésame Soja 🥢"]]
            ]
        ],

        // --- BOISSONS (6) ---
        [
            "item_id" => "26",
            "title" => "Mojito Passion Frais",
            "category" => "boissons",
            "description" => "Citron vert pressé, menthe fraîche pilée, purée de fruit de la passion et eau gazeuse.",
            "price" => 35,
            "image" => "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Palais & Sucre", "values" => ["Sucre Normal 🍹", "Moins Sucré 🍃", "Sans Sucre 🛑"]],
                ["name" => "Glaçons", "values" => ["Glace Pilée Abondante 🧊", "Peu de Glace ❄️"]]
            ]
        ],
        [
            "item_id" => "27",
            "title" => "Jus d'Orange Pressé Pur",
            "category" => "boissons",
            "description" => "100% oranges marocaines fraîchement pressées à la commande.",
            "price" => 25,
            "image" => "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Glaçons", "values" => ["Bien Frais avec Glaçons 🧊", "Sans Glaçons 🍊"]]
            ]
        ],
        [
            "item_id" => "28",
            "title" => "Smoothie Mangue Ananas Coco",
            "category" => "boissons",
            "description" => "Mangue tropicale, ananas frais et lait de coco crémeux mixés minute.",
            "price" => 40,
            "image" => "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Lait au choix", "values" => ["Lait de Coco 🥥", "Lait d'Amande 🥛", "Lait Écrémé 🥛"]]
            ]
        ],
        [
            "item_id" => "29",
            "title" => "Milkshake Nutella & Spéculoos",
            "category" => "boissons",
            "description" => "Glace vanille artisanale, Nutella généreux, éclats de biscuit spéculoos et chantilly.",
            "price" => 45,
            "image" => "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Chantilly", "values" => ["Avec Crème Chantilly 🍦", "Sans Chantilly 🛑"]]
            ]
        ],
        [
            "item_id" => "30",
            "title" => "Thé Glacé Maison Pêche & Hibiscus",
            "category" => "boissons",
            "description" => "Infusion d'hibiscus bio et thé noir à la pêche fraîche et menthe.",
            "price" => 30,
            "image" => "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Glaçons", "values" => ["Glace Pilée 🧊", "Sans Glace 🛑"]]
            ]
        ],
        [
            "item_id" => "31",
            "title" => "Eau Minérale Oulmès Gazeuse 1L",
            "category" => "boissons",
            "description" => "Bouteille d'eau minérale naturellement gazeuse servie fraîche avec tranches de citron.",
            "price" => 20,
            "image" => "https://images.unsplash.com/photo-1560023907-5f313c863d80?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Service Citron", "values" => ["Avec Rondelles de Citron 🍋", "Sans Citron 🛑"]]
            ]
        ],

        // --- DESSERTS (5) ---
        [
            "item_id" => "32",
            "title" => "Tiramisu Tradizionale au Cacao",
            "category" => "desserts",
            "description" => "Biscuits cuillère imbibés d'espresso pur, crème mascarpone et cacao amer.",
            "price" => 45,
            "image" => "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Sauce Extra", "values" => ["Sauce Chocolat Chaud 🍫", "Sauce Caramel Beurre Salé 🍯", "Sans Sauce 🛑"]]
            ]
        ],
        [
            "item_id" => "33",
            "title" => "Fondant au Chocolat Coeur Coulant",
            "category" => "desserts",
            "description" => "Fondant au chocolat Valrhona avec cœur coulant chaud, servi avec boule de glace vanille.",
            "price" => 50,
            "image" => "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Glace au choix", "values" => ["Boule Vanille Bourbon 🍨", "Boule Caramel 🍨", "Sans Glace 🛑"]]
            ]
        ],
        [
            "item_id" => "34",
            "title" => "Cheesecake Spéculoos & Caramel",
            "category" => "desserts",
            "description" => "Cheesecake new-yorkais onctueux sur base spéculoos croustillante et coulis de caramel.",
            "price" => 55,
            "image" => "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Nappage", "values" => ["Caramel Beurre Salé 🍯", "Coulis de Fruits Rouges 🍓"]]
            ]
        ],
        [
            "item_id" => "35",
            "title" => "Tarte Fine aux Pommes Caramel",
            "category" => "desserts",
            "description" => "Pâte feuilletée croustillante, lamelles de pommes caramélisées et glace vanille.",
            "price" => 45,
            "image" => "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Accompagnement", "values" => ["Avec Boule Vanille 🍨", "Sans Glace 🛑"]]
            ]
        ],
        [
            "item_id" => "36",
            "title" => "Coupe Glacée Artisanale 3 Boules",
            "category" => "desserts",
            "description" => "3 boules au choix (Vanille, Chocolat, Fraise, Caramel, Pistache) avec chantilly et nappe.",
            "price" => 40,
            "image" => "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80",
            "options" => [
                ["name" => "Parfum 1", "values" => ["Vanille Bourbon 🍨", "Chocolat Noir 🍫", "Fraise 🍓", "Pistache 🥜"]],
                ["name" => "Parfum 2", "values" => ["Caramel Beurre Salé 🍯", "Vanille Bourbon 🍨", "Chocolat 🍫"]],
                ["name" => "Chantilly & Nappage", "values" => ["Chantilly + Nappe Chocolat 🍫", "Chantilly + Caramel 🍯", "Sans Chantilly 🛑"]]
            ]
        ]
    ];

    $stmtDish = $pdo->prepare("INSERT INTO `dishes` (`item_id`, `category_id`, `category`, `title`, `description`, `price`, `image`, `options`, `is_available`)
        VALUES (:item_id, :category_id, :category, :title, :description, :price, :image, :options, 1)");

    $count = 0;
    $firstImgByCat = [];
    foreach ($dishes as $d) {
        $catId = $catSlugToId[$d['category']] ?? 1;
        if (!isset($firstImgByCat[$catId]) && !empty($d['image'])) {
            $firstImgByCat[$catId] = $d['image'];
        }

        $stmtDish->execute([
            'item_id' => $d['item_id'],
            'category_id' => $catId,
            'category' => $d['category'],
            'title' => $d['title'],
            'description' => $d['description'],
            'price' => $d['price'],
            'image' => $d['image'],
            'options' => json_encode($d['options'], JSON_UNESCAPED_UNICODE)
        ]);
        $count++;
    }

    // Update representative category images
    $stmtUpdateCatImg = $pdo->prepare("UPDATE `categories` SET `image` = :img WHERE `id` = :id");
    foreach ($firstImgByCat as $cId => $imgUrl) {
        $stmtUpdateCatImg->execute(['img' => $imgUrl, 'id' => $cId]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => "Base de données configurée avec succès ! $count plats réels enregistrés dans MySQL (restaurant_menu)."
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la configuration de la base de données : ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
