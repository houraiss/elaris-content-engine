import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where {piece} gets replaced in _buildPrompt
idx = ps.find('_buildPrompt')
# Search for {piece} replacement within that function
build_slice = ps[idx:idx+12000]

# Find .replace('{piece}' or template literal with {piece}
import re
for m in re.finditer(r'piece', build_slice):
    start = max(0, m.start()-20)
    end = m.start() + 100
    ctx = build_slice[start:end]
    if any(kw in ctx for kw in ['replace', 'const ', 'let ', 'pieceLabel', 'material', 'stone', 'subject']):
        print(f'at rel {m.start()}: {repr(ctx)}')
        print()
