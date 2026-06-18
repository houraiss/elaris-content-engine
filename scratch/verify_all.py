import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print('╔══════════════════════════════════════════════════════╗')
print('║       FINAL COMPLETE VERIFICATION SWEEP             ║')
print('╚══════════════════════════════════════════════════════╝')
print()

ALL_GOOD = True

# ── 1. Mojibake in ALL JS files ────────────────────────────────────────
print('1. MOJIBAKE SCAN (all JS files)')
BAD_PATTERNS = [
    r'[≡][ƒ][^\s\'"`,;\n\r]{0,8}',
    r'[Γ][£ÇöǓ][^\s\'"`,;\n\r]{0,6}',
    r'[├╖╕][⌐ùö░]',
    r'[┬][░]',
]
for fn in sorted(os.listdir('js')):
    if not fn.endswith('.js'): continue
    content = open(f'js/{fn}', 'r', encoding='utf-8').read()
    issues = []
    for p in BAD_PATTERNS:
        for m in re.finditer(p, content):
            issues.append(m.group())
    if issues:
        print(f'   ✗ {fn}: {list(dict.fromkeys(issues))[:5]}')
        ALL_GOOD = False
    else:
        print(f'   ✓ {fn}')

# ── 2. Critical fixes check ─────────────────────────────────────────────
print('\n2. CRITICAL FIXES')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()

checks = [
    ('pavé', ps, True, 'pavé (French) in prompt-studio.js'),
    ('café', ps, True, 'café in prompt-studio.js'),
    ('Jewelry × Type Design', ps, True, 'Bold Typography tagline'),
    ('45°', ps, True, 'Degree sign in angle fallback'),
    ('✓', ps, True, 'Checkmark in copy toasts'),
    ('tpl_cat_beldi', i18n, True, 'tpl_cat_beldi in i18n.js'),
    ('├', ps, False, '├ box-drawing mojibake'),
    ('┬░', ps, False, '┬░ degree mojibake'),
    ('≡ƒ', ps, False, '≡ƒ emoji mojibake'),
]
for term, source, should_exist, desc in checks:
    found = term in source
    ok = found == should_exist
    status = '✓' if ok else '✗'
    if not ok:
        ALL_GOOD = False
    print(f'   {status} {desc}: {"FOUND" if found else "NOT FOUND"} (expected {"present" if should_exist else "absent"})')

# ── 3. i18n duplicate check ─────────────────────────────────────────────
print('\n3. i18n DUPLICATE KEYS')
beldi_count = i18n.count('tpl_cat_beldi')
ok = beldi_count == 3
print(f'   {"✓" if ok else "✗"} tpl_cat_beldi count: {beldi_count} (expected 3 — one per language)')
if not ok:
    ALL_GOOD = False

# ── 4. CSS health ───────────────────────────────────────────────────────
print('\n4. CSS HEALTH')
css = open('css/styles.css', 'r', encoding='utf-8').read()
balance = css.count('{') - css.count('}')
print(f'   {"✓" if balance == 0 else "✗"} Brace balance: {balance} (expected 0)')
print(f'   {"✓" if ".mobile-menu-btn.active" in css else "✗"} Hamburger .active animation: {"present" if ".mobile-menu-btn.active" in css else "MISSING"}')
print(f'   {"✓" if ".mobile-menu-btn.open" not in css else "✗"} Old .mobile-menu-btn.open: {"absent" if ".mobile-menu-btn.open" not in css else "STILL PRESENT"}')
if balance != 0 or '.mobile-menu-btn.active' not in css:
    ALL_GOOD = False

# ── 5. Version numbers ──────────────────────────────────────────────────
print('\n5. CACHE VERSION NUMBERS')
html = open('index.html', 'r', encoding='utf-8').read()
for pattern, name in [
    (r'styles\.css\?v=(\d+)', 'CSS'),
    (r'prompt-studio\.js\?v=(\d+)', 'prompt-studio.js'),
    (r'app\.js\?v=(\d+)', 'app.js'),
    (r'i18n\.js\?v=(\d+)', 'i18n.js'),
]:
    m = re.search(pattern, html)
    if m:
        print(f'   {name}: v{m.group(1)}')

# ── 6. Summary ──────────────────────────────────────────────────────────
print()
print('═'*56)
if ALL_GOOD:
    print('✅ ALL CHECKS PASSED — App is clean and ready!')
else:
    print('⚠️  SOME CHECKS FAILED — Review above for details')
print('═'*56)
