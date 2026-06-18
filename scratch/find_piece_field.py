import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Search for the piece input field in the render/template section
for kw in ['pieceDesc', 'piece-input', 'piece_input', 'jewelry piece', 'piece placeholder', 
           'describe your piece', 'your piece']:
    idx = 0
    while True:
        idx = ps.find(kw, idx)
        if idx < 0: break
        print(f'"{kw}" at {idx}: {repr(ps[max(0,idx-30):idx+120])}')
        print()
        idx += 1
