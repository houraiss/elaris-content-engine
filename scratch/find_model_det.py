import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the exact pattern for Model Details injection
idx = ps.find('Model Details BEFORE the technical tail')
print(f'at {idx}:')
print(repr(ps[idx:idx+300]))
