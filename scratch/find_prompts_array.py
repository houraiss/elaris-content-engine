import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where prompts array is built
idx = ps.find('const prompts = [];')
print(f'prompts = [] at {idx}')
print(ps[idx:idx+1000])
