/**
 * REAL MYSQL RELATIONAL DATASET (Categories <-> Dishes 1-to-Many Relationship)
 * Synchronized with MySQL database tables `categories` & `dishes` (api/setup_db.php)
 */

window.REAL_MYSQL_DISHES = [
    // --- PASTAS (category_id: 1) ---
    {
        id: "1",
        category_id: 1,
        category: "pastas",
        category_name: "Pâtes",
        category_icon: "",
        title: "Tagliatelle aux Truffes Noires",
        description: "Pâtes fraîches avec crème de truffe noire d'Alba et copeaux de parmesan Vache di Bruno.",
        price: 110,
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "2",
        category_id: 1,
        category: "pastas",
        category_name: "Pâtes",
        category_icon: "",
        title: "Creamy Garlic Parmesan Pasta",
        description: "Pâtes artisanales avec crème fraîche, ail rôti et parmesan affiné 24 mois.",
        price: 85,
        image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "3",
        category_id: 1,
        category: "pastas",
        category_name: "Pâtes",
        category_icon: "",
        title: "Penne Arrabiata al Burrata",
        description: "Penne à la sauce tomate épicée San Marzano, piment d'Espelette et Burrata crémeuse.",
        price: 90,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "4",
        category_id: 1,
        category: "pastas",
        category_name: "Pâtes",
        category_icon: "",
        title: "Spaghetti Carbonara Tradizionale",
        description: "Spaghetti artisanaux, guanciale croustillant, jaune d'œuf et pecorino romano.",
        price: 95,
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "5",
        category_id: 1,
        category: "pastas",
        category_name: "Pâtes",
        category_icon: "",
        title: "Linguine Frutti di Mare",
        description: "Linguine aux fruits de mer frais, crevettes royales, moules et calamars sautés au vin blanc.",
        price: 130,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
    },

    // --- BURGERS (category_id: 2) ---
    {
        id: "6",
        category_id: 2,
        category: "burgers",
        category_name: "Burgers",
        category_icon: "",
        title: "Double Angus Cheeseburger",
        description: "Double steak de bœuf Black Angus grillé, cheddar fondu et oignons caramélisés.",
        price: 95,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "7",
        category_id: 2,
        category: "burgers",
        category_name: "Burgers",
        category_icon: "",
        title: "Crispy Chicken & Bacon Burger",
        description: "Filet de poulet croustillant pané aux épices, bacon doré, salade iceberg et mayo piquante.",
        price: 80,
        image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "8",
        category_id: 2,
        category: "burgers",
        category_name: "Burgers",
        category_icon: "",
        title: "Smokey BBQ Bacon Burger",
        description: "Steak Angus 180g, bacon de bœuf fumé, sauce BBQ maison et cheddar blanc affiné.",
        price: 90,
        image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "9",
        category_id: 2,
        category: "burgers",
        category_name: "Burgers",
        category_icon: "",
        title: "Truffle Mushroom Burger",
        description: "Steak Angus, poêlée de champignons sauvages, émulsion à la truffe et emmental suisse.",
        price: 105,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "10",
        category_id: 2,
        category: "burgers",
        category_name: "Burgers",
        category_icon: "",
        title: "Veggie Avocado Gourmet Burger",
        description: "Galette de quinoa et légumes grillés, guacamole maison, tomates séchées et roquette.",
        price: 70,
        image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=80"
    },

    // --- PIZZAS (category_id: 3) ---
    {
        id: "11",
        category_id: 3,
        category: "pizzas",
        category_name: "Pizzas",
        category_icon: "",
        title: "Pizza Margherita Supreme",
        description: "Pâte napolitaine maturée 48h, sauce tomate San Marzano, mozzarella fior di latte et basilic.",
        price: 65,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "12",
        category_id: 3,
        category: "pizzas",
        category_name: "Pizzas",
        category_icon: "",
        title: "Pizza Quattro Formaggi",
        description: "Mozzarella, gorgonzola AOP, taleggio et parmesan râpé avec filet de miel.",
        price: 85,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "13",
        category_id: 3,
        category: "pizzas",
        category_name: "Pizzas",
        category_icon: "",
        title: "Pizza Pepperoni & Jalapeño",
        description: "Sauce tomate piquante, mozzarella, tranches de pepperoni croustillant et jalapeños.",
        price: 80,
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "14",
        category_id: 3,
        category: "pizzas",
        category_name: "Pizzas",
        category_icon: "",
        title: "Pizza Truffe & Champignons",
        description: "Crème de truffe, champignons de paris sautés, mozzarella fior di latte et roquette.",
        price: 110,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "15",
        category_id: 3,
        category: "pizzas",
        category_name: "Pizzas",
        category_icon: "",
        title: "Pizza Frutti di Mare",
        description: "Crevettes fraîches, calamars, ail rôti, persil frais et sauce tomate basilic.",
        price: 120,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80"
    },

    // --- GRILLADES (category_id: 4) ---
    {
        id: "16",
        category_id: 4,
        category: "grillades",
        category_name: "Grillades & Viandes",
        category_icon: "",
        title: "Entrecôte Grillée Sauce Poivre",
        description: "Pièce de bœuf tendre grillée au feu de bois, sauce au poivre vert frais et frites maison.",
        price: 160,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "17",
        category_id: 4,
        category: "grillades",
        category_name: "Grillades & Viandes",
        category_icon: "",
        title: "Pavé de Saumon Grillé",
        description: "Saumon atlantique grillé au bois de hêtre, servi avec légumes de saison croquants.",
        price: 140,
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "18",
        category_id: 4,
        category: "grillades",
        category_name: "Grillades & Viandes",
        category_icon: "",
        title: "Brochettes d'Agneau Mariné",
        description: "Tendres morceaux d'agneau marinés aux épices marocaines, grillés sur charbon vif.",
        price: 130,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "19",
        category_id: 4,
        category: "grillades",
        category_name: "Grillades & Viandes",
        category_icon: "",
        title: "Mix Grill Gastronomique (2 pers.)",
        description: "Plateau royal : entrecôte, brochettes d'agneau, côtelettes et filet de poulet grillé.",
        price: 280,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "20",
        category_id: 4,
        category: "grillades",
        category_name: "Grillades & Viandes",
        category_icon: "",
        title: "Côtelettes d'Agneau au Romarin",
        description: "Côtelettes d'agneau juteuses grillées au romarin et à l'huile d'olive extra vierge.",
        price: 150,
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80"
    },

    // --- SALADES (category_id: 5) ---
    {
        id: "21",
        category_id: 5,
        category: "salades",
        category_name: "Salades Fraîches",
        category_icon: "",
        title: "Salade Burrata & Tomates Rôties",
        description: "Burrata crémeuse de Pouille, tomates cerises confites, pesto de basilic frais et pignons rôtis.",
        price: 85,
        image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "22",
        category_id: 5,
        category: "salades",
        category_name: "Salades Fraîches",
        category_icon: "",
        title: "Salade Caesar Poulet Grillé",
        description: "Cœur de romaine, filet de poulet grillé, croûtons à l'ail, parmesan et sauce Caesar maison.",
        price: 75,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "23",
        category_id: 5,
        category: "salades",
        category_name: "Salades Fraîches",
        category_icon: "",
        title: "Salade Quinoa & Avocat Detox",
        description: "Quinoa bio, morceaux d'avocat crémeux, grenades, edamame et vinaigrette au citron vert.",
        price: 70,
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "24",
        category_id: 5,
        category: "salades",
        category_name: "Salades Fraîches",
        category_icon: "",
        title: "Salade Chèvre Chaud & Miel",
        description: "Toast de chèvre chaud fondant, miel de fleurs, noix croquantes et jeunes pousses.",
        price: 80,
        image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "25",
        category_id: 5,
        category: "salades",
        category_name: "Salades Fraîches",
        category_icon: "",
        title: "Salade Saumon Avocat Gourmet",
        description: "Tranches de saumon fumé norvégien, avocat, mangue fraîche, sésame et vinaigrette passion.",
        price: 95,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80"
    },

    // --- BOISSONS (category_id: 6) ---
    {
        id: "26",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Mojito Passion Frais",
        description: "Citron vert pressé, menthe fraîche pilée, purée de fruit de la passion et eau gazeuse.",
        price: 35,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "27",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Jus d'Orange Pressé Pur",
        description: "100% oranges marocaines fraîchement pressées à la commande.",
        price: 25,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "28",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Smoothie Mangue Ananas Coco",
        description: "Mangue tropicale, ananas frais et lait de coco crémeux mixés minute.",
        price: 40,
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "29",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Milkshake Nutella & Spéculoos",
        description: "Glace vanille artisanale, Nutella généreux, éclats de biscuit spéculoos et chantilly.",
        price: 45,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "30",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Thé Glacé Maison Pêche & Hibiscus",
        description: "Infusion d'hibiscus bio et thé noir à la pêche fraîche et menthe.",
        price: 30,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "31",
        category_id: 6,
        category: "boissons",
        category_name: "Boissons & Smoothies",
        category_icon: "",
        title: "Eau Minérale Oulmès Gazeuse 1L",
        description: "Bouteille d'eau minérale naturellement gazeuse servie fraîche avec tranches de citron.",
        price: 20,
        image: "https://images.unsplash.com/photo-1560023907-5f313c863d80?w=500&auto=format&fit=crop&q=80"
    },

    // --- DESSERTS (category_id: 7) ---
    {
        id: "32",
        category_id: 7,
        category: "desserts",
        category_name: "Desserts & Glaces",
        category_icon: "",
        title: "Tiramisu Tradizionale au Cacao",
        description: "Biscuits cuillère imbibés d'espresso pur, crème mascarpone et cacao amer.",
        price: 45,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "33",
        category_id: 7,
        category: "desserts",
        category_name: "Desserts & Glaces",
        category_icon: "",
        title: "Fondant au Chocolat Coeur Coulant",
        description: "Fondant au chocolat Valrhona avec cœur coulant chaud, servi avec boule de glace vanille.",
        price: 50,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "34",
        category_id: 7,
        category: "desserts",
        category_name: "Desserts & Glaces",
        category_icon: "",
        title: "Cheesecake Spéculoos & Caramel",
        description: "Cheesecake new-yorkais onctueux sur base spéculoos croustillante et coulis de caramel.",
        price: 55,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "35",
        category_id: 7,
        category: "desserts",
        category_name: "Desserts & Glaces",
        category_icon: "",
        title: "Tarte Fine aux Pommes Caramel",
        description: "Pâte feuilletée croustillante, lamelles de pommes caramélisées et glace vanille.",
        price: 45,
        image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500&auto=format&fit=crop&q=80"
    },
    {
        id: "36",
        category_id: 7,
        category: "desserts",
        category_name: "Desserts & Glaces",
        category_icon: "",
        title: "Coupe Glacée Artisanale 3 Boules",
        description: "3 boules au choix (Vanille, Chocolat, Fraise, Caramel, Pistache) avec chantilly et nappe.",
        price: 40,
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80"
    }
];

// Helper to build relational category objects (Category -> HAS MANY -> Dishes)
window.REAL_MYSQL_CATEGORIES = [
    { id: 1, slug: 'pastas', name: 'Pâtes', icon: '', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80' },
    { id: 2, slug: 'burgers', name: 'Burgers', icon: '', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80' },
    { id: 3, slug: 'pizzas', name: 'Pizzas', icon: '', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
    { id: 4, slug: 'grillades', name: 'Grillades & Viandes', icon: '', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80' },
    { id: 5, slug: 'salades', name: 'Salades Fraîches', icon: '', image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=500&auto=format&fit=crop&q=80' },
    { id: 6, slug: 'boissons', name: 'Boissons & Smoothies', icon: '', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
    { id: 7, slug: 'desserts', name: 'Desserts & Glaces', icon: '', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80' }
].map(function(cat) {
    cat.dishes = window.REAL_MYSQL_DISHES.filter(function(d) {
        return d.category_id === cat.id || d.category === cat.slug;
    });
    cat.dishes_count = cat.dishes.length;
    return cat;
});
