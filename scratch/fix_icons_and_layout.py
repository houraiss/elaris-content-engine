"""
Fix remaining mojibake icons with proper emojis for each archetype.
Also fix the CSS overlap issue.
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Fix remaining bad icons — replace ⭐ placeholders with proper emojis per archetype
replacements = [
    ('celestial-mythic', '🌙'),
    ('seasonal-holiday', '🎁'),
    ('nature-botanical', '🌿'),
    ('heritage-moroccan', '🏺'),
    ('minimalist-space', '🤍'),
    ('desert-mirage', '🏜️'),
    ('vintage-nostalgia', '📷'),
    ('zero-gravity', '🌀'),
    ('royal-opulence', '👑'),
    ('neon-cyberpunk', '⚡'),
    ('lifestyle-moment', '☕'),
    ('surface-lean', '🪑'),
    ('masculine-editorial', '🧔'),
    ('hair-drama', '💇'),
]

# Find each archetype by ID and fix its icon
icon_bad_pattern = re.compile(r"(id:\s*'([^']+)'(?:[^{}]|\{(?:[^{}])*\})*?icon:\s*)'[^']*'", re.DOTALL)

fixed = 0
for arch_id, correct_icon in replacements:
    # Find the archetype block and replace its icon
    # Pattern: find id: 'arch_id' ... icon: 'anything'
    # Use a simpler approach: find the line with icon: '⭐' after the id
    
    # Find position of this archetype's id
    id_marker = f"id: '{arch_id}'"
    idx = js.find(id_marker)
    if idx == -1:
        print(f'NOT FOUND: {arch_id}')
        continue
    
    # Find the icon field within the next 500 chars
    icon_start = js.find("icon: '", idx)
    if icon_start == -1 or icon_start > idx + 500:
        print(f'No icon near: {arch_id}')
        continue
    
    icon_end = js.find("'", icon_start + 7)
    current_icon = js[icon_start + 7:icon_end]
    
    print(f'{arch_id}: {repr(current_icon)} -> {correct_icon}')
    
    # Replace
    js = js[:icon_start + 7] + correct_icon + js[icon_end:]
    fixed += 1

print(f'\nFixed {fixed} more icons')

# Verify all icons now
icon_pattern = re.compile(r"icon:\s*'([^']*)'")
remaining_bad = [(m.group(1)) for m in icon_pattern.finditer(js) if '≡' in m.group(1) or 'ƒ' in m.group(1) or 'Γ' in m.group(1)]
print(f'Remaining bad icons: {len(remaining_bad)}')
for b in remaining_bad:
    print(f'  {repr(b)}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('JS saved.')

# ===================================================================
# FIX CSS: The column overlap issue
# ===================================================================
print('\n=== FIXING CSS COLUMN OVERLAP ===')
css = open('css/styles.css', 'r', encoding='utf-8').read()

# The issue: the page-container has max-width: 1400px
# With sidebar 240px wide, main-content can be much wider on large screens
# The ps-layout grid: 300px 1fr 280px with gap:20px
# At narrow screens 300+280+20+20 = 620px minimum, which is fine
# But the RIGHT column may be overflowing if there's no overflow:hidden on the grid cells

# Key fix: make sure the ps-layout doesn't let columns overflow
# And ensure page-container has enough width

# Check current page-container
if 'max-width: 1400px' in css:
    print('page-container has max-width: 1400px')
    # Increase to 1600px or remove max-width for PS
    css = css.replace(
        '    max-width: 1400px;\n    margin: 0 auto;\n    padding: 28px 32px;',
        '    max-width: 1600px;\n    margin: 0 auto;\n    padding: 28px 32px;'
    )
    print('Increased max-width to 1600px')

# Also ensure ps-right doesn't overflow
# Add min-width: 0 to ps-right and overflow protection
if '    min-width: 0;\n}' in css:
    print('ps-center already has min-width: 0')

# The main fix: ensure the grid columns don't let content overflow into adjacent columns
# Add overflow: hidden to grid cells
old_layout = """.ps-layout {
    display: grid;
    grid-template-columns: 300px 1fr 280px;
    gap: 20px;
    align-items: start;
}"""

new_layout = """.ps-layout {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr) 280px;
    gap: 20px;
    align-items: start;
    width: 100%;
}"""

if old_layout in css:
    css = css.replace(old_layout, new_layout)
    print('Fixed ps-layout: added minmax(0, 1fr) and width:100%')
else:
    # Try to find and fix it anyway
    css = css.replace(
        'grid-template-columns: 300px 1fr 280px;',
        'grid-template-columns: 300px minmax(0, 1fr) 280px;'
    )
    print('Fixed grid column: 1fr -> minmax(0, 1fr)')

# Also fix the responsive overrides
css = css.replace(
    'grid-template-columns: 320px 1fr 300px;',
    'grid-template-columns: 320px minmax(0, 1fr) 300px;'
)
css = css.replace(
    'grid-template-columns: 280px 1fr 260px;',
    'grid-template-columns: 280px minmax(0, 1fr) 260px;'
)
css = css.replace(
    'grid-template-columns: 280px 1fr 260px; gap: 16px;',
    'grid-template-columns: 280px minmax(0, 1fr) 260px; gap: 16px;'
)
css = css.replace(
    'grid-template-columns: 260px 1fr;',
    'grid-template-columns: 260px minmax(0, 1fr);'
)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('CSS saved.')

# Bump cache versions
html = open('index.html', 'r', encoding='utf-8').read()
html = html.replace('styles.css?v=10', 'styles.css?v=11')
html = html.replace('prompt-studio.js?v=9', 'prompt-studio.js?v=10')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('index.html cache bumped.')

print('\n=== ALL DONE ===')
