import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where _buildPrompt starts
idx_build = ps.find('    _buildPrompt(')
print(f'_buildPrompt at {idx_build}')

# Find bodyParts array
idx_bp = ps.find('        const bodyParts = [', idx_build)
print(f'bodyParts at {idx_bp}')

# Find bodyParts closing ]
end_bp = ps.find('\n        ];\n', idx_bp) + 11
print(f'bodyParts ends at {end_bp}')
print()

# Print full bodyParts content
print('=== bodyParts content ===')
print(ps[idx_bp:end_bp])
print()

# Now find all const declarations AFTER bodyParts within _buildPrompt
# and check if any are USED inside bodyParts (TDZ)
print('=== Variables used in bodyParts (checking TDZ) ===')
body_content = ps[idx_bp:end_bp]

# Find all variable names used in bodyParts
# Look for identifiers that could be const-declared later
used_vars = set(re.findall(r'\b([a-z][a-zA-Z]+Desc|[a-z][a-zA-Z]+Part|hasModel\w+|has\w+|is\w+|[a-z]+String)\b', body_content))
print('Variables used in bodyParts:')
for v in sorted(used_vars):
    # Find where this var is declared as const in _buildPrompt
    decl_search = f'const {v} '
    decl_idx = ps.find(decl_search, idx_build)
    if decl_idx > 0:
        if decl_idx > end_bp:
            print(f'  *** TDZ RISK: "{v}" declared at {decl_idx} but bodyParts ends at {end_bp} ***')
        elif decl_idx > idx_bp:
            print(f'  *** TDZ: "{v}" declared at {decl_idx} INSIDE bodyParts (pos {idx_bp}-{end_bp}) ***')
        else:
            print(f'  OK: "{v}" declared at {decl_idx} (before bodyParts)')
    else:
        print(f'  (no const decl found for "{v}" — likely from state/this)')
