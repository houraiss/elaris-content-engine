import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Insert Brand Identity card BEFORE the Model & Human Elements card
OLD_MHE = """                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Model &amp; Human Elements</span>"""

NEW_MHE  = """                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Brand Identity</span>
                        </div>
                        <div class="form-group">
                            <p class="text-sm text-muted" style="line-height:1.4;margin-bottom:8px">Add Elaris signature to the model's clothing — a subtle brand identifier so your images are unmistakably yours.</p>
                            <div class="ps-chip-group" id="ps-brand-touch">
                                <button class="ps-chip ${this.state.brandTouch === 'none' ? 'active' : ''}" data-val="none">None</button>
                                <button class="ps-chip ${this.state.brandTouch === 'logomark' ? 'active' : ''}" data-val="logomark" title="Small four-pointed star brooch on lapel">⭐ Logomark</button>
                                <button class="ps-chip ${this.state.brandTouch === 'wordmark' ? 'active' : ''}" data-val="wordmark" title="ELARIS wordmark embroidered on clothing">ELARIS Wordmark</button>
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-top:6px;margin-bottom:0">
                                ${this.state.brandTouch === 'logomark' ? '⭐ Four-pointed star pin brooch on lapel — Elaris signature.' : this.state.brandTouch === 'wordmark' ? '"ELARIS" embroidered on lapel or collar — brand always present.' : 'No brand marking added to scene.'}
                            </p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Model &amp; Human Elements</span>"""

if OLD_MHE in ps:
    ps = ps.replace(OLD_MHE, NEW_MHE, 1)
    print('✓ Brand Identity card added before Model & Human Elements')
else:
    print('✗ Could not find insertion point')
    idx = ps.find('Model &amp; Human Elements')
    print(repr(ps[max(0,idx-200):idx+50]))

# Also add brandTouch re-render on chip click via _bindChipGroup
# (this._bindChipGroup already handles it since we added it to binding earlier)
# But _render() needs to be called after to update the hint text
# Let's check if ps-brand-touch binding is already there
idx_bt = ps.find("'ps-brand-touch'")
print(f'\nps-brand-touch binding at: {idx_bt}')
if idx_bt > 0:
    print(repr(ps[idx_bt:idx_bt+100]))

# Since the hint text is dynamic (uses this.state.brandTouch in template),
# we need to call _render() when the chip changes. Upgrade the binding
# from simple _bindChipGroup to a full render cycle.
OLD_BRAND_BIND = "        // Brand Touch chips\n        this._bindChipGroup('ps-brand-touch', 'brandTouch');"
NEW_BRAND_BIND  = """        // Brand Touch chips — needs _render() to update the hint text
        const btGroup = q('#ps-brand-touch');
        if (btGroup) {
            btGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                btGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.brandTouch = chip.dataset.val;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }"""

if OLD_BRAND_BIND in ps:
    ps = ps.replace(OLD_BRAND_BIND, NEW_BRAND_BIND)
    print('✓ Brand Touch binding upgraded to full re-render')
else:
    print('✗ brand bind anchor not found')
    idx = ps.find('Brand Touch')
    print(repr(ps[idx:idx+120]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Version bump
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Final spot checks
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== FINAL CHECKS ===')
checks = [
    ('Brand Identity' in ps2,                       'Brand Identity card in UI'),
    ('ps-brand-touch' in ps2,                        'Brand Touch chip group'),
    ('ELARIS Wordmark' in ps2,                       'Wordmark chip label'),
    ('_buildPlacementInstruction' in ps2,            '_buildPlacementInstruction defined'),
    ('necklace worn at the FRONT' in ps2,            'Necklace placement rule'),
    ('necklace on the back' in ps2,                  'Necklace-on-back negative'),
    ('disproportionate to body' in ps2,              'Scale negative'),
    ('_buildCategoryNegatives' in ps2,               '_buildCategoryNegatives defined'),
    ('four-pointed star pin brooch' in ps2,          'Logomark description'),
    ('_getAnglesForCategory' in ps2,                 'Smart angle ordering'),
    ("id: 'nour'" in ps2,                            'Nour profile'),
    ("id: 'mehdi'" in ps2,                           'Mehdi profile'),
    ('brandTouchDesc' in ps2,                        'brandTouchDesc in bodyParts'),
    ('btGroup' in ps2,                               'btGroup binding'),
]
all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  CHECK ISSUES')
