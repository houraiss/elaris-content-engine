import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── Fix 1: Wordmark — remove color-anchoring rules, keep technique only ─
OLD_WM = '''"ELARIS" brand name as genuine haute couture embroidery integrated into the garment fabric — raised dimensional satin stitch with a fine hairline outline border on each letter ensuring the wordmark is always legible: bright cream or white thread on dark/black/navy garments, deep charcoal or midnight blue on white/ivory/light garments, cool silver-white thread on yellow/gold/warm garments, deep wine or charcoal on pastel or beige fabrics — the raised stitching casts subtle micro-shadows creating readable depth even when thread tone is close to fabric, the embroidery looks genuinely woven into the clothing, not overlaid\\'';'''

NEW_WM  = '''"ELARIS" haute couture embroidery integrated into the garment fabric at whatever natural position is visible in the composition — raised dimensional satin stitch, each letter bordered by a hairline contrasting outline stitch that automatically maximizes legibility against whatever garment color the scene uses; the thread color is the strongest possible contrast to the actual fabric without being specified — the raised textile has natural micro-shadow depth making it read as genuine fabric craft, not a graphic overlay; the outfit and its color are freely determined by the scene, the embroidery seamlessly adapts to any garment color\\';'''

if OLD_WM in ps:
    ps = ps.replace(OLD_WM, NEW_WM)
    print('OK: Wordmark de-anchored from navy')
else:
    print('MISS — checking alternative match...')
    idx = ps.find('"ELARIS" brand name')
    print(repr(ps[idx:idx+300]))

# ── Fix 2: Auto styling — add variety nudge so AI doesn't default to navy ─
# When styling is 'auto', currently returns '' (nothing injected)
# Add a gentle diversity cue without locking a specific style
OLD_AUTO_STY = """'auto': '',   // auto: no styling constraint — AI matches the archetype scene"""
NEW_AUTO_STY  = """'auto': 'diverse contemporary styling — garment color and silhouette freely chosen to complement the scene, avoid repeating the same outfit across shots',   // auto: variety-first"""

if OLD_AUTO_STY in ps:
    ps = ps.replace(OLD_AUTO_STY, NEW_AUTO_STY)
    print('OK: Auto styling gets diversity nudge')
else:
    print('MISS auto styling — checking...')
    idx = ps.find("'auto': '',")
    print(repr(ps[idx:idx+80]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Verify — make sure anchoring keywords are gone
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print()
checks = [
    ('dark/black/navy garments' not in ps2,             'Navy anchoring text removed'),
    ('white/ivory/light garments' not in ps2,           'White anchoring text removed'),
    ('yellow/gold/warm garments' not in ps2,            'Yellow anchoring text removed'),
    ('pastel or beige fabrics' not in ps2,              'Beige anchoring text removed'),
    ('automatically maximizes legibility' in ps2,        'Auto-contrast technique present'),
    ('freely determined by the scene' in ps2,           'Scene freedom instruction present'),
    ('seamlessly adapts to any garment color' in ps2,   'Adaptation language present'),
    ('diverse contemporary styling' in ps2,             'Auto styling diversity nudge present'),
    ('raised dimensional satin stitch' in ps2,          'Raised stitch technique kept'),
    ('hairline contrasting outline stitch' in ps2,      'Hairline outline kept'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
