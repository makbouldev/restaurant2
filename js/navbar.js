/* ==========================================================================
   UNIFIED NAVBAR & HEADER COMPONENT (FOORES RESTAURANT)
   Single component rendered dynamically across all pages.
   ========================================================================== */

(function () {
    'use strict';

    function renderNavbar() {
        var headerContainer = document.querySelector('header.header') || document.getElementById('foores-header');
        if (!headerContainer) return;

        // Determine current page filename for active menu highlighting
        var path = window.location.pathname;
        var page = path.split("/").pop().toLowerCase() || "index.html";
        if (page === "" || page === "/") page = "index.html";

        var isActive = function(targetPage) {
            if (targetPage === 'index.html' && (page === 'index.html' || page === '')) return 'active';
            return (page === targetPage) ? 'active' : '';
        };

        var html = 
            '<div class="layer"></div>' +
            '<!-- Top Header Bar -->' +
            '<div class="top-header-bar d-none d-lg-block">' +
            '    <div class="container-fluid d-flex justify-content-between align-items-center">' +
            '        <div class="top-header-left d-flex align-items-center gap-4">' +
            '            <span class="top-info-item"><i class="bi bi-geo-alt-fill"></i> 123 Rue Gourmande, Casablanca, Maroc</span>' +
            '            <span class="top-info-item"><i class="bi bi-clock-fill"></i> Lun - Dim: 10:00 AM - 23:00 PM</span>' +
            '        </div>' +
            '        <div class="top-header-right d-flex align-items-center gap-3">' +
            '            <span class="top-info-item"><i class="bi bi-telephone-fill"></i> +212 522 22 33 44</span>' +
            '            <div class="top-social-links d-flex align-items-center gap-2 ms-2">' +
            '                <a href="#0" class="social-icon-circle"><i class="bi bi-facebook"></i></a>' +
            '                <a href="#0" class="social-icon-circle"><i class="bi bi-instagram"></i></a>' +
            '                <a href="#0" class="social-icon-circle"><i class="bi bi-twitter-x"></i></a>' +
            '                <a href="#0" class="social-icon-circle"><i class="bi bi-pinterest"></i></a>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>' +
            '<!-- Main Navigation Bar -->' +
            '<div class="main-nav-bar">' +
            '    <div class="container-fluid d-flex align-items-center justify-content-between">' +
            '        <div class="header-left-brand d-flex align-items-center gap-2">' +
            '            <a href="#0" class="open_close d-lg-none">' +
            '                <i class="icon_menu"></i><span>Menu</span>' +
            '            </a>' +
            '            <div id="logo" class="my-0">' +
            '                <a href="index.html">' +
            '                    <img src="img/logo_sticky.svg" width="140" height="35" alt="" class="logo_normal">' +
            '                    <img src="img/logo_sticky.svg" width="140" height="35" alt="" class="logo_sticky">' +
            '                </a>' +
            '            </div>' +
            '        </div>' +
            '        <nav class="main-menu">' +
            '            <div id="header_menu">' +
            '                <a href="#0" class="open_close">' +
            '                    <i class="icon_close"></i><span>Menu</span>' +
            '                </a>' +
            '                <a href="index.html"><img src="img/logo_sticky.svg" width="130" height="32" alt=""></a>' +
            '            </div>' +
            '            <ul>' +
            '                <li><a href="index.html" class="' + isActive('index.html') + '">ACCUEIL</a></li>' +
            '                <li><a href="about.html" class="' + isActive('about.html') + '">À PROPOS</a></li>' +
            '                <li><a href="menu-2.html" class="' + isActive('menu-2.html') + '">MENU</a></li>' +
            '                <li><a href="reservations.html" class="' + isActive('reservations.html') + '">RÉSERVATION</a></li>' +
            '                <li><a href="gallery.html" class="' + isActive('gallery.html') + '">GALERIE</a></li>' +
            '                <li><a href="contacts.html" class="' + isActive('contacts.html') + '">CONTACT</a></li>' +
            '                <li class="d-lg-none mt-3"><a href="reservations.html" class="btn_book_table_pill text-center text-white">BOOK A TABLE</a></li>' +
            '            </ul>' +
            '        </nav>' +
            '        <div class="header-right-actions d-flex align-items-center gap-3">' +
            '            <ul id="top_menu" class="m-0 p-0 d-flex align-items-center list-unstyled">' +
            '                <li><a href="#0" class="search-overlay-menu-btn"></a></li>' +
            '                <li>' +
            '                    <div class="dropdown dropdown-cart">' +
            '                        <a href="shop-cart.html" class="cart_bt"><strong id="cart-count">0</strong></a>' +
            '                        <div class="dropdown-menu">' +
            '                            <ul id="nav-cart-items">' +
            '                            </ul>' +
            '                            <div class="total_drop">' +
            '                                <div class="clearfix add_bottom_15"><strong>Total</strong><span id="nav-cart-total">.00</span></div>' +
            '                                <a href="shop-cart.html" class="btn_1 outline">Voir Panier</a><a href="shop-checkout.html" class="btn_1">Commander</a>' +
            '                            </div>' +
            '                        </div>' +
            '                    </div>' +
            '                </li>' +
            '            </ul>' +
            '            <a href="reservations.html" class="btn_book_table_pill d-none d-lg-inline-block">BOOK A TABLE</a>' +
            '        </div>' +
            '    </div>' +
            '</div>' +
            '<!-- Search Overlay -->' +
            '<div class="search-overlay-menu">' +
            '    <span class="search-overlay-close"><span class="closebt"><i class="icon_close"></i></span></span>' +
            '    <form role="search" id="searchform" method="get">' +
            '        <input value="" name="q" type="search" placeholder="Rechercher..." />' +
            '        <button type="submit"><i class="icon_search"></i></button>' +
            '    </form>' +
            '</div>';

        headerContainer.className = 'header clearfix element_to_stick';
        headerContainer.innerHTML = html;

        initNavbarHandlers();
    }

    function initNavbarHandlers() {
        var openCloseBtns = document.querySelectorAll('.open_close');
        var mainNav = document.querySelector('.main-menu');
        var layer = document.querySelector('.layer');

        openCloseBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (mainNav) mainNav.classList.toggle('show');
                if (layer) layer.classList.toggle('layer-is-visible');
            });
        });

        if (layer) {
            layer.addEventListener('click', function() {
                if (mainNav) mainNav.classList.remove('show');
                layer.classList.remove('layer-is-visible');
            });
        }

        var searchBtn = document.querySelector('.search-overlay-menu-btn');
        var searchOverlay = document.querySelector('.search-overlay-menu');
        var searchClose = document.querySelector('.search-overlay-close');

        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', function(e) {
                e.preventDefault();
                searchOverlay.classList.add('open');
            });
        }
        if (searchClose && searchOverlay) {
            searchClose.addEventListener('click', function(e) {
                e.preventDefault();
                searchOverlay.classList.remove('open');
            });
        }

        if (window.FOORES_CART && typeof window.FOORES_CART.updateNavCart === 'function') {
            window.FOORES_CART.updateNavCart();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderNavbar);
    } else {
        renderNavbar();
    }

    window.FOORES_NAVBAR = {
        render: renderNavbar
    };
})();
