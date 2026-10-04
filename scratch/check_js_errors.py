import re

with open('admin/script.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
print(f"Total lines in admin/script.js: {len(lines)}")

# Find patterns like document.getElementById('...').addEventListener or .querySelector('...').addEventListener
pattern = re.compile(r'document\.(getElementById|querySelector|querySelectorAll)\([^\)]+\)\.(addEventListener|style|classList|innerHTML|textContent|value)')

unsafe_calls = []
for idx, line in enumerate(lines, 1):
    matches = pattern.findall(line)
    if matches:
        unsafe_calls.append((idx, line.strip()))

print(f"\nFound {len(unsafe_calls)} direct unsafe property access calls:")
for line_num, code in unsafe_calls:
    print(f"L{line_num}: {code[:120]}")
