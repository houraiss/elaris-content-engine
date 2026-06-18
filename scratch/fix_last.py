import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Fix via simple substring replace — just the piece ring→piece portion
old = '{piece} ring prominent, warm candlelight illumination'
new = '{piece} prominent, warm candlelight and rich shadow'
if old in ps:
    ps = ps.replace(old, new)
    print('Fixed: {piece} ring prominent → {piece} prominent')
else:
    print('Not found, searching for context...')
    idx = ps.find('bar top')
    if idx > 0:
        print(repr(ps[idx-10:idx+80]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

# Final full verification
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== FINAL SPOT CHECKS ===')
checks = [
    ('wrist to knuckle' not in ps2,        'No "wrist to knuckle"'),
    ('on both hands' not in ps2,           'No "on both hands"'),
    ('showing bracelet' not in ps2,        'No hardcoded "bracelet" prefix'),
    ('rings on every finger' not in ps2,   'No "rings on every finger"'),
    ('rings and bracelets all' not in ps2, 'No "rings and bracelets all"'),
    ('{piece} ring prominent' not in ps2,  'No "{piece} ring prominent"'),
    ('signet ring at cuff' not in ps2,     'No "signet ring at cuff"'),
    ('chain bracelet draped' not in ps2,   'No "chain bracelet draped"'),
    ('chain necklace visible' not in ps2,  'No "chain necklace visible"'),
    ('POSE_ARCHETYPES' in ps2,             'poseDesc POSE_ARCHETYPES guard'),
    ('modelGenderForStyling' in ps2,       'Gender-aware styling'),
    ('strong build as the canvas' in ps2,  'Male minimal styling desc'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL CLEAN' if all_ok else 'SOME ISSUES REMAIN')
