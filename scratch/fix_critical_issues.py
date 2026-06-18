"""
Fix Critical Issues:
C1 - 5 encoding artifacts in prompt-studio.js
C2 - Add tpl_cat_beldi to i18n.js
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── C1: Fix encoding artifacts in prompt-studio.js ──────────────────────
print('=== C1: Fixing encoding artifacts in prompt-studio.js ===')
js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

FIXES = [
    # ├ù = × (multiplication sign, used in "Jewelry × Type Design")
    ('├ù', '×'),
    # ├⌐ = é (French e-acute: pavé, café)
    ('├⌐', 'é'),
    # ┬° = ° (degree sign in angle fallback)
    ('┬°', '°'),
]

total = 0
for bad, good in FIXES:
    count = js.count(bad)
    if count > 0:
        js = js.replace(bad, good)
        print(f'  Fixed {count}x: {repr(bad)} → {good}')
        total += count
    else:
        print(f'  Not found: {repr(bad)}')

print(f'\n  Total: {total} fixes applied')

# Verify no remaining encoding issues
remaining = [c for c in ['├', '╖', '╕', '┬°'] if c in js]
print(f'  Remaining artifacts: {remaining if remaining else "NONE ✓"}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('  prompt-studio.js saved.\n')

# Bump JS version
html = open('index.html', 'r', encoding='utf-8').read()
# Find current JS version
import re as re2
current = re2.search(r'prompt-studio\.js\?v=(\d+)', html)
if current:
    v = int(current.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'  JS version bumped: v{v} → v{v+1}')

# ── C2: Add tpl_cat_beldi to i18n.js ──────────────────────────────────
print('\n=== C2: Adding tpl_cat_beldi to i18n.js ===')
i18n = open('js/i18n.js', 'r', encoding='utf-8').read()

# Verify it's missing
if 'tpl_cat_beldi' in i18n:
    print('  tpl_cat_beldi already exists! No change needed.')
else:
    # Find where the other tpl_cat_ keys are defined (in each language section)
    # Find tpl_cat_classic in English, French, and Arabic sections
    for lang in ['en', 'fr', 'ar']:
        marker = "tpl_cat_classic:"
        idx = i18n.find(marker)
        search_start = 0
        found_count = 0
        while idx != -1:
            # Insert tpl_cat_beldi right after tpl_cat_classic
            # Find the end of this line
            line_end = i18n.find('\n', idx)
            classic_line = i18n[idx:line_end]
            
            # Determine indentation
            line_start = i18n.rfind('\n', 0, idx) + 1
            indent = ''
            for c in i18n[line_start:]:
                if c in (' ', '\t'):
                    indent += c
                else:
                    break
            
            if 'tpl_cat_beldi' not in i18n[idx:idx+200]:
                # Pick label based on context (check which lang section we're in)
                # Look back 2000 chars for language identifier
                context = i18n[max(0,idx-2000):idx]
                if "'ar'" in context[-500:] or '"ar"' in context[-500:]:
                    label = 'بيلدي'
                elif "'fr'" in context[-500:] or '"fr"' in context[-500:]:
                    label = 'Beldi'
                else:
                    label = 'Beldi'
                
                insert = f"\n{indent}tpl_cat_beldi: '{label}',"
                i18n = i18n[:line_end] + insert + i18n[line_end:]
                found_count += 1
                print(f'  Added tpl_cat_beldi: "{label}" (after tpl_cat_classic at pos {idx})')
            
            # Find next occurrence
            idx = i18n.find(marker, idx + len(marker) + 50)
    
    if found_count == 0:
        # Fallback: find where tpl_cat_heritage is and add after it
        for marker in ['tpl_cat_heritage:', 'tpl_cat_fes:']:
            idx = i18n.find(marker)
            if idx != -1:
                line_end = i18n.find('\n', idx)
                line_start = i18n.rfind('\n', 0, idx) + 1
                indent = ''
                for c in i18n[line_start:]:
                    if c in (' ', '\t'):
                        indent += c
                    else:
                        break
                insert = f"\n{indent}tpl_cat_beldi: 'Beldi',"
                i18n = i18n[:line_end] + insert + i18n[line_end:]
                print(f'  Added tpl_cat_beldi: "Beldi" after {marker}')
                found_count += 1
                break

    with open('js/i18n.js', 'w', encoding='utf-8') as f:
        f.write(i18n)
    print('  i18n.js saved.')

# Verify both fixes
print('\n=== VERIFICATION ===')
js_check = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
i18n_check = open('js/i18n.js', 'r', encoding='utf-8').read()
print(f'  pavé in JS: {"pavé" in js_check} (should be True)')
print(f'  café in JS: {"café" in js_check} (should be True)')
print(f'  × in JS: {"×" in js_check} (should be True)')
print(f'  ° in JS: {"°" in js_check} (should be True)')
print(f'  ├ still in JS: {"├" in js_check} (should be False)')
print(f'  tpl_cat_beldi in i18n: {"tpl_cat_beldi" in i18n_check} (should be True)')
