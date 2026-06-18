import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where subject gets {piece} replaced
idx = ps.find('{piece}', 109643)
while idx > 0 and idx < 120000:
    ctx = ps[max(0,idx-60):idx+80]
    print(f'at {idx}: {repr(ctx)}')
    print()
    idx = ps.find('{piece}', idx+1)
