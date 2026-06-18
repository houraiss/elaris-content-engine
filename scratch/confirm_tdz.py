import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Confirm: find isHuman declaration INSIDE _buildPrompt
idx_build = ps.find('    _buildPrompt(')
print(f'_buildPrompt starts at {idx_build}')

# Find isHuman inside _buildPrompt
idx_ish2 = ps.find('const isHuman = HUMAN', idx_build)
print(f'isHuman inside _buildPrompt at {idx_ish2}')
print(repr(ps[idx_ish2:idx_ish2+80]))
print()

# Find bodyParts declaration
idx_bp = ps.find('const bodyParts = [', idx_build)
print(f'bodyParts at {idx_bp}')
print()

# hasNamedProfile use vs declaration
idx_use = ps.find('!hasNamedProfile', idx_build)
idx_decl = ps.find('const hasNamedProfile', idx_build)
print(f'hasNamedProfile USED at {idx_use}, DECLARED at {idx_decl}')
print(f'USE before DECLARATION by {idx_decl - idx_use} chars  <-- TDZ crash confirmed')
