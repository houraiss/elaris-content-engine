import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the CSS style block in the JS
idx = ps.find('ps-prompt-header')
while idx > 0:
    ctx = ps[max(0,idx-30):idx+120]
    print(f'At {idx}: {repr(ctx)}')
    print()
    idx = ps.find('ps-prompt-header', idx+1)
    if idx > 115000: break
