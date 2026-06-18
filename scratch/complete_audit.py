import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Full inventory of ALL problematic strings
print('=== COMPLETE ENCODING ISSUE INVENTORY ===')
print()

# Find ALL ├ occurrences with full context
matches = list(re.finditer('[├╖╕┬]', ps))
print(f'Total encoding artifacts found: {len(matches)}')
print()
for m in matches:
    ctx = ps[max(0,m.start()-40):m.start()+60].replace('\n',' ')
    # Determine what it should be
    snippet = ps[m.start():m.start()+4]
    if snippet.startswith('├⌐') or snippet.startswith('├ë'):
        fix = 'é  (French e-acute)'
    elif snippet.startswith('├ù'):
        fix = '×  (multiplication sign) or — (em dash)'
    elif snippet.startswith('┬°'):
        fix = '°  (degree sign)'
    elif snippet.startswith('┬«'):
        fix = '®  (registered trademark)'
    elif snippet.startswith('╖'):
        fix = '(unclear)'
    else:
        fix = '(unclear)'
    print(f'  {repr(snippet[:6]):15s} -> should be: {fix}')
    print(f'  Context: ...{ctx[:80]}...')
    print()

print()
print('=== MALE MODEL PROFILES CHECK ===')
# Find actual male model profile structure
male_search = re.search(r'(male|Male).{0,200}(profile|Profile|model|Model)', ps, re.DOTALL)
if male_search:
    idx = male_search.start()
    print('Male profile context:')
    print(ps[max(0,idx-50):idx+400])
else:
    print('WARNING: No structured male model profiles found')

print()
print('=== i18n.js MISSING KEYS ===')
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()
# Check tpl_cat_beldi
print('tpl_cat_beldi in i18n:', 'tpl_cat_beldi' in i18n)
print('ps_ang_45 in i18n:', 'ps_ang_45' in i18n)

# Show all tpl_ keys defined
tpl_keys = re.findall(r"(tpl_cat_\w+)\s*:", i18n)
print('Defined tpl_cat_ keys:', list(dict.fromkeys(tpl_keys)))

# Find all template categories used in templates.js
tpl_js = open('js/templates.js', 'r', encoding='utf-8').read()
categories_used = list(dict.fromkeys(re.findall(r"category:\s*'([^']+)'", tpl_js)))
print('Template categories used in templates.js:', categories_used)
