import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════
# FIX 1 — Code: Replace raw piece assignment with sanitized build
# ════════════════════════════════════════════════════════════════
OLD_PIECE = "        const piece = this.state.pieceDesc || 'jewelry piece';\n        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';"

NEW_PIECE  = """        // ── PIECE LABEL: Always enforce correct category type word ──────────────
        // Users sometimes type the wrong category word (e.g. 'bracelet' when ring is
        // selected, or carry over an old description from a previous category session).
        // We sanitize the raw description by stripping ALL jewelry-type words and any
        // material descriptors, then always prepend: material + correct category type.
        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';
        const catLabels = {
            'ring': 'ring', 'necklace': 'necklace', 'earring': 'earrings',
            'bracelet': 'bracelet', 'bangle': 'bangle', 'anklet': 'anklet',
            'pendant': 'pendant', 'brooch': 'brooch',
        };
        const catWord = catLabels[category] || category;
        // Strip jewelry type words so wrong category can't bleed in
        const _typeWords = 'ring|rings|necklace|necklaces|earring|earrings|bracelet|bracelets|bangle|bangles|anklet|anklets|pendant|pendants|brooch|brooches|brooche';
        // Strip material text the user may have typed manually
        const _matWords = '925\\\\s*sterling\\\\s*silver|sterling\\\\s*silver|18k\\\\s*gold|14k\\\\s*gold|rose\\\\s*gold|yellow\\\\s*gold|white\\\\s*gold|platinum|\\\\b925\\\\b';
        let _rawDesc = this.state.pieceDesc || '';
        _rawDesc = _rawDesc.replace(new RegExp('\\\\b(' + _typeWords + ')\\\\b', 'gi'), '');
        _rawDesc = _rawDesc.replace(new RegExp('(' + _matWords + ')', 'gi'), '');
        _rawDesc = _rawDesc.replace(/\\s+/g, ' ').trim();
        // piece = "925 Sterling Silver ring with diamonds accents" (always correct type)
        const piece = _rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`;"""

if OLD_PIECE in ps:
    ps = ps.replace(OLD_PIECE, NEW_PIECE)
    fixes.append('FIX 1 OK: piece variable now sanitized and category-enforced')
else:
    fixes.append('FIX 1 MISS: piece declaration not matched — checking...')
    idx = ps.find("const piece = this.state.pieceDesc")
    print(repr(ps[idx:idx+200]))

# ════════════════════════════════════════════════════════════════
# FIX 2 — UI: Update placeholder to NOT include jewelry type word
# ════════════════════════════════════════════════════════════════
OLD_PH = 'placeholder="e.g. multi-band crossover ring with pavé diamond accents and intertwining silver bands"'
NEW_PH  = 'placeholder="Describe style only — e.g. multi-band crossover with pavé diamond accents (jewelry type & material are auto-injected from your selections above)"'

if OLD_PH in ps:
    ps = ps.replace(OLD_PH, NEW_PH)
    fixes.append('FIX 2 OK: placeholder updated to guide design-only description')
else:
    fixes.append('FIX 2 MISS: placeholder not matched')
    idx = ps.find('placeholder="e.g. multi-band')
    print(repr(ps[idx:idx+200]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

print()
for f in fixes: print(f'  {f}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('catWord = catLabels[category]' in ps2,                    'catWord correctly derived'),
    ('_rawDesc = this.state.pieceDesc' in ps2,                   'Raw desc from state'),
    ('_typeWords' in ps2,                                        'Type words strip pattern'),
    ('_matWords' in ps2,                                         'Material words strip pattern'),
    ('material} ${catWord}' in ps2,                             'material + catWord prepended'),
    ('Describe style only' in ps2,                              'UI placeholder updated'),
    ('auto-injected from your selections' in ps2,               'UI guidance text present'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
