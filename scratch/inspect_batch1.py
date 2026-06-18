import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Where negatives are built
idx = ps.find('_buildCategoryNeg')
print(f'=== _buildCategoryNeg at {idx} ===')
print(ps[idx:idx+300])
print()

# 2. isHuman location in _buildPrompt
idx2 = ps.find('const isHuman')
print(f'=== isHuman at {idx2} ===')
print(ps[idx2:idx2+200])
print()

# 3. Where negatives are injected into bodyParts
idx3 = ps.find('negativePrompt')
while idx3 > 0 and idx3 < 145000:
    ctx = ps[idx3:idx3+120]
    if 'bodyPart' in ctx or 'Negative' in ctx or 'CRITICAL' in ctx or 'negative:' in ctx.lower():
        print(f'neg at {idx3}: {repr(ctx[:120])}')
        print()
    idx3 = ps.find('negativePrompt', idx3+1)

# 4. angle/ratio area
idx4 = ps.find("'aerial-overhead'")
print(f'=== aerial-overhead at {idx4} ===')
print(ps[max(0,idx4-50):idx4+100])
print()

# 5. The bodyParts array assembly
idx5 = ps.find('const bodyParts = [')
print(f'=== bodyParts assembly at {idx5} ===')
print(ps[idx5:idx5+600])
