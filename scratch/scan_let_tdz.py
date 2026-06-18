import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

idx_build = ps.find('    _buildPrompt(')
idx_bp    = ps.find('        const bodyParts = [', idx_build)
end_bp    = ps.find('\n        ];\n', idx_bp) + 11

# Check BOTH const AND let declarations for all variables used in bodyParts
suspect_vars = [
    'brandTouchDesc', 'expressionDesc', 'hallmarkDesc',
    'jewelryStyleDesc', 'poseDesc', 'realismDesc',
    'stylingDesc', 'surfaceDesc', 'lightingCoherent',
    'placementRule', 'material', 'subject', 'mood',
]

print('=== TDZ check for let+const declarations ===')
print(f'bodyParts: {idx_bp} → {end_bp}')
print()

tdz_found = []
for v in suspect_vars:
    # Search for both let and const
    for keyword in ['const', 'let']:
        decl_search = f'{keyword} {v}'
        decl_idx = ps.find(decl_search, idx_build)
        if decl_idx > 0:
            if decl_idx > end_bp:
                msg = f'*** TDZ: "{v}" ({keyword}) declared at {decl_idx}, but bodyParts ends at {end_bp} — crash! ***'
                tdz_found.append((v, decl_idx, keyword))
                print(msg)
                # Show context
                print(repr(ps[decl_idx:decl_idx+80]))
                print()
            elif decl_idx > idx_bp:
                msg = f'*** INSIDE bodyParts: "{v}" ({keyword}) declared at {decl_idx} (bodyParts: {idx_bp}–{end_bp}) ***'
                tdz_found.append((v, decl_idx, keyword))
                print(msg)
            else:
                print(f'  OK: "{v}" ({keyword}) at {decl_idx} (before bodyParts at {idx_bp})')
            break

print()
if tdz_found:
    print(f'{len(tdz_found)} TDZ issue(s) found:')
    for v, idx, kw in sorted(tdz_found, key=lambda x: x[1]):
        print(f'  {kw} {v} at {idx} (bodyParts ends at {end_bp})')
else:
    print('No TDZ issues found in declared variables')
print()

# Also check: is there a "let brandTouchDesc" etc somewhere?
for v in ['brandTouchDesc', 'poseDesc', 'realismDesc', 'stylingDesc', 'expressionDesc']:
    all_decls = [(m.start(), ps[m.start():m.start()+100]) for m in re.finditer(r'\b(let|const|var)\s+' + v, ps)]
    if all_decls:
        for pos, ctx in all_decls:
            print(f'{v} declared at {pos}: {repr(ctx[:60])}')
    else:
        print(f'{v}: NO declaration found with let/const/var')
