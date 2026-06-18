import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── 1. Find exact piece variable construction ─────────────────────────
idx_piece = ps.find("const piece = this.state.pieceDesc || 'jewelry piece';")
print(f'piece at: {idx_piece}')
print(repr(ps[idx_piece:idx_piece+150]))
print()

# ── 2. Find the piece input field in the UI template ─────────────────
idx_input = ps.find("pieceDesc")
while idx_input > 0:
    ctx = ps[idx_input:idx_input+200]
    if 'placeholder' in ctx or 'input' in ctx.lower() or 'textarea' in ctx.lower():
        print(f'pieceDesc UI at: {idx_input}')
        print(repr(ctx[:200]))
        print()
    idx_input = ps.find("pieceDesc", idx_input+1)
    if idx_input > 100000: break
