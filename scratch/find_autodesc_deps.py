import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Find the auto-call inside _generate()
idx = ps.find('_autoDescribe();\n        }\n\n        const prompts')
print(f'=== auto-call in _generate at {idx} ===')
print(ps[max(0,idx-300):idx+50])
print()

# 2. Find where jewelryStyleDesc is built
idx2 = ps.find('jewelryStyleDesc')
while idx2 > 0 and idx2 < 145000:
    ctx = ps[idx2:idx2+150]
    if 'const' in ctx or '=' in ctx:
        print(f'jewelryStyleDesc at {idx2}:')
        print(ctx[:150])
        print()
    idx2 = ps.find('jewelryStyleDesc', idx2+1)

# 3. Find _rawDesc / pieceDesc in _buildPrompt
idx3 = ps.find('_rawDesc')
while idx3 > 0 and idx3 < 145000:
    ctx = ps[idx3:idx3+150]
    print(f'_rawDesc at {idx3}: {repr(ctx[:150])}')
    print()
    idx3 = ps.find('_rawDesc', idx3+1)

# 4. Find where the auto-desc listener is bound
idx4 = ps.find('ps-auto-desc')
while idx4 > 0 and idx4 < 165000:
    ctx = ps[idx4:idx4+150]
    print(f'ps-auto-desc at {idx4}: {repr(ctx[:150])}')
    print()
    idx4 = ps.find('ps-auto-desc', idx4+1)
