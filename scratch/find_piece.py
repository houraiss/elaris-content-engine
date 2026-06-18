import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find how pieceLabel / {piece} is built
for kw in ['pieceLabel', 'pieceDesc', '{piece}', 'piece}', 'replace(']:
    idx = ps.find(kw)
    if idx > 0:
        print(f'=== {kw} at {idx} ===')
        print(ps[idx:idx+200])
        print()
