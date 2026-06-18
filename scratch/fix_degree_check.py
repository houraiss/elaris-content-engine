import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

print('Before fixes:')
print('  "┬░" count:', js.count('┬░'))
print('  "Γ£ô" count:', js.count('Γ£ô'))

FIXES = [
    # The actual degree-sign mojibake (┬░ not ┬°)
    ('┬░', '°'),
    # Checkmark in success toasts (Γ£ô → ✓)
    ('Γ£ô', '✓'),
    # Also check for Γ£ö (another checkmark variant)
    ('Γ£ö', '✓'),
]

total = 0
for bad, good in FIXES:
    count = js.count(bad)
    if count > 0:
        js = js.replace(bad, good)
        print(f'  Fixed {count}x: {repr(bad)} → {good}')
        total += count

print(f'\nTotal: {total} fixes')

# Verify
print(f'\n"45°" in JS: {"45°" in js}')
print(f'"✓" in JS: {"✓" in js}')
print(f'"┬░" remains: {"┬░" in js}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('\nprompt-studio.js saved.')

# Bump JS version
html = open('index.html', 'r', encoding='utf-8').read()
current = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if current:
    v = int(current.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'JS version bumped: v{v} → v{v+1}')

# Also check i18n.js for same patterns
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()
i18n_total = 0
for bad, good in FIXES:
    count = i18n.count(bad)
    if count > 0:
        i18n = i18n.replace(bad, good)
        print(f'i18n.js: Fixed {count}x: {repr(bad)} → {good}')
        i18n_total += count
if i18n_total > 0:
    with open('js/i18n.js', 'w', encoding='utf-8') as f:
        f.write(i18n)
    print('i18n.js saved.')
else:
    print('i18n.js: No issues found.')
