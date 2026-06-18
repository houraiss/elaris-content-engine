import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print('=== FINAL FULL SWEEP — All JS files ===\n')

# Patterns that indicate mojibake
BAD_PATTERNS = [
    r'[≡][ƒ][^\s\'"`,;\n\r]{0,8}',   # ≡ƒ... emoji mojibake
    r'[Γ][£ÇöÿǓ][^\s\'"`,;\n\r]{0,8}',  # Γ... mojibake
    r'[├╖╕][⌐ùö░]',                    # ├... French char mojibake
    r'[┬][░°]',                         # ┬° degree sign mojibake
    r'[∩╕][Å┼]',                        # ∩╕ tag icon mojibake
]

total_issues = 0
for fn in sorted(os.listdir('js')):
    if not fn.endswith('.js'): continue
    try:
        content = open(f'js/{fn}', 'r', encoding='utf-8').read()
    except Exception as e:
        print(f'ERROR reading {fn}: {e}')
        continue
    
    file_issues = []
    for pattern in BAD_PATTERNS:
        matches = re.findall(pattern, content)
        for m in matches:
            ctx_idx = content.find(m)
            ctx = content[max(0,ctx_idx-20):ctx_idx+len(m)+30].replace('\n', ' ')
            file_issues.append((m, ctx))
    
    if file_issues:
        print(f'❌ {fn}: {len(file_issues)} issue(s)')
        for bad, ctx in file_issues[:5]:
            print(f'   {repr(bad):20s} → ...{ctx[:60]}...')
        total_issues += len(file_issues)
    else:
        print(f'✓  {fn}: CLEAN')

print(f'\n=== RESULT: {total_issues} total mojibake issues remaining ===')

# Also verify the specific fixes
print()
print('=== SPECIFIC FIX VERIFICATION ===')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
checks = [
    ('pavé', 'pavé (French)', True),
    ('café', 'café (French)', True),
    ('×', '× multiplication sign', True),
    ('45°', '45° degree angle', True),
    ('✓', '✓ checkmark in toasts', True),
    ('tpl_cat_beldi', 'tpl_cat_beldi in i18n', False),  # checked separately
    ('├', '├ box drawing (mojibake)', False),
    ('┬░', '┬░ degree mojibake', False),
    ('Γ£ô', 'Γ£ô checkmark mojibake', False),
]
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()
for term, desc, should_exist in checks:
    if term == 'tpl_cat_beldi':
        found = term in i18n
        source = 'i18n.js'
    else:
        found = term in ps
        source = 'prompt-studio.js'
    
    status = '✓' if found == should_exist else '✗ FAIL'
    expectation = 'present' if should_exist else 'absent'
    print(f'  {status} {desc} ({expectation} in {source}): {"FOUND" if found else "NOT FOUND"}')
