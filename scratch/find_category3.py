import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find ALL 'category' references in _buildPrompt
idx = ps.find('_buildPrompt(archetype)')
end = idx + 25000
slice_ = ps[idx:end]

# Find any assignment to 'category'
for m in re.finditer(r'(const|let|var)\s+category\s*=', slice_):
    pos = m.start()
    print(f'DECLARED at rel {pos} (abs {idx+pos}):')
    print(slice_[pos:pos+100])
    print()

# Also find first usage of category as property access
for m in re.finditer(r'\bcategory\b', slice_[:500]):
    print(f'USED at rel {m.start()}: {repr(slice_[max(0,m.start()-20):m.start()+60])}')
