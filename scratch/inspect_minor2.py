import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── m5: Find where template filter tabs are rendered ──────────────────
print('=== m5: Template filter tab rendering ===')
tpl = open('js/templates.js', 'r', encoding='utf-8').read()

# Find filter tab render / categories array
for keyword in ['filter', 'CATEGORY_TABS', 'categoryTabs', 'catTabs', 'filterCateg']:
    matches = [m.start() for m in re.finditer(keyword, tpl, re.IGNORECASE)]
    if matches:
        print(f'\n"{keyword}" found {len(matches)} times:')
        for idx in matches[:3]:
            print(f'  pos {idx}: {repr(tpl[idx:idx+120])}')

# Look for the array that defines filter buttons
print('\n--- Looking for category tab definition ---')
tab_patterns = [
    r'\[\s*[\'"](all|rhodie|fes|heritage)',
    r'categories?\s*[:=]\s*\[',
    r'tabs?\s*[:=]\s*\[',
    r'FILTERS?\s*[:=]\s*\['
]
for p in tab_patterns:
    m = re.search(p, tpl, re.IGNORECASE)
    if m:
        print(f'Pattern "{p}" found at pos {m.start()}:')
        print(tpl[m.start():m.start()+400])
        break

# Also check prompt-studio.js for similar tab filter patterns
print('\n\n--- Filter in prompt-studio.js? ---')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
# Look for beldi in templates rendering
for keyword in ['rhodie', 'fes', 'heritage', 'beldi', 'tpl_cat']:
    idx = ps.find(keyword)
    if idx > 0:
        print(f'{keyword} in prompt-studio.js at {idx}: {repr(ps[idx:idx+100])}')

# ── m6: Check tip 3 icon ──────────────────────────────────────────────
print('\n\n=== m6: Quick Tips icons ===')
tips = re.findall(r'<div class="ps-tip">([^\n<]{1,100})', ps)
for i, t in enumerate(tips):
    print(f'  Tip {i+1}: {t[:80]}')
