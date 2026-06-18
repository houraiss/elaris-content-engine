import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the _bindEvents or init function
print('=== _bindEvents / init section ===')
for keyword in ['_bindEvents', 'bindEvents', '_initEvents', '_bind(']:
    idx = ps.find(keyword)
    if idx > 0:
        print(f'"{keyword}" at {idx}:')
        print(ps[idx:idx+3000])
        break

# Find how ps-angle events are bound
print('\n=== ps-angle binding ===')
idx = ps.find('ps-angle')
while idx != -1:
    ctx = ps[idx:idx+200]
    if 'addEventListener' in ctx or 'click' in ctx.lower() or 'state.angle' in ctx:
        print(f'pos {idx}: {repr(ctx[:150])}')
    idx = ps.find('ps-angle', idx+1)

# Also check the init() function
print('\n=== init() function ===')
init_idx = ps.find('    init(')
if init_idx < 0:
    init_idx = ps.find('    init (')
if init_idx < 0:
    init_idx = ps.find('    _init(')
print(f'init at {init_idx}')
print(ps[init_idx:init_idx+2000] if init_idx > 0 else 'NOT FOUND')
