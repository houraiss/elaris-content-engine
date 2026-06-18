import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. How isHuman is determined in _buildPrompt
idx = ps.find('isHuman')
while idx > 0:
    ctx = ps[max(0,idx-10):idx+100]
    if 'const isHuman' in ctx or 'let isHuman' in ctx or 'isHuman =' in ctx:
        print(f'isHuman assignment at {idx}:')
        print(repr(ctx[:120]))
        print()
    idx = ps.find('isHuman', idx+1)
    if idx > 130000: break

# 2. Find the Mirror & Reflection subject template
idx2 = ps.find('mirror-reflection')
if idx2 < 0: idx2 = ps.find('mirror')
print(f'\nmirror archetype at: {idx2}')
print(ps[idx2:idx2+400])

# 3. Check wet-element in HUMAN sets
print()
for kw in ['wet-element', 'wet_element']:
    idx3 = ps.find(kw)
    print(f'{kw} at: {idx3}')
    if idx3 > 0: print(repr(ps[max(0,idx3-60):idx3+100]))

# 4. Find the placementRule bodyParts injection
idx4 = ps.find('placementRule ?')
print(f'\nplacementRule in bodyParts at: {idx4}')
print(repr(ps[max(0,idx4-10):idx4+80]))

# 5. Check how multi-image model details is conditioned
idx5 = ps.find('hasModelDesc && isHuman')
idx5b = ps.find('if (hasModelDesc)')
print(f'\nhasModelDesc&&isHuman at: {idx5}')
print(f'if(hasModelDesc) at: {idx5b}')
if idx5b > 0:
    print(ps[idx5b:idx5b+300])
