import re

with open('admin/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update :root variables
old_root = """:root {
    --bg-main: #080C14;
    --bg-sidebar: #0C1220;
    --bg-card: #121A2B;
    --bg-card-hover: #172238;
    --bg-input: #111827;

    --primary-green: #10B981;
    --primary-green-hover: #059669;
    --primary-green-pill: #1C3B2B;

    --accent-orange: #F97316;
    --accent-purple: #A855F7;
    --accent-blue: #3B82F6;
    --accent-yellow: #F59E0B;

    --text-heading: #FFFFFF;
    --text-body: #94A3B8;
    --text-muted: #64748B;
    --border-color: rgba(255, 255, 255, 0.08);"""

new_root = """:root {
    --bg-main: #F8FAFC;
    --bg-sidebar: #FFFFFF;
    --bg-card: #FFFFFF;
    --bg-card-hover: #F1F5F9;
    --bg-input: #F8FAFC;

    --primary-green: #10B981;
    --primary-green-hover: #059669;
    --primary-green-pill: #E6F4EA;

    --accent-orange: #F97316;
    --accent-purple: #8B5CF6;
    --accent-blue: #3B82F6;
    --accent-yellow: #D97706;

    --text-heading: #0F172A;
    --text-body: #475569;
    --text-muted: #64748B;
    --border-color: #E2E8F0;"""

css = css.replace(old_root, new_root)

# 2. General replacements for hardcoded dark background and border colors
css = re.sub(r'#080C14|#080c14|#040711|#080D1A', '#F8FAFC', css)
css = re.sub(r'#0C1220|#0d1629|#0D1629', '#FFFFFF', css)
css = re.sub(r'#121A2B|#172238|#111827', '#FFFFFF', css)

# 3. Replace white text on dark with dark slate text for headings and icons
css = css.replace('color: #FFFFFF;', 'color: #0F172A;')
css = css.replace('color: #ffffff;', 'color: #0F172A;')
css = css.replace('color: #FFFFFF !important;', 'color: #0F172A !important;')

# Fix exceptions where text should be white (e.g., inside green/primary/accent buttons & badges)
css = css.replace('.btn-primary {', '.btn-primary {\n    color: #FFFFFF !important;')
css = css.replace('.badge-success {', '.badge-success {\n    color: #047857 !important;\n    background: #E6F4EA !important;')
css = css.replace('.logo-icon-box {', '.logo-icon-box {\n    background-color: #10B981 !important;\n    color: #FFFFFF !important;')

# 4. Replace translucent white borders with light slate borders
css = re.sub(r'rgba\(255,\s*255,\s*255,\s*0\.(?:0[1-9]|1[0-9]|2[0-9])\)', '#E2E8F0', css)

# 5. Add custom light theme overrides at the end of styles.css
light_overrides = """

/* ==========================================================================
   ADMIN LIGHT THEME POLISH OVERRIDES
   ========================================================================== */
body {
    background-color: #F8FAFC !important;
    color: #0F172A !important;
}

.sidebar {
    background-color: #FFFFFF !important;
    border-right: 1px solid #E2E8F0 !important;
    box-shadow: 2px 0 10px rgba(0,0,0,0.03) !important;
}

.sidebar-menu li a {
    color: #475569 !important;
}

.sidebar-menu li a:hover {
    background-color: #F1F5F9 !important;
    color: #0F172A !important;
}

.sidebar-menu li.active a,
.sidebar-menu li a.active {
    background-color: #E6F4EA !important;
    color: #047857 !important;
    font-weight: 700 !important;
}

.main-content {
    background-color: #F8FAFC !important;
}

.top-header, header.admin-header {
    background-color: #FFFFFF !important;
    border-bottom: 1px solid #E2E8F0 !important;
}

.card, .stat-card, .data-card, .chart-card, .table-card {
    background-color: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04) !important;
    color: #0F172A !important;
}

.card-title, h1, h2, h3, h4, h5, h6 {
    color: #0F172A !important;
}

table {
    background-color: #FFFFFF !important;
    color: #1E293B !important;
}

th {
    background-color: #F8FAFC !important;
    color: #475569 !important;
    border-bottom: 1px solid #E2E8F0 !important;
}

td {
    border-bottom: 1px solid #F1F5F9 !important;
    color: #1E293B !important;
}

tr:hover td {
    background-color: #F8FAFC !important;
}

input, select, textarea {
    background-color: #F8FAFC !important;
    border: 1px solid #CBD5E1 !important;
    color: #0F172A !important;
}

input:focus, select:focus, textarea:focus {
    border-color: #10B981 !important;
    background-color: #FFFFFF !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15) !important;
}

.modal-content, .modal-box {
    background-color: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    color: #0F172A !important;
    box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important;
}

.badge-pending, .badge-warning {
    background-color: #FEF3C7 !important;
    color: #B45309 !important;
}

.badge-success, .badge-completed {
    background-color: #E6F4EA !important;
    color: #047857 !important;
}

.badge-danger, .badge-cancelled {
    background-color: #FEE2E2 !important;
    color: #B91C1C !important;
}
"""

css += light_overrides

with open('admin/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Admin styles converted to Light Theme!")
