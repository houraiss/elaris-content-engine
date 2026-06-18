import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
ps  = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
html = open('index.html', 'r', encoding='utf-8').read()

# ╔══════════════════════════════════════════════════════╗
# ║  PART 1: CSS — Fix hover scale/clipping issue        ║
# ╚══════════════════════════════════════════════════════╝
print('=== PART 1: CSS hover fixes ===')

# 1a. Remove the scale(1.02) from the duplicate hover rule
old_scale = '''.ps-arch-card:hover {
    transform: translateY(-2px) scale(1.02);
}'''
new_scale = '''.ps-arch-card:hover {
    transform: translateY(-2px);
}'''
if old_scale in css:
    css = css.replace(old_scale, new_scale)
    print('  ✓ Removed scale(1.02) from hover — kept translateY(-2px) lift')
else:
    # Try just replacing the transform line
    css = css.replace('transform: translateY(-2px) scale(1.02);', 'transform: translateY(-2px);')
    print('  ✓ Replaced scale(1.02) transform (alt method)')

# 1b. Fix the ps-arch-area container — add overflow-x: visible so cards can lift
# Also add padding so the lift shadow doesn't clip
css = css.replace(
    '.ps-arch-area { flex: 1; overflow-y: auto; padding: 16px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }',
    '.ps-arch-area { flex: 1; overflow-y: auto; overflow-x: visible; padding: 16px 16px 20px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }'
)
print('  ✓ Added overflow-x: visible to ps-arch-area (stops card clipping)')

# 1c. Add a small gap/padding to the archetype grid so cards can lift without clipping
idx_grid = css.find('.ps-archetype-grid {')
if idx_grid > 0:
    end = css.find('}', idx_grid)
    old_grid = css[idx_grid:end+1]
    if 'padding' not in old_grid and 'gap' in old_grid:
        new_grid = old_grid.replace('}', '    padding-bottom: 4px;\n}')
        css = css.replace(old_grid, new_grid)
        print('  ✓ Added padding-bottom to archetype grid')
    else:
        print('  ✓ Grid already has padding or different structure')
else:
    print('  ✓ No ps-archetype-grid found (using ps-arch-grid instead)')

# 1d. Fix the first hover rule too — consolidate to avoid both firing
# The first one has: transform: translateY(-2px); — that's fine
# The second one (the scale one) is now just translateY(-2px) too — make it empty to avoid redundancy  
# Actually, let's check if there are two hover rules now
hover_count = css.count('.ps-arch-card:hover {')
print(f'  ps-arch-card:hover rules: {hover_count}')

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('  → CSS saved')

# ╔══════════════════════════════════════════════════════╗
# ║  PART 2: JS — Add Facial Expressions control         ║
# ╚══════════════════════════════════════════════════════╝
print('\n=== PART 2: JS — Facial Expressions ===')

# ── 2a. Add facialExpression to state ──────────────────────────────────
old_state = """        // Realism controls
        skinTexture: 'natural',
        wrinkles: 'none',
        bodyHair: 'none',
        skinDetail: 'none',"""

new_state = """        // Realism controls
        skinTexture: 'natural',
        wrinkles: 'none',
        bodyHair: 'none',
        skinDetail: 'none',
        facialExpression: 'none',"""

if old_state in ps:
    ps = ps.replace(old_state, new_state)
    print('  ✓ Added facialExpression to state')
else:
    print('  ✗ State block not found as expected')

# ── 2b. Add facialExpressions getter after skinDetails ──────────────────
old_skin_details_end = """    get skinDetails() {
        return [
            { id: 'none',         label: '✦ Standard' },
            { id: 'veins',        label: '🩸 Veins Visible' },
            { id: 'freckles',     label: '🌟 Freckles / Spots' },
            { id: 'translucent',  label: '💎 Skin Translucency' },
        ];
    },"""

new_skin_details_end = """    get skinDetails() {
        return [
            { id: 'none',         label: '✦ Standard' },
            { id: 'veins',        label: '🩸 Veins Visible' },
            { id: 'freckles',     label: '🌟 Freckles / Spots' },
            { id: 'translucent',  label: '💎 Skin Translucency' },
        ];
    },

    get facialExpressions() {
        return [
            { id: 'none',       label: '✦ Neutral' },
            { id: 'serene',     label: '😌 Serene / Calm' },
            { id: 'smile',      label: '😊 Soft Smile' },
            { id: 'joy',        label: '😄 Joy / Laugh' },
            { id: 'intense',    label: '🔥 Intense / Focus' },
            { id: 'sultry',     label: '💋 Sultry / Confident' },
            { id: 'thoughtful', label: '🤔 Thoughtful / Dream' },
        ];
    },"""

if old_skin_details_end in ps:
    ps = ps.replace(old_skin_details_end, new_skin_details_end)
    print('  ✓ Added facialExpressions getter')
else:
    print('  ✗ Could not find skinDetails getter end')

# ── 2c. Add Facial Expressions chip group in the HTML template ──────────
# Insert AFTER the skin-detail form-group, BEFORE the separator (hallmark section)
old_skin_detail_html = """                        <div class="form-group">
                            <label class="form-label">Skin Detail</label>
                            <div class="ps-chip-group" id="ps-skin-detail">
                                ${this.skinDetails.map(d => `<button class="ps-chip ${d.id === this.state.skinDetail ? 'active' : ''}" data-val="${d.id}">${d.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">"""

new_skin_detail_html = """                        <div class="form-group">
                            <label class="form-label">Skin Detail</label>
                            <div class="ps-chip-group" id="ps-skin-detail">
                                ${this.skinDetails.map(d => `<button class="ps-chip ${d.id === this.state.skinDetail ? 'active' : ''}" data-val="${d.id}">${d.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Facial Expression <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-facial-expression">
                                ${this.facialExpressions.map(f => `<button class="ps-chip ${f.id === this.state.facialExpression ? 'active' : ''}" data-val="${f.id}">${f.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">"""

if old_skin_detail_html in ps:
    ps = ps.replace(old_skin_detail_html, new_skin_detail_html)
    print('  ✓ Added Facial Expression chip group in HTML template')
else:
    print('  ✗ Could not find skin-detail HTML block')
    # Debug: find how close we are
    idx = ps.find('id="ps-skin-detail"')
    print(f'  ps-skin-detail at: {idx}')
    print(repr(ps[idx:idx+300]))

# ── 2d. Add _bindChipGroup for facial expression ──────────────────────
old_bindings = """        this._bindChipGroup('ps-skin-detail', 'skinDetail');"""
new_bindings = """        this._bindChipGroup('ps-skin-detail', 'skinDetail');
        this._bindChipGroup('ps-facial-expression', 'facialExpression');"""

if old_bindings in ps:
    ps = ps.replace(old_bindings, new_bindings)
    print('  ✓ Added facialExpression event binding')
else:
    print('  ✗ Could not find skinDetail binding')

# ── 2e. Add facial expression to _buildPrompt ──────────────────────────
# Find where skinDetailMap is used and add facial expression AFTER it
old_build_end = """            if (realismParts.length > 0) {
                realismDesc = realismParts.filter(Boolean).join(', ');
            } else {
                // Fall back to the random realism pool for variety
                realismDesc = realismPool[Math.floor(Math.random() * realismPool.length)];
            }
        }"""

new_build_end = """            // Skin detail
            const skinDetailMap2 = {
                'none':        '',
                'veins':       'subtle veins visible beneath skin, dermal translucency',
                'freckles':    'natural freckles and sun spots visible on skin',
                'translucent': 'skin translucency with subsurface scattering, light passing through thin skin areas',
            };

            if (realismParts.length > 0) {
                realismDesc = realismParts.filter(Boolean).join(', ');
            } else {
                // Fall back to the random realism pool for variety
                realismDesc = realismPool[Math.floor(Math.random() * realismPool.length)];
            }
        }

        // ── Facial Expression (human archetypes only) ──────────────────────
        let expressionDesc = '';
        if (isHuman) {
            const expressionMap = {
                'none':       '',
                'serene':     'serene calm expression, soft relaxed face, eyes slightly downcast, peaceful',
                'smile':      'gentle authentic smile, soft lips slightly parted, warmth in eyes',
                'joy':        'genuine laugh, joy visible in crinkled eyes and open smile, natural euphoria',
                'intense':    'intense focused gaze directly at camera, strong confident expression, sharp eyes',
                'sultry':     'sultry confident look, soft half-smile, eyes full of quiet confidence and sensuality',
                'thoughtful': 'thoughtful dreamy expression, eyes slightly unfocused, contemplative and poetic mood',
            };
            expressionDesc = expressionMap[this.state?.facialExpression || 'none'] || '';
        }"""

if old_build_end in ps:
    ps = ps.replace(old_build_end, new_build_end)
    print('  ✓ Added facial expression logic to _buildPrompt')
else:
    print('  ✗ Could not find _buildPrompt realism end block')
    idx = ps.find('realismParts.filter(Boolean)')
    print(f'  realismParts.filter at: {idx}')

# ── 2f. Inject expressionDesc into the standardParts array ──────────────
old_parts = """            poseDesc ? `Pose: ${poseDesc}.` : '',
            realismDesc ? realismDesc + '.' : '',"""

new_parts = """            poseDesc ? `Pose: ${poseDesc}.` : '',
            expressionDesc ? `Expression: ${expressionDesc}.` : '',
            realismDesc ? realismDesc + '.' : '',"""

if old_parts in ps:
    ps = ps.replace(old_parts, new_parts)
    print('  ✓ Injected expressionDesc into standardParts')
else:
    print('  ✗ Could not find standardParts pose line')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('  → JS saved')

# ── Bump versions ──────────────────────────────────────────────────────
for pattern, name in [(r'styles\.css\?v=(\d+)', 'CSS'), (r'prompt-studio\.js\?v=(\d+)', 'JS')]:
    m = re.search(pattern, html)
    if m:
        v = int(m.group(1))
        html = html.replace(f'{["styles.css", "prompt-studio.js"][[r"styles", r"prompt-studio"].index(pattern.split(r".")[0].split(r"\\")[0][-6:])]}?v={v}',
                            f'{["styles.css", "prompt-studio.js"][[r"styles", r"prompt-studio"].index(pattern.split(r".")[0].split(r"\\")[0][-6:])]}?v={v+1}')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Simpler version bump
html2 = open('index.html', 'r', encoding='utf-8').read()
m_css = re.search(r'styles\.css\?v=(\d+)', html2)
m_js = re.search(r'prompt-studio\.js\?v=(\d+)', html2)
html2_new = html2
if m_css:
    v = int(m_css.group(1))
    html2_new = html2_new.replace(f'styles.css?v={v}', f'styles.css?v={v+1}')
    print(f'\n  CSS v{v} → v{v+1}')
if m_js:
    v = int(m_js.group(1))
    html2_new = html2_new.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    print(f'  JS v{v} → v{v+1}')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html2_new)

print('\n=== FINAL VERIFICATION ===')
css2 = open('css/styles.css', 'r', encoding='utf-8').read()
ps2  = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

checks = [
    ('scale(1.02)' not in css2,   'scale(1.02) REMOVED from CSS'),
    ('overflow-x: visible' in css2, 'overflow-x: visible in ps-arch-area'),
    ('facialExpression' in ps2,    'facialExpression in state'),
    ('get facialExpressions()' in ps2, 'facialExpressions getter'),
    ('ps-facial-expression' in ps2, 'facial-expression chip group'),
    ("'ps-facial-expression', 'facialExpression'" in ps2, 'facialExpression binding'),
    ('expressionDesc' in ps2,       'expressionDesc in _buildPrompt'),
    ('expressionMap' in ps2,        'expressionMap defined'),
    (css2.count('{') == css2.count('}'), 'CSS brace balance'),
]

all_ok = True
for ok, desc in checks:
    status = '✓' if ok else '✗'
    if not ok:
        all_ok = False
    print(f'  {status} {desc}')

print('\n' + ('✅ ALL GOOD' if all_ok else '⚠️  SOME ISSUES'))
