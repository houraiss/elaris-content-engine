import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# FIX 1 — Brand Identity: always visible regardless of garment color
# ════════════════════════════════════════════════════════════════════
OLD_BRAND = """        let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            brandTouchDesc = 'model wearing a small elegant silver four-pointed star pin brooch on the lapel or collar — the ELARIS brand logomark, subtly present as a luxury styling detail';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            brandTouchDesc = 'subtle \"ELARIS\" wordmark delicately embroidered in fine silver thread on the model\\'s lapel or collar, brand identity quietly present in the scene';
        }"""

NEW_BRAND  = """        let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            // Gold metallic pin provides contrast against ANY garment color
            brandTouchDesc = 'model wearing a small polished gold four-pointed star pin brooch on the lapel or collar — the ELARIS brand logomark, gold metallic finish clearly visible against any garment color, a refined luxury styling accent';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            // High-contrast thread: gold on dark garments, charcoal on light — always legible
            brandTouchDesc = '"ELARIS" wordmark embroidered on the model\\'s lapel or collar in high-contrast thread — gold embroidery on dark garments, deep charcoal on light garments — always clearly legible against the clothing, never blending into the fabric';
        }"""

if OLD_BRAND in ps:
    ps = ps.replace(OLD_BRAND, NEW_BRAND)
    fixes.append('FIX 1 OK: Brand touch descriptions updated for visibility')
else:
    fixes.append('FIX 1 MISS: brand touch block not found')
    idx = ps.find('brandTouchDesc =')
    print(f'  brandTouchDesc at: {idx}')
    print(repr(ps[idx:idx+200]))

# ════════════════════════════════════════════════════════════════════
# FIX 2 — Expand Camera Angles from 10 to 22
# ════════════════════════════════════════════════════════════════════
OLD_ANGLES = """get angles() {
        return [
            { id: 'eye-level', label: window.I18n ? window.I18n.t('ps_ang_eye') : 'Eye Level' },
            { id: 'overhead', label: window.I18n ? window.I18n.t('ps_ang_overhead') : 'Overhead / Bird\\'s Eye' },
            { id: 'low-angle', label: window.I18n ? window.I18n.t('ps_ang_low') : 'Low Angle (Hero)' },
            { id: 'dutch', label: window.I18n ? window.I18n.t('ps_ang_dutch') : 'Dutch Angle' },
            { id: 'macro', label: window.I18n ? window.I18n.t('ps_ang_macro') : 'Macro Close-up' },
            { id: 'over-shoulder', label: window.I18n ? window.I18n.t('ps_ang_shoulder') : 'Over the Shoulder' },
            { id: '45-degree', label: window.I18n ? window.I18n.t('ps_ang_45') : '45° Three-Quarter' },
            { id: 'side-profile', label: 'Side Profile' },
            { id: 'glance-down', label: 'Glance Down' },
            { id: 'from-behind', label: 'From Behind (Nape)' },
        ];
    },"""

NEW_ANGLES  = """get angles() {
        return [
            // ── Classic Angles ──────────────────────────────────────────
            { id: 'eye-level',      label: window.I18n ? window.I18n.t('ps_ang_eye') : 'Eye Level' },
            { id: '45-degree',      label: window.I18n ? window.I18n.t('ps_ang_45') : '45° Three-Quarter' },
            { id: 'side-profile',   label: 'Side Profile' },
            { id: 'glance-down',    label: 'Glance Down' },
            { id: 'overhead',       label: window.I18n ? window.I18n.t('ps_ang_overhead') : 'Overhead / Bird\\'s Eye' },
            { id: 'low-angle',      label: window.I18n ? window.I18n.t('ps_ang_low') : 'Low Angle (Hero)' },
            { id: 'dutch',          label: window.I18n ? window.I18n.t('ps_ang_dutch') : 'Dutch Angle' },
            { id: 'over-shoulder',  label: window.I18n ? window.I18n.t('ps_ang_shoulder') : 'Over the Shoulder' },
            { id: 'from-behind',    label: 'From Behind (Nape)' },
            // ── Macro & Product Angles ──────────────────────────────────
            { id: 'macro',          label: window.I18n ? window.I18n.t('ps_ang_macro') : 'Macro Close-up' },
            { id: 'extreme-macro',  label: 'Extreme Macro (Gem Facets)' },
            { id: 'flat-lay',       label: 'Flat Lay (Top-Down)' },
            { id: 'knuckle-level',  label: 'Knuckle Level (Table-Height)' },
            // ── Cinematic & Trending ────────────────────────────────────
            { id: 'worms-eye',      label: "Worm's Eye (Looking Up)" },
            { id: 'silhouette',     label: 'Silhouette (Backlit)' },
            { id: 'golden-hour',    label: 'Golden Hour (Rim Light)' },
            { id: 'through-glass',  label: 'Through Glass / Crystal' },
            { id: 'candid',         label: 'Candid / Stolen Moment' },
            { id: 'tilt-shift',     label: 'Tilt-Shift (Selective Plane)' },
            // ── Editorial & Fashion ─────────────────────────────────────
            { id: 'top-down-hand',  label: 'Top-Down Hand (Aerial Wrist)' },
            { id: 'chin-up',        label: 'Chin Up (Looking Down the Lens)' },
            { id: 'foreground-blur', label: 'Foreground Blur (Bokeh Frame)' },
        ];
    },"""

if OLD_ANGLES in ps:
    ps = ps.replace(OLD_ANGLES, NEW_ANGLES)
    fixes.append('FIX 2 OK: Camera angles expanded from 10 to 22')
else:
    fixes.append('FIX 2 MISS: angles getter not found')

# ════════════════════════════════════════════════════════════════════
# FIX 3 — Update cameraMap in _buildPrompt with new angle descriptors
# ════════════════════════════════════════════════════════════════════
OLD_CAMMAP = """cameraMap = {
            'eye-level':     'shot on 85mm f/1.4 portrait lens, shallow depth of field',
            'overhead':      'shot from directly above on 50mm f/4 lens, even focus plane across the subject',
            'low-angle':     'shot from below eye level on 35mm lens, hero angle creating drama',
            'dutch':         'camera tilted 15-25 degrees creating tension, 50mm lens',
            'macro':         'shot on 100mm macro lens, razor-thin depth of field, studio ring light',
            'over-shoulder': 'shot over the model\\'s shoulder on 35mm f/2 lens',
            '45-degree':     'shot on 85mm f/1.8 lens, three-quarter angle, balanced depth',
            'side-profile':  'pure side profile on 135mm f/2 lens, clean background separation',
            'glance-down':   'high angle slightly above eye level on 85mm lens, intimate glance-down',
            'from-behind':   'shot from behind on 85mm f/1.8 lens, nape and back of neck in focus',
        };"""

NEW_CAMMAP  = """cameraMap = {
            // ── Classic Angles ──────────────────────────────────────────
            'eye-level':      'shot on 85mm f/1.4 portrait lens, natural eye-level perspective, shallow depth of field',
            '45-degree':      'shot on 85mm f/1.8 lens, three-quarter angle, balanced depth and dimension',
            'side-profile':   'pure side profile on 135mm f/2 lens, clean background separation, elegant silhouette',
            'glance-down':    'high angle slightly above eye level on 85mm lens, intimate glance-down perspective',
            'overhead':       'shot from directly above on 50mm f/4 lens, even focus plane across the subject',
            'low-angle':      'shot from below eye level on 35mm lens, hero angle creating power and drama',
            'dutch':          'camera tilted 15-25 degrees creating tension and editorial energy, 50mm lens',
            'over-shoulder':  'shot over the model\\'s shoulder on 35mm f/2 lens, intimate reveal angle',
            'from-behind':    'shot from behind on 85mm f/1.8 lens, nape and back of neck in focus, mysterious elegance',
            // ── Macro & Product Angles ──────────────────────────────────
            'macro':          'shot on 100mm macro lens, razor-thin depth of field, studio ring light, extreme surface detail',
            'extreme-macro':  'shot on 180mm macro lens at 2:1 magnification, individual gem facets and metal grain visible, zero breathing room around subject',
            'flat-lay':       'strict top-down flat lay on 50mm f/5.6 lens, perfectly level overhead, graphic two-dimensional composition, no parallax',
            'knuckle-level':  'camera at table or surface height on 85mm f/1.4 lens, ring or bracelet at exact eye level of the piece, intimate product-height perspective',
            // ── Cinematic & Trending ────────────────────────────────────
            'worms-eye':      'extreme upward-looking angle, camera below subject looking up, 24mm f/2.8 lens, dramatically elongated and powerful composition',
            'silhouette':     'strong backlit silhouette, subject shot against bright window or sky, form reduced to shape and outline, minimal detail, high contrast',
            'golden-hour':    'shot at golden hour or with warm rim-light source behind subject, 85mm f/1.4, halo of warm light on jewelry and hair, deep warm bokeh',
            'through-glass':  'shot through glass, crystal prism, or water element, 85mm f/1.4, prismatic light refraction framing the piece, dreamy and unique perspective',
            'candid':         'candid paparazzi-style on 70mm f/2.8, unposed natural moment, slight motion, real-world editorial energy, authentic and spontaneous',
            'tilt-shift':     'tilt-shift lens effect, miniaturization plane of focus, only a thin slice of the jewelry sharp, dreamy selective blur above and below',
            // ── Editorial & Fashion ─────────────────────────────────────
            'top-down-hand':  'aerial wrist-down shot from directly above the hand on 50mm f/2.8, ring or bracelet visible from above, arm extending from frame edge',
            'chin-up':        'model chin slightly up, looking directly down the lens, 85mm f/1.4, commanding and confident editorial gaze, jewelry at chest level in foreground',
            'foreground-blur': 'subject in mid or deep background, an element of the jewelry or scene deliberately blurred in extreme foreground, 85mm f/1.4 at minimum focus, framing bokeh effect',
        };"""

if OLD_CAMMAP in ps:
    ps = ps.replace(OLD_CAMMAP, NEW_CAMMAP)
    fixes.append('FIX 3 OK: cameraMap expanded with 12 new angle descriptors')
else:
    fixes.append('FIX 3 MISS: cameraMap not found')
    idx = ps.find('cameraMap = {')
    print(f'  cameraMap at: {idx}')
    print(repr(ps[idx:idx+100]))

# ════════════════════════════════════════════════════════════════════
# FIX 4 — Update _getAnglesForCategory rankings with new angles
# ════════════════════════════════════════════════════════════════════
OLD_RANK = """    // Returns angles sorted best-to-least for the selected jewelry category
    _getAnglesForCategory(category) {
        const rankings = {
            // Ring: close detail at an angle or macro to show band + stone
            'ring':     ['macro', '45-degree', 'glance-down', 'eye-level', 'low-angle', 'over-shoulder', 'overhead', 'dutch', 'side-profile', 'from-behind'],
            // Necklace: front/chest visible, side profile also shows it well
            'necklace': ['eye-level', 'glance-down', '45-degree', 'over-shoulder', 'side-profile', 'low-angle', 'macro', 'from-behind', 'overhead', 'dutch'],
            // Bracelet: overhead or macro shows it clearly on the wrist
            'bracelet': ['macro', 'overhead', '45-degree', 'glance-down', 'eye-level', 'low-angle', 'over-shoulder', 'side-profile', 'dutch', 'from-behind'],
            // Earring: side profile is ideal, then 3/4 angle
            'earring':  ['side-profile', '45-degree', 'glance-down', 'eye-level', 'over-shoulder', 'macro', 'low-angle', 'from-behind', 'overhead', 'dutch'],
            // Pendant: front chest area, glance down flatters the pendant drop
            'pendant':  ['eye-level', 'glance-down', '45-degree', 'macro', 'over-shoulder', 'low-angle', 'side-profile', 'overhead', 'dutch', 'from-behind'],
            // Brooch: 3/4 angle shows lapel brooch clearly
            'brooch':   ['45-degree', 'macro', 'eye-level', 'glance-down', 'over-shoulder', 'side-profile', 'overhead', 'low-angle', 'dutch', 'from-behind'],
            // Anklet: overhead or low-angle looking down at ankle
            'anklet':   ['overhead', 'glance-down', 'macro', 'low-angle', '45-degree', 'eye-level', 'side-profile', 'over-shoulder', 'dutch', 'from-behind'],
            // Bangle: macro or overhead shows the band around the wrist well
            'bangle':   ['macro', 'overhead', '45-degree', 'eye-level', 'low-angle', 'glance-down', 'over-shoulder', 'side-profile', 'dutch', 'from-behind'],
        };
        const order = rankings[category] || rankings['ring'];
        return [...this.angles].sort((a, b) => {
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    },"""

NEW_RANK  = """    // Returns angles sorted best-to-least for the selected jewelry category
    _getAnglesForCategory(category) {
        const rankings = {
            // Ring: macro detail, then knuckle-level for product, 45° for editorial
            'ring': [
                'macro', 'extreme-macro', 'knuckle-level', '45-degree', 'glance-down',
                'top-down-hand', 'eye-level', 'flat-lay', 'low-angle', 'golden-hour',
                'through-glass', 'over-shoulder', 'overhead', 'tilt-shift', 'candid',
                'dutch', 'side-profile', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Necklace: eye-level shows chain + pendant at chest, glance-down reveals drop
            'necklace': [
                'eye-level', 'glance-down', '45-degree', 'chin-up', 'golden-hour',
                'over-shoulder', 'side-profile', 'through-glass', 'low-angle', 'silhouette',
                'macro', 'from-behind', 'candid', 'tilt-shift', 'foreground-blur',
                'overhead', 'dutch', 'flat-lay', 'extreme-macro', 'knuckle-level',
                'top-down-hand', 'worms-eye',
            ],
            // Bracelet/Bangle: top-down-hand and knuckle-level are ideal for wrist pieces
            'bracelet': [
                'top-down-hand', 'macro', 'knuckle-level', 'overhead', '45-degree',
                'glance-down', 'flat-lay', 'extreme-macro', 'eye-level', 'golden-hour',
                'through-glass', 'low-angle', 'tilt-shift', 'over-shoulder', 'side-profile',
                'candid', 'dutch', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Earring: side profile is #1, shows earring drop perfectly
            'earring': [
                'side-profile', '45-degree', 'glance-down', 'extreme-macro', 'macro',
                'from-behind', 'eye-level', 'over-shoulder', 'golden-hour', 'chin-up',
                'through-glass', 'silhouette', 'low-angle', 'tilt-shift', 'candid',
                'overhead', 'dutch', 'foreground-blur', 'flat-lay', 'knuckle-level',
                'top-down-hand', 'worms-eye',
            ],
            // Pendant: glance-down and eye-level reveal the drop at chest
            'pendant': [
                'eye-level', 'glance-down', '45-degree', 'macro', 'chin-up', 'golden-hour',
                'extreme-macro', 'over-shoulder', 'low-angle', 'side-profile', 'silhouette',
                'through-glass', 'tilt-shift', 'candid', 'foreground-blur', 'from-behind',
                'overhead', 'dutch', 'flat-lay', 'knuckle-level', 'top-down-hand', 'worms-eye',
            ],
            // Brooch: 45° shows lapel pin head-on, macro reveals craftsmanship
            'brooch': [
                '45-degree', 'macro', 'extreme-macro', 'eye-level', 'glance-down',
                'golden-hour', 'over-shoulder', 'through-glass', 'side-profile', 'tilt-shift',
                'chin-up', 'overhead', 'low-angle', 'dutch', 'candid', 'foreground-blur',
                'silhouette', 'flat-lay', 'from-behind', 'top-down-hand', 'knuckle-level', 'worms-eye',
            ],
            // Anklet: overhead and knuckle-level look down at ankle best
            'anklet': [
                'overhead', 'knuckle-level', 'glance-down', 'macro', 'flat-lay',
                'extreme-macro', 'low-angle', '45-degree', 'through-glass', 'golden-hour',
                'eye-level', 'tilt-shift', 'side-profile', 'over-shoulder', 'dutch',
                'candid', 'foreground-blur', 'from-behind', 'top-down-hand', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Bangle: knuckle-level, macro and top-down-hand all work great for wrist
            'bangle': [
                'knuckle-level', 'macro', 'top-down-hand', 'overhead', 'flat-lay',
                '45-degree', 'extreme-macro', 'glance-down', 'eye-level', 'golden-hour',
                'through-glass', 'low-angle', 'tilt-shift', 'over-shoulder', 'side-profile',
                'candid', 'dutch', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
        };
        const order = rankings[category] || rankings['ring'];
        return [...this.angles].sort((a, b) => {
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    },"""

if OLD_RANK in ps:
    ps = ps.replace(OLD_RANK, NEW_RANK)
    fixes.append('FIX 4 OK: _getAnglesForCategory rankings updated for 22 angles')
else:
    fixes.append('FIX 4 MISS: _getAnglesForCategory not found')

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
import re as re2
print('\n=== VERIFICATION ===')
checks = [
    ('high-contrast thread' in ps2,               'Wordmark uses high-contrast thread'),
    ('gold embroidery on dark garments' in ps2,    'Gold on dark garments'),
    ('deep charcoal on light garments' in ps2,     'Charcoal on light garments'),
    ('polished gold four-pointed star' in ps2,     'Logomark is gold (not silver)'),
    ('extreme-macro' in ps2,                       'extreme-macro angle exists'),
    ('flat-lay' in ps2,                            'flat-lay angle exists'),
    ('knuckle-level' in ps2,                       'knuckle-level angle exists'),
    ("worms-eye" in ps2,                           'worms-eye angle exists'),
    ('silhouette' in ps2,                          'silhouette angle exists'),
    ('golden-hour' in ps2,                         'golden-hour angle exists'),
    ('through-glass' in ps2,                       'through-glass angle exists'),
    ('candid' in ps2,                              'candid angle exists'),
    ('tilt-shift' in ps2,                          'tilt-shift angle exists'),
    ('top-down-hand' in ps2,                       'top-down-hand angle exists'),
    ('chin-up' in ps2,                             'chin-up angle exists'),
    ('foreground-blur' in ps2,                     'foreground-blur angle exists'),
    (len(re2.findall(r"\{ id: '", ps2[ps2.find('get angles()'):ps2.find('get angles()')+2000])) >= 22, '22+ angle entries'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
