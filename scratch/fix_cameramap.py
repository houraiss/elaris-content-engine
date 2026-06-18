import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

OLD_CM = """cameraMap = {
            'eye-level':     'shot on 85mm f/1.4 portrait lens, shallow depth of field',
            'overhead':      'shot from directly above on 50mm f/4 lens, even focus plane across the frame',
            'low-angle':     'low angle hero shot on 35mm f/2.8 wide lens, dramatic perspective distortion',
            'dutch':         'dutch angle tilt on 50mm f/2 lens, dynamic visual tension',
            'macro':         'shot on 100mm f/2.8 macro lens, razor-thin depth of field, extreme close-up revealing individual metal grain and surface texture',
            'over-shoulder': 'over-the-shoulder composition on 85mm f/1.8 lens, creamy bokeh background',
            '45-degree':     'three-quarter angle on 70mm f/2.2 lens, natural dimensional perspective',
            'side-profile':  'side profile angle, architectural lines emphasized, sharp feature isolation',
            'glance-down':   'intimate slightly elevated angle looking down at subject, emotive and delicate',
            'from-behind':   'shot from behind focusing on the nape of the neck and back details, mysterious framing',
        };"""

NEW_CM  = """cameraMap = {
            // ── Classic Angles ──────────────────────────────────────────────────
            'eye-level':       'shot on 85mm f/1.4 portrait lens, natural eye-level perspective, shallow depth of field',
            '45-degree':       'three-quarter angle on 85mm f/1.8 lens, natural dimensional depth and presence',
            'side-profile':    'pure side profile on 135mm f/2 lens, clean background separation, elegant silhouette',
            'glance-down':     'high angle slightly above eye level on 85mm lens, intimate glance-down perspective, emotive and delicate',
            'overhead':        'shot from directly above on 50mm f/4 lens, even focus plane across the subject',
            'low-angle':       'shot from below eye level on 35mm f/2.8 lens, hero angle creating power and drama',
            'dutch':           'camera tilted 15-25 degrees creating tension and editorial energy, 50mm f/2 lens',
            'over-shoulder':   'shot over the model\\'s shoulder on 35mm f/2 lens, intimate reveal angle',
            'from-behind':     'shot from behind focusing on the nape and back details on 85mm f/1.8 lens, mysterious elegance',
            // ── Macro & Product Angles ──────────────────────────────────────────
            'macro':           'shot on 100mm f/2.8 macro lens, razor-thin depth of field, studio ring light, extreme surface detail',
            'extreme-macro':   'shot on 180mm macro lens at 2:1 magnification, individual gem facets and metal grain visible, zero breathing room around subject',
            'flat-lay':        'strict top-down flat lay on 50mm f/5.6 lens, perfectly level overhead, graphic two-dimensional composition',
            'knuckle-level':   'camera at surface height on 85mm f/1.4 lens, jewelry at exact eye level of the piece, intimate product-height perspective',
            // ── Cinematic & Trending ────────────────────────────────────────────
            'worms-eye':       'extreme upward-looking angle, camera below subject on 24mm f/2.8 lens, dramatically elongated and powerful composition',
            'silhouette':      'strong backlit silhouette against bright window or sky, form reduced to shape and outline, high contrast minimal detail',
            'golden-hour':     'shot at golden hour with warm rim-light behind subject, 85mm f/1.4, halo of warm light on jewelry and hair, deep warm bokeh',
            'through-glass':   'shot through glass, crystal prism, or water element on 85mm f/1.4, prismatic light refraction framing the piece',
            'candid':          'candid unposed natural moment on 70mm f/2.8, slight motion, real-world editorial energy, authentic and spontaneous',
            'tilt-shift':      'tilt-shift lens selective plane of focus, only a thin slice of the jewelry sharp, dreamy blur above and below',
            // ── Editorial & Fashion ─────────────────────────────────────────────
            'top-down-hand':   'aerial wrist-down shot from directly above the hand on 50mm f/2.8, ring or bracelet visible from above, arm extending from frame edge',
            'chin-up':         'model chin slightly up, looking directly down the lens on 85mm f/1.4, commanding editorial gaze, jewelry at chest level in foreground',
            'foreground-blur': 'subject in background, element of the jewelry or scene deliberately blurred in extreme foreground on 85mm f/1.4, framing bokeh effect',
        };"""

if OLD_CM in ps:
    ps = ps.replace(OLD_CM, NEW_CM)
    print('cameraMap OK')
else:
    print('cameraMap MISS — checking exact text...')
    idx = ps.find("cameraMap = {")
    end = ps.find("};", idx)
    print(repr(ps[idx:end+2]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Final verification
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print()
checks = [
    ('extreme-macro' in ps2,                                'extreme-macro in cameraMap'),
    ('flat-lay' in ps2 and 'two-dimensional composition' in ps2, 'flat-lay descriptor'),
    ('knuckle-level' in ps2 and 'surface height' in ps2,   'knuckle-level descriptor'),
    ("worms-eye" in ps2 and 'below subject' in ps2,         'worms-eye descriptor'),
    ('silhouette' in ps2 and 'high contrast' in ps2,        'silhouette descriptor'),
    ('golden-hour' in ps2 and 'warm rim-light' in ps2,     'golden-hour descriptor'),
    ('through-glass' in ps2 and 'prismatic' in ps2,         'through-glass descriptor'),
    ('candid' in ps2 and 'authentic and spontaneous' in ps2,'candid descriptor'),
    ('tilt-shift' in ps2 and 'selective plane' in ps2,      'tilt-shift descriptor'),
    ('top-down-hand' in ps2 and 'aerial wrist' in ps2,      'top-down-hand descriptor'),
    ('chin-up' in ps2 and 'commanding editorial' in ps2,    'chin-up descriptor'),
    ('foreground-blur' in ps2 and 'framing bokeh' in ps2,   'foreground-blur descriptor'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
