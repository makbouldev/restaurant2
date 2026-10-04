import re

with open('admin/script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Track const/let/var declarations of DOM elements
dom_vars = {}
for idx, line in enumerate(lines, 1):
    m = re.search(r'(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*document\.(getElementById|querySelector)\(', line)
    if m:
        var_name = m.group(2)
        dom_vars[var_name] = idx

print(f"Tracked {len(dom_vars)} DOM element variables.")

# Now check usage of these variables for .addEventListener, .style, .classList, .value, .innerHTML without null check
issues = []
for idx, line in enumerate(lines, 1):
    for var_name, decl_line in dom_vars.items():
        # Check if line calls var_name.addEventListener or var_name.style or var_name.classList without if (var_name)
        if re.search(r'\b' + var_name + r'\.(addEventListener|style|classList|innerHTML|textContent|value|setAttribute|removeAttribute|focus|click|reset)\b', line):
            # Check if line or preceding 3 lines have an 'if (var_name)' check
            context = "".join(lines[max(0, idx-4):idx])
            if not (f"if ({var_name})" in context or f"if({var_name})" in context or f"{var_name} &&" in context or f"{var_name}?." in context):
                issues.append((idx, var_name, line.strip()))

print(f"Found {len(issues)} potential un-checked DOM variable calls:")
for idx, var_name, line_code in issues[:40]:
    print(f"L{idx} [{var_name}]: {line_code}")
