import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

print('Current status:')
print('  skinTextures getter:', 'get skinTextures()' in ps)
print('  _bindChipGroup for realism:', 'ps-skin-texture' in ps and '_bindChipGroup' in ps[ps.find('ps-skin-texture')-50:ps.find('ps-skin-texture')+10])

# Check if orphan event block from previous attempt exists
print('  Orphan realism events block:', '// ── Scene Realism events' in ps)

# ── Step 1: Add getters after get stylings() ──────────────────────────
# Find exact end of stylings getter (the closing },)
sty_idx = ps.find('get stylings()')
sty_end = ps.find('\n    },\n\n    // ── State', sty_idx)
if sty_end < 0:
    sty_end = ps.find('\n    },\n\n    jewelryStyles', sty_idx)
print(f'\nstylings getter ends at: {sty_end}')
print('Context:', repr(ps[sty_end:sty_end+60]))

REALISM_GETTERS = """

    // ── Scene Realism getters ──────────────────────
    get skinTextures() {
        return [
            { id: 'natural',    label: '🌿 Natural' },
            { id: 'pores',      label: '🔬 Pores & Texture' },
            { id: 'smooth',     label: '✨ Polished Smooth' },
            { id: 'luminous',   label: '💫 Luminous Glow' },
        ];
    },

    get wrinkleLevels() {
        return [
            { id: 'none',       label: '✦ None' },
            { id: 'subtle',     label: '🌾 Subtle Lines' },
            { id: 'natural',    label: '🧬 Natural' },
            { id: 'character',  label: '🎭 Character Lines' },
        ];
    },

    get bodyHairLevels() {
        return [
            { id: 'none',       label: '✦ None' },
            { id: 'fine',       label: '🪶 Fine & Subtle' },
            { id: 'natural',    label: '🌱 Natural Visible' },
        ];
    },

    get skinDetails() {
        return [
            { id: 'none',         label: '✦ Standard' },
            { id: 'veins',        label: '🩸 Veins Visible' },
            { id: 'freckles',     label: '🌟 Freckles / Spots' },
            { id: 'translucent',  label: '💎 Skin Translucency' },
        ];
    },
"""

if sty_end > 0:
    insert_pos = sty_end + len('\n    },')
    ps = ps[:insert_pos] + REALISM_GETTERS + ps[insert_pos:]
    print('  ✓ Added realism getters after stylings getter')
else:
    print('  ✗ Could not find stylings getter end')

# ── Step 2: Add _bindChipGroup calls after ps-styling ──────────────────
BIND_TARGET = "        this._bindChipGroup('ps-styling', 'styling');"
BIND_REPLACEMENT = """        this._bindChipGroup('ps-styling', 'styling');
        this._bindChipGroup('ps-skin-texture', 'skinTexture');
        this._bindChipGroup('ps-wrinkles', 'wrinkles');
        this._bindChipGroup('ps-body-hair', 'bodyHair');
        this._bindChipGroup('ps-skin-detail', 'skinDetail');"""

if BIND_TARGET in ps:
    ps = ps.replace(BIND_TARGET, BIND_REPLACEMENT)
    print('  ✓ Added realism _bindChipGroup calls')
else:
    print('  ✗ Could not find ps-styling bindChipGroup call')
    # Try to find and show context
    idx = ps.find('ps-styling')
    while idx != -1:
        ctx = ps[max(0,idx-60):idx+100]
        if '_bindChipGroup' in ctx:
            print(f'  Found at {idx}:', repr(ctx[:150]))
        idx = ps.find('ps-styling', idx+1)

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('\n  JS saved.')

# ── Bump version ──────────────────────────────────────────────────────
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'  JS v{v} → v{v+1}')

print('\n=== FINAL VERIFICATION ===')
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
checks = [
    ('get skinTextures()', 'skinTextures getter'),
    ('get wrinkleLevels()', 'wrinkleLevels getter'),
    ('get bodyHairLevels()', 'bodyHairLevels getter'),
    ('get skinDetails()', 'skinDetails getter'),
    ("_bindChipGroup('ps-skin-texture'", 'skinTexture event binding'),
    ("_bindChipGroup('ps-wrinkles'", 'wrinkles event binding'),
    ("_bindChipGroup('ps-body-hair'", 'bodyHair event binding'),
    ("_bindChipGroup('ps-skin-detail'", 'skinDetail event binding'),
    ('ps-skin-texture', 'skin-texture chip group in HTML'),
    ('ps-wrinkles', 'wrinkles chip group in HTML'),
    ('ps-body-hair', 'body-hair chip group in HTML'),
    ('ps-skin-detail', 'skin-detail chip group in HTML'),
    ("skinTexture: 'natural'", 'skinTexture in state'),
    ('skinTextureMap', 'realism in _buildPrompt'),
]
all_ok = True
for term, desc in checks:
    ok = term in ps2
    status = '✓' if ok else '✗'
    if not ok:
        all_ok = False
    print(f'  {status} {desc}')

print()
print('✅ ALL GOOD' if all_ok else '⚠️  SOME ISSUES REMAIN')
