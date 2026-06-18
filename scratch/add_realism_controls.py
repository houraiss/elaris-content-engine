"""
Two changes:
1. CSS: Remove text truncation from archetype cards, size up fonts
2. JS: Add Realism Controls section in Advanced Controls
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css_path = 'css/styles.css'
js_path = 'js/prompt-studio.js'
html_path = 'index.html'

css = open(css_path, 'r', encoding='utf-8').read()
ps = open(js_path, 'r', encoding='utf-8').read()
html = open(html_path, 'r', encoding='utf-8').read()

# ╔══════════════════════════════════════════════════════╗
# ║  PART 1: CSS — Fix text truncation in archetype cards ║
# ╚══════════════════════════════════════════════════════╝

print('=== PART 1: CSS text truncation fix ===')

# Fix .ps-arch-name: remove nowrap/ellipsis, bump font size
css = css.replace(
    '''.ps-arch-name {
    font-size: 13px; font-weight: 700;
    color: var(--text-primary); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}''',
    '''.ps-arch-name {
    font-size: 14px; font-weight: 700;
    color: var(--text-primary); line-height: 1.25;
}'''
)
print('  ✓ .ps-arch-name: nowrap removed, font 13→14px')

# Fix .ps-arch-tag: remove nowrap
old_tag = '''.ps-arch-tag {
    font-size: 11px; color: var(--text-secondary);
    font-style: italic; margin-top: 3px; line-height: 1.3;
    white-space: nowrap; '''
new_tag = '''.ps-arch-tag {
    font-size: 12px; color: var(--text-secondary);
    font-style: italic; margin-top: 3px; line-height: 1.3;
    '''
if old_tag in css:
    css = css.replace(old_tag, new_tag)
    print('  ✓ .ps-arch-tag: nowrap removed, font 11→12px')
else:
    # Try finding and patching differently
    idx = css.find('.ps-arch-tag {')
    if idx > 0:
        end = css.find('}', idx) + 1
        old = css[idx:end]
        new_rule = re.sub(r'font-size:\s*\d+px', 'font-size: 12px', old)
        new_rule = re.sub(r'white-space:\s*nowrap;\s*', '', new_rule)
        css = css[:idx] + new_rule + css[end:]
        print('  ✓ .ps-arch-tag patched (alt method)')

# Fix .ps-arch-bestfor: remove nowrap/ellipsis, bump font size
css = css.replace(
    '''.ps-arch-bestfor {
    font-size: 10px; color: var(--moroccan-bronze);
    margin-top: 3px; font-weight: 500; opacity: 0.9; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}''',
    '''.ps-arch-bestfor {
    font-size: 11px; color: var(--moroccan-bronze);
    margin-top: 3px; font-weight: 500; opacity: 0.9; line-height: 1.4;
}'''
)
print('  ✓ .ps-arch-bestfor: nowrap removed, font 10→11px')

# Fix .ps-arch-info: remove overflow:hidden (text needs to show)
css = css.replace(
    '.ps-arch-info { flex: 1; min-width: 0; overflow: hidden; }',
    '.ps-arch-info { flex: 1; min-width: 0; }'
)
print('  ✓ .ps-arch-info: overflow:hidden removed')

# Fix card alignment: icon should align to top when text wraps
css = css.replace(
    '''.ps-arch-card {
    display: flex;
    align-items: center;''',
    '''.ps-arch-card {
    display: flex;
    align-items: flex-start;'''
)
print('  ✓ .ps-arch-card: align-items center→flex-start')

# Also update the compact media query sizes (these override at smaller breakpoints)
# Find all .ps-arch-name { font-size: 13px; } in media queries and update
css = css.replace('.ps-arch-name { font-size: 13px; }', '.ps-arch-name { font-size: 13px; }')  # keep compact as-is
css = css.replace('.ps-arch-tag { font-size: 10px; }', '.ps-arch-tag { font-size: 11px; }')
css = css.replace('.ps-arch-bestfor { font-size: 10px; }', '.ps-arch-bestfor { font-size: 11px; }')
css = css.replace('.ps-arch-tag { font-size: 9px; }', '.ps-arch-tag { font-size: 10px; }')
css = css.replace('.ps-arch-bestfor { font-size: 9px; }', '.ps-arch-bestfor { font-size: 10px; }')
print('  ✓ Media query sizes bumped up by 1px across breakpoints')

# Also remove overflow:hidden from .ps-arch-info in media queries
css = css.replace('.ps-arch-info { min-width: 0; overflow: hidden; }', '.ps-arch-info { min-width: 0; }')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('  → CSS saved')

# ╔══════════════════════════════════════════════════════╗
# ║  PART 2: JS — Add Realism Controls                   ║
# ╚══════════════════════════════════════════════════════╝

print('\n=== PART 2: JS — Add Realism Controls ===')

# ── 2a. Add realism properties to state object ──────────────────────────
old_state_end = '''        hallmarkEnabled: false,
        history: [],
        jewelryCount: 0,
        consistencyOn: false,
        modelGender: 'female',
        jewelryStyle: [],
        activeProfileId: 'lina',
        profiles: [],
    }'''

new_state_end = '''        hallmarkEnabled: false,
        history: [],
        jewelryCount: 0,
        consistencyOn: false,
        modelGender: 'female',
        jewelryStyle: [],
        activeProfileId: 'lina',
        profiles: [],
        // Realism controls
        skinTexture: 'natural',
        wrinkles: 'none',
        bodyHair: 'none',
        skinDetail: 'none',
    }'''

if old_state_end in ps:
    ps = ps.replace(old_state_end, new_state_end)
    print('  ✓ Added realism state properties')
else:
    print('  ✗ Could not find state end — manual fix needed')

# ── 2b. Add realism data arrays after stylings array ──────────────────────
# Find the stylings array definition
stylings_end_pattern = r"(        this\.stylings\s*=\s*\[.*?\];)"
stylings_match = re.search(stylings_end_pattern, ps, re.DOTALL)

REALISM_ARRAYS = '''

        // ── Scene Realism controls ──────────────────────────
        this.skinTextures = [
            { id: 'natural',   label: '🌿 Natural' },
            { id: 'pores',     label: '🔬 Pores & Texture' },
            { id: 'smooth',    label: '✨ Polished Smooth' },
            { id: 'luminous',  label: '💫 Luminous Glow' },
        ];
        this.wrinkleLevels = [
            { id: 'none',      label: '✦ None' },
            { id: 'subtle',    label: '🌾 Subtle Lines' },
            { id: 'natural',   label: '🧬 Natural' },
            { id: 'character', label: '🎭 Character Lines' },
        ];
        this.bodyHairLevels = [
            { id: 'none',    label: '✦ None' },
            { id: 'fine',    label: '🪶 Fine & Subtle' },
            { id: 'natural', label: '🌱 Natural Visible' },
        ];
        this.skinDetails = [
            { id: 'none',      label: '✦ Standard' },
            { id: 'veins',     label: '🩸 Veins Visible' },
            { id: 'freckles',  label: '🌟 Freckles / Spots' },
            { id: 'translucent', label: '💎 Skin Translucency' },
        ];'''

if stylings_match:
    insert_pos = stylings_match.end()
    ps = ps[:insert_pos] + REALISM_ARRAYS + ps[insert_pos:]
    print('  ✓ Added realism data arrays')
else:
    print('  ✗ Could not find stylings array end — trying alternate')
    # Try to find _init or similar
    alt_idx = ps.find("this.stylings = [")
    if alt_idx > 0:
        end = ps.find('];', alt_idx) + 2
        ps = ps[:end] + REALISM_ARRAYS + ps[end:]
        print('  ✓ Added realism arrays (alternate method)')

# ── 2c. Add Realism Controls HTML in Advanced Controls ──────────────────────
# Insert AFTER the Model Styling form-group, before the closing div
# The Model Styling chip-group ends with:
old_styling_end = '''                            <div class="ps-chip-group" id="ps-styling">
                                ${this.stylings.map(s => `<button class="ps-chip ${s.id === this.state.styling ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">'''

REALISM_HTML = '''                            <div class="ps-chip-group" id="ps-styling">
                                ${this.stylings.map(s => `<button class="ps-chip ${s.id === this.state.styling ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>

                        <!-- ── Scene Realism Controls ─────────────────── -->
                        <div class="form-group" style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border)">
                            <label class="form-label" style="font-size:11px;letter-spacing:0.06em;opacity:0.7;text-transform:uppercase;font-weight:700">🎭 Scene Realism</label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skin Texture</label>
                            <div class="ps-chip-group" id="ps-skin-texture">
                                ${this.skinTextures.map(s => `<button class="ps-chip ${s.id === this.state.skinTexture ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Expression Lines / Wrinkles</label>
                            <div class="ps-chip-group" id="ps-wrinkles">
                                ${this.wrinkleLevels.map(w => `<button class="ps-chip ${w.id === this.state.wrinkles ? 'active' : ''}" data-val="${w.id}">${w.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Body Hair <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-body-hair">
                                ${this.bodyHairLevels.map(b => `<button class="ps-chip ${b.id === this.state.bodyHair ? 'active' : ''}" data-val="${b.id}">${b.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skin Detail</label>
                            <div class="ps-chip-group" id="ps-skin-detail">
                                ${this.skinDetails.map(d => `<button class="ps-chip ${d.id === this.state.skinDetail ? 'active' : ''}" data-val="${d.id}">${d.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">'''

if old_styling_end in ps:
    ps = ps.replace(old_styling_end, REALISM_HTML)
    print('  ✓ Added Realism Controls HTML in Advanced Controls')
else:
    print('  ✗ Could not find Model Styling end pattern')
    print('  Trying to locate it...')
    idx = ps.find('id="ps-styling"')
    if idx > 0:
        print(f'  ps-styling found at {idx}')
        ctx = ps[idx:idx+300]
        print(repr(ctx[:200]))

# ── 2d. Add event binding for realism controls ──────────────────────────
# Find where styling events are bound
old_styling_event = "        this.container.querySelector('#ps-styling')?.addEventListener('click', e => {"
if old_styling_event not in ps:
    # Try to find the general chip binding pattern
    styling_event_idx = ps.find("'#ps-styling'")
    if styling_event_idx < 0:
        styling_event_idx = ps.find('"ps-styling"')
    print(f'  Styling event at index: {styling_event_idx}')
    if styling_event_idx > 0:
        print(repr(ps[max(0,styling_event_idx-50):styling_event_idx+200]))

# Simpler: find the block that binds chip groups and add realism bindings after
# Pattern: look for a block that binds multiple chip groups
chip_bind_pattern = r"container\.querySelector\('#ps-styling'\).*?this\.state\.styling.*?\}.*?\}"
chip_bind_match = re.search(chip_bind_pattern, ps, re.DOTALL)
if chip_bind_match:
    end_pos = chip_bind_match.end()
    
    REALISM_EVENTS = """

        // ── Scene Realism events ──────────────────────────
        this.container.querySelector('#ps-skin-texture')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.skinTexture = btn.dataset.val;
            this.container.querySelectorAll('#ps-skin-texture .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-wrinkles')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.wrinkles = btn.dataset.val;
            this.container.querySelectorAll('#ps-wrinkles .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-body-hair')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.bodyHair = btn.dataset.val;
            this.container.querySelectorAll('#ps-body-hair .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-skin-detail')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.skinDetail = btn.dataset.val;
            this.container.querySelectorAll('#ps-skin-detail .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });"""
    
    ps = ps[:end_pos] + REALISM_EVENTS + ps[end_pos:]
    print('  ✓ Added realism event binding')
else:
    print('  ✗ Could not find styling event pattern — realism events need manual addition')
    # Try simpler method: find styling event block
    s_idx = ps.find("state.styling =")
    if s_idx > 0:
        # Find end of that handler
        end_handler = ps.find('\n        });', s_idx)
        if end_handler > 0:
            REALISM_EVENTS = """

        // ── Scene Realism events ──────────────────────────
        this.container.querySelector('#ps-skin-texture')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.skinTexture = btn.dataset.val;
            this.container.querySelectorAll('#ps-skin-texture .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-wrinkles')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.wrinkles = btn.dataset.val;
            this.container.querySelectorAll('#ps-wrinkles .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-body-hair')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.bodyHair = btn.dataset.val;
            this.container.querySelectorAll('#ps-body-hair .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });
        this.container.querySelector('#ps-skin-detail')?.addEventListener('click', e => {
            const btn = e.target.closest('.ps-chip');
            if (!btn) return;
            this.state.skinDetail = btn.dataset.val;
            this.container.querySelectorAll('#ps-skin-detail .ps-chip').forEach(b => b.classList.toggle('active', b === btn));
        });"""
            ps = ps[:end_handler+12] + REALISM_EVENTS + ps[end_handler+12:]
            print('  ✓ Added realism events (alternate method)')

# ── 2e. Modify _buildPrompt to use realism state instead of random pool ──────────────────────
# Find the realismPool random selection and replace with user-controlled selection
old_realism = '''            realismDesc = realismPool[Math.floor(Math.random() * realismPool.length)];
        }'''

new_realism = '''            // Use user-controlled realism settings if any are set
            const userSkinTexture = this.state?.skinTexture || 'natural';
            const userWrinkles = this.state?.wrinkles || 'none';
            const userBodyHair = this.state?.bodyHair || 'none';
            const userSkinDetail = this.state?.skinDetail || 'none';

            const realismParts = [];

            // Skin texture
            const skinTextureMap = {
                'natural':  'natural photorealistic skin texture with authentic micro-detail',
                'pores':    'visible skin pores and fine texture, hyperrealistic skin surface',
                'smooth':   'professionally smooth skin, polished editorial finish',
                'luminous': 'luminous skin glow, soft subsurface scattering effect',
            };
            if (userSkinTexture !== 'natural') realismParts.push(skinTextureMap[userSkinTexture] || '');

            // Wrinkles / expression lines
            const wrinkleMap = {
                'none':      '',
                'subtle':    'subtle natural expression lines, authentic skin character',
                'natural':   'natural wrinkles and skin creases visible, photorealistic authenticity',
                'character': 'prominent character expression lines, aged editorial realism',
            };
            if (userWrinkles !== 'none') realismParts.push(wrinkleMap[userWrinkles] || '');

            // Body hair
            const bodyHairMap = {
                'none':    '',
                'fine':    'fine subtle arm hair visible, natural human skin detail',
                'natural': 'natural body hair visible on arms and hands, authentic human realism',
            };
            if (userBodyHair !== 'none') realismParts.push(bodyHairMap[userBodyHair] || '');

            // Skin detail
            const skinDetailMap = {
                'none':        '',
                'veins':       'subtle veins visible beneath skin, dermal translucency',
                'freckles':    'natural freckles and sun spots visible on skin',
                'translucent': 'skin translucency with subsurface scattering, light passing through thin skin areas',
            };
            if (userSkinDetail !== 'none') realismParts.push(skinDetailMap[userSkinDetail] || '');

            if (realismParts.length > 0) {
                realismDesc = realismParts.filter(Boolean).join(', ');
            } else {
                // Fall back to the random realism pool for variety
                realismDesc = realismPool[Math.floor(Math.random() * realismPool.length)];
            }
        }'''

if old_realism in ps:
    ps = ps.replace(old_realism, new_realism)
    print('  ✓ Modified _buildPrompt to use user-controlled realism settings')
else:
    print('  ✗ Could not find realismDesc random pool end — checking...')
    idx = ps.find('realismPool[Math.floor')
    if idx > 0:
        print(f'  Found at {idx}:', repr(ps[idx:idx+100]))

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(ps)
print('  → JS saved')

# ── Bump versions ──────────────────────────────────────────────────────
m_css = re.search(r'styles\.css\?v=(\d+)', html)
m_js = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m_css:
    v = int(m_css.group(1))
    html = html.replace(f'styles.css?v={v}', f'styles.css?v={v+1}')
    print(f'\n  CSS v{v} → v{v+1}')
if m_js:
    v = int(m_js.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    print(f'  JS v{v} → v{v+1}')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('\n=== VERIFICATION ===')
css2 = open(css_path, 'r', encoding='utf-8').read()
ps2 = open(js_path, 'r', encoding='utf-8').read()
print('CSS brace balance:', css2.count('{') - css2.count('}'))
print('No white-space:nowrap in ps-arch-name:', 'white-space: nowrap' not in css2[css2.find('.ps-arch-name'):css2.find('.ps-arch-name')+200])
print('skinTextures array in JS:', 'this.skinTextures = [' in ps2)
print('wrinkleLevels array in JS:', 'this.wrinkleLevels = [' in ps2)
print('bodyHairLevels array in JS:', 'this.bodyHairLevels = [' in ps2)
print('skinDetails array in JS:', 'this.skinDetails = [' in ps2)
print('ps-skin-texture in HTML:', 'ps-skin-texture' in ps2)
print('ps-wrinkles in HTML:', 'ps-wrinkles' in ps2)
print('ps-body-hair in HTML:', 'ps-body-hair' in ps2)
print('ps-skin-detail in HTML:', 'ps-skin-detail' in ps2)
print('Realism events in JS:', "state.skinTexture = btn" in ps2)
print('Realism in _buildPrompt:', 'skinTextureMap' in ps2)
print('state.skinTexture in state:', "skinTexture: 'natural'" in ps2)
print()
print('DONE.')
