"""
Fix all remaining mojibake in prompt-studio.js and add mobile navbar.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── Map of mojibake → correct replacement ──────────────────────────────
FIXES = [
    # Quick Tips icons
    ('≡ƒÆí',    '💡'),   # Select multiple archetypes tip
    ('≡ƒĻ',     '✏️'),   # Be specific tip  
    ('≡ƒöä',    '🔄'),   # Re-generate tip
    
    # Copy button icons (these appear in both Copy All and Copy)
    ('≡ƒôï',    '📋'),   # Copy / Copy All
    
    # Hallmark Injection label icon
    ('≡ƒÅ╖∩╕Å', '🏷️'),  # label/tag
    
    # File upload icon (before <input type="file")
    ('≡ƒô╖',    '📂'),   # folder/file open
    
    # Auto-describe / Generate buttons (Γ£ª = ✨ originally)
    ('Γ£ª',     '✨'),   # sparkle / auto
    
    # Recommended button badge (Γ¡É = + or ✨)
    ('Γ¡É',     '+'),    # plus sign
    
    # Em dash in comments and A-Z button (ΓÇö = —)
    # For A-Z button: change AΓÇöZ to A–Z
    ('AΓÇöZ',   'A–Z'),  # en dash sort label
    
    # Remaining ΓÇö in code comments (harmless but clean up)
    ('ΓÇö',     '—'),    # em dash
    
    # Any leftover ΓÇô (en dash)
    ('ΓÇô',     '–'),    # en dash
    
    # ΓÇÿ / ΓÇÖ (smart quotes)
    ('ΓÇÿ',     '\u2018'),  # '
    ('ΓÇÖ',     '\u2019'),  # '
    
    # Γÿò (check mark / heart variants)
    ('Γÿò',     '✓'),
]

fixed_count = 0
for bad, good in FIXES:
    count = js.count(bad)
    if count > 0:
        js = js.replace(bad, good)
        print(f'Fixed {count}x: {repr(bad)} → {good}')
        fixed_count += count

print(f'\nTotal fixes: {fixed_count}')

# Final check
import re
remaining = re.findall(r'[≡Γ][ƒÇ][^\s\'\",;]{0,8}', js)
unique = list(dict.fromkeys(remaining))
print(f'Remaining mojibake: {len(unique)}')
for p in unique:
    print(f'  {repr(p)}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('\nJS saved.')

# Bump JS cache
html = open('index.html', 'r', encoding='utf-8').read()
html = html.replace('prompt-studio.js?v=10', 'prompt-studio.js?v=11')
open('index.html', 'w', encoding='utf-8').write(html)
print('index.html bumped (JS v11).')
