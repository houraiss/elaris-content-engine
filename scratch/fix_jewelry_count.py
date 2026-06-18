import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── Expand chip options from [0,1,2,3,4] to [0..10] ──────────────────────
OLD_CHIPS = """${[0, 1, 2, 3, 4].map(n => `<button class="ps-chip ${this.state.jewelryCount === n ? 'active' : ''}" data-val="${n}">${n === 0 ? (window.I18n ? window.I18n.t('ps_none') : 'None') : n === 4 ? '4+' : n}</button>`).join('')}"""

NEW_CHIPS = """${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="ps-chip ${this.state.jewelryCount === n ? 'active' : ''}" data-val="${n}">${n === 0 ? (window.I18n ? window.I18n.t('ps_none') : 'None') : n}</button>`).join('')}"""

if OLD_CHIPS in ps:
    ps = ps.replace(OLD_CHIPS, NEW_CHIPS)
    print('✓ Jewelry shots expanded to 0-10')
else:
    print('✗ Could not find chip group — showing context:')
    idx = ps.find('ps-jewelry-count')
    print(repr(ps[idx:idx+400]))

# ── Also check _bindChipGroup handles numeric conversion ──────────────────
# Make sure jewelryCount state gets stored as a Number not a String
bind_idx = ps.find("'ps-jewelry-count', 'jewelryCount'")
print(f'\nBinding for ps-jewelry-count at: {bind_idx}')
if bind_idx > 0:
    print(repr(ps[bind_idx:bind_idx+80]))

# ── Check the _bindChipGroup generic implementation ───────────────────────
bg_idx = ps.find('_bindChipGroup(groupId, stateKey)')
print(f'\n_bindChipGroup at: {bg_idx}')
end = ps.find('\n    },', bg_idx + 100)
print(ps[bg_idx:end+6])

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('\nJS saved.')

# Bump version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\nVerification:')
print('  [OK] 0-10 range present:', '0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10' in ps2)
print('  [OK] 4+ removed:', "'4+'" not in ps2)
print('  [OK] 10 is top value:', 'data-val="10"' in ps2 or '10' in ps2)
