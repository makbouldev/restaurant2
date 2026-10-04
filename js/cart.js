/* ==========================================================================
   REAL SHOPPING CART & ORDER ENGINE (FOORES RESTAURANT)
   Handles localStorage persistence, Add to Cart, Nav Dropdown,
   Cart Page, Checkout Form & Order Confirmation Summary.
   ========================================================================== */

(function () {
    'use strict';

    var CART_STORAGE_KEY = 'foores_cart_items';
    var LAST_ORDER_KEY = 'foores_last_order';

    // Get Cart items from localStorage
    function getCart() {
        try {
            var data = localStorage.getItem(CART_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading cart from localStorage', e);
            return [];
        }
    }

    function isTitleInCart(title) {
        if (!title) return false;
        var cart = getCart();
        var cleanT = title.trim().toLowerCase();
        return cart.some(function(item) {
            return item.title && item.title.trim().toLowerCase() === cleanT;
        });
    }

    function updateAllCartButtons() {
        var cart = getCart();
        var cartTitles = cart.map(function(item) { return item.title ? item.title.trim().toLowerCase() : ''; });

        var allBtns = document.querySelectorAll('.add_to_cart, .btn-add-creative, #lightboxAddToCartBtn');
        allBtns.forEach(function(btn) {
            var card = btn.closest('.creative-menu-card, .menu_item, .recipe-card-full, .lightbox-card-wrapper');
            var title = '';
            if (btn.id === 'lightboxAddToCartBtn') {
                title = document.getElementById('lightboxModalTitle') ? document.getElementById('lightboxModalTitle').textContent : '';
            } else if (card) {
                var titleEl = card.querySelector('.dish-title, h3, h4, h1');
                if (titleEl) title = titleEl.textContent;
            }

            if (title) {
                var isAdded = cartTitles.indexOf(title.trim().toLowerCase()) !== -1;
                if (isAdded) {
                    btn.classList.add('added-in-cart');
                    if (btn.id === 'lightboxAddToCartBtn') {
                        btn.innerHTML = '<i class="bi bi-check-lg"></i> Dans le Panier';
                    } else if (btn.classList.contains('btn-add-creative')) {
                        btn.innerHTML = '<i class="bi bi-check-lg"></i> Dans le Panier';
                    } else {
                        btn.innerHTML = '✓ Dans le Panier';
                    }
                } else {
                    btn.classList.remove('added-in-cart');
                    if (btn.id === 'lightboxAddToCartBtn') {
                        btn.innerHTML = '<i class="icon_cart"></i> Ajouter au Panier';
                    } else if (btn.classList.contains('btn-add-creative')) {
                        btn.innerHTML = '<i class="icon_cart"></i> Ajouter au Panier';
                    } else {
                        btn.innerHTML = 'Ajouter au Panier';
                    }
                }
            }
        });
    }

    // Save Cart items to localStorage
    function saveCart(cart) {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            updateNavCart();
            updateAllCartButtons();
            if (document.querySelector('.cart-list')) {
                renderCartPage();
            }
            if (document.getElementById('checkout-summary-list')) {
                renderCheckoutPage();
            }
        } catch (e) {
            console.error('Error saving cart to localStorage', e);
        }
    }

    // Format currency in DH
    function formatPrice(amount) {
        return Math.round(amount) + ' DH';
    }

    function areOptionsEqual(optA, optB) {
        if (!optA && !optB) return true;
        return JSON.stringify(optA || {}) === JSON.stringify(optB || {});
    }

    function formatOptionsText(selectedOptions) {
        if (!selectedOptions) return '';
        var parts = [];
        for (var key in selectedOptions) {
            if (selectedOptions.hasOwnProperty(key) && selectedOptions[key]) {
                parts.push(key + ': ' + selectedOptions[key]);
            }
        }
        return parts.join(' • ');
    }

    // Add item to cart
    function addToCart(item) {
        var cart = getCart();
        var existingIndex = -1;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].title === item.title && areOptionsEqual(cart[i].selectedOptions, item.selectedOptions)) {
                existingIndex = i;
                break;
            }
        }

        if (existingIndex > -1) {
            cart[existingIndex].quantity += (item.quantity || 1);
        } else {
            cart.push({
                id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                title: item.title,
                price: parseFloat(item.price),
                image: item.image || 'img/menu_items/1.jpg',
                quantity: item.quantity || 1,
                selectedOptions: item.selectedOptions || null
            });
        }

        saveCart(cart);
        showToast('"' + item.title + '" a été ajouté au panier !');
    }

    function openOptionsModal(item, onConfirm) {
        if (!item || !item.options || !Array.isArray(item.options) || item.options.length === 0) {
            if (typeof onConfirm === 'function') onConfirm(null);
            return;
        }

        var modal = document.getElementById('creativeDishOptionsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'creativeDishOptionsModal';
            modal.className = 'creative-options-overlay';
            modal.innerHTML = 
                '<div class="options-backdrop-close" onclick="window.FOORES_CART.closeOptionsModal()"></div>' +
                '<div class="options-card-wrapper">' +
                '   <button class="options-close-btn" onclick="window.FOORES_CART.closeOptionsModal()" title="Fermer">✕</button>' +
                '   <div class="options-header-split">' +
                '       <img id="optModalImage" src="" alt="Plat" class="opt-modal-img" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80\';">' +
                '       <div>' +
                '           <span class="opt-modal-badge" id="optModalCategory">✨ Gourmand</span>' +
                '           <h3 id="optModalTitle" class="opt-modal-title"></h3>' +
                '           <span id="optModalPrice" class="opt-modal-price"></span>' +
                '       </div>' +
                '   </div>' +
                '   <div class="options-body-content" id="optModalOptionsList"></div>' +
                '   <div class="options-footer-actions mt-3">' +
                '       <button type="button" class="btn-confirm-options" id="optModalConfirmBtn"><i class="bi bi-cart-plus-fill me-1"></i> Ajouter au Panier</button>' +
                '   </div>' +
                '</div>';
            document.body.appendChild(modal);

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeOptionsModal();
            });
        }

        document.getElementById('optModalImage').src = item.image || 'img/menu_items/1.jpg';
        document.getElementById('optModalTitle').textContent = item.title || 'Plat';
        document.getElementById('optModalCategory').textContent = item.category ? (CATEGORY_BADGES[item.category] || item.category) : '✨ Spécialité';
        document.getElementById('optModalPrice').textContent = formatPrice(item.price || 100);

        var listContainer = document.getElementById('optModalOptionsList');
        listContainer.innerHTML = '';

        var currentSelected = {};

        item.options.forEach(function(optGroup) {
            var groupDiv = document.createElement('div');
            groupDiv.className = 'opt-group-wrapper';
            
            var label = document.createElement('label');
            label.className = 'opt-group-title';
            
            var groupIcon = '✨';
            var nameLower = (optGroup.name || '').toLowerCase();
            if (nameLower.includes('taille') || nameLower.includes('format') || nameLower.includes('portion')) groupIcon = '📐';
            else if (nameLower.includes('sauce de base') || nameLower.includes('sauce / crème') || nameLower.includes('sauce au choix')) groupIcon = '🥫';
            else if (nameLower.includes('piment') || nameLower.includes('harissa') || nameLower.includes('piquante')) groupIcon = '🌶️';
            else if (nameLower.includes('cuisson')) groupIcon = '🔥';
            else if (nameLower.includes('fromage') || nameLower.includes('extra')) groupIcon = '🧀';
            else if (nameLower.includes('boisson') || nameLower.includes('glace')) groupIcon = '🥤';
            else if (nameLower.includes('accompagnement') || nameLower.includes('garniture') || nameLower.includes('frites')) groupIcon = '🍟';
            else if (nameLower.includes('topping') || nameLower.includes('nappage') || nameLower.includes('parfum')) groupIcon = '🍨';

            label.innerHTML = '<span>' + groupIcon + '</span> <strong>' + optGroup.name + '</strong>';
            groupDiv.appendChild(label);

            var pillsRow = document.createElement('div');
            pillsRow.className = 'opt-pills-row';

            var values = optGroup.values || [];
            if (values.length > 0) {
                currentSelected[optGroup.name] = values[0];
            }

            values.forEach(function(val, valIndex) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'opt-pill-btn' + (valIndex === 0 ? ' active' : '');
                btn.textContent = val;
                btn.onclick = function() {
                    pillsRow.querySelectorAll('.opt-pill-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    currentSelected[optGroup.name] = val;
                };
                pillsRow.appendChild(btn);
            });

            groupDiv.appendChild(pillsRow);
            listContainer.appendChild(groupDiv);
        });

        var confirmBtn = document.getElementById('optModalConfirmBtn');
        confirmBtn.onclick = function() {
            closeOptionsModal();
            if (typeof onConfirm === 'function') {
                onConfirm(currentSelected);
            }
        };

        modal.classList.add('active');
    }

    function closeOptionsModal() {
        var modal = document.getElementById('creativeDishOptionsModal');
        if (modal) modal.classList.remove('active');
    }

    // Add item to cart directly from DOM button
    function addToCartFromBtn(target, event, providedOptions) {
        if (event) {
            if (typeof event.preventDefault === 'function') event.preventDefault();
            if (typeof event.stopPropagation === 'function') event.stopPropagation();
            if (event._cartHandled) return;
            event._cartHandled = true;
        }
        if (!target) return;
        if (target._cartHandlingActive) return;
        target._cartHandlingActive = true;
        setTimeout(function() {
            try { delete target._cartHandlingActive; } catch(e) {}
        }, 300);

        // Find closest specific item container
        var menuItem = target.closest('.menu_item, .grid_item, .shop_item, .box_grid, .prod_info, .col-lg-6, .col-md-6, .col-6, .col-xl-3, .col-lg-4, .col-md-4, .creative-menu-card');
        var title = 'Plat Délicieux';
        var price = 0;
        var image = 'img/menu_items/1.jpg';

        if (menuItem) {
            // 1. Title Extraction
            var titleEl = menuItem.querySelector('.menu_title h3, .grid_item h3, h3, h4, h1, .title, .dish-title');
            if (titleEl) {
                var cleanTitle = titleEl.textContent.trim();
                if (cleanTitle) title = cleanTitle;
            }

            // 2. Price Extraction
            var priceEl = menuItem.querySelector('.menu_title em, .price_box .new_price, .price_box span:not(.old_price), .price_main .new_price, .menu_item em, em, .price, .dish-price-tag');
            
            if (priceEl && priceEl.textContent.trim()) {
                var rawPriceText = priceEl.textContent.trim();
                var numMatch = rawPriceText.match(/\d+(?:\.\d+)?/);
                if (numMatch) {
                    var parsed = parseFloat(numMatch[0]);
                    if (!isNaN(parsed) && parsed > 0) {
                        price = parsed;
                    }
                }
            }

            // Fallback price search if price is still 0
            if (price <= 0) {
                var candidateEms = menuItem.querySelectorAll('em, span, strong');
                for (var i = 0; i < candidateEms.length; i++) {
                    var txt = candidateEms[i].textContent.trim();
                    if (txt.includes('DH') || /\d+/.test(txt)) {
                        var m = txt.match(/\d+(?:\.\d+)?/);
                        if (m) {
                            var p = parseFloat(m[0]);
                            if (p > 0) {
                                price = p;
                                break;
                            }
                        }
                    }
                }
            }

            // 3. Image Extraction
            var imgEl = menuItem.querySelector('figure img, img');
            if (imgEl) {
                var src = imgEl.getAttribute('data-src') || imgEl.getAttribute('src');
                if (src && !src.includes('placeholder')) image = src;
            }
        }

        if (price <= 0) price = 100;

        // Check if dish has options in custom menu
        var customMenu = getCustomMenu();
        var matchingDish = customMenu.find(function(d) {
            return d.title && d.title.trim().toLowerCase() === title.trim().toLowerCase();
        });

        if (!providedOptions && matchingDish && matchingDish.options && Array.isArray(matchingDish.options) && matchingDish.options.length > 0) {
            openOptionsModal(matchingDish, function(selectedOptions) {
                addToCart({
                    title: matchingDish.title,
                    price: matchingDish.price || price,
                    image: matchingDish.image || image,
                    quantity: 1,
                    selectedOptions: selectedOptions
                });
            });
            return;
        }

        addToCart({
            title: title,
            price: price,
            image: image,
            quantity: 1,
            selectedOptions: providedOptions || null
        });
    }

    // Update Item Quantity
    function updateQuantity(id, newQty) {
        var cart = getCart();
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) {
                if (newQty <= 0) {
                    cart.splice(i, 1);
                } else {
                    cart[i].quantity = newQty;
                }
                break;
            }
        }
        saveCart(cart);
    }

    // Remove Item from Cart
    function removeFromCart(id) {
        var cart = getCart();
        cart = cart.filter(function (item) { return item.id !== id; });
        saveCart(cart);
    }

    // Clear Cart
    function clearCart() {
        localStorage.removeItem(CART_STORAGE_KEY);
        updateNavCart();
        if (document.querySelector('.cart-list')) renderCartPage();
        if (document.getElementById('checkout-summary-list')) renderCheckoutPage();
    }

    // Calculate Totals
    function getTotals() {
        var cart = getCart();
        var totalCount = 0;
        var totalPrice = 0;
        cart.forEach(function (item) {
            totalCount += item.quantity;
            totalPrice += (item.price * item.quantity);
        });
        return {
            count: totalCount,
            total: totalPrice
        };
    }

    function initSideCartDOM() {
        var drawer = document.getElementById('creativeSideCartDrawer');
        if (!drawer) {
            drawer = document.createElement('div');
            drawer.id = 'creativeSideCartDrawer';
            drawer.className = 'side-cart-drawer-overlay';
            drawer.innerHTML = 
                '<div class="side-cart-backdrop" onclick="window.FOORES_CART.toggleSideCart(false)"></div>' +
                '<div class="side-cart-panel">' +
                '   <div class="side-cart-header">' +
                '       <div class="d-flex align-items-center gap-2">' +
                '           <span class="cart-icon-badge"><i class="icon_cart"></i></span>' +
                '           <div>' +
                '               <h3 class="side-cart-title">Mon Panier Gourmand</h3>' +
                '               <span class="side-cart-subtitle" id="sideCartCountLabel">0 article(s)</span>' +
                '           </div>' +
                '       </div>' +
                '       <button class="side-cart-close-btn" onclick="window.FOORES_CART.toggleSideCart(false)" title="Fermer (Échap)">✕</button>' +
                '   </div>' +
                '   <div class="side-cart-body" id="sideCartItemsContainer"></div>' +
                '   <div class="side-cart-footer">' +
                '       <div class="side-cart-summary">' +
                '           <div class="summary-row"><span>Sous-total</span><strong id="sideCartSubtotal">0 DH</strong></div>' +
                '           <div class="summary-row"><span>Livraison Casablanca</span><strong style="color:#10B981;">Gratuite</strong></div>' +
                '           <div class="summary-row total-row"><span>Total à Payer</span><strong class="side-cart-grand-total" id="sideCartGrandTotal">0 DH</strong></div>' +
                '       </div>' +
                '       <div class="side-cart-actions">' +
                '           <a href="shop-checkout.html" class="btn-side-cart-main-red"><i class="icon_bag_alt"></i> Commander (Finaliser)</a>' +
                '           <div class="d-flex gap-2 mt-2">' +
                '               <a href="#" id="sideCartWaCheckoutBtn" target="_blank" class="btn-side-cart-wa-small"><i class="bi bi-whatsapp"></i> WhatsApp</a>' +
                '               <a href="shop-cart.html" class="btn-side-cart-secondary">Voir le Panier</a>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>';
            document.body.appendChild(drawer);

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') toggleSideCart(false);
            });
        }
        return drawer;
    }

    function toggleSideCart(show) {
        var drawer = initSideCartDOM();
        if (show === undefined) {
            show = !drawer.classList.contains('open');
        }
        if (show) {
            renderSideCartDrawer();
            drawer.classList.add('open');
        } else {
            drawer.classList.remove('open');
        }
    }

    function renderSideCartDrawer() {
        var drawer = initSideCartDOM();
        var container = document.getElementById('sideCartItemsContainer');
        var countLabel = document.getElementById('sideCartCountLabel');
        var subtotalEl = document.getElementById('sideCartSubtotal');
        var totalEl = document.getElementById('sideCartGrandTotal');
        var waBtn = document.getElementById('sideCartWaCheckoutBtn');

        var cart = getCart();
        var totals = getTotals();

        if (countLabel) countLabel.textContent = totals.count + (totals.count === 1 ? ' article' : ' articles');
        if (subtotalEl) subtotalEl.textContent = formatPrice(totals.total);
        if (totalEl) totalEl.textContent = formatPrice(totals.total);
        if (waBtn) waBtn.href = getWhatsAppOrderUrl();

        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = 
                '<div class="text-center py-5 my-auto" style="color: #94A3B8;">' +
                '   <i class="icon_cart fs-1 mb-3" style="font-size: 48px; color: #9B804E; opacity: 0.6;"></i>' +
                '   <h4 style="font-family: \'Lora\', serif; color: #ffffff; margin-bottom: 8px;">Votre panier est vide</h4>' +
                '   <p style="font-size: 13.5px; opacity: 0.8; margin-bottom: 20px;">Découvrez nos recettes faites maison et ajoutez vos spécialités préférées !</p>' +
                '   <button class="btn_1" onclick="window.FOORES_CART.toggleSideCart(false)">Découvrir le Menu</button>' +
                '</div>';
            return;
        }

        var html = '';
        cart.forEach(function(item) {
            var optText = formatOptionsText(item.selectedOptions);
            html += 
                '<div class="side-cart-item">' +
                '   <img src="' + item.image + '" alt="' + item.title + '" class="side-cart-item-img" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80\';">' +
                '   <div class="side-cart-item-info">' +
                '       <h4 class="side-cart-item-title">' + item.title + '</h4>' +
                (optText ? '       <div class="side-cart-item-options" style="font-size: 11.5px; color: #9B804E; margin-bottom: 2px;">' + optText + '</div>' : '') +
                '       <span class="side-cart-item-price">' + formatPrice(item.price * item.quantity) + '</span>' +
                '       <div class="side-cart-qty-row">' +
                '           <button class="side-cart-qty-btn" onclick="window.FOORES_CART.updateQuantity(\'' + item.id + '\', ' + (item.quantity - 1) + ')">-</button>' +
                '           <span class="side-cart-qty-val">' + item.quantity + '</span>' +
                '           <button class="side-cart-qty-btn" onclick="window.FOORES_CART.updateQuantity(\'' + item.id + '\', ' + (item.quantity + 1) + ')">+</button>' +
                '       </div>' +
                '   </div>' +
                '   <button class="side-cart-remove-btn" onclick="window.FOORES_CART.removeFromCart(\'' + item.id + '\')" title="Supprimer">' +
                '       <i class="icon_trash_alt"></i>' +
                '   </button>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // Update Top Navigation Cart Badge & Dropdown
    function updateNavCart() {
        var cart = getCart();
        var totals = getTotals();

        var cartBadge = document.getElementById('cart-count');
        if (cartBadge) {
            cartBadge.textContent = totals.count;
        }

        var navList = document.getElementById('nav-cart-items');
        var navTotal = document.getElementById('nav-cart-total');

        if (navList) {
            if (cart.length === 0) {
                navList.innerHTML = '<li class="text-center p-3 text-muted">Votre panier est vide</li>';
            } else {
                var html = '';
                cart.forEach(function (item) {
                    var optText = formatOptionsText(item.selectedOptions);
                    html += '<li>' +
                        '<figure><img src="' + item.image + '" alt="' + item.title + '" width="50" height="50"></figure>' +
                        '<strong><span>' + item.quantity + 'x ' + item.title + (optText ? ' (' + optText + ')' : '') + '</span>' + formatPrice(item.price * item.quantity) + '</strong>' +
                        '<a href="#0" class="action remove-nav-cart" data-id="' + item.id + '"><i class="icon_trash_alt"></i></a>' +
                        '</li>';
                });
                navList.innerHTML = html;

                var removeBtns = navList.querySelectorAll('.remove-nav-cart');
                removeBtns.forEach(function (btn) {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        var id = this.getAttribute('data-id');
                        removeFromCart(id);
                    });
                });
            }
        }

        if (navTotal) {
            navTotal.textContent = formatPrice(totals.total);
        }

        renderSideCartDrawer();
    }

    // Generate WhatsApp Order Message URL
    function getWhatsAppOrderUrl(customOrder) {
        var cart = customOrder ? customOrder.items : getCart();
        var total = customOrder ? customOrder.total : getTotals().total;
        if (!cart || cart.length === 0) return '#';

        var msg = "Bonjour Foores Restaurant! 🍽️\nJe souhaite passer une commande :\n\n";
        cart.forEach(function (item) {
            var optText = formatOptionsText(item.selectedOptions);
            msg += "• " + item.quantity + "x " + item.title + (optText ? " [" + optText + "]" : "") + " (" + formatPrice(item.price * item.quantity) + ")\n";
        });
        msg += "\nTotal : " + formatPrice(total);
        if (customOrder && customOrder.customer) {
            msg += "\n\nNom: " + customOrder.customer.name;
            msg += "\nTél: " + customOrder.customer.phone;
            msg += "\nAdresse: " + customOrder.customer.address;
        }
        msg += "\nPaiement: Paiement à la livraison (Espèces)";
        msg += "\n\nMerci!";

        return "https://wa.me/212522223344?text=" + encodeURIComponent(msg);
    }

    // Render Full Cart Page (shop-cart.html)
    function renderCartPage() {
        var cartTableBody = document.querySelector('.cart-list tbody');
        var cartSubtotal = document.getElementById('cart-subtotal');
        var cartTotal = document.getElementById('cart-grand-total');
        var waBtn = document.getElementById('btn-wa-checkout');

        if (!cartTableBody) return;

        var cart = getCart();
        var totals = getTotals();

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5"><h4>Votre panier est actuellement vide 🛒</h4><p class="text-muted">Découvrez nos délicieuses spécialités et ajoutez-les à votre commande.</p><a href="menu-2.html" class="btn_1 mt-3">Découvrir le Menu</a></td></tr>';
            if (cartSubtotal) cartSubtotal.textContent = '0 DH';
            if (cartTotal) cartTotal.textContent = '0 DH';
            if (waBtn) waBtn.style.display = 'none';
            return;
        }

        if (waBtn) {
            waBtn.style.display = 'block';
            waBtn.href = getWhatsAppOrderUrl();
        }

        var html = '';
        cart.forEach(function (item) {
            var optText = formatOptionsText(item.selectedOptions);
            html += '<tr>' +
                '<td>' +
                '<div class="d-flex align-items-center">' +
                '<img src="' + item.image + '" alt="' + item.title + '" class="cart-item-img">' +
                '<div>' +
                '<span class="cart-item-title d-block">' + item.title + '</span>' +
                (optText ? '<small style="color: #9B804E; font-size: 12px; margin-left: 15px;">' + optText + '</small>' : '') +
                '</div>' +
                '</div>' +
                '</td>' +
                '<td><strong>' + formatPrice(item.price) + '</strong></td>' +
                '<td>' +
                '<div class="qty-control-box">' +
                '<button type="button" class="btn-qty-action btn-qty-dec" data-id="' + item.id + '">-</button>' +
                '<input type="text" value="' + item.quantity + '" readonly class="qty-val-input">' +
                '<button type="button" class="btn-qty-action btn-qty-inc" data-id="' + item.id + '">+</button>' +
                '</div>' +
                '</td>' +
                '<td><strong class="text-dark">' + formatPrice(item.price * item.quantity) + '</strong></td>' +
                '<td class="text-center">' +
                '<a href="#0" class="btn-trash-item" data-id="' + item.id + '" title="Supprimer"><i class="icon_trash_alt"></i></a>' +
                '</td>' +
                '</tr>';
        });

        cartTableBody.innerHTML = html;

        if (cartSubtotal) cartSubtotal.textContent = formatPrice(totals.total);
        if (cartTotal) cartTotal.textContent = formatPrice(totals.total);

        cartTableBody.querySelectorAll('.btn-qty-inc').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                var cart = getCart();
                var item = cart.find(function (i) { return i.id === id; });
                if (item) updateQuantity(id, item.quantity + 1);
            });
        });

        cartTableBody.querySelectorAll('.btn-qty-dec').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                var cart = getCart();
                var item = cart.find(function (i) { return i.id === id; });
                if (item) updateQuantity(id, item.quantity - 1);
            });
        });

        cartTableBody.querySelectorAll('.btn-trash-item').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });
    }

    // Render Checkout Page Summary (shop-checkout.html)
    function renderCheckoutPage() {
        var summaryContainer = document.getElementById('checkout-summary-list');
        var checkoutSubtotal = document.getElementById('checkout-subtotal');
        var checkoutTotal = document.getElementById('checkout-total');

        if (!summaryContainer) return;

        var cart = getCart();
        var totals = getTotals();

        if (cart.length === 0) {
            summaryContainer.innerHTML = '<li class="text-muted text-center py-3">Votre panier est vide</li>';
            if (checkoutSubtotal) checkoutSubtotal.textContent = '0 DH';
            if (checkoutTotal) checkoutTotal.textContent = '0 DH';
            return;
        }

        var html = '';
        cart.forEach(function (item) {
            var optText = formatOptionsText(item.selectedOptions);
            html += '<li class="clearfix"><em>' + item.quantity + 'x ' + item.title + (optText ? ' (' + optText + ')' : '') + '</em> <span>' + formatPrice(item.price * item.quantity) + '</span></li>';
        });

        summaryContainer.innerHTML = html;
        if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(totals.total);
        if (checkoutTotal) checkoutTotal.textContent = formatPrice(totals.total);
    }

    // Process Order Submission from shop-checkout.html
    function processCheckout(e) {
        if (e) e.preventDefault();

        var cart = getCart();
        var totals = getTotals();

        if (cart.length === 0) {
            alert('Votre panier est vide. Veuillez ajouter des plats avant de commander.');
            window.location.href = 'menu-2.html';
            return false;
        }

        var nameInput = document.getElementById('cust-name');
        var phoneInput = document.getElementById('cust-phone');
        var addressInput = document.getElementById('cust-address');

        var name = nameInput ? nameInput.value.trim() : '';
        var phone = phoneInput ? phoneInput.value.trim() : '';
        var address = addressInput ? addressInput.value.trim() : '';

        if (!name || !phone || !address) {
            alert('Veuillez remplir tous les champs obligatoires (Nom, Téléphone, Adresse).');
            return false;
        }

        var cmdNum = Math.floor(1000 + Math.random() * 9000);
        var order = {
            id: 'CMD-' + cmdNum,
            cmdId: '#' + 'CMD-' + cmdNum,
            date: new Date().toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            customer: {
                name: name,
                phone: phone,
                address: address
            },
            items: cart,
            itemsSummary: cart.map(function (i) { return i.quantity + 'x ' + i.title; }).join(', '),
            total: totals.total,
            paymentMethod: 'Paiement à la livraison (Espèces)',
            status: 'pending',
            channel: 'online',
            createdAt: Date.now()
        };

        try {
            localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));

            var existingOrders = JSON.parse(localStorage.getItem('foores_live_orders') || '[]');
            existingOrders.unshift(order);
            localStorage.setItem('foores_live_orders', JSON.stringify(existingOrders));

            // Sync to MySQL API
            fetch('api/orders.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            }).catch(function(err) {});
        } catch (err) {
            console.error('Error saving order', err);
        }

        // Clear active cart after saving order
        clearCart();

        // Redirect to confirm.html
        window.location.href = 'confirm.html';
        return false;
    }

    // Render Order Details on confirm.html
    function renderConfirmationPage() {
        var orderBox = document.getElementById('order-details-box');
        var orderIdEl = document.getElementById('order-confirm-id');
        var orderMsgEl = document.getElementById('order-confirm-msg');
        var waConfirmBtn = document.getElementById('wa-confirm-order-btn');

        if (!orderBox) return;

        var lastOrderData = localStorage.getItem(LAST_ORDER_KEY);
        if (!lastOrderData) {
            orderBox.innerHTML = '<div class="text-center p-3 text-muted">Aucune commande récente trouvée.</div>';
            return;
        }

        var order;
        try {
            order = JSON.parse(lastOrderData);
        } catch (e) {
            console.error('Error parsing order data', e);
            return;
        }

        if (orderIdEl) {
            orderIdEl.textContent = 'N° de Commande: #' + order.id;
        }

        if (orderMsgEl && order.customer && order.customer.name) {
            orderMsgEl.textContent = 'Merci ' + order.customer.name + ' ! Votre commande a été transmise à notre cuisine à Casablanca. Notre livreur vous contactera au ' + order.customer.phone + ' dès son arrivée.';
        }

        if (waConfirmBtn) {
            waConfirmBtn.href = getWhatsAppOrderUrl(order);
        }

        var itemsHtml = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(function (item) {
                var optText = formatOptionsText(item.selectedOptions);
                itemsHtml += '<li class="d-flex justify-content-between align-items-center py-2 border-bottom">' +
                    '<div><strong>' + item.quantity + 'x</strong> ' + item.title + (optText ? ' <small style="color: #9B804E;" class="d-block">' + optText + '</small>' : '') + '</div>' +
                    '<span class="fw-bold">' + formatPrice(item.price * item.quantity) + '</span>' +
                    '</li>';
            });
        }

        var html = '<h5 class="fw-bold mb-3 border-bottom pb-2 text-dark"><i class="icon_document me-2"></i>Détails de la Commande</h5>' +
            '<div class="mb-3 text-start small">' +
            '<p class="mb-1"><strong>Client :</strong> ' + (order.customer ? order.customer.name : 'Client') + '</p>' +
            '<p class="mb-1"><strong>Téléphone :</strong> ' + (order.customer ? order.customer.phone : '-') + '</p>' +
            '<p class="mb-1"><strong>Adresse de livraison :</strong> ' + (order.customer ? order.customer.address : 'Casablanca') + '</p>' +
            '<p class="mb-1"><strong>Paiement :</strong> <span class="badge bg-success">Paiement à la livraison (Espèces)</span></p>' +
            '<p class="mb-1"><strong>Date :</strong> ' + order.date + '</p>' +
            '</div>' +
            '<h6 class="fw-bold mb-2 text-dark mt-3">Articles commandés :</h6>' +
            '<ul class="list-unstyled mb-3">' + itemsHtml + '</ul>' +
            '<div class="d-flex justify-content-between align-items-center pt-2 border-top">' +
            '<span class="fs-5 fw-bold">Total à payer à la livraison :</span>' +
            '<span class="fs-4 fw-bold text-success">' + formatPrice(order.total) + '</span>' +
            '</div>';

        orderBox.innerHTML = html;
    }

    // Show Toast Notification
    function showToast(message) {
        var toast = document.getElementById('cart-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cart-toast';
            toast.className = 'cart-toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(function () {
            toast.classList.remove('show');
        }, 3000);
    }

    /* ==========================================================================
       DYNAMIC DISHES & MENU SYNC ENGINE (ADMIN <-> WEBSITE)
       ========================================================================== */
    var DEFAULT_DISHES = [
        // --- PASTAS (5) ---
        {
            id: "1",
            title: "Tagliatelle aux Truffes Noires",
            category: "pastas",
            description: "Pâtes fraîches avec crème de truffe noire d'Alba et copeaux de parmesan Vache di Bruno.",
            price: 110,
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Format Portion", values: ["Portion Normale (350g) 🍝", "Grande Portion Gourmet (500g) 🍝"] },
                { name: "Sauce / Crème", values: ["Crème Truffe Noire 🍄", "Tomate San Marzano 🍅", "Pesto Basilic 🌿"] },
                { name: "Extra Fromage", values: ["Parmesan Affiné 🧀", "Burrata Crémeuse 🧀", "Sans Fromage 🛑"] }
            ]
        },
        {
            id: "2",
            title: "Creamy Garlic Parmesan Pasta",
            category: "pastas",
            description: "Pâtes artisanales avec crème fraîche, ail rôti et parmesan affiné 24 mois.",
            price: 85,
            image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281274?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Format Portion", values: ["Portion Normale (350g) 🍝", "Grande Portion Gourmet (500g) 🍝"] },
                { name: "Sauce", values: ["Crème Ail & Parmesan 🧄", "Crème Truffe 🍄", "Tomate Basilic 🍅"] },
                { name: "Extra Fromage", values: ["Parmesan Affiné 🧀", "Sans Fromage 🛑"] }
            ]
        },
        {
            id: "3",
            title: "Penne Arrabiata al Burrata",
            category: "pastas",
            description: "Penne à la sauce tomate épicée San Marzano, piment d'Espelette et Burrata crémeuse.",
            price: 90,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Niveau de Piment", values: ["Piquant Moyen 🌶️", "Très Piquant 🔥", "Doux Sans Piment 🛑"] },
                { name: "Format Portion", values: ["Portion Normale (350g) 🍝", "Grande Portion Gourmet (500g) 🍝"] },
                { name: "Fromage Extra", values: ["Burrata Crémeuse 🧀", "Parmesan 🧀"] }
            ]
        },
        {
            id: "4",
            title: "Spaghetti Carbonara Tradizionale",
            category: "pastas",
            description: "Spaghetti artisanaux, guanciale croustillant, jaune d'œuf et pecorino romano.",
            price: 95,
            image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Format Portion", values: ["Portion Normale (350g) 🍝", "Grande Portion Gourmet (500g) 🍝"] },
                { name: "Fromage", values: ["Pecorino Romano 🧀", "Parmesan Affiné 🧀"] }
            ]
        },
        {
            id: "5",
            title: "Linguine Frutti di Mare",
            category: "pastas",
            description: "Linguine aux fruits de mer frais, crevettes royales, moules et calamars sautés au vin blanc.",
            price: 130,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce de cuisson", values: ["Sauce Vin Blanc & Ail 🍷", "Sauce Tomate San Marzano 🍅"] },
                { name: "Niveau Piment", values: ["Légèrement Piquant 🌶️", "Doux 🛑"] }
            ]
        },

        // --- BURGERS (5) ---
        {
            id: "6",
            title: "Double Angus Cheeseburger",
            category: "burgers",
            description: "Double steak de bœuf Black Angus grillé, cheddar fondu et oignons caramélisés.",
            price: 95,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce au choix", values: ["Sauce Algérienne 🌶️", "Sauce Biggy Burger 🍯", "Sauce Blanche Ail 🥣", "Sauce BBQ Fumé 🔥"] },
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Formule Menu", values: ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"] }
            ]
        },
        {
            id: "7",
            title: "Crispy Chicken Spicy Burger",
            category: "burgers",
            description: "Filet de poulet croustillant mariné, sauce sriracha mayo et salade iceberg frisée.",
            price: 75,
            image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Niveau Piment", values: ["Sauce Sriracha Mayo 🌶️", "Sauce Blanche Douce 🥣", "Sauce Algérienne 🔥"] },
                { name: "Formule Menu", values: ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"] }
            ]
        },
        {
            id: "8",
            title: "Smokey Bacon BBQ Burger",
            category: "burgers",
            description: "Steak Angus 180g, bacon de bœuf fumé, sauce BBQ maison et cheddar blanc affiné.",
            price: 90,
            image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce", values: ["Sauce BBQ Fumé 🔥", "Sauce Biggy Burger 🍯", "Sauce Algérienne 🌶️"] },
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Formule Menu", values: ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"] }
            ]
        },
        {
            id: "9",
            title: "Truffle Mushroom Burger",
            category: "burgers",
            description: "Steak Angus, poêlée de champignons sauvages, émulsion à la truffe et emmental suisse.",
            price: 105,
            image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce / Émulsion", values: ["Émulsion à la Truffe 🍄", "Sauce Blanche Ail 🥣"] },
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Formule Menu", values: ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"] }
            ]
        },
        {
            id: "10",
            title: "Veggie Avocado Gourmet Burger",
            category: "burgers",
            description: "Galette de quinoa et légumes grillés, guacamole maison, tomates séchées et roquette.",
            price: 70,
            image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce", values: ["Guacamole Maison 🥑", "Sauce Blanche Ail 🥣", "Sauce Pesto 🌿"] },
                { name: "Formule Menu", values: ["Seul 🍔", "Formule Menu (+Frites & Boisson) 🍟🥤"] }
            ]
        },

        // --- PIZZAS (5) ---
        {
            id: "11",
            title: "Pizza Margherita Supreme",
            category: "pizzas",
            description: "Pâte napolitaine maturée 48h, sauce tomate San Marzano, mozzarella fior di latte et basilic.",
            price: 65,
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Taille / Format", values: ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"] },
                { name: "Sauce de Base", values: ["Sauce Tomate San Marzano 🍅", "Crème Fraîche Onctueuse 🥛"] },
                { name: "Sauce Piquante", values: ["Sauce Harissa Maison 🌶️", "Huile Pimentée 🫒", "Sans Piment 🛑"] }
            ]
        },
        {
            id: "12",
            title: "Pizza Quattro Formaggi",
            category: "pizzas",
            description: "Mozzarella, gorgonzola AOP, taleggio et parmesan râpé avec filet de miel.",
            price: 85,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Taille / Format", values: ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"] },
                { name: "Sauce de Base", values: ["Crème Fraîche Onctueuse 🥛", "Sauce Tomate San Marzano 🍅"] },
                { name: "Finition Miel", values: ["Avec Filet de Miel 🍯", "Sans Miel 🛑"] }
            ]
        },
        {
            id: "13",
            title: "Pizza Pepperoni & Jalapeño",
            category: "pizzas",
            description: "Sauce tomate piquante, mozzarella, tranches de pepperoni croustillant et jalapeños.",
            price: 80,
            image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Taille / Format", values: ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"] },
                { name: "Piment", values: ["Avec Jalapeños 🌶️", "Très Piquant 🔥", "Doux 🛑"] },
                { name: "Sauce de Base", values: ["Sauce Tomate Piquante 🍅", "Crème Fraîche 🥛"] }
            ]
        },
        {
            id: "14",
            title: "Pizza Truffe & Champignons",
            category: "pizzas",
            description: "Crème de truffe, champignons de paris sautés, mozzarella fior di latte et roquette.",
            price: 110,
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Taille / Format", values: ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"] },
                { name: "Sauce de Base", values: ["Crème de Truffe 🍄", "Sauce Tomate 🍅"] }
            ]
        },
        {
            id: "15",
            title: "Pizza Frutti di Mare",
            category: "pizzas",
            description: "Crevettes fraîches, calamars, ail rôti, persil frais et sauce tomate basilic.",
            price: 120,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Taille / Format", values: ["Grande 🍕", "Moyenne 🍕", "Petite 🍕"] },
                { name: "Sauce de Base", values: ["Sauce Tomate Basilic 🍅", "Crème Fraîche 🥛"] },
                { name: "Sauce Piquante", values: ["Huile Pimentée 🫒", "Harissa Maison 🌶️", "Sans Piment 🛑"] }
            ]
        },

        // --- GRILLADES (5) ---
        {
            id: "16",
            title: "Entrecôte Grillée Sauce Poivre",
            category: "grillades",
            description: "Pièce de bœuf tendre grillée au feu de bois, sauce au poivre vert frais et frites maison.",
            price: 160,
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Sauce au choix", values: ["Sauce Poivre Vert 🫛", "Sauce Champignons Truffée 🍄", "Sauce Béarnaise 🥣"] },
                { name: "Accompagnement", values: ["Frites Maison 🍟", "Riz Basmati Parfumé 🍚", "Légumes Grillés 🥦"] }
            ]
        },
        {
            id: "17",
            title: "Pavé de Saumon Grillé",
            category: "grillades",
            description: "Saumon atlantique grillé au bois de hêtre, servi avec légumes de saison croquants.",
            price: 140,
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce au choix", values: ["Sauce Citron & Aneth 🍋", "Sauce Béarnaise 🥣", "Beurre Blanc 🧈"] },
                { name: "Accompagnement", values: ["Légumes Grillés 🥦", "Riz Basmati Parfumé 🍚", "Frites Maison 🍟"] }
            ]
        },
        {
            id: "18",
            title: "Brochettes d'Agneau Assaisonnées",
            category: "grillades",
            description: "Brochettes d'agneau fraîchement marinées aux épices marocaines et herbes aromatiques.",
            price: 130,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Sauce au choix", values: ["Harissa Maison 🌶️", "Sauce Blanche Ail 🥣", "Sauce BBQ Fumé 🔥"] },
                { name: "Accompagnement", values: ["Frites Maison 🍟", "Riz Basmati Parfumé 🍚", "Légumes Grillés 🥦"] }
            ]
        },
        {
            id: "19",
            title: "Demi-Poulet Braisé aux Herbes",
            category: "grillades",
            description: "Poulet mariné au citron confit, thym et romarin, cuit lentement au four à bois.",
            price: 95,
            image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce au choix", values: ["Sauce Citron Confit 🍋", "Sauce BBQ Fumé 🔥", "Sauce Algérienne 🌶️"] },
                { name: "Accompagnement", values: ["Frites Maison 🍟", "Riz Basmati Parfumé 🍚", "Légumes Grillés 🥦"] }
            ]
        },
        {
            id: "20",
            title: "Côte de Bœuf Maturée (400g)",
            category: "grillades",
            description: "Côte de bœuf d'exception grillée, fleur de sel de Guérande et beurre maître d'hôtel.",
            price: 220,
            image: "https://images.unsplash.com/photo-1558030006-450675393462?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Cuisson Viande", values: ["À point 🥩", "Bien cuit 🔥", "Saignant 🔴"] },
                { name: "Sauce au choix", values: ["Sauce Poivre Vert 🫛", "Sauce Champignons Truffée 🍄", "Beurre Maître d'Hôtel 🧈"] },
                { name: "Accompagnement", values: ["Frites Maison 🍟", "Riz Basmati Parfumé 🍚", "Légumes Grillés 🥦"] }
            ]
        },

        // --- SALADES (5) ---
        {
            id: "21",
            title: "Salade César au Poulet Grillé",
            category: "salades",
            description: "Cœur de romaine, blanc de poulet grillé, croûtons à l'ail, parmesan et sauce César artisanale.",
            price: 65,
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce Vinaigrette", values: ["Sauce César Artisanale 🥗", "Vinaigrette Agrumes 🍋", "Pesto Basilic 🌿"] },
                { name: "Toasts Extra", values: ["Pain Aillé Croustillant 🍞", "Sans Toasts 🛑"] }
            ]
        },
        {
            id: "22",
            title: "Salade Burrata & Tomates Rôties",
            category: "salades",
            description: "Burrata crémeuse 125g, tomates cerises confites, pesto de basilic et pignons de pin.",
            price: 85,
            image: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce Vinaigrette", values: ["Pesto de Basilic 🌿", "Vinaigrette Balsamique 🍇", "Huile d'Olive Extra 🫒"] },
                { name: "Toasts Extra", values: ["Gressins Italiens 🥨", "Pain Aillé 🍞", "Sans Pain 🛑"] }
            ]
        },
        {
            id: "23",
            title: "Salade Saumon Avocat & Quinoa",
            category: "salades",
            description: "Saumon fumé, dés d'avocat frais, quinoa bio, mangue et vinaigrette agrumes.",
            price: 90,
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce Vinaigrette", values: ["Vinaigrette Agrumes & Citron 🍋", "Pesto Basilic 🌿"] }
            ]
        },
        {
            id: "24",
            title: "Salade Grecque Authentique",
            category: "salades",
            description: "Féta AOP, concombres croquants, tomates maturées, olives de Kalamata et huile d'olive vierge.",
            price: 60,
            image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce Vinaigrette", values: ["Huile d'Olive & Citron 🫒", "Vinaigrette Balsamique 🍇"] }
            ]
        },
        {
            id: "25",
            title: "Salade Chèvre Chaud & Miel",
            category: "salades",
            description: "Toasts de fromage de chèvre chaud caramélisés au miel, noix grillées et mesclun frais.",
            price: 75,
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sauce Vinaigrette", values: ["Miel & Balsamique 🍯", "Vinaigrette Agrumes 🍋"] }
            ]
        },

        // --- BOISSONS (6) ---
        {
            id: "26",
            title: "Coca-Cola Original Canette (33cl)",
            category: "boissons",
            description: "Canette Coca-Cola glacée servie avec rondelle de citron frais.",
            price: 15,
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Service & Température", values: ["Très Glacée avec Glaçons 🧊", "Température Ambiante 🧊"] },
                { name: "Citron", values: ["Tranche de Citron Vert 🍋", "Nature 🛑"] }
            ]
        },
        {
            id: "27",
            title: "Poms Pomme Canette (33cl)",
            category: "boissons",
            description: "Boisson gazeuse rafraîchissante au délicieux goût de pomme.",
            price: 15,
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Service & Température", values: ["Très Glacée avec Glaçons 🧊", "Température Ambiante 🧊"] }
            ]
        },
        {
            id: "28",
            title: "Hawai Tropical Canette (33cl)",
            category: "boissons",
            description: "Boisson gazeuse marocaine aux saveurs tropicales d'ananas et fruit de la passion.",
            price: 15,
            image: "https://images.unsplash.com/photo-1543253687-c931c8e01820?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Service & Température", values: ["Très Glacée avec Glaçons 🧊", "Température Ambiante 🧊"] }
            ]
        },
        {
            id: "29",
            title: "Jus d'Orange Frais Pressé",
            category: "boissons",
            description: "100% oranges marocaines gorgées de soleil, fraîchement pressées à la commande.",
            price: 25,
            image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Service", values: ["Glacé avec Glaçons 🧊", "Sans Glaçons 🍹"] }
            ]
        },
        {
            id: "30",
            title: "Mojito Citron & Menthe Fraîche",
            category: "boissons",
            description: "Cocktail rafraîchissant menthe marocaine pilée, citron vert et eau gazeuse.",
            price: 35,
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Sucre", values: ["Niveau Sucre Normal 🌿", "Moins Sucré 🍋", "Très Sucré 🍯"] },
                { name: "Glaçons", values: ["Glaçons Pilés 🧊", "Sans Glaçons 🍹"] }
            ]
        },
        {
            id: "36",
            title: "Eau Minérale Sidi Ali (50cl)",
            category: "boissons",
            description: "Bouteille d'eau minérale naturelle marocaine glacée.",
            price: 10,
            image: "https://images.unsplash.com/photo-1560023907-5f313d8750b7?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Service & Température", values: ["Très Glacée 🧊", "Température Ambiante 🧊"] }
            ]
        },

        // --- DESSERTS (5) ---
        {
            id: "31",
            title: "Fondant au Chocolat Coeur Coulant",
            category: "desserts",
            description: "Gâteau chaud au chocolat noir intense 70%, servi avec une boule de glace vanille Bourbon.",
            price: 50,
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Glace Extra", values: ["Une Boule Vanille Bourbon 🍨", "Une Boule Chocolat 🍨", "Sans Glace 🛑"] },
                { name: "Nappage", values: ["Chocolat Noir Fondu 🍫", "Caramel Beurre Salé 🍯"] }
            ]
        },
        {
            id: "32",
            title: "Tiramisu Tradizionale Italien",
            category: "desserts",
            description: "Biscuits imbibés au café expresso, crème mascarpone légère et cacao amer.",
            price: 45,
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Finition Cacao", values: ["Saupoudré de Cacao Amer 🍫", "Avec Pépites de Chocolat 🍫"] }
            ]
        },
        {
            id: "33",
            title: "Cheesecake New-Yorkais aux Fruits Rouges",
            category: "desserts",
            description: "Cheesecake crémeux sur biscuit croustillant, coulis maison de framboises fraîches.",
            price: 55,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Coulis au choix", values: ["Coulis Framboises Fraîches 🍓", "Coulis Fruits de la Passion 🥭", "Chocolat Chaud 🍫"] }
            ]
        },
        {
            id: "34",
            title: "Crème Brûlée à la Vanille Bourbon",
            category: "desserts",
            description: "Crème onctueuse à la vanille naturelle avec sa croûte de sucre brun caramélisée au chalumeau.",
            price: 45,
            image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Parfum Crème", values: ["Vanille Bourbon 🌾", "Fleur d'Oranger 🍊"] }
            ]
        },
        {
            id: "35",
            title: "Tarte Fine aux Pommes Caramélisées",
            category: "desserts",
            description: "Pâte feuilletée croustillante, pommes dorées au beurre et glace vanille.",
            price: 50,
            image: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=500&auto=format&fit=crop&q=80",
            options: [
                { name: "Glace Extra", values: ["Une Boule Vanille Bourbon 🍨", "Une Boule Caramel 🍨", "Sans Glace 🛑"] },
                { name: "Nappage", values: ["Caramel Beurre Salé 🍯", "Sauce Cannelle Miel 🍯"] }
            ]
        }
    ];

    var liveFetchedMenu = null;

    try { localStorage.removeItem('foores_custom_menu'); } catch (e) {}

    function fetchLiveApiMenu() {
        var apiPath = (window.location.pathname.indexOf('/admin') !== -1) ? '../api/dishes.php' : 'api/dishes.php';
        fetch(apiPath)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data && data.status === 'success' && Array.isArray(data.dishes) && data.dishes.length > 0) {
                    liveFetchedMenu = data.dishes;
                    if (document.getElementById('live_menu_container') || document.querySelector('.row.magnific-gallery.homepage')) {
                        renderDynamicMenu();
                    }
                }
            })
            .catch(function(err) {
                console.log('Live MySQL API fetch fallback to static dataset:', err);
            });
    }

    function getCustomMenu() {
        if (liveFetchedMenu && Array.isArray(liveFetchedMenu) && liveFetchedMenu.length > 0) {
            return liveFetchedMenu;
        }
        if (window.REAL_MYSQL_DISHES && Array.isArray(window.REAL_MYSQL_DISHES) && window.REAL_MYSQL_DISHES.length > 0) {
            return window.REAL_MYSQL_DISHES;
        }
        return [];
    }

    var CATEGORY_TITLES = {
        'pastas': '🍝 Pastas & Pâtes Gourmet',
        'burgers': '🍔 Burgers Gourmet',
        'pizzas': '🍕 Pizzas Italiennes',
        'grillades': '🥩 Grillades & Viandes',
        'salades': '🥗 Salades Fraîches',
        'boissons': '🍹 Boissons & Cocktails',
        'desserts': '🍰 Desserts Gourmands'
    };

    var CATEGORY_BADGES = {
        'pastas': '🍝 Pastas',
        'burgers': '🍔 Burgers',
        'pizzas': '🍕 Pizzas',
        'grillades': '🥩 Grillades',
        'salades': '🥗 Salades',
        'boissons': '🍹 Boissons',
        'desserts': '🍰 Desserts'
    };

    var currentActiveCat = 'all';
    var currentSearchQuery = '';
    var INITIAL_DISH_LIMIT = 12;
    var LOAD_MORE_STEP = 8;
    var currentVisibleLimit = INITIAL_DISH_LIMIT;

    function filterCategory(cat, btnElement) {
        currentActiveCat = cat;
        currentVisibleLimit = INITIAL_DISH_LIMIT;
        var buttons = document.querySelectorAll('.tasty-cat-btn, .cat-filter-btn, .category-circle-item');
        buttons.forEach(function(b) {
            b.classList.remove('active');
        });
        if (btnElement) {
            btnElement.classList.add('active');
        } else {
            var matchBtns = document.querySelectorAll('[data-category="' + cat + '"]');
            matchBtns.forEach(function(mb) { mb.classList.add('active'); });
        }
        renderFilteredDishesGrid();
    }

    function filterMenuBySearch(query) {
        currentSearchQuery = (query || '').toLowerCase().trim();
        currentVisibleLimit = INITIAL_DISH_LIMIT;
        renderFilteredDishesGrid();
    }

    function loadMoreDishes() {
        currentVisibleLimit += LOAD_MORE_STEP;
        renderFilteredDishesGrid();
    }

    function renderFilteredDishesGrid() {
        var dishes = getCustomMenu();
        var gridContainer = document.getElementById('dishes_grid_display');
        var sectionTitleEl = document.getElementById('active_category_title');
        var loadMoreContainer = document.getElementById('load_more_btn_container');
        if (!gridContainer) return;

        var filtered = dishes.filter(function(dish) {
            var cat = (dish.category || 'burgers').toLowerCase();
            var title = (dish.title || '').toLowerCase();
            var desc = (dish.description || '').toLowerCase();

            var matchesCat = (currentActiveCat === 'all' || cat === currentActiveCat.toLowerCase());
            var matchesSearch = (!currentSearchQuery || title.indexOf(currentSearchQuery) !== -1 || desc.indexOf(currentSearchQuery) !== -1);

            return matchesCat && matchesSearch;
        });

        if (sectionTitleEl) {
            sectionTitleEl.innerHTML = '';
            sectionTitleEl.style.display = 'none';
        }

        var itemsHtml = '';
        if (filtered.length === 0) {
            itemsHtml = '<div class="col-12 text-center py-5">' +
                '<p class="fs-5 text-muted mb-3">Aucun plat disponible dans cette catégorie pour le moment.</p>' +
                '<button class="tasty-load-more-btn" onclick="window.FOORES_CART.filterCategory(\'all\')">Voir tous les plats</button>' +
                '</div>';
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        } else {
            var APPETIZING_BADGES = {
                'burgers': '🔥 Populaire',
                'pizzas': '🔥 Populaire',
                'pastas': '🔥 Populaire',
                'grillades': '🔥 Spécial Chef',
                'salades': '🔥 Populaire',
                'boissons': '🔥 Signature',
                'desserts': '🔥 Gourmand'
            };

            var visibleDishes = filtered.slice(0, currentVisibleLimit);

            visibleDishes.forEach(function(dish) {
                var imgUrl = dish.image || 'img/menu_items/1.jpg';
                var priceText = formatPrice(dish.price || 100);
                var catBadgeText = CATEGORY_BADGES[dish.category] || dish.category;
                var cleanTitle = dish.title || 'Plat Délicieux';
                var cleanDesc = dish.description || 'Ingrédients frais préparés à la commande par notre chef.';
                var dishBadge = APPETIZING_BADGES[(dish.category || '').toLowerCase()] || '🔥 Populaire';

                var escapedTitle = cleanTitle.replace(/'/g, "\\'");
                var escapedCat = catBadgeText.replace(/'/g, "\\'");
                var escapedPrice = priceText.replace(/'/g, "\\'");
                var escapedDesc = cleanDesc.replace(/'/g, "\\'");
                var escapedImg = imgUrl.replace(/'/g, "\\'");

                var inCart = isTitleInCart(cleanTitle);
                var btnClass = 'add_to_cart' + (inCart ? ' added-in-cart' : '');
                var btnText = inCart ? '<i class="bi bi-check-lg"></i> Dans le Panier' : '<i class="icon_cart"></i> Ajouter au Panier';

                itemsHtml += '<div class="col-xl-3 col-lg-4 col-md-6 col-6 tasty-card-col mb-4" style="opacity: 1 !important; visibility: visible !important;">' +
                    '<div class="tasty-food-card" data-dish-id="' + dish.id + '">' +
                    '<div class="tasty-card-img-container" onclick="window.FOORES_CART.openImageLightbox(\'' + escapedImg + '\', \'' + escapedTitle + '\', \'' + escapedCat + '\', \'' + escapedPrice + '\', \'' + escapedDesc + '\', \'' + dish.id + '\')">' +
                    '<span class="tasty-card-badge">' + dishBadge + '</span>' +
                    '<span class="tasty-card-rating-badge">4.9</span>' +
                    '<img src="' + imgUrl + '" alt="' + cleanTitle + '" onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80\';">' +
                    '</div>' +
                    '<div class="tasty-card-body">' +
                    '<h3 class="tasty-card-title" onclick="window.FOORES_CART.openImageLightbox(\'' + escapedImg + '\', \'' + escapedTitle + '\', \'' + escapedCat + '\', \'' + escapedPrice + '\', \'' + escapedDesc + '\', \'' + dish.id + '\')">' + cleanTitle + '</h3>' +
                    '<p class="tasty-card-sub">' + cleanDesc + '</p>' +
                    '<div class="tasty-card-divider"></div>' +
                    '<div class="tasty-card-footer-row">' +
                    '<div class="tasty-card-price">' + priceText + '</div>' +
                    '<button type="button" class="' + btnClass + ' tasty-pill-add-btn" onclick="window.FOORES_CART.addToCartFromBtn(this, event); return false;">' + btnText + '</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            });

            if (loadMoreContainer) {
                if (filtered.length > currentVisibleLimit) {
                    var remaining = filtered.length - visibleDishes.length;
                    loadMoreContainer.style.display = 'block';
                    loadMoreContainer.innerHTML = '<button type="button" class="tasty-load-more-btn" onclick="window.FOORES_CART.loadMoreDishes()">Charger Plus de Plats</button>';
                } else {
                    if (filtered.length > INITIAL_DISH_LIMIT) {
                        loadMoreContainer.style.display = 'block';
                        loadMoreContainer.innerHTML = '<p class="text-muted small mt-2 fw-semibold">✨ Tous les ' + filtered.length + ' plats de cette sélection sont affichés</p>';
                    } else {
                        loadMoreContainer.style.display = 'none';
                    }
                }
            }
        }

        gridContainer.innerHTML = itemsHtml;
        gridContainer.style.opacity = '1';
        gridContainer.style.visibility = 'visible';
    }

    function renderDynamicMenu() {
        var dishes = getCustomMenu();
        if (!dishes || dishes.length === 0) return;

        var liveMenuContainer = document.getElementById('live_menu_container');

        if (liveMenuContainer) {
            var html = '<div class="tasty-menu-header">' +
                '<span class="tasty-header-tag">✨ SÉLECTION GASTRONOMIQUE DE CASABLANCA</span>' +
                '<h2 class="tasty-menu-title">Notre Carte <span>Gourmande</span></h2>' +
                '<p class="tasty-menu-subtitle">Découvrez notre sélection artisanale préparée à la commande avec des ingrédients frais par notre chef</p>' +
                '</div>' +
                '<div class="search-filter-wrapper mx-auto mb-4" style="max-width: 480px; position: relative;">' +
                '<i class="icon_search" style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #e45d16; font-size: 18px;"></i>' +
                '<input type="text" id="creativeMenuSearchInput" placeholder="Rechercher un plat, ingrédient..." ' +
                'style="width: 100%; padding: 12px 20px 12px 48px; border-radius: 30px; border: 2px solid #E5E7EB; font-size: 14.5px; outline: none; transition: all 0.3s ease; background: #FFF; box-shadow: 0 4px 15px rgba(0,0,0,0.03);" ' +
                'oninput="window.FOORES_CART.filterMenuBySearch(this.value)">' +
                '</div>' +
                '<div class="creative-category-bar-box mb-4">' +
                '<div class="d-flex align-items-center justify-content-start justify-content-md-center gap-3 gap-md-4 overflow-auto py-2 category-scroll-container">' +
                '<div class="category-circle-item active" data-category="all" onclick="window.FOORES_CART.filterCategory(\'all\', this)" role="button" title="Tous les Plats">' +
                '<div class="circle-img-box"><img src="img/menu_items/1.jpg" alt="Tous" class="cat-circle-img"><span class="circle-badge">✨</span></div>' +
                '<span class="category-circle-label">Tous</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="burgers" onclick="window.FOORES_CART.filterCategory(\'burgers\', this)" role="button" title="Burgers">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80" alt="Burgers" class="cat-circle-img"><span class="circle-badge">🍔</span></div>' +
                '<span class="category-circle-label">Burgers</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="pizzas" onclick="window.FOORES_CART.filterCategory(\'pizzas\', this)" role="button" title="Pizzas">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80" alt="Pizzas" class="cat-circle-img"><span class="circle-badge">🍕</span></div>' +
                '<span class="category-circle-label">Pizzas</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="pastas" onclick="window.FOORES_CART.filterCategory(\'pastas\', this)" role="button" title="Pâtes">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=80" alt="Pâtes" class="cat-circle-img"><span class="circle-badge">🍝</span></div>' +
                '<span class="category-circle-label">Pâtes</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="grillades" onclick="window.FOORES_CART.filterCategory(\'grillades\', this)" role="button" title="Grillades">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80" alt="Grillades" class="cat-circle-img"><span class="circle-badge">🥩</span></div>' +
                '<span class="category-circle-label">Grillades</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="salades" onclick="window.FOORES_CART.filterCategory(\'salades\', this)" role="button" title="Salades">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80" alt="Salades" class="cat-circle-img"><span class="circle-badge">🥗</span></div>' +
                '<span class="category-circle-label">Salades</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="boissons" onclick="window.FOORES_CART.filterCategory(\'boissons\', this)" role="button" title="Boissons">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80" alt="Boissons" class="cat-circle-img"><span class="circle-badge">🍹</span></div>' +
                '<span class="category-circle-label">Boissons</span>' +
                '</div>' +
                '<div class="category-circle-item" data-category="desserts" onclick="window.FOORES_CART.filterCategory(\'desserts\', this)" role="button" title="Desserts">' +
                '<div class="circle-img-box"><img src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80" alt="Desserts" class="cat-circle-img"><span class="circle-badge">🍰</span></div>' +
                '<span class="category-circle-label">Desserts</span>' +
                '</div>' +
                '</div>' +
                '</div>';

            html += '<div class="row add_bottom_45 g-3 g-md-4" id="dishes_grid_display" style="opacity: 1 !important; visibility: visible !important;"></div>';

            html += '<div class="text-center mt-3 mb-5" id="load_more_btn_container"><button type="button" class="tasty-load-more-btn" onclick="window.FOORES_CART.loadMoreDishes()">Charger Plus de Plats</button></div>';



            liveMenuContainer.innerHTML = html;
            liveMenuContainer.style.opacity = '1';
            liveMenuContainer.style.visibility = 'visible';

            renderFilteredDishesGrid();
        }

        // 2. Target homepage menu containers (.row.magnific-gallery.homepage)
        var homeGalleries = document.querySelectorAll('.row.magnific-gallery.homepage');
        homeGalleries.forEach(function(gallery) {
            var itemsHtml = '';
            dishes.slice(0, 8).forEach(function(dish) {
                var imgUrl = dish.image || 'img/menu_items/1.jpg';
                var priceText = formatPrice(dish.price || 100);
                var catBadgeText = CATEGORY_BADGES[dish.category] || dish.category;

                itemsHtml += '<div class="col-lg-6 mb-4" style="opacity: 1 !important; visibility: visible !important;">' +
                    '<div class="creative-menu-card menu_item order">' +
                    '<div class="card-img-box">' +
                    '<img src="' + imgUrl + '" alt="' + dish.title + '">' +
                    '<span class="card-category-badge">' + catBadgeText + '</span>' +
                    '</div>' +
                    '<div class="card-details">' +
                    '<div class="card-header-row menu_title">' +
                    '<h3 class="dish-title">' + dish.title + '</h3>' +
                    '<span class="dish-price-tag">' + priceText + '</span>' +
                    '</div>' +
                    '<p class="dish-desc">' + (dish.description || 'Ingrédients frais et préparation artisanale.') + '</p>' +
                    '<a href="#0" class="btn-add-creative add_to_cart" onclick="window.FOORES_CART.addToCartFromBtn(this); return false;">' +
                    '<i class="icon_cart"></i> Ajouter au Panier' +
                    '</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            });
            gallery.innerHTML = itemsHtml;
            gallery.style.opacity = '1';
            gallery.style.visibility = 'visible';
        });
    }

    // Listen for cross-tab dishes updates from Admin panel
    window.addEventListener('storage', function(e) {
        if (e.key === 'foores_custom_menu' || e.key === 'foores_custom_menu_updated') {
            fetchLiveApiMenu();
        }
    });

    // Initialize Event Handlers
    function init() {
        fetchLiveApiMenu();
        updateNavCart();
        renderDynamicMenu();
        updateAllCartButtons();

        if (document.querySelector('.cart-list')) {
            renderCartPage();
        }

        if (document.getElementById('checkout-summary-list')) {
            renderCheckoutPage();
        }

        if (document.getElementById('order-details-box')) {
            renderConfirmationPage();
        }

        initReservationFormHandler();

        // Global Add To Cart Delegated Listener
        document.addEventListener('click', function (e) {
            var target = e.target.closest('.add_to_cart, .btn_add_cart');
            if (target) {
                e.preventDefault();
                addToCartFromBtn(target, e);
            }
        }, true);
    }

    // Table Reservation Form Submission Handler
    function initReservationFormHandler() {
        document.addEventListener('submit', function (e) {
            var form = e.target;
            if (form && (form.id === 'wrapped' || form.querySelector('#middle-wizard'))) {
                e.preventDefault();
                e.stopPropagation();

                var dateInput = form.querySelector('#datepicker_field');
                var timeInput = form.querySelector('input[name="time"]:checked');
                var peopleInput = form.querySelector('input[name="people"]:checked');
                var nameInput = form.querySelector('input[name="name_reserve"]');
                var phoneInput = form.querySelector('input[name="telephone_reserve"]');

                var date = (dateInput && dateInput.value) ? dateInput.value : 'Aujourd\'hui';
                var time = (timeInput && timeInput.value) ? timeInput.value : '19:30';
                var people = (peopleInput && peopleInput.value) ? peopleInput.value : '2';
                var name = nameInput ? nameInput.value.trim() : '';
                var phone = phoneInput ? phoneInput.value.trim() : '';

                if (!name || !phone) {
                    alert('Veuillez renseigner votre nom et numéro de téléphone pour la réservation.');
                    return false;
                }

                var resNum = Math.floor(1000 + Math.random() * 9000);
                var emailInput = form.querySelector('input[name="email_reserve"]');
                var optMsgInput = form.querySelector('textarea[name="opt_message_reserve"]');

                var reservation = {
                    id: '#RES-' + resNum,
                    resId: '#RES-' + resNum,
                    name: name,
                    phone: phone,
                    email: emailInput ? emailInput.value.trim() : 'Non renseigné',
                    date: date,
                    time: time,
                    people: people,
                    notes: optMsgInput ? optMsgInput.value.trim() : 'Aucune remarque',
                    status: 'pending',
                    channel: 'online',
                    createdAt: Date.now()
                };

                try {
                    var existingResa = JSON.parse(localStorage.getItem('foores_live_reservations') || '[]');
                    existingResa.unshift(reservation);
                    localStorage.setItem('foores_live_reservations', JSON.stringify(existingResa));

                    // Sync to MySQL API
                    fetch('api/reservations.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(reservation)
                    }).catch(function(err) {});
                } catch (err) {
                    console.error('Error saving live reservation', err);
                }

                var container = form.closest('#wizard_container') || form.parentElement;
                if (container) {
                    var waMsg = "Bonjour Foores Restaurant! 🍽️\nJe souhaite réserver une table :\n\n" +
                        "• Nom : " + name + "\n" +
                        "• Tél : " + phone + "\n" +
                        "• Date : " + date + "\n" +
                        "• Heure : " + time + "\n" +
                        "• Convives : " + people + " personne(s)\n\nMerci!";

                    var waUrl = "https://wa.me/212522223344?text=" + encodeURIComponent(waMsg);

                    container.innerHTML = '<div class="text-center p-4 bg-white rounded shadow-sm border" style="border-color: #9B804E !important;">' +
                        '<div class="icon icon--order-success svg mb-3">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72">' +
                        '<g fill="none" stroke="#8EC343" stroke-width="2">' +
                        '<circle cx="36" cy="36" r="35" style="stroke-dasharray:240px, 240px; stroke-dashoffset: 480px;"></circle>' +
                        '<path d="M17.417,37.778l9.93,9.909l25.444-25.393" style="stroke-dasharray:50px, 50px; stroke-dashoffset: 0px;"></path>' +
                        '</g>' +
                        '</svg>' +
                        '</div>' +
                        '<h3 class="text-success fw-bold mb-2">Réservation Confirmée avec Succès !</h3>' +
                        '<p class="text-muted mb-4">Merci <strong>' + name + '</strong> ! Votre réservation de table a été transmise à Foores Restaurant Casablanca.</p>' +
                        '<div class="p-3 bg-light rounded text-start mb-4 small">' +
                        '<p class="mb-1"><strong>Nom du Client :</strong> ' + name + '</p>' +
                        '<p class="mb-1"><strong>Téléphone :</strong> ' + phone + '</p>' +
                        '<p class="mb-1"><strong>Date :</strong> ' + date + '</p>' +
                        '<p class="mb-1"><strong>Heure :</strong> ' + time + '</p>' +
                        '<p class="mb-0"><strong>Nombre de Convives :</strong> ' + people + ' personne(s)</p>' +
                        '</div>' +
                        '<div class="d-flex flex-wrap justify-content-center gap-2">' +
                        '<a href="index-3.html" class="btn_1 outline">Retour à l\'Accueil</a>' +
                        '<a href="' + waUrl + '" target="_blank" class="btn-wa-order px-4">' +
                        '<i class="bi bi-whatsapp me-2"></i> Confirmer sur WhatsApp' +
                        '</a>' +
                        '</div>' +
                        '</div>';
                }
                return false;
            }
        }, true);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function openImageLightbox(imgUrl, title, category, price, desc, dishId) {
        var modal = document.getElementById('creativeImageLightboxModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'creativeImageLightboxModal';
            modal.className = 'creative-lightbox-overlay';
            modal.innerHTML = 
                '<div class="lightbox-backdrop-close" onclick="window.FOORES_CART.closeImageLightbox()"></div>' +
                '<div class="lightbox-card-wrapper">' +
                '    <button class="lightbox-close-btn" onclick="window.FOORES_CART.closeImageLightbox()" title="Fermer (Échap)">✕</button>' +
                '    <div class="lightbox-image-container">' +
                '        <img id="lightboxModalImage" src="" alt="Photo">' +
                '        <span class="lightbox-category-badge" id="lightboxModalCategory"></span>' +
                '    </div>' +
                '    <div class="lightbox-content-footer">' +
                '        <div class="lightbox-header-row">' +
                '            <h3 id="lightboxModalTitle"></h3>' +
                '            <span class="lightbox-price-tag" id="lightboxModalPrice"></span>' +
                '        </div>' +
                '        <p id="lightboxModalDesc"></p>' +
                '        <div class="lightbox-action-row">' +
                '            <button class="lightbox-cart-btn" id="lightboxAddToCartBtn"><i class="icon_cart"></i> Ajouter au Panier</button>' +
                '        </div>' +
                '    </div>' +
                '</div>';
            document.body.appendChild(modal);

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeImageLightbox();
            });
        }

        document.getElementById('lightboxModalImage').src = imgUrl;
        document.getElementById('lightboxModalTitle').textContent = title || 'Plat Gastronomique';
        document.getElementById('lightboxModalCategory').textContent = category || 'Spécialité';
        document.getElementById('lightboxModalPrice').textContent = price || '';
        document.getElementById('lightboxModalDesc').textContent = desc || '';

        var isAdded = isTitleInCart(title);
        var cartBtn = document.getElementById('lightboxAddToCartBtn');
        if (cartBtn) {
            if (isAdded) {
                cartBtn.classList.add('added-in-cart');
                cartBtn.innerHTML = '<i class="bi bi-check-lg"></i> Dans le Panier';
            } else {
                cartBtn.classList.remove('added-in-cart');
                cartBtn.innerHTML = '<i class="icon_cart"></i> Ajouter au Panier';
            }

            cartBtn.onclick = function() {
                var dishes = getCustomMenu();
                var match = dishes.find(function(d) { return String(d.id) === String(dishId); });
                if (!match) {
                    match = {
                        id: dishId || 'custom_' + Date.now(),
                        title: title,
                        price: parseFloat(price.replace(/[^0-9.]/g, '')) || 100,
                        image: imgUrl
                    };
                }
                addToCart(match);
                updateAllCartButtons();
                closeImageLightbox();
            };
        }

        modal.classList.add('active');
    }

    function closeImageLightbox() {
        var modal = document.getElementById('creativeImageLightboxModal');
        if (modal) modal.classList.remove('active');
    }

    // Delegated click listener for image zoom on static images
    document.addEventListener('click', function(e) {
        var imgWrapper = e.target.closest('figure a, figure img, .recipe-card-img-wrapper img, .dish-thumb');
        if (imgWrapper && !e.target.closest('.card-img-box')) {
            var card = imgWrapper.closest('.menu_item, .recipe-card-full, .leaderboard-item');
            if (card) {
                var img = card.querySelector('img');
                var title = card.querySelector('h3, h4') ? card.querySelector('h3, h4').textContent.trim() : 'Plat';
                var price = card.querySelector('em, strong, .dish-sub') ? card.querySelector('em, strong, .dish-sub').textContent.trim() : '';
                var desc = card.querySelector('p') ? card.querySelector('p').textContent.trim() : 'Spécialité culinaire préparée avec des ingrédients frais.';
                var badge = card.querySelector('.cat-badge') ? card.querySelector('.cat-badge').textContent.trim() : '✨ Gourmet';
                var imgSrc = img ? img.src : '';

                if (imgSrc) {
                    openImageLightbox(imgSrc, title, badge, price, desc, card.getAttribute('data-dish-id') || card.getAttribute('data-id'));
                }
            }
        }
    });

    // Delegated click listener for top navbar cart triggers -> Open Offcanvas Side Cart
    document.addEventListener('click', function(e) {
        var cartTrigger = e.target.closest('.cart_bt, .dropdown-cart > a, a[href="shop-cart.html"]:not(.btn_1):not(.btn-side-cart-secondary), #top_menu .dropdown-cart');
        if (cartTrigger && !e.target.closest('.side-cart-panel') && !e.target.closest('.action') && !e.target.closest('.remove-nav-cart')) {
            e.preventDefault();
            toggleSideCart(true);
        }
    });

    // Expose global cart API
    window.FOORES_CART = {
        getCart: getCart,
        addToCart: addToCart,
        addToCartFromBtn: addToCartFromBtn,
        removeFromCart: removeFromCart,
        updateQuantity: updateQuantity,
        clearCart: clearCart,
        processCheckout: processCheckout,
        renderConfirmationPage: renderConfirmationPage,
        filterCategory: filterCategory,
        filterMenuBySearch: filterMenuBySearch,
        loadMoreDishes: loadMoreDishes,
        openImageLightbox: openImageLightbox,
        closeImageLightbox: closeImageLightbox,
        openOptionsModal: openOptionsModal,
        closeOptionsModal: closeOptionsModal,
        toggleSideCart: toggleSideCart,
        renderSideCartDrawer: renderSideCartDrawer
    };

})();
