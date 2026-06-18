import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where prompts are built and then shown
idx_gen = ps.find('_generatePrompts()')
print(f'_generatePrompts at {idx_gen}')
print(ps[idx_gen:idx_gen+1500])
