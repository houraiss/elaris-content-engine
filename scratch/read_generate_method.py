import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the _generate method definition (not call site)
idx = ps.find('    _generate() {\n')
if idx < 0:
    idx = ps.find('    _generate() {')
print(f'_generate method at {idx}')
print(ps[idx:idx+2000])
