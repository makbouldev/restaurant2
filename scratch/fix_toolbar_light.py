with open('admin/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

toolbar_light_css = """

/* ==========================================================================
   LIGHT THEME OVERRIDES FOR ORDERS TOOLBAR, SEARCH BAR & DATE FILTER
   ========================================================================== */
.orders-toolbar-creative {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
    backdrop-filter: none !important;
}

.orders-filter-action-bar {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
}

.creative-date-filter {
    background: #F8FAFC !important;
    border: 1.5px solid #CBD5E1 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03) !important;
}

.creative-date-filter:hover {
    border-color: #10B981 !important;
    background: #F0FDF4 !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.18) !important;
}

.creative-date-select,
.creative-date-filter select {
    background: transparent !important;
    color: #0F172A !important;
    font-weight: 700 !important;
}

.creative-date-select option,
.creative-date-filter select option {
    background-color: #FFFFFF !important;
    color: #0F172A !important;
}

.creative-search-box input {
    background: #F8FAFC !important;
    border: 1.5px solid #CBD5E1 !important;
    color: #0F172A !important;
}

.creative-search-box input::placeholder {
    color: #64748B !important;
}

.creative-search-box input:focus {
    background: #FFFFFF !important;
    border-color: #10B981 !important;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
}

.search-kbd-shortcut {
    background: #E2E8F0 !important;
    border: 1px solid #CBD5E1 !important;
    color: #475569 !important;
}
"""

css += toolbar_light_css

with open('admin/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Orders toolbar & date filter light theme styles applied!")
