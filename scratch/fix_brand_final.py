import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

OLD_BRAND = """let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            // Gold metallic pin provides contrast against ANY garment color
            brandTouchDesc = 'model wearing a small polished gold four-pointed star pin brooch on the lapel or collar — the ELARIS brand logomark, gold metallic finish clearly visible against any garment color, a refined luxury styling accent';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            // High-contrast thread: gold on dark garments, charcoal on light — always legible
            brandTouchDesc = '"ELARIS" wordmark embroidered on the model\\'s lapel or collar in high-contrast thread — gold embroidery on dark garments, deep charcoal on light garments — always clearly legible against the clothing, never blending into the fabric';
        }"""

NEW_BRAND  = """let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            // Enamel-filled pin: dark enamel body + polished gold outline = always visible on any garment
            brandTouchDesc = 'model wearing a small luxury four-pointed star pin brooch on the lapel — ELARIS brand logomark, deep black enamel fill with polished gold outline border, the contrasting enamel-and-metal design ensures it reads clearly against any garment color (dark, light, gold, silver, colourful), an authentic couture pin perfectly integrated into the look';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            // Luxury tri-layer embroidery technique used by haute couture houses:
            // (1) raised dimensional satin stitch creates micro-shadows for depth even on color-matched fabric
            // (2) hairline contrast outline stitch around each letter guarantees edge separation
            // (3) adaptive color rule: cool-toned thread on warm/yellow/gold fabrics, warm on cool, bright on dark, dark on bright
            brandTouchDesc = '"ELARIS" brand name as genuine haute couture embroidery integrated into the garment fabric — raised dimensional satin stitch with a fine hairline outline border on each letter ensuring the wordmark is always legible: bright cream or white thread on dark/black/navy garments, deep charcoal or midnight blue on white/ivory/light garments, cool silver-white thread on yellow/gold/warm garments, deep wine or charcoal on pastel or beige fabrics — the raised stitching casts subtle micro-shadows creating readable depth even when thread tone is close to fabric, the embroidery looks genuinely woven into the clothing, not overlaid';
        }"""

if OLD_BRAND in ps:
    ps = ps.replace(OLD_BRAND, NEW_BRAND)
    print('OK: Brand touch updated with 3-layer embroidery technique')
else:
    print('MISS — checking for partial match...')
    idx = ps.find('let brandTouchDesc')
    print(repr(ps[idx:idx+400]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
checks = [
    ('enamel fill' in ps2,                         'Logomark: enamel fill technique'),
    ('polished gold outline border' in ps2,         'Logomark: gold outline border'),
    ('raised dimensional satin stitch' in ps2,      'Wordmark: raised satin stitch'),
    ('hairline outline border' in ps2,              'Wordmark: hairline outline'),
    ('cool silver-white thread on yellow' in ps2,   'Wordmark: yellow/gold fabric rule'),
    ('micro-shadows' in ps2,                        'Wordmark: micro-shadow depth'),
    ('genuinely woven into the clothing' in ps2,    'Wordmark: integrated not overlaid'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
