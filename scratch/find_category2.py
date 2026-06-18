import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# category might be declared differently
idx = ps.find('_buildPrompt(archetype)')
end = idx + 15000
slice_ = ps[idx:end]
for m in re.finditer(r'category', slice_):
    pos = m.start()
    ctx = slice_[max(0,pos-30):pos+80]
    if any(kw in ctx for kw in ['const', 'let', 'var', '= this.state', '= archetype']):
        print(f'rel {pos}: {repr(ctx)}')
        print()
