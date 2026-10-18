import glob

for fpath in glob.glob('*.html'):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(fpath, 'r', encoding='latin-1') as f:
            content = f.read()
    
    # Update header hamburger button
    new_content = content.replace('<a href="#0" class="open_close">', '<a href="#0" class="open_close d-lg-none">')
    
    # Restore drawer close button inside #header_menu
    new_content = new_content.replace('<div id="header_menu">\n\t\t\t\t\t\t<a href="#0" class="open_close d-lg-none">', '<div id="header_menu">\n\t\t\t\t\t\t<a href="#0" class="open_close">')
    new_content = new_content.replace('<div id="header_menu">\n\t\t\t\t<a href="#0" class="open_close d-lg-none">', '<div id="header_menu">\n\t\t\t\t<a href="#0" class="open_close">')
    new_content = new_content.replace('<div id="header_menu">\n                    <a href="#0" class="open_close d-lg-none">', '<div id="header_menu">\n                    <a href="#0" class="open_close">')
    
    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {fpath}")
