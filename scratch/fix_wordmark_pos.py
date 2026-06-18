import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find by landmark
start_marker = '"ELARIS" brand name as genuine haute couture embroidery'
end_marker = "the embroidery looks genuinely woven into the clothing, not overlaid"

idx = ps.find(start_marker)
end = ps.find(end_marker, idx)
if idx > 0 and end > 0:
    # Find the actual end of the string (past the end_marker)
    actual_end = end + len(end_marker)
    # Grab 30 more chars to see exact ending
    print(f'Found at {idx}:{actual_end}')
    print(repr(ps[idx:actual_end+10]))
    
    # Build the replacement
    old_chunk = ps[idx:actual_end]
    new_chunk = '"ELARIS" haute couture embroidery integrated into the garment fabric at whatever natural position is visible in the composition — raised dimensional satin stitch, each letter bordered by a hairline contrasting outline stitch that automatically maximizes legibility against whatever garment color the scene uses; the thread color is chosen to be the strongest possible contrast to the actual fabric, determined by the image context — the raised textile has natural micro-shadow depth making it read as genuine fabric craft, not a graphic overlay; the outfit and its color are freely determined by the scene, the embroidery seamlessly adapts to any garment color'
    
    ps = ps[:idx] + new_chunk + ps[actual_end:]
    print(f'Replaced successfully: {len(old_chunk)} chars → {len(new_chunk)} chars')
else:
    print(f'Markers not found: idx={idx}, end={end}')

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
print()
checks = [
    ('dark/black/navy garments' not in ps2,             'Navy anchor REMOVED'),
    ('white/ivory/light garments' not in ps2,           'White/ivory anchor REMOVED'),
    ('yellow/gold/warm garments' not in ps2,            'Yellow/gold anchor REMOVED'),
    ('pastel or beige fabrics' not in ps2,              'Beige anchor REMOVED'),
    ('automatically maximizes legibility' in ps2,        'Auto-contrast technique present'),
    ('freely determined by the scene' in ps2,           'Scene freedom present'),
    ('seamlessly adapts to any garment color' in ps2,   'Adapts to any color present'),
    ('raised dimensional satin stitch' in ps2,          'Raised stitch kept'),
    ('hairline contrasting outline stitch' in ps2,      'Outline stitch kept'),
    ('diverse contemporary styling' in ps2,             'Auto styling diversity nudge'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
