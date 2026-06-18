import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# motion-blur: "earrings sharp and frozen mid-swing"
OLD1 = "{piece} earrings sharp and frozen mid-swing'"
NEW1  = "{piece} sharp and frozen mid-swing'"
if OLD1 in ps:
    ps = ps.replace(OLD1, NEW1)
    fixes.append('OK: motion-blur earrings mid-swing')
else: fixes.append('MISS 1')

# motion-blur: "earrings, strands streaking"
OLD2 = "{piece} earrings, strands streaking across frame'"
NEW2  = "{piece}, strands streaking across frame'"
if OLD2 in ps:
    ps = ps.replace(OLD2, NEW2)
    fixes.append('OK: motion-blur earrings strands streaking')
else: fixes.append('MISS 2')

# hair-drama: "earrings swinging mid-motion"
OLD3 = "{piece} earrings swinging mid-motion'"
NEW3  = "{piece} swinging mid-motion'"
if OLD3 in ps:
    ps = ps.replace(OLD3, NEW3)
    fixes.append('OK: hair-drama earrings swinging')
else: fixes.append('MISS 3')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

for f in fixes: print(f'  {f}')

# Final check
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
remaining = [m.group() for m in re.finditer(r'\{piece\} earring', ps2)]
print(f'\nRemaining {{piece}} earring occurrences: {len(remaining)}')
for r in remaining: print(f'  {repr(r)}')
