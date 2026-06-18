"""
Deep code audit of all JS files for:
1. Remaining mojibake
2. Missing i18n keys
3. Broken archetype bestFor strings
4. Missing model profiles for male
5. Untranslated raw keys exposed to UI
"""
import sys, io, os, re, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

JS_DIR = 'js'

print('='*60)
print('1. MOJIBAKE SCAN (all JS files)')
print('='*60)
for fn in sorted(os.listdir(JS_DIR)):
    if not fn.endswith('.js'): continue
    content = open(f'{JS_DIR}/{fn}', 'r', encoding='utf-8').read()
    bad = re.findall(r'[≡Γ][ƒÇ][^\s\'\",;\n\r`]{0,10}', content)
    bad += re.findall(r'[├][ù╕╣╗]', content)  # other cp1252 artifacts
    if bad:
        unique = list(dict.fromkeys(bad))
        print(f'\n  {fn} ({len(unique)} patterns):')
        for p in unique:
            idx = content.find(p)
            ctx = content[max(0,idx-30):idx+len(p)+40].replace('\n',' ')
            print(f'    {repr(p):20s} -> {ctx[:80]}')

print()
print('='*60)
print('2. RAW i18n KEYS EXPOSED IN UI (ps_, wm_, etc.)')
print('='*60)
for fn in sorted(os.listdir(JS_DIR)):
    if not fn.endswith('.js'): continue
    content = open(f'{JS_DIR}/{fn}', 'r', encoding='utf-8').read()
    # Find raw keys being used as display text (not in data-i18n attributes)
    # Pattern: strings like 'tpl_cat_beldi' or 'ps_arch_xxx' in text content
    raw_keys = re.findall(r'>[a-z]{2,4}_[a-z_]{3,30}<', content)
    raw_keys += re.findall(r'["\']([a-z]{2,4}_cat_[a-z_]+)["\']', content)
    if raw_keys:
        unique = list(dict.fromkeys(raw_keys))
        print(f'\n  {fn}:')
        for k in unique[:20]:
            print(f'    {k}')

print()
print('='*60)
print('3. ARCHETYPE BESTFOR STRINGS (check for encoding issues)')
print('='*60)
ps_js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
bestfor_matches = re.findall(r'bestFor:\s*[\'"]([^\'\"]{0,200})[\'"]', ps_js)
for i, bf in enumerate(bestfor_matches):
    if any(c in bf for c in ['├', '╕', '╖', '╣', '≡', 'Γ', '∩']):
        print(f'  Archetype {i+1}: {repr(bf[:100])}')

print()
print('='*60)
print('4. ARCHETYPE TAGLINE/NAME ENCODING ISSUES')
print('='*60)
tagline_matches = re.findall(r'tagline:\s*[\'"]([^\'\"]{0,100})[\'"]', ps_js)
for i, t in enumerate(tagline_matches):
    if any(c in t for c in ['├', '╕', '╖', '╣', '≡', 'Γ', '∩']):
        print(f'  Tagline {i+1}: {repr(t[:100])}')

name_matches = re.findall(r'(?<!\w)name:\s*[\'"]([^\'\"]{0,100})[\'"]', ps_js)
for i, n in enumerate(name_matches):
    if any(c in n for c in ['├', '╕', '╖', '╣', '≡', 'Γ', '∩']):
        print(f'  Name {i+1}: {repr(n[:100])}')

print()
print('='*60)
print('5. MALE MODEL PROFILES (check if defined)')
print('='*60)
male_check = re.search(r'male.*?model.*?profile|modelProfiles.*?male|male.*?profiles', ps_js, re.IGNORECASE | re.DOTALL)
if male_check:
    print('  Male model profiles found:', male_check.group()[:100])
else:
    print('  WARNING: No male model profiles found in prompt-studio.js')

# Check i18n.js for missing translations
print()
print('='*60)
print('6. i18n.js MISSING KEYS CHECK')
print('='*60)
i18n_js = open('js/i18n.js', 'r', encoding='utf-8').read()
# Find keys used in data-i18n attributes in prompt-studio.js
used_keys = set(re.findall(r'data-i18n=["\']([^"\']+)["\']', ps_js))
used_keys |= set(re.findall(r'I18n\.t\(["\']([^"\']+)["\']', ps_js))
# Find keys defined in i18n.js
en_keys = set(re.findall(r'\s+([a-z_]{2,50}):', i18n_js))
missing = sorted([k for k in used_keys if k and '_' in k and k not in en_keys])
if missing:
    print(f'  Keys used but possibly missing from i18n:')
    for k in missing[:20]:
        print(f'    {k}')

print()
print('='*60)
print('7. CSS BROKEN REFERENCES')
print('='*60)
css = open('css/styles.css', 'r', encoding='utf-8').read()
# Check brace balance
print(f'  Brace balance: {css.count("{") - css.count("}")} (should be 0)')
# Check for any remaining mojibake in CSS
css_bad = re.findall(r'[≡Γ├][ƒÇù][^\s;:{}]{0,10}', css)
if css_bad:
    print(f'  Mojibake in CSS: {list(dict.fromkeys(css_bad))[:10]}')
else:
    print('  No mojibake in CSS')

print()
print('='*60)
print('8. TEMPLATES PAGE CATEGORY KEYS')
print('='*60)
# Find template category IDs
tpl_js = open('js/templates.js', 'r', encoding='utf-8').read() if os.path.exists('js/templates.js') else ''
if tpl_js:
    cat_ids = re.findall(r'id:\s*[\'"]([^\'\"]+)[\'"]', tpl_js)
    print(f'  Template category IDs found: {cat_ids[:10]}')
    # Check if tpl_cat_beldi is in i18n
    if 'tpl_cat_beldi' in i18n_js:
        print('  tpl_cat_beldi: FOUND in i18n')
    else:
        print('  tpl_cat_beldi: MISSING from i18n')

print('\nAudit complete.')
