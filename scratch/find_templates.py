import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ── 1. cinematic-portrait: "earring" hardcoded ────────────────────────
OLD = "                'close-up of model\\u2019s eyes and {piece} earring, shallow anamorphic lens flare',"
# Python read will decode \u2019 — let's search for the actual unicode char
actual = ps.find("eyes and {piece} earring")
print(f'cinematic-portrait earring at: {actual}')
if actual > 0:
    print(repr(ps[actual-10:actual+80]))

# ── 2. seasonal-holiday: "ring box" ──────────────────────────────────
actual2 = ps.find('velvet ring box')
print(f'\nvelvet ring box at: {actual2}')
if actual2 > 0:
    print(repr(ps[actual2-10:actual2+80]))

# ── 3. hair-drama: "earring" hardcoded ───────────────────────────────
actual3 = ps.find('reveal {piece} earring')
print(f'\nhair-drama earring at: {actual3}')
if actual3 > 0:
    print(repr(ps[actual3-10:actual3+80]))

# ── 4. motion-blur: "necklace" hardcoded ─────────────────────────────
actual4 = ps.find('{piece} necklace in perfect focus')
print(f'\nmotion-blur necklace at: {actual4}')
if actual4 > 0:
    print(repr(ps[actual4-10:actual4+80]))

# ── 5. motion-blur: "bracelet and ring" hardcoded ───────────────────
actual5 = ps.find('{piece} bracelet and ring frozen')
print(f'\nmotion-blur bracelet+ring at: {actual5}')
if actual5 > 0:
    print(repr(ps[actual5-10:actual5+80]))
