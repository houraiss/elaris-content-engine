import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find exact current brand block
idx = ps.find('let brandTouchDesc =')
end = ps.find('const bodyParts', idx)
print(f'brand block at {idx}:{end}')
print(repr(ps[idx:end]))
