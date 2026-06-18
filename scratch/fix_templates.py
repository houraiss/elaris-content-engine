import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ── 1. cinematic-portrait: remove hardcoded "earring" ─────────────────
OLD1 = "s eyes and {piece} earring, shallow anamorphic lens flare crossing frame'"
NEW1  = "s eyes and {piece}, shallow anamorphic lens flare crossing frame'"
if OLD1 in ps:
    ps = ps.replace(OLD1, NEW1)
    fixes.append('FIX 1 OK: cinematic-portrait earring removed')
else: fixes.append('FIX 1 MISS: cinematic-portrait earring not found')

# ── 2. seasonal-holiday: "ring box" → "jewelry box" ───────────────────
OLD2 = '{piece} on a velvet ring box surrounded by wedding confetti and champagne glass, bridal season'
NEW2  = '{piece} in an open velvet jewelry box surrounded by wedding confetti and champagne glass, bridal season'
if OLD2 in ps:
    ps = ps.replace(OLD2, NEW2)
    fixes.append('FIX 2 OK: seasonal-holiday ring box → jewelry box')
else: fixes.append('FIX 2 MISS: seasonal ring box not found')

# ── 3. hair-drama: remove hardcoded "earring" ─────────────────────────
OLD3 = "e hand to reveal {piece} earring, sensual editorial gesture'"
NEW3  = "e hand to reveal {piece}, sensual editorial gesture'"
if OLD3 in ps:
    ps = ps.replace(OLD3, NEW3)
    fixes.append('FIX 3 OK: hair-drama earring removed')
else: fixes.append('FIX 3 MISS: hair-drama earring not found')

# ── 4. motion-blur: remove hardcoded "necklace" ───────────────────────
OLD4 = "mid-flow, {piece} necklace in perfect focus'"
NEW4  = "mid-flow, {piece} in perfect focus'"
if OLD4 in ps:
    ps = ps.replace(OLD4, NEW4)
    fixes.append('FIX 4 OK: motion-blur necklace removed')
else: fixes.append('FIX 4 MISS: motion-blur necklace not found')

# ── 5. motion-blur: "bracelet and ring" → clean ───────────────────────
OLD5 = "spinning, {piece} bracelet and ring frozen in detail while dress blurs around her'"
NEW5  = "spinning, {piece} frozen in sharp detail while dress blurs around her'"
if OLD5 in ps:
    ps = ps.replace(OLD5, NEW5)
    fixes.append('FIX 5 OK: motion-blur bracelet+ring removed')
else: fixes.append('FIX 5 MISS: motion-blur bracelet+ring not found')

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
    ('{piece} earring' not in ps2,               'No more hardcoded earring in subjects'),
    ('velvet ring box' not in ps2,               'No more hardcoded ring box'),
    ('velvet jewelry box' in ps2,                'jewelry box is in place'),
    ('{piece} necklace in perfect focus' not in ps2, 'No more hardcoded necklace in motion-blur'),
    ('bracelet and ring frozen' not in ps2,       'No more hardcoded bracelet+ring'),
    ('{piece} frozen in sharp detail' in ps2,     'Clean motion-blur subject in place'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
