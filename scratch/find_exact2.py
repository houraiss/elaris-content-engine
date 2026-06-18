import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Search more broadly
print('Searching for stylings...')
for pattern in ['stylings', 'styling', 'Model Styling', 'ps-styling']:
    idx = ps.find(pattern)
    if idx > 0:
        print(f'"{pattern}" at {idx}: {repr(ps[max(0,idx-20):idx+80])}')

print()
print('Searching for state.styling...')
idx = ps.find('.styling')
while idx != -1 and idx < 100000:
    ctx = ps[idx:idx+60]
    print(f'  {idx}: {repr(ctx)}')
    idx = ps.find('.styling', idx+1)

print()
print('Searching for chip event patterns...')
idx = ps.find("addEventListener('click'")
count = 0
while idx != -1 and count < 20:
    ctx = ps[max(0,idx-80):idx+100]
    if 'ps-' in ctx and 'chip' in ctx.lower():
        print(f'  {idx}: {repr(ctx[:150])}')
    idx = ps.find("addEventListener('click'", idx+1)
    count += 1
