import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the exact piece builder block and fix the category references
OLD_CATWORD = "        const catWord = catLabels[category] || category;"
NEW_CATWORD  = "        const catWord = catLabels[this.state.category] || this.state.category;"

if OLD_CATWORD in ps:
    ps = ps.replace(OLD_CATWORD, NEW_CATWORD)
    print('OK: catWord now uses this.state.category')
else:
    print('MISS: catWord line not found')
    # Try to find it
    idx = ps.find('catWord = catLabels')
    print(repr(ps[idx:idx+100]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print()
checks = [
    ('catLabels[this.state.category]' in ps2,  'catWord uses this.state.category'),
    ('catLabels[category] || category' not in ps2, 'bare category reference removed'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
