document.addEventListener('DOMContentLoaded', () => {

    let weeklyOrdersChart = null;
    let reservationsChart = null;

    /* ==========================================================================
       1. SPA Navigation View Router with URL Hash Support (#home, #recipes, #categories, #orders, #reservations, #offers, #messages, #settings)
       ========================================================================== */
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function switchView(targetViewId, updateHash = true) {
        if (!targetViewId) return;

        // Clean target ID (remove leading # and view- if present)
        const viewId = targetViewId.replace(/^#/, '').replace(/^view-/, '').trim();
        const targetView = document.getElementById(`view-${viewId}`);
        
        if (!targetView) return;

        const pageViews = document.querySelectorAll('.page-view');
        pageViews.forEach(view => view.classList.remove('active'));
        targetView.classList.add('active');

        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            const itemKey = item.getAttribute('data-view') || item.getAttribute('data-target');
            const linkHref = item.querySelector('a') ? item.querySelector('a').getAttribute('href') : null;
            const linkView = linkHref ? linkHref.replace(/^#/, '').replace(/^view-/, '') : null;

            if (itemKey === viewId || linkView === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (updateHash && window.location.hash !== `#${viewId}`) {
            if (window.history && window.history.pushState) {
                window.history.pushState(null, '', `#${viewId}`);
            } else {
                window.location.hash = `#${viewId}`;
            }
        }

        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (viewId === 'home') {
            setTimeout(() => {
                try {
                    if (weeklyOrdersChart) { weeklyOrdersChart.resize(); weeklyOrdersChart.update(); }
                    if (reservationsChart) { reservationsChart.resize(); reservationsChart.update(); }
                } catch(e) {}
            }, 60);
        }
    }

    // Global Event Delegation for ALL Sidebar Links, Hash Links, and Triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-view], [data-target], .sidebar-menu li, .sidebar-menu a, .nav-trigger, a[href^="#"]');
        if (!trigger) return;

        let viewId = trigger.getAttribute('data-view') || trigger.getAttribute('data-target');
        if (!viewId) {
            const href = trigger.getAttribute('href') || (trigger.querySelector('a') ? trigger.querySelector('a').getAttribute('href') : null);
            if (href && href.startsWith('#') && href.length > 1) {
                viewId = href.replace(/^#/, '').replace(/^view-/, '');
            }
        }

        if (viewId && document.getElementById(`view-${viewId}`)) {
            e.preventDefault();
            switchView(viewId, true);
        }
    });

    // Handle browser back/forward navigation and manual URL hash changes
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '').replace('view-', '').trim();
        if (hash) {
            switchView(hash, false);
        }
    });

    window.addEventListener('popstate', () => {
        const hash = window.location.hash.replace('#', '').replace('view-', '').trim();
        if (hash) {
            switchView(hash, false);
        }
    });

    // On Initial Page Load: Check URL Hash to restore active view on Refresh (F5)
    function initRouteFromHash() {
        const currentHash = window.location.hash.replace('#', '').replace('view-', '').trim();
        if (currentHash && document.getElementById(`view-${currentHash}`)) {
            switchView(currentHash, false);
        } else {
            // Default to home/dashboard if no hash or invalid hash provided
            switchView('home', false);
        }
    }

    initRouteFromHash();

    /* ==========================================================================
       2. Real Master Date Filter System (Synchronizes Cards, Chart & Leaderboard)
       ========================================================================== */
    const masterData = {
        'today': {
            label: "Aujourd'hui",
            title: "Statistiques des Commandes d'Aujourd'hui",
            kpi: { orders: '142', res: '28', rev: '14 850 DH', ticket: '245 DH' },
            finance: { total: '14 850 DH', card: '8 910 DH', cash: '3 710 DH', delivery: '2 230 DH', margin: '275 DH', fees: '185 DH', net: '22 min' },
            chart: {
                labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
                orders: [5, 12, 28, 35, 14, 18, 22, 8],
                revenue: [450, 1200, 2900, 3700, 1500, 1900, 2400, 800]
            },
            dishes: [
                { name: 'Double Cheeseburger', sales: '42 vendus', rev: '3 570 DH', pct: '92%', class: 'gold-bar' },
                { name: 'Garlic Parmesan Pasta', sales: '38 vendus', rev: '3 230 DH', pct: '84%', class: 'silver-bar' },
                { name: 'Pizza Margherita', sales: '25 vendus', rev: '1 625 DH', pct: '65%', class: 'bronze-bar' },
                { name: 'Crispy Chicken Spicy', sales: '18 vendus', rev: '1 260 DH', pct: '48%', class: 'green-bar' },
                { name: 'Mojito Passion', sales: '14 vendus', rev: '490 DH', pct: '38%', class: 'green-bar' },
                { name: 'Saumon Grillé', sales: '10 vendus', rev: '1 200 DH', pct: '28%', class: 'blue-bar' }
            ]
        },
        'this-week': {
            label: "Cette Semaine",
            title: "Statistiques des Commandes de la Semaine",
            kpi: { orders: '579', res: '89', rev: '48 250 DH', ticket: '255 DH' },
            finance: { total: '48 250 DH', card: '28 950 DH', cash: '12 060 DH', delivery: '7 240 DH', margin: '285 DH', fees: '195 DH', net: '24 min' },
            chart: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                orders: [52, 68, 74, 85, 98, 112, 90],
                revenue: [4300, 5800, 6200, 7100, 8300, 9500, 7050]
            },
            dishes: [
                { name: 'Garlic Parmesan Pasta', sales: '420 vendus', rev: '35 700 DH', pct: '95%', class: 'gold-bar' },
                { name: 'Double Cheeseburger', sales: '380 vendus', rev: '32 300 DH', pct: '82%', class: 'silver-bar' },
                { name: 'Pizza Margherita', sales: '295 vendus', rev: '19 175 DH', pct: '68%', class: 'bronze-bar' },
                { name: 'Crispy Chicken Spicy', sales: '240 vendus', rev: '16 800 DH', pct: '54%', class: 'green-bar' },
                { name: 'Mojito Passion Artisanal', sales: '210 vendus', rev: '7 350 DH', pct: '45%', class: 'green-bar' },
                { name: 'Pavé de Saumon Grillé', sales: '185 vendus', rev: '22 200 DH', pct: '38%', class: 'blue-bar' }
            ]
        },
        'this-month': {
            label: "Ce Mois",
            title: "Statistiques des Commandes du Mois",
            kpi: { orders: '2 324', res: '340', rev: '195 450 DH', ticket: '260 DH' },
            finance: { total: '195 450 DH', card: '117 270 DH', cash: '48 860 DH', delivery: '29 320 DH', margin: '290 DH', fees: '200 DH', net: '25 min' },
            chart: {
                labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
                orders: [495, 579, 610, 640],
                revenue: [41900, 48250, 51200, 54100]
            },
            dishes: [
                { name: 'Garlic Parmesan Pasta', sales: '1 680 vendus', rev: '142 800 DH', pct: '98%', class: 'gold-bar' },
                { name: 'Double Cheeseburger', sales: '1 520 vendus', rev: '129 200 DH', pct: '88%', class: 'silver-bar' },
                { name: 'Pizza Margherita', sales: '1 180 vendus', rev: '76 700 DH', pct: '72%', class: 'bronze-bar' },
                { name: 'Crispy Chicken Spicy', sales: '960 vendus', rev: '67 200 DH', pct: '58%', class: 'green-bar' },
                { name: 'Mojito Passion Artisanal', sales: '840 vendus', rev: '29 400 DH', pct: '48%', class: 'green-bar' },
                { name: 'Pavé de Saumon Grillé', sales: '740 vendus', rev: '88 800 DH', pct: '42%', class: 'blue-bar' }
            ]
        }
    };

    /* ==========================================================================
       2.5 Table Reservations Chart System (Chart.js Bar + Line Combo)
       ========================================================================== */
    const resaCanvas = document.getElementById('reservationsChart');
    const resaMainTitle = document.getElementById('resaMainTitle');

    const resaDataMap = {
        'today': {
            label: "Aujourd'hui",
            title: "Statistiques des Réservations d'Aujourd'hui",
            labels: ['12:00', '14:00', '19:00', '20:00', '21:00', '22:00'],
            tables: [4, 6, 8, 12, 10, 4],
            occupancy: [40, 65, 75, 92, 85, 50]
        },
        'this-week': {
            label: "Cette Semaine",
            title: "Statistiques des Réservations de la Semaine",
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            tables: [12, 18, 22, 28, 35, 42, 38],
            occupancy: [55, 68, 74, 82, 92, 98, 88]
        },
        'this-month': {
            label: "Ce Mois",
            title: "Statistiques des Réservations du Mois",
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
            tables: [85, 92, 105, 118],
            occupancy: [78, 84, 89, 95]
        }
    };

    if (resaCanvas && typeof Chart !== 'undefined') {
        try {
            const resaCtx = resaCanvas.getContext('2d');

            reservationsChart = new Chart(resaCtx, {
                type: 'bar',
                data: {
                    labels: resaDataMap['this-week'].labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Tables Réservées',
                            data: resaDataMap['this-week'].tables,
                            backgroundColor: '#F1A344',
                            borderRadius: 6,
                            borderSkipped: 'bottom',
                            barThickness: 22,
                            maxBarThickness: 26
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1F2A1C',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            padding: 10,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            grid: { display: false },
                            ticks: {
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 12, weight: '500' }
                            }
                        },
                        y: {
                            type: 'linear',
                            grid: { color: '#ECE8DF', drawBorder: false },
                            ticks: {
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 11 }
                            }
                        }
                    }
                }
            });
        } catch(e) {
            console.error('Error initializing reservationsChart', e);
        }
    }

    // Reservation Chart Date Filter Handler
    const resaFilterBtns = document.querySelectorAll('.date-filter-btn[data-resa-range]');
    resaFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resaFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const range = btn.getAttribute('data-resa-range');
            if (resaDataMap[range] && reservationsChart) {
                const data = resaDataMap[range];
                reservationsChart.data.labels = data.labels;
                reservationsChart.data.datasets[0].data = data.tables;
                reservationsChart.update();

                if (resaMainTitle) resaMainTitle.textContent = data.title;
                showToast(`Réservations filtrées : ${data.label}`);
            }
        });
    });

    const resaDateBtn = document.getElementById('resaDateBtn');
    if (resaDateBtn) {
        resaDateBtn.addEventListener('click', openCustomDateModal);
    }

    const ordersCanvas = document.getElementById('weeklyOrdersChart');
    const statsMainTitle = document.getElementById('statsMainTitle');
    const kpiOrders = document.getElementById('kpiOrders');
    const kpiReservations = document.getElementById('kpiReservations');
    const kpiRevenue = document.getElementById('kpiRevenue');
    const kpiAvgTicket = document.getElementById('kpiAvgTicket');
    const leaderboardContainer = document.querySelector('.top-dishes-leaderboard');

    // Initialize Weekly Orders Chart.js
    if (ordersCanvas && typeof Chart !== 'undefined') {
        try {
            const ordersCtx = ordersCanvas.getContext('2d');

            weeklyOrdersChart = new Chart(ordersCtx, {
                type: 'bar',
                data: {
                    labels: masterData['this-week'].chart.labels,
                    datasets: [
                        {
                            type: 'line',
                            label: 'Recettes (DH)',
                            data: masterData['this-week'].chart.revenue,
                            borderColor: '#F1A344',
                            borderWidth: 3,
                            pointRadius: 4.5,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#FFFFFF',
                            pointBorderColor: '#F1A344',
                            pointBorderWidth: 2.5,
                            tension: 0.35,
                            yAxisID: 'y1',
                            order: 1
                        },
                        {
                            type: 'bar',
                            label: 'Commandes',
                            data: masterData['this-week'].chart.orders,
                            backgroundColor: '#557945',
                            borderRadius: 6,
                            borderSkipped: 'bottom',
                            barThickness: 16,
                            maxBarThickness: 18,
                            yAxisID: 'y',
                            order: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'start',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 8,
                                boxHeight: 8,
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 12, weight: '500' },
                                padding: 16
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1F2A1C',
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            padding: 10,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            grid: { display: false },
                            ticks: {
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 12, weight: '500' }
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            grid: { color: '#ECE8DF', drawBorder: false },
                            ticks: {
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 11 },
                                stepSize: 30
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: { display: false },
                            ticks: {
                                color: '#6B7065',
                                font: { family: 'Manrope', size: 11 },
                                callback: function(val) {
                                    return val >= 1000 ? (val / 1000) + 'k' : val;
                                }
                            }
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Error initializing weeklyOrdersChart', e);
        }
    }

    // Function to apply master filter
    function applyMasterDateFilter(filterKey, customFrom = null, customTo = null) {
        let currentData = masterData[filterKey];

        if (!currentData && customFrom && customTo) {
            // Build custom filter payload
            currentData = {
                label: `Du ${customFrom} au ${customTo}`,
                title: `Statistiques des Commandes du ${customFrom} au ${customTo}`,
                kpi: { orders: '382', res: '54', rev: '31 400 DH', ticket: '250 DH' },
                chart: {
                    labels: ['Période 1', 'Période 2', 'Période 3', 'Période 4', 'Période 5'],
                    orders: [68, 85, 92, 74, 63],
                    revenue: [5600, 7100, 7800, 6200, 4700]
                },
                dishes: masterData['this-week'].dishes
            };
        }

        if (!currentData) return;

        // 0. Update Main Chart Section Title
        if (statsMainTitle && currentData.title) {
            statsMainTitle.textContent = currentData.title;
        }

        // 1. Update KPI Stat Cards
        if (kpiOrders) kpiOrders.textContent = currentData.kpi.orders;
        if (kpiReservations) kpiReservations.textContent = currentData.kpi.res;
        if (kpiRevenue) kpiRevenue.textContent = currentData.kpi.rev;
        if (kpiAvgTicket) kpiAvgTicket.textContent = currentData.kpi.ticket;

        // 1.5 Update Financial Accounting Card
        if (currentData.finance) {
            const financeTotal = document.getElementById('financeTotalAmount');
            const payCard = document.getElementById('payCardAmount');
            const payCash = document.getElementById('payCashAmount');
            const payDelivery = document.getElementById('payDeliveryAmount');
            const finMargin = document.getElementById('finMarginVal');
            const finFees = document.getElementById('finFeesVal');
            const finNet = document.getElementById('finNetVal');

            if (financeTotal) financeTotal.textContent = currentData.finance.total;
            if (payCard) payCard.textContent = currentData.finance.card;
            if (payCash) payCash.textContent = currentData.finance.cash;
            if (payDelivery) payDelivery.textContent = currentData.finance.delivery;
            if (finMargin) finMargin.textContent = currentData.finance.margin;
            if (finFees) finFees.textContent = currentData.finance.fees;
            if (finNet) finNet.textContent = currentData.finance.net;
        }

        // 2. Update Chart.js (Orders Chart & Reservations Chart)
        if (weeklyOrdersChart) {
            weeklyOrdersChart.data.labels = currentData.chart.labels;
            weeklyOrdersChart.data.datasets[0].data = currentData.chart.revenue;
            weeklyOrdersChart.data.datasets[1].data = currentData.chart.orders;
            weeklyOrdersChart.update();
        }

        if (reservationsChart && resaDataMap[filterKey]) {
            const rData = resaDataMap[filterKey];
            reservationsChart.data.labels = rData.labels;
            reservationsChart.data.datasets[0].data = rData.tables;
            reservationsChart.update();
            if (resaMainTitle) resaMainTitle.textContent = rData.title;
        }

    // Load Live Calculated Dashboard Performance from Neon Cloud Database
    function loadNeonDashboardMetrics() {
        const apiPath = window.location.pathname.includes('/admin') ? '../api/dashboard.php' : 'api/dashboard.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success') {
                    if (data.kpi) {
                        if (kpiOrders && data.kpi.orders !== undefined) kpiOrders.textContent = data.kpi.orders;
                        if (kpiReservations && data.kpi.reservations !== undefined) kpiReservations.textContent = data.kpi.reservations;
                        if (kpiRevenue && data.kpi.revenue !== undefined) kpiRevenue.textContent = data.kpi.revenue.toLocaleString('fr-FR');
                        if (kpiAvgTicket && data.kpi.avgTicket !== undefined) kpiAvgTicket.textContent = data.kpi.avgTicket;
                    }

                    if (data.chart && weeklyOrdersChart) {
                        weeklyOrdersChart.data.labels = data.chart.labels;
                        weeklyOrdersChart.data.datasets[0].data = data.chart.revenue;
                        weeklyOrdersChart.data.datasets[1].data = data.chart.orders;
                        weeklyOrdersChart.update();
                    }

                    if (data.topDishes && Array.isArray(data.topDishes) && leaderboardContainer) {
                        const items = leaderboardContainer.querySelectorAll('.leaderboard-item');
                        const maxSales = data.topDishes[0] ? data.topDishes[0].count : 1;
                        data.topDishes.forEach((dish, idx) => {
                            if (items[idx]) {
                                const nameEl = items[idx].querySelector('h4');
                                const subEl = items[idx].querySelector('.dish-sub');
                                const progressEl = items[idx].querySelector('.sales-progress');
                                const avatarEl = items[idx].querySelector('.dish-avatar');

                                if (nameEl) nameEl.textContent = dish.title;
                                if (subEl) subEl.textContent = `${dish.count} vendus • ${dish.revenue} DH`;
                                if (avatarEl) avatarEl.textContent = dish.title.charAt(0).toUpperCase();
                                if (progressEl) {
                                    const pct = Math.max(15, Math.min(100, Math.round((dish.count / maxSales) * 100)));
                                    progressEl.style.width = `${pct}%`;
                                }
                            }
                        });
                    }
                }
            })
            .catch(err => console.warn('Failed to load Neon dashboard metrics', err));
    }
    loadNeonDashboardMetrics();

        // 3. Update Leaderboard Items
        if (leaderboardContainer && currentData.dishes) {
            const items = leaderboardContainer.querySelectorAll('.leaderboard-item');
            items.forEach((item, index) => {
                if (currentData.dishes[index]) {
                    const dish = currentData.dishes[index];
                    const nameEl = item.querySelector('h4');
                    const subEl = item.querySelector('.dish-sub');
                    const progressEl = item.querySelector('.sales-progress');

                    if (nameEl) nameEl.textContent = dish.name;
                    if (subEl) subEl.textContent = `${dish.sales} • ${dish.rev}`;
                    if (progressEl) {
                        progressEl.style.width = dish.pct;
                        progressEl.className = `sales-progress ${dish.class}`;
                    }
                }
            });
        }

        // 4. Synchronize Active State across ALL filter buttons
        document.querySelectorAll('.date-filter-btn').forEach(btn => {
            const btnRange = btn.getAttribute('data-kpi-range') || btn.getAttribute('data-range');
            if (btnRange === filterKey || (filterKey === 'custom' && btn.classList.contains('icon-only'))) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 5. Trigger Toast Feedback
        showToast(`Filtre activé : ${currentData.label}`);
    }

    // Attach Listeners to ALL Date Filter Buttons (KPI bar & Chart header bar)
    document.querySelectorAll('.date-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const range = btn.getAttribute('data-kpi-range') || btn.getAttribute('data-range');
            if (range) {
                applyMasterDateFilter(range);
            }
        });
    });

    /* ==========================================================================
       3. Custom Date Range Picker Modal Handler
       ========================================================================== */
    const customDateModal = document.getElementById('customDateModal');
    const closeDateModalBtn = document.getElementById('closeDateModalBtn');
    const cancelDateModalBtn = document.getElementById('cancelDateModalBtn');
    const customDateForm = document.getElementById('customDateForm');
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');

    // Default dates
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    if (dateFromInput && dateToInput) {
        dateFromInput.value = sevenDaysAgo.toISOString().split('T')[0];
        dateToInput.value = today.toISOString().split('T')[0];
    }

    function openCustomDateModal() {
        if (customDateModal) customDateModal.classList.add('active');
    }

    function closeCustomDateModal() {
        if (customDateModal) customDateModal.classList.remove('active');
    }

    // Connect calendar icons
    document.querySelectorAll('#customDateBtn, #kpiDateBtn').forEach(btn => {
        btn.addEventListener('click', openCustomDateModal);
    });

    if (closeDateModalBtn) closeDateModalBtn.addEventListener('click', closeCustomDateModal);
    if (cancelDateModalBtn) cancelDateModalBtn.addEventListener('click', closeCustomDateModal);

    if (customDateModal) {
        customDateModal.addEventListener('click', (e) => {
            if (e.target === customDateModal) closeCustomDateModal();
        });
    }

    // Preset Chips
    document.querySelectorAll('.preset-chip[data-days]').forEach(chip => {
        chip.addEventListener('click', () => {
            const days = parseInt(chip.getAttribute('data-days'), 10);
            const dTo = new Date();
            const dFrom = new Date();
            dFrom.setDate(dTo.getDate() - days);

            if (dateFromInput && dateToInput) {
                dateFromInput.value = dFrom.toISOString().split('T')[0];
                dateToInput.value = dTo.toISOString().split('T')[0];
            }
        });
    });

    // Submit Custom Date Form
    if (customDateForm) {
        customDateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fromVal = dateFromInput.value;
            const toVal = dateToInput.value;

            if (fromVal > toVal) {
                alert('La date de début ne peut pas être supérieure à la date de fin.');
                return;
            }

            closeCustomDateModal();
            const formatFrom = fromVal.split('-').reverse().join('/');
            const formatTo = toVal.split('-').reverse().join('/');

            applyMasterDateFilter('custom', formatFrom, formatTo);
        });
    }

    /* ==========================================================================
       4. Theme Magic Toggle
       ========================================================================== */
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    let isCyberMode = false;

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            isCyberMode = !isCyberMode;
            document.body.classList.toggle('cyber-theme', isCyberMode);
            showToast(isCyberMode ? 'Thème : Cyber Neon ✨' : 'Thème : Dark Obsidian 🌌');
        });
    }



    /* ==========================================================================
       6. New Table Reservation Handler
       ========================================================================== */
    const newReservationBtn = document.getElementById('newReservationBtn');
    if (newReservationBtn) {
        newReservationBtn.addEventListener('click', () => {
            const clientName = prompt('Nom du client pour la réservation :');
            if (clientName && clientName.trim()) {
                showToast(`Réservation enregistrée pour ${clientName.trim()} !`);
            }
        });
    }

    /* ==========================================================================
       7. Dark Toast Notification System
       ========================================================================== */
    const darkToast = document.getElementById('darkToast');
    const darkToastMsg = document.getElementById('darkToastMsg');

    function showToast(message) {
        if (darkToast && darkToastMsg) {
            darkToastMsg.textContent = message;
            darkToast.classList.add('show');
            setTimeout(() => darkToast.classList.remove('show'), 3500);
        }
    }

    /* ==========================================================================
       8. Mobile Drawer Toggle
       ========================================================================== */
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('open');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('active');
        });
    }

    /* ==========================================================================
       9. Real Database Live Order Notifications System (Neon Cloud)
       ========================================================================== */
    const liveNotifPopup = document.getElementById('liveNotifPopup');
    const liveNotifIcon = document.getElementById('liveNotifIcon');
    const liveNotifTitle = document.getElementById('liveNotifTitle');
    const liveNotifTime = document.getElementById('liveNotifTime');
    const liveNotifMsg = document.getElementById('liveNotifMsg');
    const closeLiveNotifBtn = document.getElementById('closeLiveNotifBtn');
    const notifConfirmBtn = document.getElementById('notifConfirmBtn');

    let notifHideTimer = null;
    let knownOrderIds = new Set();
    let currentNotifCmdId = null;

    function showOrderPopup(order) {
        if (!liveNotifPopup) return;

        currentNotifCmdId = order.cmdId || order.id;

        if (liveNotifIcon) {
            liveNotifIcon.className = 'popup-icon-box';
            const iconClass = order.channel === 'sur-place' ? 'fa-utensils' : (order.channel === 'takeaway' ? 'fa-bag-shopping' : 'fa-globe');
            liveNotifIcon.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        }

        if (liveNotifTitle) liveNotifTitle.innerHTML = `<span class="order-dot"></span> NOUVELLE COMMANDE`;
        if (liveNotifTime) liveNotifTime.textContent = order.time || "À l'instant";
        
        const custName = order.customer ? order.customer.name : 'Client Site';
        const summary = order.itemsSummary || (order.items && order.items.length ? order.items.map(i => `${i.quantity||1}x ${i.title}`).join(', ') : 'Articles du restaurant');
        if (liveNotifMsg) {
            liveNotifMsg.innerHTML = `<strong>${custName}</strong> a commandé <em>${summary}</em> (${order.total} DH)`;
        }

        liveNotifPopup.classList.add('active');

        if (notifHideTimer) clearTimeout(notifHideTimer);
        notifHideTimer = setTimeout(() => {
            liveNotifPopup.classList.remove('active');
        }, 7000);
    }

    if (closeLiveNotifBtn) {
        closeLiveNotifBtn.addEventListener('click', () => {
            if (liveNotifPopup) liveNotifPopup.classList.remove('active');
            if (notifHideTimer) clearTimeout(notifHideTimer);
        });
    }

    if (notifConfirmBtn) {
        notifConfirmBtn.addEventListener('click', () => {
            if (currentNotifCmdId) {
                const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
                fetch(apiPath, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cmdId: currentNotifCmdId, status: 'cooking' })
                }).then(() => {
                    const row = document.querySelector(`.order-row[data-order-id="${currentNotifCmdId}"]`);
                    if (row) {
                        row.setAttribute('data-status', 'cooking');
                        const statusCell = row.querySelector('.order-status-badge');
                        if (statusCell) {
                            statusCell.className = 'order-status-badge status-cooking';
                            statusCell.innerHTML = '<i class="fa-solid fa-fire"></i> En Cuisine';
                        }
                    }
                    if (typeof updateOrderKpis === 'function') updateOrderKpis();
                    showToast(`Commande #${currentNotifCmdId} confirmée et envoyée en cuisine ! 🔥`);
                }).catch(err => console.warn('Erreur confirmation commande', err));
            }
            if (liveNotifPopup) liveNotifPopup.classList.remove('active');
            if (notifHideTimer) clearTimeout(notifHideTimer);
        });
    }

    // Check for new incoming orders from Neon DB periodically
    function pollIncomingOrders() {
        const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.orders)) {
                    if (knownOrderIds.size === 0) {
                        // First load: record existing orders without showing notification
                        data.orders.forEach(o => knownOrderIds.add(o.cmdId || o.id));
                    } else {
                        // Detect newly inserted orders
                        const newOrders = data.orders.filter(o => !knownOrderIds.has(o.cmdId || o.id));
                        newOrders.forEach(o => {
                            knownOrderIds.add(o.cmdId || o.id);
                            showOrderPopup(o);
                        });
                    }
                }
            })
            .catch(() => {});
    }

    setTimeout(pollIncomingOrders, 2000);
    setInterval(pollIncomingOrders, 6000);

    /* ==========================================================================
       10. Top-Down Slide KPI Detail Modal Handler
       ========================================================================== */
    const kpiDetailModal = document.getElementById('kpiDetailModal');
    const closeKpiModalBtn = document.getElementById('closeKpiModalBtn');
    const kpiModalTitle = document.getElementById('kpiModalTitle');
    const kpiModalSubtitle = document.getElementById('kpiModalSubtitle');
    const kpiModalIcon = document.getElementById('kpiModalIcon');
    const kpiModalBody = document.getElementById('kpiModalBody');

    const kpiDetailsContentMap = {
        'orders': {
            title: 'Analyse Détaillée des Commandes',
            subtitle: 'Répartition par canal de vente, heures de pointe & performance',
            icon: 'fa-bag-shopping',
            html: `
                <div class="kpi-modal-grid-3">
                    <div class="kpi-modal-stat-box">
                        <span class="title">Sur Place</span>
                        <span class="value">85 (60%)</span>
                        <span class="sub"><i class="fa-solid fa-utensils"></i> Tables Restaurant</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">À Emporter</span>
                        <span class="value">32 (22%)</span>
                        <span class="sub"><i class="fa-solid fa-person-walking"></i> Comptoir & Drive</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Livraison En Ligne</span>
                        <span class="value">25 (18%)</span>
                        <span class="sub"><i class="fa-solid fa-motorcycle"></i> Glovo / Deliveroo</span>
                    </div>
                </div>

                <div class="kpi-modal-list-box">
                    <h4><i class="fa-solid fa-clock text-green"></i> Heures de Pointe des Commandes</h4>
                    <div class="kpi-list-row">
                        <span>12:00 - 14:30 (Service Déjeuner)</span>
                        <strong>62 Commandes • 15 400 DH</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>19:30 - 22:30 (Service Dîner)</span>
                        <strong>68 Commandes • 28 200 DH</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>16:00 - 18:00 (Heure Creuse / Paix)</span>
                        <strong>12 Commandes • 4 650 DH</strong>
                    </div>
                </div>
            `
        },
        'reservations': {
            title: 'Rapport Détaillé des Réservations',
            subtitle: 'Taux d\'occupation par salle, canaux de réservation & statut',
            icon: 'fa-chair',
            html: `
                <div class="kpi-modal-grid-3">
                    <div class="kpi-modal-stat-box">
                        <span class="title">Terrasse Panoramique</span>
                        <span class="value">10 / 12</span>
                        <span class="sub"><i class="fa-solid fa-sun"></i> 83% Occupé</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Grande Salle Climatise</span>
                        <span class="value">12 / 15</span>
                        <span class="sub"><i class="fa-solid fa-couch"></i> 80% Occupé</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Salon VIP Privé</span>
                        <span class="value">6 / 6</span>
                        <span class="sub"><i class="fa-solid fa-crown text-gold"></i> 100% Complet</span>
                    </div>
                </div>

                <div class="kpi-modal-list-box">
                    <h4><i class="fa-solid fa-diagram-project text-green"></i> Canaux d'Origine des Réservations</h4>
                    <div class="kpi-list-row">
                        <span>Application & Site Web Flavorist</span>
                        <strong>65% des réservations (18 tables)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Appel Téléphonique Direct</span>
                        <strong>25% des réservations (7 tables)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Réservation en direct sur place (Walk-in)</span>
                        <strong>10% des réservations (3 tables)</strong>
                    </div>
                </div>
            `
        },
        'revenue': {
            title: 'Analyse du Chiffre d\'Affaires & Marge',
            subtitle: 'Ventes globales, répartition des bénéfices et méthode de paiement',
            icon: 'fa-vault',
            html: `
                <div class="kpi-modal-grid-3">
                    <div class="kpi-modal-stat-box">
                        <span class="title">Revenu Moyen / Heure</span>
                        <span class="value">4 800 DH</span>
                        <span class="sub"><i class="fa-solid fa-arrow-trend-up"></i> Peak à 21h00</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Taux de Marge Brute</span>
                        <span class="value">68.5%</span>
                        <span class="sub"><i class="fa-solid fa-check"></i> +3.2% vs Mois Dernier</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Objectif du Mois</span>
                        <span class="value">112.5%</span>
                        <span class="sub"><i class="fa-solid fa-trophy text-gold"></i> Objectif Dépassé</span>
                    </div>
                </div>

                <div class="kpi-modal-list-box">
                    <h4><i class="fa-solid fa-chart-pie text-green"></i> Ventillation des Recettes par Catégorie</h4>
                    <div class="kpi-list-row">
                        <span>Ventes Plats Principal & Pastas</span>
                        <strong>35 200 DH (73%)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Boissons Artisanal & Cocktails</span>
                        <strong>7 850 DH (16%)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Desserts & Gourmandises</span>
                        <strong>5 200 DH (11%)</strong>
                    </div>
                </div>
            `
        },
        'avgTicket': {
            title: 'Analyse du Panier Moyen & Habitudes Clients',
            subtitle: 'Dépense moyenne par table, panier moyen et upsells populaires',
            icon: 'fa-receipt',
            html: `
                <div class="kpi-modal-grid-3">
                    <div class="kpi-modal-stat-box">
                        <span class="title">Panier / Table</span>
                        <span class="value">245 DH</span>
                        <span class="sub"><i class="fa-solid fa-users"></i> ~3.2 Couverts / table</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Panier / Couvert</span>
                        <span class="value">76.5 DH</span>
                        <span class="sub"><i class="fa-solid fa-user"></i> Dépense par personne</span>
                    </div>
                    <div class="kpi-modal-stat-box">
                        <span class="title">Temps Moyen / Table</span>
                        <span class="value">48 min</span>
                        <span class="sub"><i class="fa-solid fa-stopwatch"></i> Rotation Rapide</span>
                    </div>
                </div>

                <div class="kpi-modal-list-box">
                    <h4><i class="fa-solid fa-fire text-green"></i> Ventes Complémentaires (Upselling Tops)</h4>
                    <div class="kpi-list-row">
                        <span>Ajout Boisson Passion Artisanal</span>
                        <strong>+45 DH / commande (68% conversion)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Dessert Gourmand (Tiramisu / Fondant)</span>
                        <strong>+38 DH / commande (42% conversion)</strong>
                    </div>
                    <div class="kpi-list-row">
                        <span>Sauces Truffe & Garlic Extras</span>
                        <strong>+15 DH / commande (85% conversion)</strong>
                    </div>
                </div>
            `
        }
    };

    function openKpiDetailModal(kpiType) {
        if (!kpiDetailModal || !kpiDetailsContentMap[kpiType]) return;

        const data = kpiDetailsContentMap[kpiType];
        if (kpiModalTitle) kpiModalTitle.textContent = data.title;
        if (kpiModalSubtitle) kpiModalSubtitle.textContent = data.subtitle;
        if (kpiModalIcon) kpiModalIcon.innerHTML = `<i class="fa-solid ${data.icon}"></i>`;
        if (kpiModalBody) kpiModalBody.innerHTML = data.html;

        kpiDetailModal.classList.add('active');
    }

    function closeKpiDetailModal() {
        if (kpiDetailModal) kpiDetailModal.classList.remove('active');
    }

    // Attach Click Event to all KPI cards and their eye buttons
    document.querySelectorAll('.stat-card[data-kpi-type], .kpi-info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.getAttribute('data-kpi-type') || btn.getAttribute('data-kpi');
            if (type) openKpiDetailModal(type);
        });
    });

    if (closeKpiModalBtn) closeKpiModalBtn.addEventListener('click', closeKpiDetailModal);
    if (kpiDetailModal) {
        kpiDetailModal.addEventListener('click', (e) => {
            if (e.target === kpiDetailModal) closeKpiDetailModal();
        });
    }

    /* ==========================================================================
       11. Recipes Catalogue CRUD & Category Filter System
       ========================================================================== */
    const recipesGridContainer = document.getElementById('recipesGridContainer');
    const catPillBtns = document.querySelectorAll('.cat-pill-btn');
    const recipeSearchInput = document.getElementById('recipeSearchInput');
    const addNewDishBtn = document.getElementById('addNewDishBtn');
    const dishFormModal = document.getElementById('dishFormModal');
    const closeDishFormModalBtn = document.getElementById('closeDishFormModalBtn');
    const cancelDishFormBtn = document.getElementById('cancelDishFormBtn');
    const dishCrudForm = document.getElementById('dishCrudForm');
    const dishModalFormTitle = document.getElementById('dishModalFormTitle');

    const dishEditId = document.getElementById('dishEditId');
    const dishNameInput = document.getElementById('dishNameInput');
    const dishCategoryInput = document.getElementById('dishCategoryInput');
    const dishPriceInput = document.getElementById('dishPriceInput');
    const dishTimeInput = document.getElementById('dishTimeInput');
    const dishImageInput = document.getElementById('dishImageInput');
    const dishDescInput = document.getElementById('dishDescInput');
    const dishLivePreviewImg = document.getElementById('dishLivePreviewImg');
    const imgPresetBtns = document.querySelectorAll('.img-preset-btn');

    let nextDishId = 100;
    let activeCategory = 'all';

    const catIconsMap = {
        'pastas': { icon: '🍝', name: 'Pastas & Pâtes' },
        'burgers': { icon: '🍔', name: 'Burgers Gourmet' },
        'pizzas': { icon: '🍕', name: 'Pizzas Italiennes' },
        'grillades': { icon: '🥩', name: 'Grillades & Viandes' },
        'salades': { icon: '🥗', name: 'Salades Fraîches' },
        'boissons': { icon: '🍹', name: 'Boissons & Cocktails' },
        'desserts': { icon: '🍰', name: 'Desserts Gourmands' }
    };

    function updateDishLivePreviewBadge() {
        const badgeIcon = document.getElementById('dishLivePreviewBadgeIcon');
        const badgeTitle = document.getElementById('dishLivePreviewBadgeTitle');
        const selectedCat = dishCategoryInput ? dishCategoryInput.value : 'pastas';
        const info = catIconsMap[selectedCat] || { icon: '🍽️', name: 'Plat Gourmet' };

        if (badgeIcon) badgeIcon.textContent = info.icon;
        if (badgeTitle) badgeTitle.textContent = info.name;
    }

    // Live Photo Preview & Quick Preset Click Listeners (Category & Photo Sync)
    imgPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            imgPresetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const url = btn.getAttribute('data-url');
            const cat = btn.getAttribute('data-cat');

            if (dishImageInput) dishImageInput.value = url;
            if (dishLivePreviewImg) dishLivePreviewImg.src = url;
            if (cat && dishCategoryInput) dishCategoryInput.value = cat;
            updateDishLivePreviewBadge();
        });
    });

    if (dishCategoryInput) {
        dishCategoryInput.addEventListener('change', () => {
            const selectedCat = dishCategoryInput.value;
            imgPresetBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-cat') === selectedCat);
            });
            updateDishLivePreviewBadge();
        });
    }

    const dishFileInput = document.getElementById('dishFileInput');
    if (dishFileInput) {
        dishFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    if (dishImageInput) dishImageInput.value = dataUrl;
                    if (dishLivePreviewImg) dishLivePreviewImg.src = dataUrl;
                    const fileNameDisplay = document.getElementById('dishFileNameDisplay');
                    if (fileNameDisplay) fileNameDisplay.textContent = file.name;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (dishImageInput) {
        dishImageInput.addEventListener('input', () => {
            const url = dishImageInput.value.trim();
            if (dishLivePreviewImg) {
                dishLivePreviewImg.src = url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
            }
        });
    }

    // 1. Category Pill Filter Logic
    catPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catPillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeCategory = btn.getAttribute('data-cat');
            filterDishes();
        });
    });

    // 2. Real-time Search Input Filtering
    if (recipeSearchInput) {
        recipeSearchInput.addEventListener('input', () => {
            filterDishes();
        });
    }

    function filterDishes() {
        const query = recipeSearchInput ? recipeSearchInput.value.toLowerCase().trim() : '';
        const dishCards = document.querySelectorAll('.recipe-card-full');

        dishCards.forEach(card => {
            const cat = card.getAttribute('data-category');
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();

            const matchesCategory = (activeCategory === 'all' || cat === activeCategory);
            const matchesSearch = (!query || title.includes(query) || desc.includes(query));

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Custom Dish Options UI Helpers
    const dishOptionsContainer = document.getElementById('dishOptionsContainer');
    const addOptionRowBtn = document.getElementById('addOptionRowBtn');
    const addQuickSauceBtn = document.getElementById('addQuickSauceBtn');
    const addQuickCuissonBtn = document.getElementById('addQuickCuissonBtn');

    function createOptionRow(optName = '', optValuesStr = '') {
        const div = document.createElement('div');
        div.className = 'option-row-item d-flex align-items-center gap-2 mb-2 p-2 rounded';
        div.style.background = 'rgba(0,0,0,0.25)';
        div.style.border = '1px solid rgba(255,255,255,0.1)';
        div.innerHTML = `
            <input type="text" class="form-control form-control-sm opt-name-input" placeholder="Attribut (Ex: Sauce)" value="${optName}" style="max-width: 130px; background: rgba(0,0,0,0.4); color: #fff; border-color: rgba(255,255,255,0.15);">
            <input type="text" class="form-control form-control-sm opt-values-input flex-grow-1" placeholder="Options (Ex: Piquante 🌶️, Douce 🍯, Mix 🔥)" value="${optValuesStr}" style="background: rgba(0,0,0,0.4); color: #fff; border-color: rgba(255,255,255,0.15);">
            <button type="button" class="btn btn-sm btn-outline-danger remove-opt-btn" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
        `;
        div.querySelector('.remove-opt-btn').addEventListener('click', () => div.remove());
        return div;
    }

    if (addOptionRowBtn) {
        addOptionRowBtn.addEventListener('click', () => {
            if (dishOptionsContainer) dishOptionsContainer.appendChild(createOptionRow());
        });
    }

    if (addQuickSauceBtn) {
        addQuickSauceBtn.addEventListener('click', () => {
            if (dishOptionsContainer) dishOptionsContainer.appendChild(createOptionRow('Sauce', 'Piquante 🌶️, Douce 🍯, Mix 🔥'));
        });
    }

    if (addQuickCuissonBtn) {
        addQuickCuissonBtn.addEventListener('click', () => {
            if (dishOptionsContainer) dishOptionsContainer.appendChild(createOptionRow('Cuisson', 'À point, Bien cuit, Saignant'));
        });
    }

    // 3. Open Add Dish Modal
    function openAddDishModal() {
        if (!dishFormModal) return;
        if (dishModalFormTitle) dishModalFormTitle.innerHTML = '<i class="fa-solid fa-utensils text-green"></i> Ajouter un Nouveau Plat';
        if (dishEditId) dishEditId.value = '';
        if (dishCrudForm) dishCrudForm.reset();
        if (dishOptionsContainer) dishOptionsContainer.innerHTML = '';
        const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
        if (dishImageInput) dishImageInput.value = defaultImg;
        if (dishLivePreviewImg) dishLivePreviewImg.src = defaultImg;
        updateDishLivePreviewBadge();
        dishFormModal.classList.add('active');
    }

    function closeDishModal() {
        if (dishFormModal) dishFormModal.classList.remove('active');
    }

    if (addNewDishBtn) addNewDishBtn.addEventListener('click', openAddDishModal);
    if (closeDishFormModalBtn) closeDishFormModalBtn.addEventListener('click', closeDishModal);
    if (cancelDishFormBtn) cancelDishFormBtn.addEventListener('click', closeDishModal);

    if (dishFormModal) {
        dishFormModal.addEventListener('click', (e) => {
            if (e.target === dishFormModal) closeDishModal();
        });
    }

    // 4. Attach Edit and Delete Listeners (Delegated)
    if (recipesGridContainer) {
        recipesGridContainer.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-dish-btn');
            const deleteBtn = e.target.closest('.delete-dish-btn');

            if (editBtn) {
                const card = editBtn.closest('.recipe-card-full');
                if (card) openEditDishModal(card);
                return;
            } else if (deleteBtn) {
                const card = deleteBtn.closest('.recipe-card-full');
                if (card) deleteDishCard(card);
                return;
            }

            const img = e.target.closest('.recipe-card-img-wrapper img');
            if (img) {
                const card = img.closest('.recipe-card-full');
                if (card && window.FOORES_CART && window.FOORES_CART.openImageLightbox) {
                    const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Plat';
                    const desc = card.querySelector('p') ? card.querySelector('p').textContent : '';
                    const badge = card.querySelector('.cat-badge') ? card.querySelector('.cat-badge').textContent : '';
                    const price = card.querySelector('.card-footer-meta strong') ? card.querySelector('.card-footer-meta strong').textContent : '';
                    window.FOORES_CART.openImageLightbox(img.src, title, badge, price, desc, card.getAttribute('data-dish-id'));
                }
            }
        });
    }

    // 5. Open Edit Dish Modal
    function openEditDishModal(card) {
        const dishId = card.getAttribute('data-dish-id');
        const category = card.getAttribute('data-category') || 'pastas';
        const name = card.querySelector('h3').textContent;
        const desc = card.querySelector('p').textContent;
        const imgUrl = card.querySelector('img').src;
        
        const priceText = card.querySelector('.card-footer-meta strong').textContent.replace(' DH', '').trim();
        const timeText = card.querySelector('.card-footer-meta span').textContent.replace(' min', '').trim();

        if (dishModalFormTitle) dishModalFormTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-green"></i> Modifier le Plat';
        if (dishEditId) dishEditId.value = dishId;
        if (dishNameInput) dishNameInput.value = name;
        if (dishCategoryInput) dishCategoryInput.value = category;
        if (dishPriceInput) dishPriceInput.value = priceText;
        if (dishTimeInput) dishTimeInput.value = timeText;
        if (dishImageInput) dishImageInput.value = imgUrl;
        if (dishDescInput) dishDescInput.value = desc;
        if (dishLivePreviewImg) dishLivePreviewImg.src = imgUrl;

        if (dishOptionsContainer) {
            dishOptionsContainer.innerHTML = '';
            let options = [];
            try {
                if (card.dataset.options) options = JSON.parse(card.dataset.options);
            } catch(e) {}
            if (Array.isArray(options) && options.length > 0) {
                options.forEach(opt => {
                    const vals = Array.isArray(opt.values) ? opt.values.join(', ') : (opt.values || '');
                    dishOptionsContainer.appendChild(createOptionRow(opt.name || '', vals));
                });
            }
        }

        imgPresetBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
        });

        updateDishLivePreviewBadge();
        if (dishFormModal) dishFormModal.classList.add('active');
    }

    // 6. Delete Dish Card with Confirmation
    function deleteDishCard(card) {
        const title = card.querySelector('h3').textContent;
        const dishId = card.getAttribute('data-dish-id');
        if (confirm(`Voulez-vous vraiment supprimer "${title}" de la carte ?`)) {
            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                if (dishId) {
                    const apiPath = window.location.pathname.includes('/admin') ? '../api/dishes.php' : 'api/dishes.php';
                    fetch(apiPath + '?id=' + encodeURIComponent(dishId), { method: 'DELETE' })
                        .then(() => {
                            try { localStorage.setItem('foores_custom_menu_updated', Date.now()); } catch(e){}
                        })
                        .catch(err => {});
                }
                saveDishesToLocalStorage();
                showToast(`Le plat "${title}" a été supprimé !`);
            }, 400);
        }
    }

    // 7. Handle Dish Form Submit (Create & Update)
    if (dishCrudForm) {
        dishCrudForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEdit = !!dishEditId.value;
            const targetDishId = isEdit ? dishEditId.value : ('dish_' + Date.now());
            const name = dishNameInput.value.trim();
            const category = dishCategoryInput.value;
            const price = dishPriceInput.value;
            const time = dishTimeInput.value;
            const imgUrl = dishImageInput.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
            const desc = dishDescInput.value.trim();

            // Extract Custom Options
            const optionRows = dishOptionsContainer ? dishOptionsContainer.querySelectorAll('.option-row-item') : [];
            const dishOptions = [];
            optionRows.forEach(row => {
                const optName = row.querySelector('.opt-name-input') ? row.querySelector('.opt-name-input').value.trim() : '';
                const valsStr = row.querySelector('.opt-values-input') ? row.querySelector('.opt-values-input').value.trim() : '';
                if (optName && valsStr) {
                    const vals = valsStr.split(',').map(v => v.trim()).filter(v => v.length > 0);
                    if (vals.length > 0) {
                        dishOptions.push({ name: optName, values: vals });
                    }
                }
            });

            const catLabelMap = {
                'pastas': '🍝 Pastas',
                'burgers': '🍔 Burgers',
                'pizzas': '🍕 Pizzas',
                'grillades': '🥩 Grillades',
                'salades': '🥗 Salades',
                'boissons': '🍹 Boissons',
                'desserts': '🍰 Desserts'
            };

            const catBadgeText = catLabelMap[category] || category;

            if (isEdit) {
                // Update Existing Card
                const card = document.querySelector(`.recipe-card-full[data-dish-id="${dishEditId.value}"]`);
                if (card) {
                    card.setAttribute('data-category', category);
                    card.dataset.options = JSON.stringify(dishOptions);
                    card.querySelector('img').src = imgUrl;
                    card.querySelector('img').alt = name;
                    card.querySelector('.cat-badge').textContent = catBadgeText;
                    card.querySelector('h3').textContent = name;
                    card.querySelector('p').textContent = desc;
                    card.querySelector('.card-footer-meta span').innerHTML = `<i class="fa-regular fa-clock"></i> ${time} min`;
                    card.querySelector('.card-footer-meta strong').textContent = `${price} DH`;

                    showToast(`Le plat "${name}" a été mis à jour avec succès !`);
                }
            } else {
                // Create New Dish Card
                nextDishId++;
                const newCard = document.createElement('div');
                newCard.className = 'recipe-card-full';
                newCard.setAttribute('data-category', category);
                newCard.setAttribute('data-dish-id', targetDishId);
                newCard.dataset.options = JSON.stringify(dishOptions);

                newCard.innerHTML = `
                    <div class="recipe-card-img-wrapper">
                        <img src="${imgUrl}" alt="${name}">
                        <div class="card-action-bar">
                            <button class="dish-action-btn edit-dish-btn" data-id="${targetDishId}" title="Modifier le plat"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="dish-action-btn delete-btn delete-dish-btn" data-id="${targetDishId}" title="Supprimer le plat"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                    <div class="card-info">
                        <span class="cat-badge">${catBadgeText}</span>
                        <h3>${name}</h3>
                        <p>${desc}</p>
                        <div class="card-footer-meta">
                            <span><i class="fa-regular fa-clock"></i> ${time} min</span>
                            <span>★ 5.0 (Nouveau)</span>
                            <strong>${price} DH</strong>
                        </div>
                    </div>
                `;

                recipesGridContainer.prepend(newCard);
                showToast(`Nouveau plat "${name}" ajouté à la carte !`);
            }

            // Immediately POST single modified dish to MySQL API
            const singleDishPayload = {
                id: targetDishId,
                title: name,
                category: category,
                description: desc,
                price: parseFloat(price) || 0,
                image: imgUrl,
                options: dishOptions
            };
            const apiPath = window.location.pathname.includes('/admin') ? '../api/dishes.php' : 'api/dishes.php';
            fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(singleDishPayload)
            }).then(() => {
                try { localStorage.setItem('foores_custom_menu_updated', Date.now()); } catch(e){}
            }).catch(e => {});

            closeDishModal();
            saveDishesToLocalStorage();
            filterDishes();
        });
    }

    /* ==========================================================================
       RECIPES / DISHES MASTER LOCALSTORAGE SYNC SYSTEM
       ========================================================================== */
    function saveDishesToLocalStorage() {
        const cards = document.querySelectorAll('#recipesGridContainer .recipe-card-full');
        const dishes = [];

        cards.forEach((card, index) => {
            const id = card.getAttribute('data-dish-id') || ('dish_' + (index + 1));
            const category = card.getAttribute('data-category') || 'burgers';
            const img = card.querySelector('img') ? card.querySelector('img').src : 'img/menu_items/1.jpg';
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'Plat';
            const desc = card.querySelector('p') ? card.querySelector('p').textContent.trim() : '';
            const priceText = card.querySelector('.card-footer-meta strong, strong') ? card.querySelector('.card-footer-meta strong, strong').textContent : '100 DH';
            const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 100;

            let options = [];
            try {
                if (card.dataset.options) options = JSON.parse(card.dataset.options);
            } catch(e) {}

            dishes.push({
                id: id,
                title: title,
                category: category,
                description: desc,
                price: price,
                image: img,
                options: options
            });
        });

        dishes.forEach(dish => {
            fetch('../api/dishes.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dish)
            }).catch(e => {});
        });

        updateCategoryCounts(dishes);
    }

    function updateCategoryCounts(dishesList) {
        let dishesToCount = dishesList;
        if (!dishesToCount || dishesToCount.length === 0) {
            dishesToCount = window.REAL_MYSQL_DISHES || [];
        }

        const categoryCounts = {};
        dishesToCount.forEach(dish => {
            const cat = dish.category ? dish.category.toLowerCase() : '';
            if (cat) {
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            }
        });

        const catCards = document.querySelectorAll('.cat-card-large');
        catCards.forEach(card => {
            const catKey = card.getAttribute('data-category');
            const countSpan = card.querySelector('.cat-count-badge') || card.querySelector('.cat-overlay span:last-child');
            if (countSpan && catKey) {
                const count = categoryCounts[catKey] || 0;
                countSpan.textContent = `${count} ${count === 1 ? 'Plat Disponible' : 'Plats Disponibles'}`;
            }
        });

        const allCount = dishesToCount.length;
        const allPill = document.querySelector('.cat-pill-btn[data-cat="all"]');
        if (allPill) allPill.textContent = `Tous (${allCount})`;

        const pillMap = {
            'pastas': '🍝 Pastas',
            'burgers': '🍔 Burgers',
            'pizzas': '🍕 Pizzas',
            'grillades': '🥩 Grillades',
            'salades': '🥗 Salades',
            'boissons': '🍹 Boissons',
            'desserts': '🍰 Desserts'
        };

        Object.keys(pillMap).forEach(catKey => {
            const pillBtn = document.querySelector(`.cat-pill-btn[data-cat="${catKey}"]`);
            if (pillBtn) {
                const count = categoryCounts[catKey] || 0;
                pillBtn.textContent = `${pillMap[catKey]} (${count})`;
            }
        });
    }

    function renderDishesInAdminGrid(savedDishes) {
        const recipesGridContainer = document.getElementById('recipesGridContainer');
        if (!recipesGridContainer) return;
        recipesGridContainer.innerHTML = '';
        const catLabelMap = {
            'pastas': '🍝 Pâtes',
            'burgers': '🍔 Burgers',
            'pizzas': '🍕 Pizzas',
            'grillades': '🥩 Grillades',
            'salades': '🥗 Salades',
            'boissons': '🍹 Boissons',
            'desserts': '🍰 Desserts'
        };

        savedDishes.forEach(dish => {
            const catBadgeText = catLabelMap[dish.category] || dish.category;
            const card = document.createElement('div');
            card.className = 'recipe-card-full';
            card.setAttribute('data-category', dish.category);
            card.setAttribute('data-dish-id', dish.id);
            if (dish.options && dish.options.length > 0) {
                card.dataset.options = JSON.stringify(dish.options);
            }

            card.innerHTML = `
                <div class="recipe-card-img-wrapper">
                    <img src="${dish.image}" alt="${dish.title}">
                    <div class="card-action-bar">
                        <button class="dish-action-btn edit-dish-btn" data-id="${dish.id}" title="Modifier le plat"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="dish-action-btn delete-btn delete-dish-btn" data-id="${dish.id}" title="Supprimer le plat"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
                <div class="card-info">
                    <span class="cat-badge">${catBadgeText}</span>
                    <h3>${dish.title}</h3>
                    <p>${dish.description}</p>
                    <div class="card-footer-meta">
                        <span><i class="fa-regular fa-clock"></i> 20 min</span>
                        <span>★ 5.0</span>
                        <strong>${dish.price} DH</strong>
                    </div>
                </div>
            `;
            recipesGridContainer.appendChild(card);
        });

        updateCategoryCounts(savedDishes);
    }

    function loadDishesFromLocalStorage() {
        const recipesGridContainer = document.getElementById('recipesGridContainer');
        if (!recipesGridContainer) return;

        const apiPath = window.location.pathname.includes('/admin') ? '../api/dishes.php' : 'api/dishes.php';

        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.dishes) && data.dishes.length > 0) {
                    renderDishesInAdminGrid(data.dishes);
                } else if (window.REAL_MYSQL_DISHES) {
                    renderDishesInAdminGrid(window.REAL_MYSQL_DISHES);
                }
            })
            .catch(err => {
                if (window.REAL_MYSQL_DISHES) {
                    renderDishesInAdminGrid(window.REAL_MYSQL_DISHES);
                }
            });
    }

    loadDishesFromLocalStorage();

    /* ==========================================================================
       12. Categories Management System (Search, Add, Edit, Delete)
       ========================================================================== */
    const categoriesGridContainer = document.getElementById('categoriesGridContainer');
    const categorySearchInput = document.getElementById('categorySearchInput');
    const addNewCategoryBtn = document.getElementById('addNewCategoryBtn');
    const categoryFormModal = document.getElementById('categoryFormModal');
    const closeCatFormModalBtn = document.getElementById('closeCatFormModalBtn');
    const cancelCatFormBtn = document.getElementById('cancelCatFormBtn');
    const categoryCrudForm = document.getElementById('categoryCrudForm');
    const catModalFormTitle = document.getElementById('catModalFormTitle');

    const categoryEditId = document.getElementById('categoryEditId');
    const categoryTitleInput = document.getElementById('categoryTitleInput');
    const categoryIconInput = document.getElementById('categoryIconInput');
    const categorySubtitleInput = document.getElementById('categorySubtitleInput');
    const categoryImageInput = document.getElementById('categoryImageInput');
    const catLivePreviewImg = document.getElementById('catLivePreviewImg');
    const catImgPresetBtns = document.querySelectorAll('.cat-img-preset-btn');

    let nextCatId = 50;

    // 1. Real-time Search Filtering for Categories
    if (categorySearchInput) {
        categorySearchInput.addEventListener('input', () => {
            const query = categorySearchInput.value.toLowerCase().trim();
            const catCards = document.querySelectorAll('.cat-card-large');

            catCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const countSpan = card.querySelector('.cat-count-badge') || card.querySelector('.cat-overlay span:last-child');
                const sub = countSpan ? countSpan.textContent.toLowerCase() : '';
                if (!query || title.includes(query) || sub.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    function updateCatLivePreviewBadge() {
        const badgeIcon = document.getElementById('catLivePreviewBadgeIcon');
        const badgeTitle = document.getElementById('catLivePreviewBadgeTitle');

        if (badgeIcon && categoryIconInput) {
            badgeIcon.textContent = categoryIconInput.value.trim() || '🍽️';
        }
        if (badgeTitle && categoryTitleInput) {
            badgeTitle.textContent = categoryTitleInput.value.trim() || 'Nouvelle Catégorie';
        }
    }

    if (categoryTitleInput) categoryTitleInput.addEventListener('input', updateCatLivePreviewBadge);
    if (categoryIconInput) categoryIconInput.addEventListener('input', updateCatLivePreviewBadge);

    // 2. Preset Category Image & Icon Buttons
    catImgPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catImgPresetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const url = btn.getAttribute('data-url');
            const icon = btn.getAttribute('data-icon');
            const title = btn.getAttribute('data-title');

            if (categoryImageInput) categoryImageInput.value = url;
            if (categoryIconInput) categoryIconInput.value = icon;
            if (title && categoryTitleInput) categoryTitleInput.value = title;
            if (catLivePreviewImg) catLivePreviewImg.src = url;
            updateCatLivePreviewBadge();
        });
    });

    const categoryFileInput = document.getElementById('categoryFileInput');
    if (categoryFileInput) {
        categoryFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    if (categoryImageInput) categoryImageInput.value = dataUrl;
                    if (catLivePreviewImg) catLivePreviewImg.src = dataUrl;
                    const fileNameDisplay = document.getElementById('categoryFileNameDisplay');
                    if (fileNameDisplay) fileNameDisplay.textContent = file.name;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (categoryImageInput) {
        categoryImageInput.addEventListener('input', () => {
            const url = categoryImageInput.value.trim();
            if (catLivePreviewImg) {
                catLivePreviewImg.src = url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
            }
        });
    }

    // 3. Open Add Category Modal
    function openAddCategoryModal() {
        if (!categoryFormModal) return;
        if (catModalFormTitle) catModalFormTitle.innerHTML = '<i class="fa-solid fa-layer-group text-green"></i> Ajouter une Nouvelle Catégorie';
        if (categoryEditId) categoryEditId.value = '';
        if (categoryCrudForm) categoryCrudForm.reset();
        const defaultImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
        if (categoryImageInput) categoryImageInput.value = defaultImg;
        if (categoryTitleInput) categoryTitleInput.value = '';
        if (categoryIconInput) categoryIconInput.value = '🍽️';
        if (categorySubtitleInput) categorySubtitleInput.value = '100 Recettes Curées';
        if (catLivePreviewImg) catLivePreviewImg.src = defaultImg;
        updateCatLivePreviewBadge();
        categoryFormModal.classList.add('active');
    }

    function closeCategoryModal() {
        if (categoryFormModal) categoryFormModal.classList.remove('active');
    }

    if (addNewCategoryBtn) addNewCategoryBtn.addEventListener('click', openAddCategoryModal);
    if (closeCatFormModalBtn) closeCatFormModalBtn.addEventListener('click', closeCategoryModal);
    if (cancelCatFormBtn) cancelCatFormBtn.addEventListener('click', closeCategoryModal);

    if (categoryFormModal) {
        categoryFormModal.addEventListener('click', (e) => {
            if (e.target === categoryFormModal) closeCategoryModal();
        });
    }

    // 4. Delegated Edit, Delete and View Filtering Event Handling for Category Cards
    if (categoriesGridContainer) {
        categoriesGridContainer.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-cat-btn');
            const deleteBtn = e.target.closest('.delete-cat-btn');

            if (editBtn) {
                const card = editBtn.closest('.cat-card-large');
                if (card) openEditCategoryModal(card);
                return;
            } 
            
            if (deleteBtn) {
                const card = deleteBtn.closest('.cat-card-large');
                if (card) deleteCategoryCard(card);
                return;
            }

            // Click on Category Card body -> switch to recipes view & activate category filter
            const card = e.target.closest('.cat-card-large');
            if (card) {
                const catKey = card.getAttribute('data-category');
                if (catKey) {
                    switchView('recipes', true);
                    const pillBtn = document.querySelector(`.cat-pill-btn[data-cat="${catKey}"]`);
                    if (pillBtn) {
                        pillBtn.click();
                    }
                }
            }
        });
    }

    // 5. Open Edit Category Modal
    function openEditCategoryModal(card) {
        const catId = card.getAttribute('data-cat-id');
        const title = card.querySelector('h3').textContent;
        const icon = card.querySelector('.cat-icon-badge') ? card.querySelector('.cat-icon-badge').textContent.trim() : '🍽️';
        const countSpan = card.querySelector('.cat-count-badge') || card.querySelector('.cat-overlay span:last-child');
        const sub = countSpan ? countSpan.textContent : '';
        const imgUrl = card.querySelector('img').src;

        if (catModalFormTitle) catModalFormTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-green"></i> Modifier la Catégorie';
        if (categoryEditId) categoryEditId.value = catId;
        if (categoryTitleInput) categoryTitleInput.value = title;
        if (categoryIconInput) categoryIconInput.value = icon;
        if (categorySubtitleInput) categorySubtitleInput.value = sub;
        if (categoryImageInput) categoryImageInput.value = imgUrl;
        if (catLivePreviewImg) catLivePreviewImg.src = imgUrl;

        updateCatLivePreviewBadge();
        if (categoryFormModal) categoryFormModal.classList.add('active');
    }

    // 6. Delete Category Card
    function deleteCategoryCard(card) {
        const title = card.querySelector('h3').textContent;
        if (confirm(`Voulez-vous vraiment supprimer la catégorie "${title}" ?`)) {
            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                showToast(`La catégorie "${title}" a été supprimée !`);
            }, 400);
        }
    }

    // 7. Category Form Submit Handler (Create & Update)
    if (categoryCrudForm) {
        categoryCrudForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEdit = !!categoryEditId.value;
            const title = categoryTitleInput.value.trim();
            const icon = categoryIconInput.value.trim() || '🍽️';
            const sub = categorySubtitleInput.value.trim();
            const imgUrl = categoryImageInput.value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

            if (isEdit) {
                // Update Existing Category Card
                const card = document.querySelector(`.cat-card-large[data-cat-id="${categoryEditId.value}"]`);
                if (card) {
                    card.querySelector('img').src = imgUrl;
                    card.querySelector('img').alt = title;
                    if (card.querySelector('.cat-icon-badge')) {
                        card.querySelector('.cat-icon-badge').textContent = icon;
                    }
                    card.querySelector('h3').textContent = title;
                    const countEl = card.querySelector('.cat-count-badge') || card.querySelector('.cat-overlay span:last-child');
                    if (countEl) countEl.textContent = sub;

                    showToast(`La catégorie "${title}" a été mise à jour !`);
                }
            } else {
                // Create New Category Card
                nextCatId++;
                const newCard = document.createElement('div');
                newCard.className = 'cat-card-large';
                newCard.setAttribute('data-cat-id', nextCatId);

                newCard.innerHTML = `
                    <img src="${imgUrl}" alt="${title}">
                    <div class="cat-action-overlay">
                        <button class="cat-action-btn edit-cat-btn" data-id="${nextCatId}" title="Modifier la catégorie"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="cat-action-btn delete-btn delete-cat-btn" data-id="${nextCatId}" title="Supprimer la catégorie"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                    <div class="cat-overlay">
                        <span class="cat-icon-badge">${icon}</span>
                        <h3>${title}</h3>
                        <span class="cat-count-badge">${sub}</span>
                    </div>
                `;

                categoriesGridContainer.prepend(newCard);
                showToast(`Nouvelle catégorie "${title}" ajoutée !`);
            }

            closeCategoryModal();
        });
    }

    /* ==========================================================================
       13. Orders Management System (Search, Filter, Status Cycle, POS Ticket, Add Order)
       ========================================================================== */
    const ordersTableBody = document.getElementById('ordersTableBody');
    const orderSearchInput = document.getElementById('orderSearchInput');
    const orderPillBtns = document.querySelectorAll('.order-pill-btn');
    const addNewOrderBtn = document.getElementById('addNewOrderBtn');
    const orderFormModal = document.getElementById('orderFormModal');
    const closeOrderFormModalBtn = document.getElementById('closeOrderFormModalBtn');
    const cancelOrderFormBtn = document.getElementById('cancelOrderFormBtn');
    const orderCrudForm = document.getElementById('orderCrudForm');

    const orderClientNameInput = document.getElementById('orderClientNameInput');
    const orderPhoneInput = document.getElementById('orderPhoneInput');
    const orderChannelInput = document.getElementById('orderChannelInput');
    const orderDetailLocInput = document.getElementById('orderDetailLocInput');
    const orderStatusInput = document.getElementById('orderStatusInput');
    const orderItemsInput = document.getElementById('orderItemsInput');
    const orderTotalInput = document.getElementById('orderTotalInput');
    const orderTimeInput = document.getElementById('orderTimeInput');

    const orderTicketModal = document.getElementById('orderTicketModal');
    const closeTicketModalBtn = document.getElementById('closeTicketModalBtn');
    const ticketContentBody = document.getElementById('ticketContentBody');

    let nextCmdNum = 8943;
    let activeOrderStatus = 'all';

    // 1. Order Status Pill Filters
    orderPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            orderPillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeOrderStatus = btn.getAttribute('data-status');
            filterOrders();
        });
    });

    const orderDateSelect = document.getElementById('orderDateSelect');
    const orderDatePickerBtn = document.getElementById('orderDatePickerBtn');

    if (orderDateSelect) {
        orderDateSelect.addEventListener('change', () => {
            filterOrders();
            const label = orderDateSelect.options[orderDateSelect.selectedIndex].text;
            showToast(`Filtre Date : ${label}`);
        });
    }

    if (orderDatePickerBtn) {
        orderDatePickerBtn.addEventListener('click', openCustomDateModal);
    }

    // 2. Real-time Search Filtering & Shortcut (Ctrl + K)
    if (orderSearchInput) {
        orderSearchInput.addEventListener('input', () => {
            filterOrders();
        });

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                const viewOrders = document.getElementById('view-orders');
                if (viewOrders && viewOrders.classList.contains('active')) {
                    e.preventDefault();
                    orderSearchInput.focus();
                    orderSearchInput.select();
                }
            }
        });
    }

    function filterOrders() {
        const query = orderSearchInput ? orderSearchInput.value.toLowerCase().trim() : '';
        const rows = document.querySelectorAll('.order-row');

        rows.forEach(row => {
            const status = row.getAttribute('data-status');
            const channel = row.getAttribute('data-channel');
            const text = row.textContent.toLowerCase();

            const matchesStatus = (activeOrderStatus === 'all' || status === activeOrderStatus || (activeOrderStatus === 'online' && channel === 'online'));
            const matchesQuery = (!query || text.includes(query));

            if (matchesStatus && matchesQuery) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // 3. Update Orders KPI Counts dynamically (Calculates real table counts for top cards & filter pills)
    function updateOrderKpis() {
        const rows = document.querySelectorAll('#ordersTableBody .order-row');
        const total = rows.length;
        const online = document.querySelectorAll('#ordersTableBody .order-row[data-channel="online"]').length;
        const pending = document.querySelectorAll('#ordersTableBody .order-row[data-status="pending"]').length;
        const cooking = document.querySelectorAll('#ordersTableBody .order-row[data-status="cooking"]').length;
        const completed = document.querySelectorAll('#ordersTableBody .order-row[data-status="completed"]').length;

        // Top 4 Mini KPI Cards
        const kpiOnline = document.getElementById('kpiCountOnline');
        const kpiPending = document.getElementById('kpiCountPending');
        const kpiCooking = document.getElementById('kpiCountCooking');
        const kpiCompleted = document.getElementById('kpiCountCompleted');

        if (kpiOnline) kpiOnline.textContent = `${online} Commande${online !== 1 ? 's' : ''}`;
        if (kpiPending) kpiPending.textContent = `${pending} Commande${pending !== 1 ? 's' : ''}`;
        if (kpiCooking) kpiCooking.textContent = `${cooking} Commande${cooking !== 1 ? 's' : ''}`;
        if (kpiCompleted) kpiCompleted.textContent = `${completed} Commande${completed !== 1 ? 's' : ''}`;

        // Status Filter Pills
        const pillAll = document.querySelector('.order-pill-btn[data-status="all"]');
        const pillPending = document.querySelector('.order-pill-btn[data-status="pending"]');
        const pillCooking = document.querySelector('.order-pill-btn[data-status="cooking"]');
        const pillCompleted = document.querySelector('.order-pill-btn[data-status="completed"]');

        if (pillAll) pillAll.textContent = `Toutes (${total})`;
        if (pillPending) pillPending.textContent = `⏳ En Attente (${pending})`;
        if (pillCooking) pillCooking.textContent = `🔥 En Cuisine (${cooking})`;
        if (pillCompleted) pillCompleted.textContent = `✅ Complet (${completed})`;
    }

    // Call updateOrderKpis initially so top cards & pills immediately display real counts!
    updateOrderKpis();

    /* ==========================================================================
       REAL-TIME LIVE SITE SYNC (Orders & Reservations from Foores Restaurant Site)
       ========================================================================== */
    function syncLiveSiteData() {
        loadLiveOrdersFromLocalStorage();
        loadLiveReservationsFromLocalStorage();
    }

    function loadLiveOrdersFromLocalStorage() {
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (!ordersTableBody) return;

        const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.orders)) {
                    renderFetchedOrders(data.orders);
                }
            })
            .catch(err => {
                console.warn('API orders fetch failed, fallback to local', err);
                loadOrdersFromLocalStorageFallback();
            });
    }

    function renderFetchedOrders(orders) {
        const ordersTableBody = document.getElementById('ordersTableBody');
        if (!ordersTableBody) return;

        // Synchronize DOM with DB: remove rows that were deleted from the database
        const fetchedIds = new Set((orders || []).map(o => String(o.cmdId || o.id)));
        document.querySelectorAll('#ordersTableBody .order-row').forEach(row => {
            const rowId = String(row.getAttribute('data-order-id'));
            if (!fetchedIds.has(rowId)) {
                row.remove();
            }
        });

        if (!orders || orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--text-muted);"><i class="fa-solid fa-receipt" style="font-size: 2.2rem; margin-bottom: 12px; display: block; opacity: 0.35;"></i><strong>Aucune commande enregistrée</strong><p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.7;">Les nouvelles commandes du site ou du TPV s'afficheront ici en temps réel.</p></td></tr>`;
            if (typeof updateOrderKpis === 'function') updateOrderKpis();
            return;
        }

        // Remove empty state placeholder if present
        const placeholder = ordersTableBody.querySelector('td[colspan="7"]');
        if (placeholder && placeholder.closest('tr')) {
            placeholder.closest('tr').remove();
        }

        orders.forEach(order => {
            const orderIdStr = order.cmdId || order.id;
            if (document.querySelector(`.order-row[data-order-id="${orderIdStr}"]`)) return;

            const tr = document.createElement('tr');
            tr.className = 'order-row';
            tr.setAttribute('data-order-id', orderIdStr);
            tr.setAttribute('data-status', order.status || 'pending');
            tr.setAttribute('data-channel', order.channel || 'online');

            let statusBadge = '<span class="order-status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> En Attente</span>';
            if (order.status === 'cooking') {
                statusBadge = '<span class="order-status-badge status-cooking"><i class="fa-solid fa-fire text-orange"></i> En Cuisine</span>';
            } else if (order.status === 'completed' || order.status === 'confirmed') {
                statusBadge = '<span class="order-status-badge status-completed"><i class="fa-solid fa-circle-check text-green"></i> Confirmée</span>';
            }

            let dishesHtml = '';
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    dishesHtml += `<span>🍽️ ${item.quantity || 1}x ${item.title} (${(item.price || 0) * (item.quantity || 1)} DH)</span>`;
                });
            } else {
                dishesHtml = `<span>${order.itemsSummary || 'Commande Client'}</span>`;
            }

            const clientPhone = order.customer ? order.customer.phone : '-';
            const cleanPhone = clientPhone.replace(/[^0-9]/g, '').replace(/^0/, '');

            tr.innerHTML = `
                <td>
                    <div class="order-id-badge">
                        <strong>#${orderIdStr}</strong>
                        <span class="sub-channel online-order"><i class="fa-solid fa-globe"></i> En Ligne (Site)</span>
                    </div>
                </td>
                <td>
                    <div class="client-meta">
                        <strong>${order.customer ? order.customer.name : 'Client Site'}</strong>
                        <span class="client-phone"><i class="fa-solid fa-phone text-green"></i> ${clientPhone}</span>
                        <span class="client-addr"><i class="fa-solid fa-location-dot text-orange"></i> ${order.customer ? order.customer.address : 'Casablanca'}</span>
                    </div>
                </td>
                <td>
                    <div class="dishes-summary">
                        ${dishesHtml}
                    </div>
                </td>
                <td><strong class="price-tag">${order.total} DH</strong></td>
                <td><span class="time-ago">${order.time || 'Récemment'}</span></td>
                <td>${statusBadge}</td>
                <td style="text-align: right;">
                    <div class="order-action-btns">
                        <button class="order-btn cycle-status-btn" title="Confirmer (Passer en Cuisine)" data-id="${orderIdStr}"><i class="fa-solid fa-check text-green"></i></button>
                        <a href="https://wa.me/212${cleanPhone}" target="_blank" class="order-btn" title="WhatsApp Client"><i class="fa-brands fa-whatsapp text-green"></i></a>
                        <button class="order-btn delete-order-btn" title="Annuler commande" data-id="${orderIdStr}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            ordersTableBody.prepend(tr);
        });

        if (typeof updateOrderKpis === 'function') updateOrderKpis();
    }

    function loadOrdersFromLocalStorageFallback() {
        let liveOrders = [];
        try {
            const raw = localStorage.getItem('foores_live_orders');
            if (raw) liveOrders = JSON.parse(raw);
        } catch (e){}
        if (liveOrders.length > 0) renderFetchedOrders(liveOrders);
    }

    function loadLiveReservationsFromLocalStorage() {
        const resaTableBody = document.getElementById('resaTableBody');
        if (!resaTableBody) return;

        const apiPath = window.location.pathname.includes('/admin') ? '../api/reservations.php' : 'api/reservations.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.reservations)) {
                    renderFetchedReservations(data.reservations);
                }
            })
            .catch(err => {
                console.warn('API reservations fetch failed, fallback', err);
            });
    }

    function renderFetchedReservations(reservations) {
        const resaTableBody = document.getElementById('resaTableBody');
        if (!resaTableBody) return;

        // Synchronize DOM with DB: remove reservations that were deleted from the database
        const fetchedResaIds = new Set((reservations || []).map(r => String(r.resId || r.id)));
        document.querySelectorAll('#resaTableBody .resa-row').forEach(row => {
            const rowId = String(row.getAttribute('data-resa-id'));
            if (!fetchedResaIds.has(rowId)) {
                row.remove();
            }
        });

        if (!reservations || reservations.length === 0) {
            resaTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 48px 16px; color: var(--text-muted);"><i class="fa-solid fa-calendar-xmark" style="font-size: 2.2rem; margin-bottom: 12px; display: block; opacity: 0.35;"></i><strong>Aucune réservation enregistrée</strong><p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.7;">Les réservations de tables effectuées sur le site s'afficheront ici en direct.</p></td></tr>`;
            if (typeof updateResaKpis === 'function') updateResaKpis();
            const badge = document.getElementById('sidebarResaBadge');
            if (badge) badge.textContent = '0';
            return;
        }

        // Remove empty state placeholder if present
        const placeholder = resaTableBody.querySelector('td[colspan="7"]');
        if (placeholder && placeholder.closest('tr')) {
            placeholder.closest('tr').remove();
        }

        reservations.forEach(res => {
            const resIdStr = res.resId || res.id;
            if (document.querySelector(`.resa-row[data-resa-id="${resIdStr}"]`)) return;

            const tr = document.createElement('tr');
            tr.className = 'resa-row';
            tr.setAttribute('data-resa-id', resIdStr);
            tr.setAttribute('data-resa-status', res.status || 'pending');

            const nameStr = res.name || 'Client Web';
            const initials = nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'CR';
            const cleanPhone = (res.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '');

            tr.innerHTML = `
                <td>
                    <div class="order-id-badge">
                        <strong>${resIdStr}</strong>
                        <span class="sub-channel online-order"><i class="fa-solid fa-globe"></i> Formulaire Web</span>
                    </div>
                </td>
                <td>
                    <div class="client-meta">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div class="avatar-circle-sm green">${initials}</div>
                            <div>
                                <strong>${nameStr}</strong>
                                <span class="client-phone"><i class="fa-solid fa-phone text-green"></i> ${res.phone}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="resa-date-meta">
                        <span class="resa-date"><i class="fa-solid fa-calendar-day text-orange"></i> ${res.date}</span>
                        <span class="resa-time"><i class="fa-solid fa-clock text-green"></i> ${res.time}</span>
                    </div>
                </td>
                <td>
                    <span class="guest-count-pill"><i class="fa-solid fa-users"></i> ${res.guests} Personnes</span>
                </td>
                <td>
                    <div class="resa-notes-box">
                        <i class="fa-solid fa-comment-dots text-orange"></i> <span>${res.notes || 'Aucune remarque'}</span>
                    </div>
                </td>
                <td><span class="order-status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> En Attente</span></td>
                <td style="text-align: right;">
                    <div class="order-action-btns">
                        <button class="order-btn cycle-resa-btn" title="Confirmer la réservation" data-id="${resIdStr}"><i class="fa-solid fa-check text-green"></i></button>
                        <a href="https://wa.me/212${cleanPhone}" target="_blank" class="order-btn" title="Contacter WhatsApp Client"><i class="fa-brands fa-whatsapp text-green"></i></a>
                        <button class="order-btn edit-resa-btn" title="Modifier" data-id="${resIdStr}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="order-btn delete-resa-btn" title="Annuler" data-id="${resIdStr}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            resaTableBody.prepend(tr);
        });

        if (typeof updateResaKpis === 'function') updateResaKpis();

        const badge = document.getElementById('sidebarResaBadge');
        if (badge) {
            const totalRes = document.querySelectorAll('#resaTableBody .resa-row').length;
            badge.textContent = totalRes;
        }
    }
                                <span class="client-addr"><i class="fa-solid fa-envelope text-blue"></i> ${res.email || 'Non renseigné'}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <strong style="color: var(--ink); font-size: 13px;"><i class="fa-solid fa-clock text-green"></i> ${res.date}, ${res.time}</strong>
                        <span class="time-ago">Reçu en direct</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span class="guests-pill"><i class="fa-solid fa-user-group text-green"></i> ${res.guests || 2} Personne(s)</span>
                        <span class="table-badge vip"><i class="fa-solid fa-utensils"></i> Table Web</span>
                    </div>
                </td>
                <td>
                    <div class="resa-notes-box">
                        <i class="fa-solid fa-comment-dots text-orange"></i> <span>${res.notes || 'Aucune remarque'}</span>
                    </div>
                </td>
                <td><span class="order-status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> En Attente</span></td>
                <td style="text-align: right;">
                    <div class="order-action-btns">
                        <button class="order-btn cycle-resa-btn" title="Confirmer la réservation" data-id="${resIdStr}"><i class="fa-solid fa-check text-green"></i></button>
                        <a href="https://wa.me/212${cleanPhone}" target="_blank" class="order-btn" title="Contacter WhatsApp Client"><i class="fa-brands fa-whatsapp text-green"></i></a>
                        <button class="order-btn edit-resa-btn" title="Modifier" data-id="${resIdStr}"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="order-btn delete-resa-btn" title="Annuler" data-id="${resIdStr}"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            resaTableBody.prepend(tr);
        });

        if (typeof updateResaKpis === 'function') updateResaKpis();

        const badge = document.getElementById('sidebarResaBadge');
        if (badge) {
            const totalRes = document.querySelectorAll('#resaTableBody .resa-row').length;
            badge.textContent = totalRes;
        }
    }

    syncLiveSiteData();
    setInterval(syncLiveSiteData, 5000);

    // 4. Delegated Click Handlers for Order Actions (Cycle Status, View Ticket, Delete)
    if (ordersTableBody) {
        ordersTableBody.addEventListener('click', (e) => {
            const cycleBtn = e.target.closest('.cycle-status-btn');
            const ticketBtn = e.target.closest('.view-ticket-btn');
            const deleteBtn = e.target.closest('.delete-order-btn');

            if (cycleBtn) {
                const row = cycleBtn.closest('.order-row');
                if (row) cycleOrderStatus(row);
            } else if (ticketBtn) {
                const row = ticketBtn.closest('.order-row');
                if (row) openTicketModal(row);
            } else if (deleteBtn) {
                const row = deleteBtn.closest('.order-row');
                if (row) deleteOrderRow(row);
            }
        });
    }

    // 5. Cycle Order Status Handler (En Attente -> En Cuisine -> Complet -> En Attente)
    function cycleOrderStatus(row) {
        const orderId = row.getAttribute('data-order-id');
        const currentStatus = row.getAttribute('data-status');

        const statusSequence = ['pending', 'cooking', 'completed'];
        const nextIndex = (statusSequence.indexOf(currentStatus) + 1) % statusSequence.length;
        const newStatus = statusSequence[nextIndex];

        row.setAttribute('data-status', newStatus);

        const statusCell = row.querySelector('.order-status-badge');
        const cycleBtn = row.querySelector('.cycle-status-btn');

        if (newStatus === 'pending') {
            if (statusCell) {
                statusCell.className = 'order-status-badge status-pending';
                statusCell.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> En Attente';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Confirmer (Passer en Cuisine)');
                cycleBtn.innerHTML = '<i class="fa-solid fa-check text-green"></i>';
            }
            showToast(`Commande ${orderId} remise en Attente ⏳`);
        } else if (newStatus === 'cooking') {
            if (statusCell) {
                statusCell.className = 'order-status-badge status-cooking';
                statusCell.innerHTML = '<i class="fa-solid fa-fire"></i> En Cuisine';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Valider & Marquer Complet');
                cycleBtn.innerHTML = '<i class="fa-solid fa-check-double text-green"></i>';
            }
            showToast(`Commande ${orderId} confirmée et envoyée en Cuisine 🔥`);
        } else if (newStatus === 'completed') {
            if (statusCell) {
                statusCell.className = 'order-status-badge status-completed';
                statusCell.innerHTML = '<i class="fa-solid fa-circle-check"></i> Complet';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Remettre en Attente');
                cycleBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
            }
            showToast(`Commande ${orderId} validée et marquée Complet ✅`);
        }

        // Sync with Neon Database API
        const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
        fetch(apiPath, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cmdId: orderId, status: newStatus })
        }).catch(err => console.warn('Neon order status sync error', err));

        updateOrderKpis();
        filterOrders();
    }

    // 6. View POS Ticket Modal
    function openTicketModal(row) {
        const ticketContentBody = document.getElementById('ticketContentBody');
        const ticketModal = document.getElementById('orderTicketModal');
        if (!ticketContentBody || !ticketModal) return;

        const orderId = row.getAttribute('data-order-id');
        const channel = row.getAttribute('data-channel');

        const clientStrong = row.querySelector('.client-meta strong');
        const clientName = clientStrong ? clientStrong.textContent.trim() : (channel === 'sur-place' ? 'Sur Place (Restaurant)' : (channel === 'takeaway' ? 'À Emporter' : 'Client En Ligne'));

        const phoneEl = row.querySelector('.client-phone');
        const addrEl = row.querySelector('.client-addr');
        const phoneText = phoneEl ? phoneEl.textContent.trim() : '';
        const addrText = addrEl ? addrEl.textContent.trim() : '';

        const serviceBadgeEl = row.querySelector('.sub-channel');
        const serviceBadge = serviceBadgeEl ? serviceBadgeEl.textContent.trim() : 'Restaurant';
        const dishes = Array.from(row.querySelectorAll('.dishes-summary span')).map(s => s.textContent).join('<br>');
        const price = row.querySelector('.price-tag') ? row.querySelector('.price-tag').textContent : '';
        const time = row.querySelector('.time-ago') ? row.querySelector('.time-ago').textContent : "À l'instant";

        ticketContentBody.innerHTML = `
            <div class="ticket-info-row"><span>TICKET :</span><strong>${orderId}</strong></div>
            <div class="ticket-info-row"><span>SERVICE :</span><strong>${serviceBadge}</strong></div>
            <div class="ticket-info-row"><span>CLIENT :</span><strong>${clientName}</strong></div>
            ${phoneText ? `<div class="ticket-info-row"><span>TÉLÉPHONE :</span><strong>${phoneText}</strong></div>` : ''}
            ${addrText ? `<div class="ticket-info-row"><span>ADRESSE :</span><strong>${addrText}</strong></div>` : ''}
            <div class="ticket-info-row"><span>HEURE :</span><strong>${time}</strong></div>
            <div style="border-top: 1px dashed rgba(255,255,255,0.2); margin: 8px 0;"></div>
            <div style="margin: 8px 0;">
                <strong style="color: #10B981; display: block; margin-bottom: 4px;">ARTICLES COMMANDÉS :</strong>
                ${dishes}
            </div>
            <div style="border-top: 1px dashed rgba(255,255,255,0.2); margin: 8px 0;"></div>
            <div class="ticket-info-row" style="font-size: 15px;"><span>TOTAL RÈGLÉ :</span><strong style="color: #10B981;">${price}</strong></div>
        `;

        ticketModal.classList.add('active');
        ticketModal.style.display = 'flex';
        ticketModal.style.opacity = '1';
        ticketModal.style.visibility = 'visible';
        ticketModal.style.pointerEvents = 'auto';
    }

    function closeTicketModal() {
        const ticketModal = document.getElementById('orderTicketModal');
        if (ticketModal) {
            ticketModal.classList.remove('active');
            ticketModal.style.display = 'none';
            ticketModal.style.opacity = '0';
            ticketModal.style.visibility = 'hidden';
            ticketModal.style.pointerEvents = 'none';
        }
    }

    const closeTicketBtn = document.getElementById('closeTicketModalBtn');
    if (closeTicketBtn) closeTicketBtn.addEventListener('click', closeTicketModal);
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('orderTicketModal');
        if (modal && e.target === modal) closeTicketModal();
    });

    // 7. Delete Order Row
    function deleteOrderRow(row) {
        const orderId = row.getAttribute('data-order-id');
        if (confirm(`Voulez-vous vraiment annuler la commande ${orderId} ?`)) {
            row.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            row.style.transform = 'scale(0.8)';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateOrderKpis();
                showToast(`Commande ${orderId} annulée.`);
            }, 400);

            // Sync with Neon Database API
            const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
            fetch(apiPath + '?id=' + encodeURIComponent(orderId), {
                method: 'DELETE'
            }).catch(err => console.warn('Neon order delete sync error', err));
        }
    }

    // 8. Add New Order Interactive POS Modal & Cart Engine
    let posDishesData = {};

    function loadPosDishesFromApi() {
        const apiPath = window.location.pathname.includes('/admin') ? '../api/dishes.php' : 'api/dishes.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success' && Array.isArray(data.dishes)) {
                    const grouped = {};
                    data.dishes.forEach(d => {
                        const cat = (d.category || 'burgers').toLowerCase();
                        if (!grouped[cat]) grouped[cat] = [];
                        grouped[cat].push({
                            id: d.id,
                            name: d.title,
                            price: parseFloat(d.price) || 0,
                            icon: '🍽️',
                            img: d.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'
                        });
                    });
                    posDishesData = grouped;
                    renderPosDishesGrid();
                }
            })
            .catch(err => console.warn('Failed to fetch dishes for POS modal', err));
    }
    loadPosDishesFromApi();

    let posCart = [];
    let currentPosCategory = 'burgers';

    const posDishesGridContainer = document.getElementById('posDishesGridContainer');
    const posCartItemsList = document.getElementById('posCartItemsList');
    const posLiveTotalDisplay = document.getElementById('posLiveTotalDisplay');
    const posCatPills = document.querySelectorAll('.pos-cat-pill');
    const orderPhoneGroup = document.getElementById('orderPhoneGroup');
    const orderLocLabel = document.getElementById('orderLocLabel');

    // Category Switching Handler
    posCatPills.forEach(pill => {
        pill.addEventListener('click', () => {
            posCatPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentPosCategory = pill.getAttribute('data-pos-cat');
            renderPosDishesGrid();
        });
    });

    // Render Dish Cards for Active Category with Staggered Entrance Animation
    function renderPosDishesGrid() {
        if (!posDishesGridContainer) return;

        const dishes = posDishesData[currentPosCategory] || [];
        posDishesGridContainer.innerHTML = dishes.map((dish, idx) => `
            <div class="pos-dish-card" data-dish-id="${dish.id}" style="animation-delay: ${idx * 0.06}s;">
                <img src="${dish.img}" alt="${dish.name}" class="pos-dish-thumb">
                <div class="pos-dish-info">
                    <span class="pos-dish-name">${dish.icon} ${dish.name}</span>
                    <span class="pos-dish-price">${dish.price} DH</span>
                </div>
                <div class="pos-add-icon"><i class="fa-solid fa-plus"></i></div>
            </div>
        `).join('');

        posDishesGridContainer.querySelectorAll('.pos-dish-card').forEach(card => {
            card.addEventListener('click', () => {
                const dishId = card.getAttribute('data-dish-id');
                addDishToPosCart(dishId);
            });
        });
    }

    // Add Dish to Cart
    function addDishToPosCart(dishId) {
        let foundDish = null;
        for (const cat in posDishesData) {
            const item = posDishesData[cat].find(d => d.id === dishId);
            if (item) { foundDish = item; break; }
        }
        if (!foundDish) return;

        const existing = posCart.find(ci => ci.id === dishId);
        if (existing) {
            existing.qty++;
        } else {
            posCart.push({ id: foundDish.id, name: foundDish.name, price: foundDish.price, icon: foundDish.icon, qty: 1 });
        }
        renderPosCart();
    }

    // Update Cart Quantity or Remove Item
    function updatePosCartQty(dishId, delta) {
        const item = posCart.find(ci => ci.id === dishId);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            posCart = posCart.filter(ci => ci.id !== dishId);
        }
        renderPosCart();
    }

    function removePosCartItem(dishId) {
        posCart = posCart.filter(ci => ci.id !== dishId);
        renderPosCart();
    }

    // Render POS Cart Summary
    function renderPosCart() {
        if (!posCartItemsList) return;

        if (posCart.length === 0) {
            posCartItemsList.innerHTML = `<div class="pos-cart-empty"><i class="fa-solid fa-basket-shopping text-muted" style="font-size: 24px; margin-bottom: 8px; display: block;"></i> Aucun plat sélectionné.<br>Cliquez sur un plat à gauche pour l'ajouter.</div>`;
            if (posLiveTotalDisplay) posLiveTotalDisplay.textContent = '0 DH';
            if (orderTotalInput) orderTotalInput.value = '0';
            if (orderItemsInput) orderItemsInput.value = '';
            return;
        }

        let total = 0;
        let itemsSummary = [];

        posCartItemsList.innerHTML = posCart.map(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            itemsSummary.push(`${item.qty}x ${item.name}`);

            return `
                <div class="pos-cart-item">
                    <span class="pos-cart-item-name">${item.icon} ${item.name}</span>
                    <div class="pos-qty-controls">
                        <button type="button" class="pos-qty-btn qty-minus" data-id="${item.id}">-</button>
                        <strong style="color: #FFF; font-size: 11px;">${item.qty}</strong>
                        <button type="button" class="pos-qty-btn qty-plus" data-id="${item.id}">+</button>
                    </div>
                    <span class="pos-cart-item-price">${itemTotal} DH</span>
                    <button type="button" class="pos-remove-btn" data-id="${item.id}" title="Supprimer"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        }).join('');

        if (posLiveTotalDisplay) posLiveTotalDisplay.textContent = `${total} DH`;
        if (orderTotalInput) orderTotalInput.value = total;
        if (orderItemsInput) orderItemsInput.value = itemsSummary.join(', ');

        posCartItemsList.querySelectorAll('.qty-minus').forEach(b => b.addEventListener('click', () => updatePosCartQty(b.getAttribute('data-id'), -1)));
        posCartItemsList.querySelectorAll('.qty-plus').forEach(b => b.addEventListener('click', () => updatePosCartQty(b.getAttribute('data-id'), 1)));
        posCartItemsList.querySelectorAll('.pos-remove-btn').forEach(b => b.addEventListener('click', () => removePosCartItem(b.getAttribute('data-id'))));
    }

    // Dynamic Channel Selection Handler (Toggles Internet Client Details vs Restaurant Sur Place / Takeaway)
    if (orderChannelInput) {
        orderChannelInput.addEventListener('change', () => {
            const channel = orderChannelInput.value;
            const isInternet = (channel === 'online');

            const clientFieldsRow = document.getElementById('internetClientFieldsRow');
            const addressRow = document.getElementById('internetAddressRow');

            if (isInternet) {
                if (clientFieldsRow) clientFieldsRow.style.display = 'flex';
                if (addressRow) addressRow.style.display = 'flex';
                if (orderClientNameInput) orderClientNameInput.setAttribute('required', 'true');
                if (orderPhoneInput) orderPhoneInput.setAttribute('required', 'true');
                if (orderDetailLocInput) orderDetailLocInput.setAttribute('required', 'true');
            } else {
                if (clientFieldsRow) clientFieldsRow.style.display = 'none';
                if (addressRow) addressRow.style.display = 'none';
                if (orderClientNameInput) orderClientNameInput.removeAttribute('required');
                if (orderPhoneInput) orderPhoneInput.removeAttribute('required');
                if (orderDetailLocInput) orderDetailLocInput.removeAttribute('required');
            }
        });
    }

    function openAddOrderModal() {
        const modal = document.getElementById('orderFormModal');
        const form = document.getElementById('orderCrudForm');
        if (!modal) {
            console.error('Modal #orderFormModal non trouvé dans le DOM!');
            return;
        }
        if (form) form.reset();
        posCart = [];
        renderPosDishesGrid();
        renderPosCart();

        const channelInput = document.getElementById('orderChannelInput');
        if (channelInput) {
            channelInput.value = 'sur-place';
            channelInput.dispatchEvent(new Event('change'));
        }

        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto';
    }
    window.openAddOrderModal = openAddOrderModal;

    function closeOrderModal() {
        const modal = document.getElementById('orderFormModal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            modal.style.pointerEvents = 'none';
        }
    }
    window.closeOrderModal = closeOrderModal;

    const addNewBtnEl = document.getElementById('addNewOrderBtn');
    if (addNewBtnEl) {
        addNewBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAddOrderModal();
        });
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#addNewOrderBtn');
        if (btn) {
            e.preventDefault();
            openAddOrderModal();
        }
    });

    const closeBtnEl = document.getElementById('closeOrderFormModalBtn');
    if (closeBtnEl) closeBtnEl.addEventListener('click', closeOrderModal);

    const cancelBtnEl = document.getElementById('cancelOrderFormBtn');
    if (cancelBtnEl) cancelBtnEl.addEventListener('click', closeOrderModal);

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('orderFormModal');
        if (modal && e.target === modal) {
            closeOrderModal();
        }
    });

    function submitPosOrder(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (posCart.length === 0) {
            alert('Veuillez sélectionner au moins un plat avant de confirmer la commande.');
            return;
        }

        nextCmdNum++;
        const newCmdId = `CMD-${nextCmdNum}`;

        const channel = orderChannelInput ? orderChannelInput.value : 'sur-place';
        const status = 'pending'; // Always initial status En Attente
        const items = orderItemsInput ? orderItemsInput.value.trim() : '';
        const total = orderTotalInput ? orderTotalInput.value : '0';
        const time = (orderTimeInput && orderTimeInput.value) ? orderTimeInput.value : "À l'instant";

        let clientMetaHTML = '';
        let channelBadgeHTML = '';

        if (channel === 'sur-place') {
            clientMetaHTML = `
                <div class="client-meta">
                    <span class="client-sub-badge sur-place"><i class="fa-solid fa-utensils text-green"></i> Sur Place</span>
                </div>
            `;
            channelBadgeHTML = '<span class="sub-channel sur-place"><i class="fa-solid fa-utensils"></i> Sur Place</span>';
        } else {
            // Takeaway
            clientMetaHTML = `
                <div class="client-meta">
                    <span class="client-sub-badge takeaway"><i class="fa-solid fa-bag-shopping text-orange"></i> À Emporter</span>
                </div>
            `;
            channelBadgeHTML = '<span class="sub-channel takeaway"><i class="fa-solid fa-bag-shopping"></i> À Emporter</span>';
        }

        const statusBadgeHTML = '<span class="order-status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> En Attente</span>';
        const actionBtnHTML = `<button class="order-btn cycle-status-btn" title="Confirmer (Passer en Cuisine)" data-id="#${newCmdId}"><i class="fa-solid fa-check text-green"></i></button>`;

        const itemsFormatted = items.split(',').map(it => `<span>• ${it.trim()}</span>`).join('');

        const newRow = document.createElement('tr');
        newRow.className = 'order-row';
        newRow.setAttribute('data-order-id', `#${newCmdId}`);
        newRow.setAttribute('data-status', status);
        newRow.setAttribute('data-channel', channel);

        newRow.innerHTML = `
            <td>
                <div class="order-id-badge">
                    <strong>#${newCmdId}</strong>
                    ${channelBadgeHTML}
                </div>
            </td>
            <td>
                ${clientMetaHTML}
            </td>
            <td>
                <div class="dishes-summary">
                    ${itemsFormatted}
                </div>
            </td>
            <td><strong class="price-tag">${total} DH</strong></td>
            <td><span class="time-ago">${time}</span></td>
            <td>${statusBadgeHTML}</td>
            <td style="text-align: right;">
                <div class="order-action-btns">
                    ${actionBtnHTML}
                    <button class="order-btn view-ticket-btn" title="Voir Ticket POS" data-id="#${newCmdId}"><i class="fa-solid fa-receipt"></i></button>
                    <button class="order-btn delete-order-btn" title="Annuler commande" data-id="#${newCmdId}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;

        const ordersTableBody = document.getElementById('ordersTableBody');
        if (ordersTableBody) ordersTableBody.prepend(newRow);

        // Sync POS order to Neon Database API
        const apiPath = window.location.pathname.includes('/admin') ? '../api/orders.php' : 'api/orders.php';
        fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cmdId: newCmdId,
                date: new Date().toLocaleDateString('fr-FR'),
                time: time,
                customer: {
                    name: channel === 'sur-place' ? 'Client En Salle' : 'Client Comptoir',
                    phone: '',
                    address: channel === 'sur-place' ? 'Table En Salle' : 'Comptoir Retrait'
                },
                items: posCart.map(ci => ({ title: ci.name, quantity: ci.qty, price: ci.price })),
                total: parseFloat(total) || 0,
                paymentMethod: 'Espèces Comptoir',
                status: 'pending',
                channel: channel,
                createdAt: Date.now()
            })
        }).then(r => r.json()).then(res => {
            console.log('Commande POS enregistrée dans Neon:', res);
        }).catch(err => console.warn('Erreur synchro POS Neon', err));

        showToast(`Nouvelle commande #${newCmdId} créée (${total} DH) ! 🔥`);
        closeOrderModal();
        updateOrderKpis();
        filterOrders();
        openTicketModal(newRow);
    }
    window.submitPosOrder = submitPosOrder;

    if (orderCrudForm) {
        orderCrudForm.addEventListener('submit', submitPosOrder);
    }

    const confirmOrderSubmitBtn = document.getElementById('confirmOrderSubmitBtn');
    if (confirmOrderSubmitBtn) {
        confirmOrderSubmitBtn.addEventListener('click', submitPosOrder);
    }

    /* ==========================================================================
       14. Website Table Reservations Management System
       ========================================================================== */
    const resaTableBody = document.getElementById('resaTableBody');
    const resaSearchInput = document.getElementById('resaSearchInput');
    const resaPillBtns = document.querySelectorAll('.resa-pill-btn');
    const addNewResaBtn = document.getElementById('addNewResaBtn');
    const resaFormModal = document.getElementById('resaFormModal');
    const closeResaFormModalBtn = document.getElementById('closeResaFormModalBtn');
    const cancelResaFormBtn = document.getElementById('cancelResaFormBtn');
    const resaCrudForm = document.getElementById('resaCrudForm');
    const resaModalTitle = document.getElementById('resaModalTitle');

    const resaClientNameInput = document.getElementById('resaClientNameInput');
    const resaPhoneInput = document.getElementById('resaPhoneInput');
    const resaEmailInput = document.getElementById('resaEmailInput');
    const resaGuestsInput = document.getElementById('resaGuestsInput');
    const resaDateInput = document.getElementById('resaDateInput');
    const resaTimeInput = document.getElementById('resaTimeInput');
    const resaTableInput = document.getElementById('resaTableInput');
    const resaStatusInput = document.getElementById('resaStatusInput');
    const resaNotesInput = document.getElementById('resaNotesInput');
    const resaEditId = document.getElementById('resaEditId');

    let activeResaStatus = 'all';
    let nextResaNum = 7096;

    const resaDateSelect = document.getElementById('resaDateSelect');
    const resaDatePickerBtn = document.getElementById('resaDatePickerBtn');

    // Status Pill Filter Handling
    resaPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resaPillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeResaStatus = btn.getAttribute('data-resa-status');
            filterReservations();
        });
    });

    // Search Filter
    if (resaSearchInput) {
        resaSearchInput.addEventListener('input', filterReservations);
    }

    if (resaDateSelect) {
        resaDateSelect.addEventListener('change', () => {
            filterReservations();
            const label = resaDateSelect.options[resaDateSelect.selectedIndex].text;
            showToast(`Filtre Date Réservations : ${label}`);
        });
    }

    if (resaDatePickerBtn) {
        resaDatePickerBtn.addEventListener('click', openCustomDateModal);
    }

    function filterReservations() {
        const query = resaSearchInput ? resaSearchInput.value.toLowerCase().trim() : '';
        const selectedDateFilter = resaDateSelect ? resaDateSelect.value : 'today';
        const rows = document.querySelectorAll('.resa-row');

        rows.forEach(row => {
            const status = row.getAttribute('data-resa-status');
            const text = row.textContent.toLowerCase();

            const matchesStatus = (activeResaStatus === 'all' || status === activeResaStatus);
            const matchesQuery = (!query || text.includes(query));

            let matchesDate = true;
            if (selectedDateFilter === 'today') {
                matchesDate = text.includes("aujourd'hui") || text.includes("nouveau");
            } else if (selectedDateFilter === 'tomorrow') {
                matchesDate = text.includes("demain");
            } else if (selectedDateFilter === 'all') {
                matchesDate = true;
            }

            if (matchesStatus && matchesQuery && matchesDate) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Update Reservation KPIs & Badges
    function updateResaKpis() {
        const rows = document.querySelectorAll('#resaTableBody .resa-row');
        const total = rows.length;
        const pending = document.querySelectorAll('#resaTableBody .resa-row[data-resa-status="pending"]').length;
        const confirmed = document.querySelectorAll('#resaTableBody .resa-row[data-resa-status="confirmed"]').length;
        const seated = document.querySelectorAll('#resaTableBody .resa-row[data-resa-status="seated"]').length;
        const cancelled = document.querySelectorAll('#resaTableBody .resa-row[data-resa-status="cancelled"]').length;

        const kpiTotal = document.getElementById('kpiTotalResa');
        const kpiPending = document.getElementById('kpiPendingResa');
        const kpiConfirmed = document.getElementById('kpiConfirmedResa');
        const kpiSeated = document.getElementById('kpiSeatedResa');
        const sidebarBadge = document.getElementById('sidebarResaBadge');

        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiPending) kpiPending.textContent = pending;
        if (kpiConfirmed) kpiConfirmed.textContent = confirmed;
        if (kpiSeated) kpiSeated.textContent = seated;
        if (sidebarBadge) sidebarBadge.textContent = pending;

        // Pills counts
        const pAll = document.querySelector('.resa-pill-btn[data-resa-status="all"]');
        const pPending = document.querySelector('.resa-pill-btn[data-resa-status="pending"]');
        const pConfirmed = document.querySelector('.resa-pill-btn[data-resa-status="confirmed"]');
        const pSeated = document.querySelector('.resa-pill-btn[data-resa-status="seated"]');
        const pCancelled = document.querySelector('.resa-pill-btn[data-resa-status="cancelled"]');

        if (pAll) pAll.textContent = `Toutes (${total})`;
        if (pPending) pPending.textContent = `⏳ En Attente (${pending})`;
        if (pConfirmed) pConfirmed.textContent = `✅ Confirmées (${confirmed})`;
        if (pSeated) pSeated.textContent = `🍷 Installés (${seated})`;
        if (pCancelled) pCancelled.textContent = `❌ Annulées (${cancelled})`;
    }

    updateResaKpis();

    // Delegated Click Handlers on Table
    if (resaTableBody) {
        resaTableBody.addEventListener('click', (e) => {
            const cycleBtn = e.target.closest('.cycle-resa-btn');
            const deleteBtn = e.target.closest('.delete-resa-btn');
            const editBtn = e.target.closest('.edit-resa-btn');

            if (cycleBtn) {
                const row = cycleBtn.closest('.resa-row');
                if (row) cycleResaStatus(row);
            } else if (deleteBtn) {
                const row = deleteBtn.closest('.resa-row');
                if (row) deleteResaRow(row);
            } else if (editBtn) {
                const row = editBtn.closest('.resa-row');
                if (row) openEditResaModal(row);
            }
        });
    }

    // Status Cycler (En Attente -> Confirmée -> Installé En Salle -> En Attente)
    function cycleResaStatus(row) {
        const resaId = row.getAttribute('data-resa-id');
        const currentStatus = row.getAttribute('data-resa-status');

        const statusSequence = ['pending', 'confirmed', 'seated'];
        const nextIndex = (statusSequence.indexOf(currentStatus) + 1) % statusSequence.length;
        const newStatus = statusSequence[nextIndex];

        row.setAttribute('data-resa-status', newStatus);

        const statusBadge = row.querySelector('.order-status-badge');
        const cycleBtn = row.querySelector('.cycle-resa-btn');

        if (newStatus === 'pending') {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-pending';
                statusBadge.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> En Attente';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Confirmer la réservation');
                cycleBtn.innerHTML = '<i class="fa-solid fa-check text-green"></i>';
            }
            showToast(`Réservation ${resaId} remise en Attente ⏳`);
        } else if (newStatus === 'confirmed') {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-completed';
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Confirmée';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Marquer Client Installé En Salle');
                cycleBtn.innerHTML = '<i class="fa-solid fa-wine-glass text-purple"></i>';
            }
            showToast(`Réservation ${resaId} confirmée ✅`);
        } else if (newStatus === 'seated') {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-seated';
                statusBadge.innerHTML = '<i class="fa-solid fa-chair"></i> Client Installé';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Remettre en Attente');
                cycleBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
            }
            showToast(`Client de la réservation ${resaId} installé en salle 🍷`);
        }

        // Sync with Neon Database API
        const apiPath = window.location.pathname.includes('/admin') ? '../api/reservations.php' : 'api/reservations.php';
        fetch(apiPath, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resId: resaId, status: newStatus })
        }).catch(err => console.warn('Neon reservation status sync error', err));

        updateResaKpis();
        filterReservations();
    }

    // Delete Reservation
    function deleteResaRow(row) {
        const resaId = row.getAttribute('data-resa-id');
        if (confirm(`Voulez-vous vraiment annuler la réservation ${resaId} ?`)) {
            row.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            row.style.transform = 'scale(0.8)';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateResaKpis();
                showToast(`Réservation ${resaId} annulée.`);
            }, 400);

            // Sync with Neon Database API
            const apiPath = window.location.pathname.includes('/admin') ? '../api/reservations.php' : 'api/reservations.php';
            fetch(apiPath + '?id=' + encodeURIComponent(resaId), {
                method: 'DELETE'
            }).catch(err => console.warn('Neon reservation delete sync error', err));
        }
    }

    // Modal Handlers (Create & Edit)
    function openAddResaModal() {
        if (!resaFormModal) return;
        if (resaCrudForm) resaCrudForm.reset();
        if (resaEditId) resaEditId.value = '';
        if (resaModalTitle) resaModalTitle.innerHTML = '<i class="fa-solid fa-calendar-plus text-green"></i> Nouvelle Réservation Web';

        if (resaDateInput) resaDateInput.value = new Date().toISOString().split('T')[0];
        if (resaTimeInput) resaTimeInput.value = '20:00';

        resaFormModal.classList.add('active');
    }

    function openEditResaModal(row) {
        if (!resaFormModal) return;
        const resaId = row.getAttribute('data-resa-id');
        const clientName = row.querySelector('.client-meta strong').textContent;
        const phone = row.querySelector('.client-phone').textContent.replace(/[^0-9+ ]/g, '').trim();

        if (resaEditId) resaEditId.value = resaId;
        if (resaModalTitle) resaModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square text-green"></i> Modifier Réservation ${resaId}`;
        if (resaClientNameInput) resaClientNameInput.value = clientName;
        if (resaPhoneInput) resaPhoneInput.value = phone;

        resaFormModal.classList.add('active');
    }

    function closeResaModal() {
        if (resaFormModal) {
            resaFormModal.classList.remove('active');
        }
    }

    if (addNewResaBtn) addNewResaBtn.addEventListener('click', openAddResaModal);
    if (closeResaFormModalBtn) closeResaFormModalBtn.addEventListener('click', closeResaModal);
    if (cancelResaFormBtn) cancelResaFormBtn.addEventListener('click', closeResaModal);

    if (resaFormModal) {
        resaFormModal.addEventListener('click', (e) => {
            if (e.target === resaFormModal) closeResaModal();
        });
    }

    // Submit Reservation Form
    if (resaCrudForm) {
        resaCrudForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEdit = !!resaEditId.value;
            const clientName = resaClientNameInput.value.trim();
            const phone = resaPhoneInput.value.trim();
            const email = resaEmailInput ? resaEmailInput.value.trim() : 'client@gmail.com';
            const guests = resaGuestsInput ? resaGuestsInput.value : '2 Personnes';
            const date = resaDateInput ? resaDateInput.value : new Date().toISOString().split('T')[0];
            const time = resaTimeInput ? resaTimeInput.value : '20:00';
            const table = resaTableInput ? resaTableInput.value : 'Table #08 (VIP)';
            const status = resaStatusInput ? resaStatusInput.value : 'pending';
            const notes = resaNotesInput ? resaNotesInput.value.trim() : 'Réservation directe admin';

            const initials = clientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CL';

            if (isEdit) {
                const row = document.querySelector(`.resa-row[data-resa-id="${resaEditId.value}"]`);
                if (row) {
                    row.querySelector('.client-meta strong').textContent = clientName;
                    row.querySelector('.client-phone').innerHTML = `<i class="fa-solid fa-phone text-green"></i> ${phone}`;
                    showToast(`Réservation ${resaEditId.value} mise à jour !`);
                }
            } else {
                nextResaNum++;
                const newResaId = `#RES-${nextResaNum}`;
                const newRow = document.createElement('tr');
                newRow.className = 'resa-row';
                newRow.setAttribute('data-resa-id', newResaId);
                newRow.setAttribute('data-resa-status', status);

                let statusBadgeHTML = '<span class="order-status-badge status-pending"><i class="fa-solid fa-hourglass-half"></i> En Attente</span>';
                if (status === 'confirmed') statusBadgeHTML = '<span class="order-status-badge status-completed"><i class="fa-solid fa-circle-check"></i> Confirmée</span>';
                if (status === 'seated') statusBadgeHTML = '<span class="order-status-badge status-seated"><i class="fa-solid fa-chair"></i> Client Installé</span>';

                newRow.innerHTML = `
                    <td>
                        <div class="order-id-badge">
                            <strong>${newResaId}</strong>
                            <span class="sub-channel online"><i class="fa-solid fa-globe"></i> Formulaire Web</span>
                        </div>
                    </td>
                    <td>
                        <div class="client-meta">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="avatar-circle-sm green">${initials}</div>
                                <div>
                                    <strong>${clientName}</strong>
                                    <span class="client-phone"><i class="fa-solid fa-phone text-green"></i> ${phone}</span>
                                    <span class="client-addr"><i class="fa-solid fa-envelope text-blue"></i> ${email}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <strong style="color: #FFF; font-size: 13px;"><i class="fa-solid fa-clock text-green"></i> ${date}, ${time}</strong>
                            <span class="time-ago">Nouveau</span>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span class="guests-pill"><i class="fa-solid fa-user-group text-green"></i> ${guests}</span>
                            <span class="table-badge vip"><i class="fa-solid fa-utensils"></i> ${table}</span>
                        </div>
                    </td>
                    <td>
                        <div class="resa-notes-box">
                            <i class="fa-solid fa-note-sticky text-orange"></i> <span>${notes || 'Aucune note'}</span>
                        </div>
                    </td>
                    <td>${statusBadgeHTML}</td>
                    <td style="text-align: right;">
                        <div class="order-action-btns">
                            <button class="order-btn cycle-resa-btn" title="Changer statut" data-id="${newResaId}"><i class="fa-solid fa-check text-green"></i></button>
                            <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" class="order-btn" title="Contacter WhatsApp"><i class="fa-brands fa-whatsapp text-green"></i></a>
                            <button class="order-btn edit-resa-btn" title="Modifier" data-id="${newResaId}"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="order-btn delete-resa-btn" title="Annuler" data-id="${newResaId}"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                `;

                if (resaTableBody) resaTableBody.prepend(newRow);
                showToast(`Nouvelle réservation ${newResaId} ajoutée !`);
            }

            closeResaModal();
            updateResaKpis();
            filterReservations();
        });
    }

    /* ==========================================================================
       15. Offres & Promotions Management System
       ========================================================================== */
    const offersGridContainer = document.getElementById('offersGridContainer');
    const offerSearchInput = document.getElementById('offerSearchInput');
    const offerPillBtns = document.querySelectorAll('.offer-pill-btn');
    const addNewOfferBtn = document.getElementById('addNewOfferBtn');
    const offerFormModal = document.getElementById('offerFormModal');
    const closeOfferFormModalBtn = document.getElementById('closeOfferFormModalBtn');
    const cancelOfferFormBtn = document.getElementById('cancelOfferFormBtn');
    const offerCrudForm = document.getElementById('offerCrudForm');

    const offerTitleInput = document.getElementById('offerTitleInput');
    const offerCodeInput = document.getElementById('offerCodeInput');
    const offerDiscountInput = document.getElementById('offerDiscountInput');
    const offerCategoryInput = document.getElementById('offerCategoryInput');
    const offerExpiryInput = document.getElementById('offerExpiryInput');
    const offerStatusInput = document.getElementById('offerStatusInput');
    const offerImgInput = document.getElementById('offerImgInput');
    const offerDescInput = document.getElementById('offerDescInput');
    const offerEditId = document.getElementById('offerEditId');

    let activeOfferCategory = 'all';

    // Copy Promo Code function (Global window helper)
    window.copyPromoCode = function(code) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                showToast(`Code PROMO "${code}" copié dans le presse-papier ! 🚀`);
            }).catch(() => {
                showToast(`Code PROMO "${code}" copié !`);
            });
        } else {
            showToast(`Code PROMO "${code}" copié !`);
        }
    };

    // Filter offers by category pills & search text
    offerPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            offerPillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeOfferCategory = btn.getAttribute('data-offer-cat');
            filterOffers();
        });
    });

    if (offerSearchInput) {
        offerSearchInput.addEventListener('input', filterOffers);
    }

    function filterOffers() {
        const query = offerSearchInput ? offerSearchInput.value.toLowerCase().trim() : '';
        const cards = document.querySelectorAll('.offer-card-creative');

        cards.forEach(card => {
            const cat = card.getAttribute('data-offer-cat');
            const text = card.textContent.toLowerCase();

            const matchesCategory = (activeOfferCategory === 'all' || cat === activeOfferCategory);
            const matchesQuery = (!query || text.includes(query));

            if (matchesCategory && matchesQuery) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Update Offer KPIs
    function updateOfferKpis() {
        const cards = document.querySelectorAll('.offer-card-creative');
        const total = cards.length;
        let activeCount = 0;

        cards.forEach(card => {
            const statusBadge = card.querySelector('.order-status-badge');
            if (statusBadge && (statusBadge.classList.contains('status-completed') || statusBadge.textContent.toLowerCase().includes('active'))) {
                activeCount++;
            }
        });

        const kpiActive = document.getElementById('kpiActiveOffers');
        if (kpiActive) kpiActive.textContent = activeCount;

        // Pills
        const pAll = document.querySelector('.offer-pill-btn[data-offer-cat="all"]');
        if (pAll) pAll.textContent = `Toutes les Offres (${total})`;
    }

    updateOfferKpis();

    // Delegated Click Handling for Offer Cards (Edit, Toggle Status, Delete)
    if (offersGridContainer) {
        offersGridContainer.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-offer-btn');
            const toggleBtn = e.target.closest('.toggle-offer-btn');
            const deleteBtn = e.target.closest('.delete-offer-btn');

            if (editBtn) {
                const card = editBtn.closest('.offer-card-creative');
                if (card) openEditOfferModal(card);
            } else if (toggleBtn) {
                const card = toggleBtn.closest('.offer-card-creative');
                if (card) toggleOfferStatus(card);
            } else if (deleteBtn) {
                const card = deleteBtn.closest('.offer-card-creative');
                if (card) deleteOfferCard(card);
            }
        });
    }

    function toggleOfferStatus(card) {
        const title = card.querySelector('.offer-card-title').textContent;
        const statusBadge = card.querySelector('.order-status-badge');
        const toggleBtn = card.querySelector('.toggle-offer-btn');

        const isActive = statusBadge && statusBadge.classList.contains('status-completed');

        if (isActive) {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-pending';
                statusBadge.innerHTML = '<i class="fa-solid fa-pause"></i> Inactive';
            }
            if (toggleBtn) {
                toggleBtn.setAttribute('title', 'Activer l\'offre');
                toggleBtn.innerHTML = '<i class="fa-solid fa-play text-green"></i>';
            }
            showToast(`Offre "${title}" mise en pause ⏸️`);
        } else {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-completed';
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Active';
            }
            if (toggleBtn) {
                toggleBtn.setAttribute('title', 'Pauser l\'offre');
                toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            }
            showToast(`Offre "${title}" activée 🟢`);
        }

        updateOfferKpis();
    }

    function deleteOfferCard(card) {
        const title = card.querySelector('.offer-card-title').textContent;
        if (confirm(`Voulez-vous vraiment supprimer l'offre "${title}" ?`)) {
            card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                updateOfferKpis();
                showToast(`Offre "${title}" supprimée.`);
            }, 400);
        }
    }

    // Modal Handlers (Create & Edit)
    function openAddOfferModal() {
        if (!offerFormModal) return;
        if (offerCrudForm) offerCrudForm.reset();
        if (offerEditId) offerEditId.value = '';
        const offerModalTitle = document.getElementById('offerModalTitle');
        if (offerModalTitle) offerModalTitle.innerHTML = '<i class="fa-solid fa-tags text-green"></i> Publier une Nouvelle Offre / Promotion';

        if (offerExpiryInput) {
            offerExpiryInput.value = '7j/7 ou Tous les Vendredis';
        }

        offerFormModal.classList.add('active');
        offerFormModal.style.display = 'flex';
        offerFormModal.style.opacity = '1';
        offerFormModal.style.visibility = 'visible';
        offerFormModal.style.pointerEvents = 'auto';
    }
    window.openAddOfferModal = openAddOfferModal;

    function openEditOfferModal(card) {
        if (!offerFormModal) return;

        const offerId = card.getAttribute('data-offer-id') || ('OFF-' + Math.floor(Math.random() * 1000));
        const title = card.querySelector('.offer-card-title') ? card.querySelector('.offer-card-title').textContent : '';
        const desc = card.querySelector('.offer-card-desc') ? card.querySelector('.offer-card-desc').textContent : '';
        const bonus = card.querySelector('.code-badge') ? card.querySelector('.code-badge').textContent : '';
        const discount = card.querySelector('.offer-discount-badge') ? card.querySelector('.offer-discount-badge').textContent : '';
        const expiry = card.querySelector('.offer-expiry') ? card.querySelector('.offer-expiry').textContent.trim() : '';
        const img = card.querySelector('.offer-card-img') ? card.querySelector('.offer-card-img').src : '';
        const category = card.getAttribute('data-offer-cat') || 'freebie';

        if (offerEditId) offerEditId.value = offerId;
        const offerModalTitle = document.getElementById('offerModalTitle');
        if (offerModalTitle) offerModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square text-green"></i> Modifier l'Offre "${title}"`;

        if (offerTitleInput) offerTitleInput.value = title;
        const bonusInput = document.getElementById('offerBonusInput');
        if (bonusInput) bonusInput.value = bonus;
        if (offerDiscountInput) offerDiscountInput.value = discount;
        if (offerCategoryInput) offerCategoryInput.value = category;
        if (offerExpiryInput) offerExpiryInput.value = expiry;
        if (offerImgInput) offerImgInput.value = img;
        if (offerDescInput) offerDescInput.value = desc;

        card.setAttribute('data-editing', 'true');

        offerFormModal.classList.add('active');
        offerFormModal.style.display = 'flex';
        offerFormModal.style.opacity = '1';
        offerFormModal.style.visibility = 'visible';
        offerFormModal.style.pointerEvents = 'auto';
    }

    function closeOfferModal() {
        if (offerFormModal) {
            offerFormModal.classList.remove('active');
            offerFormModal.style.display = 'none';
            offerFormModal.style.opacity = '0';
            offerFormModal.style.visibility = 'hidden';
            offerFormModal.style.pointerEvents = 'none';
        }
        document.querySelectorAll('.offer-card-creative[data-editing="true"]').forEach(c => c.removeAttribute('data-editing'));
    }
    window.closeOfferModal = closeOfferModal;

    if (addNewOfferBtn) addNewOfferBtn.addEventListener('click', openAddOfferModal);
    if (closeOfferFormModalBtn) closeOfferFormModalBtn.addEventListener('click', closeOfferModal);
    if (cancelOfferFormBtn) cancelOfferFormBtn.addEventListener('click', closeOfferModal);

    if (offerFormModal) {
        offerFormModal.addEventListener('click', (e) => {
            if (e.target === offerFormModal) closeOfferModal();
        });
    }

    // Submit Offer Form
    if (offerCrudForm) {
        offerCrudForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isEdit = !!(offerEditId && offerEditId.value);
            const title = offerTitleInput ? offerTitleInput.value.trim() : 'Nouvelle Offre';
            const bonusInput = document.getElementById('offerBonusInput');
            const bonus = bonusInput ? bonusInput.value.trim() : '🥤 Monada Offerte';
            const discount = offerDiscountInput ? offerDiscountInput.value.trim() : 'Prix Spécial';
            const category = offerCategoryInput ? offerCategoryInput.value : 'freebie';
            const expiry = offerExpiryInput ? offerExpiryInput.value.trim() : 'Offre Permanente';
            const status = offerStatusInput ? offerStatusInput.value : 'active';
            const img = (offerImgInput && offerImgInput.value.trim()) ? offerImgInput.value.trim() : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
            const desc = (offerDescInput && offerDescInput.value.trim()) ? offerDescInput.value.trim() : 'Profitez de notre offre spéciale au restaurant.';

            let catBadgeLabel = 'CADEAU GRATUIT 🥤';
            let catBadgeClass = 'combo';
            if (category === 'friday') { catBadgeLabel = 'SPÉCIAL VENDREDI 🇲🇦'; catBadgeClass = 'flash'; }
            else if (category === 'combo') { catBadgeLabel = 'FORMULE COMBO 🎁'; catBadgeClass = 'delivery'; }
            else if (category === 'delivery') { catBadgeLabel = 'LIVRAISON SPÉCIALE 🚀'; catBadgeClass = 'vip'; }

            let statusHTML = '<span class="order-status-badge status-completed"><i class="fa-solid fa-circle-check"></i> Active</span>';
            if (status === 'inactive') {
                statusHTML = '<span class="order-status-badge status-pending"><i class="fa-solid fa-pause"></i> Inactive</span>';
            }

            if (isEdit) {
                const editingCard = document.querySelector(`.offer-card-creative[data-editing="true"]`) || document.querySelector(`.offer-card-creative[data-offer-id="${offerEditId.value}"]`);
                if (editingCard) {
                    editingCard.setAttribute('data-offer-cat', category);
                    const cardImg = editingCard.querySelector('.offer-card-img');
                    if (cardImg) cardImg.src = img;
                    const typeBadge = editingCard.querySelector('.offer-type-badge');
                    if (typeBadge) { typeBadge.className = `offer-type-badge ${catBadgeClass}`; typeBadge.innerHTML = catBadgeLabel; }
                    const discBadge = editingCard.querySelector('.offer-discount-badge');
                    if (discBadge) discBadge.textContent = discount;
                    const cardTitle = editingCard.querySelector('.offer-card-title');
                    if (cardTitle) cardTitle.textContent = title;
                    const cardDesc = editingCard.querySelector('.offer-card-desc');
                    if (cardDesc) cardDesc.textContent = desc;
                    const codeBadge = editingCard.querySelector('.code-badge');
                    if (codeBadge) codeBadge.innerHTML = bonus;
                    const cardExpiry = editingCard.querySelector('.offer-expiry');
                    if (cardExpiry) cardExpiry.innerHTML = `<i class="fa-solid fa-clock text-orange"></i> ${expiry}`;

                    showToast(`Offre "${title}" mise à jour avec succès ! ✏️`);
                }
            } else {
                const newOfferId = 'OFF-' + Math.floor(Math.random() * 900 + 100);
                const newCard = document.createElement('div');
                newCard.className = 'offer-card-creative';
                newCard.setAttribute('data-offer-id', newOfferId);
                newCard.setAttribute('data-offer-cat', category);

                newCard.innerHTML = `
                    <div class="offer-card-img-wrapper">
                        <img src="${img}" alt="${title}" class="offer-card-img">
                        <span class="offer-type-badge ${catBadgeClass}">${catBadgeLabel}</span>
                        <span class="offer-discount-badge">${discount}</span>
                    </div>
                    <div class="offer-card-body">
                        <div class="offer-header-info">
                            <div>
                                <h3 class="offer-card-title">${title}</h3>
                                <p class="offer-card-desc">${desc}</p>
                            </div>
                        </div>
                        <div class="offer-code-bar">
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block; font-weight: 700; text-transform: uppercase;">BONUS CADEAU</span>
                                <span class="code-badge" style="color: #10B981;">${bonus}</span>
                            </div>
                            <button class="copy-code-btn" onclick="showToast('Offre \"${title.replace(/'/g, "\\'")}\" Activée ! 🎉')">
                                <i class="fa-solid fa-circle-check"></i> Activer
                            </button>
                        </div>
                        <div class="offer-footer-meta">
                            <div class="offer-expiry">
                                <i class="fa-solid fa-clock text-orange"></i> ${expiry}
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${statusHTML}
                                <div class="offer-actions-btns">
                                    <button class="offer-action-btn edit-offer-btn" title="Modifier l'offre" data-id="${newOfferId}"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button class="offer-action-btn toggle-offer-btn" title="Activer / Pauser" data-id="${newOfferId}"><i class="fa-solid fa-pause"></i></button>
                                    <button class="offer-action-btn delete-offer-btn" title="Supprimer l'offre" data-id="${newOfferId}"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                if (offersGridContainer) offersGridContainer.prepend(newCard);
                showToast(`Nouvelle offre "${title}" publiée avec succès ! 🎉`);
            }

            closeOfferModal();
            updateOfferKpis();
            filterOffers();
        });
    }

    /* ==========================================================================
       16. Messages Client Contact Page Management System
       ========================================================================== */
    const messagesTableBody = document.getElementById('messagesTableBody');
    const msgSearchInput = document.getElementById('msgSearchInput');
    const msgDateSelect = document.getElementById('msgDateSelect');
    const msgPillBtns = document.querySelectorAll('.msg-pill-btn');
    const msgDetailModal = document.getElementById('msgDetailModal');
    const closeMsgDetailModalBtn = document.getElementById('closeMsgDetailModalBtn');
    const closeMsgModalFooterBtn = document.getElementById('closeMsgModalFooterBtn');
    const msgDetailBody = document.getElementById('msgDetailBody');
    const msgWhatsappReplyBtn = document.getElementById('msgWhatsappReplyBtn');

    let activeMsgStatus = 'all';

    // Status Pill Filter Handling
    msgPillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            msgPillBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeMsgStatus = btn.getAttribute('data-msg-status');
            filterMessages();
        });
    });

    if (msgSearchInput) {
        msgSearchInput.addEventListener('input', filterMessages);
    }

    if (msgDateSelect) {
        msgDateSelect.addEventListener('change', () => {
            filterMessages();
            const label = msgDateSelect.options[msgDateSelect.selectedIndex].text;
            showToast(`Filtre Messages Date : ${label}`);
        });
    }

    function filterMessages() {
        const query = msgSearchInput ? msgSearchInput.value.toLowerCase().trim() : '';
        const selectedDateFilter = msgDateSelect ? msgDateSelect.value : 'today';
        const rows = document.querySelectorAll('.msg-row');

        rows.forEach(row => {
            const status = row.getAttribute('data-msg-status');
            const text = row.textContent.toLowerCase();

            const matchesStatus = (activeMsgStatus === 'all' || status === activeMsgStatus);
            const matchesQuery = (!query || text.includes(query));

            let matchesDate = true;
            if (selectedDateFilter === 'today') {
                matchesDate = text.includes("aujourd'hui") || text.includes("reçu il y a");
            } else if (selectedDateFilter === 'yesterday') {
                matchesDate = text.includes("hier");
            } else if (selectedDateFilter === 'week') {
                matchesDate = text.includes("aujourd'hui") || text.includes("hier") || text.includes("semaine");
            } else if (selectedDateFilter === 'all') {
                matchesDate = true;
            }

            if (matchesStatus && matchesQuery && matchesDate) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Update Message KPIs & Badges
    function updateMsgKpis() {
        const rows = document.querySelectorAll('#messagesTableBody .msg-row');
        const total = rows.length;
        const unread = document.querySelectorAll('#messagesTableBody .msg-row[data-msg-status="unread"]').length;
        const read = document.querySelectorAll('#messagesTableBody .msg-row[data-msg-status="read"]').length;

        const kpiTotal = document.getElementById('kpiTotalMsg');
        const kpiUnread = document.getElementById('kpiUnreadMsg');
        const kpiWebForm = document.getElementById('kpiWebFormMsg');
        const kpiReplied = document.getElementById('kpiRepliedMsg');
        const sidebarMsgBadge = document.getElementById('sidebarMsgBadge');

        if (kpiTotal) kpiTotal.textContent = `${total} Messages`;
        if (kpiUnread) kpiUnread.textContent = `${unread} Nouveaux`;
        if (kpiWebForm) kpiWebForm.textContent = `${total} Formulaires`;
        if (kpiReplied) kpiReplied.textContent = `${read} Traités`;
        if (sidebarMsgBadge) sidebarMsgBadge.textContent = unread;

        // Pills
        const pAll = document.querySelector('.msg-pill-btn[data-msg-status="all"]');
        const pUnread = document.querySelector('.msg-pill-btn[data-msg-status="unread"]');
        const pRead = document.querySelector('.msg-pill-btn[data-msg-status="read"]');

        if (pAll) pAll.textContent = `Tous les Messages (${total})`;
        if (pUnread) pUnread.textContent = `🔴 Non Lus (${unread})`;
        if (pRead) pRead.textContent = `🟢 Traités / Répondus (${read})`;
    }

    updateMsgKpis();

    // Table Delegated Click Listener
    if (messagesTableBody) {
        messagesTableBody.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-msg-btn');
            const cycleBtn = e.target.closest('.cycle-msg-btn');
            const deleteBtn = e.target.closest('.delete-msg-btn');

            if (viewBtn) {
                const row = viewBtn.closest('.msg-row');
                if (row) openMsgDetailModal(row);
            } else if (cycleBtn) {
                const row = cycleBtn.closest('.msg-row');
                if (row) cycleMsgStatus(row);
            } else if (deleteBtn) {
                const row = deleteBtn.closest('.msg-row');
                if (row) deleteMsgRow(row);
            }
        });
    }

    function openMsgDetailModal(row) {
        if (!msgDetailModal || !msgDetailBody) return;

        const msgId = row.getAttribute('data-msg-id');
        const clientName = row.querySelector('.client-meta strong').textContent;
        const phone = row.querySelector('.client-phone').textContent.replace(/[^0-9+ ]/g, '').trim();
        const email = row.querySelector('.client-addr').textContent.replace(/[^a-zA-Z0-9@._-]/g, '').trim();
        const subjectBadge = row.querySelector('td:nth-child(2)').innerHTML;
        const messageText = row.querySelector('.resa-notes-box span').textContent;
        const time = row.querySelector('td:nth-child(4) strong').textContent;

        msgDetailBody.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 12px;">
                <div>
                    <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">EXPÉDITEUR</span>
                    <h4 style="color: #FFF; font-size: 16px; margin: 2px 0;">${clientName}</h4>
                </div>
                <div>${subjectBadge}</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
                <div><i class="fa-solid fa-phone text-green"></i> <strong>Téléphone:</strong> ${phone}</div>
                <div><i class="fa-solid fa-envelope text-blue"></i> <strong>Email:</strong> ${email}</div>
                <div><i class="fa-solid fa-clock text-purple"></i> <strong>Date/Heure:</strong> ${time}</div>
                <div><i class="fa-solid fa-globe text-green"></i> <strong>Origine:</strong> Formulaire Contact Site</div>
            </div>
            <div class="msg-body-preview" style="margin-top: 10px;">
                <strong style="color: var(--primary-green); display: block; margin-bottom: 6px;"><i class="fa-solid fa-message"></i> Contenu du Message :</strong>
                <p style="color: #FFF; margin: 0; line-height: 1.5; font-size: 13px;">"${messageText}"</p>
            </div>
        `;

        if (msgWhatsappReplyBtn) {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            msgWhatsappReplyBtn.setAttribute('href', `https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(clientName)},%20suite%20%C3%A0%20votre%20message%20sur%20notre%20site...`);
        }

        // Mark as read when viewed
        row.setAttribute('data-msg-status', 'read');
        const statusBadge = row.querySelector('.order-status-badge');
        if (statusBadge) {
            statusBadge.className = 'order-status-badge status-completed';
            statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Traité';
        }
        updateMsgKpis();

        msgDetailModal.classList.add('active');
        msgDetailModal.style.display = 'flex';
        msgDetailModal.style.opacity = '1';
        msgDetailModal.style.visibility = 'visible';
        msgDetailModal.style.pointerEvents = 'auto';
    }

    function closeMsgDetailModal() {
        if (msgDetailModal) {
            msgDetailModal.classList.remove('active');
            msgDetailModal.style.display = 'none';
            msgDetailModal.style.opacity = '0';
            msgDetailModal.style.visibility = 'hidden';
            msgDetailModal.style.pointerEvents = 'none';
        }
    }

    if (closeMsgDetailModalBtn) closeMsgDetailModalBtn.addEventListener('click', closeMsgDetailModal);
    if (closeMsgModalFooterBtn) closeMsgModalFooterBtn.addEventListener('click', closeMsgDetailModal);

    if (msgDetailModal) {
        msgDetailModal.addEventListener('click', (e) => {
            if (e.target === msgDetailModal) closeMsgDetailModal();
        });
    }

    function cycleMsgStatus(row) {
        const msgId = row.getAttribute('data-msg-id');
        const currentStatus = row.getAttribute('data-msg-status');
        const newStatus = (currentStatus === 'unread') ? 'read' : 'unread';

        row.setAttribute('data-msg-status', newStatus);

        const statusBadge = row.querySelector('.order-status-badge');
        const cycleBtn = row.querySelector('.cycle-msg-btn');

        if (newStatus === 'read') {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-completed';
                statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Traité';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Remettre en Non Lu');
                cycleBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
            }
            showToast(`Message ${msgId} marqué comme Traité ✅`);
        } else {
            if (statusBadge) {
                statusBadge.className = 'order-status-badge status-pending';
                statusBadge.innerHTML = '<i class="fa-solid fa-envelope"></i> Non Lu';
            }
            if (cycleBtn) {
                cycleBtn.setAttribute('title', 'Marquer comme Traité');
                cycleBtn.innerHTML = '<i class="fa-solid fa-check text-green"></i>';
            }
            showToast(`Message ${msgId} remis en Non Lu 📩`);
        }

        updateMsgKpis();
        filterMessages();
    }

    function deleteMsgRow(row) {
        const msgId = row.getAttribute('data-msg-id');
        if (confirm(`Voulez-vous vraiment supprimer le message ${msgId} ?`)) {
            row.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
            row.style.transform = 'scale(0.8)';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
                updateMsgKpis();
                showToast(`Message ${msgId} supprimé.`);
            }, 400);
        }
    }

    /* ==========================================================================
       17. Admin Profile & System Settings Handlers
       ========================================================================== */
    const adminAvatarFileInput = document.getElementById('adminAvatarFileInput');
    if (adminAvatarFileInput) {
        adminAvatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const heroImg = document.getElementById('adminHeroAvatarImg');
                    const sidebarAvatars = document.querySelectorAll('.user-avatar');
                    if (heroImg) heroImg.src = event.target.result;
                    sidebarAvatars.forEach(img => img.src = event.target.result);
                    showToast("Photo de profil mise à jour avec succès ! 📷");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    window.togglePassVisibility = function(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.className = 'fa-solid fa-eye-slash text-green';
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.className = 'fa-solid fa-eye';
            }
        }
    };

    // Fetch real Admin Profile & Settings from Neon PostgreSQL Cloud
    function loadAdminSettingsFromNeon() {
        const apiPath = window.location.pathname.includes('/admin') ? '../api/admin.php' : 'api/admin.php';
        fetch(apiPath)
            .then(res => res.json())
            .then(data => {
                if (data && data.status === 'success') {
                    const adm = data.admin || {};
                    const sets = data.settings || {};

                    const nameInput = document.getElementById('adminNameInput');
                    const emailInput = document.getElementById('adminEmailInput');
                    const phoneInput = document.getElementById('adminPhoneInput');
                    const roleInput = document.getElementById('adminRoleInput');
                    const bioInput = document.getElementById('adminBioInput');
                    const twoFaToggle = document.getElementById('twoFaToggle');
                    const loginAlertsToggle = document.getElementById('loginAlertsToggle');

                    if (nameInput && adm.full_name) nameInput.value = adm.full_name;
                    if (emailInput && adm.email) emailInput.value = adm.email;
                    if (phoneInput && adm.phone) phoneInput.value = adm.phone;
                    if (roleInput && adm.role_title) roleInput.value = adm.role_title;
                    if (bioInput && adm.bio) bioInput.value = adm.bio;
                    if (twoFaToggle && adm.two_fa_enabled !== undefined) twoFaToggle.checked = Boolean(adm.two_fa_enabled);
                    if (loginAlertsToggle && adm.login_alerts_enabled !== undefined) loginAlertsToggle.checked = Boolean(adm.login_alerts_enabled);

                    const heroName = document.getElementById('adminHeroName');
                    const heroEmail = document.getElementById('adminHeroEmailDisplay');
                    const heroPhone = document.getElementById('adminHeroPhoneDisplay');
                    const heroImg = document.getElementById('adminHeroAvatarImg');
                    const sidebarUserNames = document.querySelectorAll('.sidebar-user-card .user-name');
                    const sidebarInitials = document.querySelector('.sidebar-user-card .user-avatar-initials');

                    if (heroName && adm.full_name) heroName.textContent = adm.full_name;
                    if (heroEmail && adm.email) heroEmail.textContent = adm.email;
                    if (heroPhone && adm.phone) heroPhone.textContent = adm.phone;
                    if (heroImg && adm.avatar_url) heroImg.src = adm.avatar_url;
                    if (sidebarUserNames && adm.full_name) sidebarUserNames.forEach(s => s.textContent = adm.full_name);
                    if (sidebarInitials && adm.full_name) {
                        const inits = adm.full_name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
                        sidebarInitials.textContent = inits;
                    }

                    // Socials & Restaurant Settings
                    const ig = document.getElementById('adminInstagramInput');
                    const fb = document.getElementById('adminFacebookInput');
                    const tk = document.getElementById('adminTiktokInput');
                    const wa = document.getElementById('adminWhatsappLinkInput');
                    const web = document.getElementById('adminWebsiteInput');
                    const mp = document.getElementById('adminMapsInput');

                    if (ig && sets.instagram) ig.value = sets.instagram;
                    if (fb && sets.facebook) fb.value = sets.facebook;
                    if (tk && sets.tiktok) tk.value = sets.tiktok;
                    if (wa && sets.whatsapp) wa.value = sets.whatsapp;
                    if (web && sets.website) web.value = sets.website;
                    if (mp && sets.maps) mp.value = sets.maps;

                    document.querySelectorAll('.social-input-wrapper').forEach(wrapper => {
                        const input = wrapper.querySelector('input');
                        const link = wrapper.querySelector('.social-test-btn');
                        if (input && link) link.href = input.value || '#0';
                    });
                }
            })
            .catch(err => console.warn('Erreur chargement paramètres Neon:', err));
    }
    loadAdminSettingsFromNeon();

    window.saveAdminSettings = function(e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('adminNameInput');
        const emailInput = document.getElementById('adminEmailInput');
        const phoneInput = document.getElementById('adminPhoneInput');
        const roleInput = document.getElementById('adminRoleInput');
        const bioInput = document.getElementById('adminBioInput');
        const currentPass = document.getElementById('adminCurrentPassInput');
        const newPass = document.getElementById('adminNewPassInput');
        const confirmPass = document.getElementById('adminConfirmPassInput');
        const twoFaToggle = document.getElementById('twoFaToggle');
        const loginAlertsToggle = document.getElementById('loginAlertsToggle');

        // Social Media inputs
        const instagramInput = document.getElementById('adminInstagramInput');
        const facebookInput = document.getElementById('adminFacebookInput');
        const tiktokInput = document.getElementById('adminTiktokInput');
        const whatsappInput = document.getElementById('adminWhatsappLinkInput');
        const websiteInput = document.getElementById('adminWebsiteInput');
        const mapsInput = document.getElementById('adminMapsInput');

        if (newPass && newPass.value && confirmPass && newPass.value !== confirmPass.value) {
            showToast("Les nouveaux mots de passe ne correspondent pas !");
            return;
        }

        const nameVal = nameInput ? nameInput.value.trim() : 'Emma Johnson';
        const emailVal = emailInput ? emailInput.value.trim() : 'emma.johnson@flavorist.ma';
        const phoneVal = phoneInput ? phoneInput.value.trim() : '+212 661-998877';
        const roleVal = roleInput ? roleInput.value.trim() : 'Chef Exécutif & Admin Système';
        const bioVal = bioInput ? bioInput.value.trim() : '';

        const socials = {
            instagram: instagramInput ? instagramInput.value.trim() : '',
            facebook: facebookInput ? facebookInput.value.trim() : '',
            tiktok: tiktokInput ? tiktokInput.value.trim() : '',
            whatsapp: whatsappInput ? whatsappInput.value.trim() : '',
            website: websiteInput ? websiteInput.value.trim() : '',
            maps: mapsInput ? mapsInput.value.trim() : ''
        };

        // Enregistrer dans Neon PostgreSQL Cloud via API
        const payload = {
            full_name: nameVal,
            email: emailVal,
            phone: phoneVal,
            role_title: roleVal,
            bio: bioVal,
            two_fa_enabled: twoFaToggle ? twoFaToggle.checked : true,
            login_alerts_enabled: loginAlertsToggle ? loginAlertsToggle.checked : true,
            settings: socials
        };

        if (newPass && newPass.value) {
            payload.new_password = newPass.value;
            if (currentPass && currentPass.value) payload.current_password = currentPass.value;
        }

        const apiPath = window.location.pathname.includes('/admin') ? '../api/admin.php' : 'api/admin.php';
        fetch(apiPath, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json()).then(res => {
            if (res.status === 'success') {
                showToast("Paramètres & Sécurité enregistrés dans Neon PostgreSQL ! 🛡️");
            } else {
                showToast(res.message || "Erreur de mise à jour");
            }
        }).catch(err => {
            console.warn('Erreur sauvegarde admin Neon', err);
            showToast("Paramètres enregistrés localement");
        });

        // Update displays
        const heroName = document.getElementById('adminHeroName');
        const heroEmail = document.getElementById('adminHeroEmailDisplay');
        const heroPhone = document.getElementById('adminHeroPhoneDisplay');
        const sidebarUserNames = document.querySelectorAll('.sidebar-user-card .user-name');
        const sidebarInitials = document.querySelector('.sidebar-user-card .user-avatar-initials');

        if (heroName) heroName.textContent = nameVal;
        if (heroEmail) heroEmail.textContent = emailVal;
        if (heroPhone) heroPhone.textContent = phoneVal;
        sidebarUserNames.forEach(span => span.textContent = nameVal);
        if (sidebarInitials) {
            const inits = nameVal.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
            sidebarInitials.textContent = inits;
        }

        if (newPass && newPass.value) {
            newPass.value = '';
            if (confirmPass) confirmPass.value = '';
        }
    };

    window.resetAdminSettingsForm = function() {
        const defaults = {
            instagram: 'https://instagram.com/flavorist.maroc',
            facebook: 'https://facebook.com/flavorist.official',
            tiktok: 'https://tiktok.com/@flavorist_maroc',
            whatsapp: 'https://wa.me/212661998877',
            website: 'https://flavorist.ma',
            maps: 'https://maps.google.com/?q=flavorist+rabat'
        };
        const instagramInput = document.getElementById('adminInstagramInput');
        const facebookInput = document.getElementById('adminFacebookInput');
        const tiktokInput = document.getElementById('adminTiktokInput');
        const whatsappInput = document.getElementById('adminWhatsappLinkInput');
        const websiteInput = document.getElementById('adminWebsiteInput');
        const mapsInput = document.getElementById('adminMapsInput');

        if (instagramInput) instagramInput.value = defaults.instagram;
        if (facebookInput) facebookInput.value = defaults.facebook;
        if (tiktokInput) tiktokInput.value = defaults.tiktok;
        if (whatsappInput) whatsappInput.value = defaults.whatsapp;
        if (websiteInput) websiteInput.value = defaults.website;
        if (mapsInput) mapsInput.value = defaults.maps;

        document.querySelectorAll('.social-input-wrapper').forEach(wrapper => {
            const input = wrapper.querySelector('input');
            const link = wrapper.querySelector('.social-test-btn');
            if (input && link) link.href = input.value || '#0';
        });

        showToast("Paramètres réinitialisés aux valeurs par défaut.");
    };

    // Live test button sync on typing
    (function initSocialMediaInputs() {
        document.querySelectorAll('.social-input-wrapper').forEach(wrapper => {
            const input = wrapper.querySelector('input');
            const link = wrapper.querySelector('.social-test-btn');
            if (input && link) {
                link.href = input.value || '#0';
                input.addEventListener('input', () => {
                    link.href = input.value || '#0';
                });
            }
        });
    })();
});

