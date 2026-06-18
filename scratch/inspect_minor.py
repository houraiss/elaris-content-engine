import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
css = open('css/styles.css', 'r', encoding='utf-8').read()
tpl = open('js/templates.js', 'r', encoding='utf-8').read()
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()

# ── m1: Check if degree sign fallback is already fixed ──────────────────
print('=== m1: Degree sign fallback ===')
idx = ps.find('45°')
if idx > 0:
    print(f'✓ 45° fixed: {repr(ps[idx:idx+40])}')
else:
    print('✗ 45° NOT found - still broken')
    idx2 = ps.find('45')
    print(f'  45 context: {repr(ps[idx2:idx2+40])}')

# ── m2: bestFor format consistency ──────────────────────────────────────
print('\n=== m2: bestFor strings format ===')
bestfor_list = re.findall(r"bestFor:\s*'([^']{0,200})'", ps)
has_prefix = [b for b in bestfor_list if b.lower().startswith('best for')]
no_prefix = [b for b in bestfor_list if not b.lower().startswith('best for')]
print(f'Total bestFor strings: {len(bestfor_list)}')
print(f'With "Best for:" prefix: {len(has_prefix)}')
print(f'Without prefix: {len(no_prefix)}')
print()
# Show a sample of each
if has_prefix:
    print('WITH prefix:')
    for b in has_prefix[:3]:
        print(f'  {repr(b[:70])}')
if no_prefix:
    print('\nWITHOUT prefix:')
    for b in no_prefix[:3]:
        print(f'  {repr(b[:70])}')
# How does the UI display bestFor?
print('\nHow bestFor is rendered:')
render_idx = ps.find('bestFor')
while render_idx != -1:
    ctx = ps[render_idx:render_idx+200]
    if 'innerHTML' in ctx or 'textContent' in ctx or 'innerText' in ctx or '.bestFor' in ctx:
        print(f'  pos {render_idx}: {repr(ctx[:120])}')
    render_idx = ps.find('bestFor', render_idx+1)

# ── m4: ps-chip-group at 360px ──────────────────────────────────────────
print('\n=== m4: ps-chip-group 360px overflow ===')
chip_rules = re.findall(r'\.ps-chip-group[^{]*\{[^}]*\}', css)
for r in chip_rules:
    print(f'  {r[:100]}')
idx360 = css.find('360px')
if idx360 > 0:
    print(f'  360px rule exists at pos {idx360}: {css[idx360-30:idx360+150]}')
else:
    print('  NO 360px media query found for chips')

# ── m5: Templates beldi filter tab ──────────────────────────────────────
print('\n=== m5: Templates beldi filter tab ===')
# Check if there's a filter tab array/function in templates.js
filter_tabs = re.findall(r"filterTabs?|categories.*filter|FILTER|tabCateg", tpl, re.IGNORECASE)
print(f'Filter tab references in templates.js: {len(filter_tabs)}')
# Find category tabs definition
cat_tab_idx = tpl.find('rhodie')
if cat_tab_idx > 0:
    print('Category tab context:')
    print(tpl[max(0,cat_tab_idx-200):cat_tab_idx+300])
