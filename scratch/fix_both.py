"""
Fix two issues:
1. Mojibake emoji icons in archetype definitions in prompt-studio.js
2. CSS layout: html/body overflow:hidden blocking scroll + column overlap
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ===================================================================
# FIX 1: Replace mojibake emoji icons in prompt-studio.js
# ===================================================================
# Map of broken mojibake -> correct emoji
# Identified by looking at archetype IDs and what icons they should have

ICON_MAP = {
    # body-intimate -> 🤲 (hands / skin)
    "'≡ƒæñ'": "'🤲'",
    # object-pairing -> 🌿 (natural props)
    "'≡ƒìï'": "'🌿'",
    # editorial-model -> 📸 (camera / fashion)
    "'≡ƒô╕'": "'📸'",
    # surreal-animal -> 🦋 (butterfly / exotic)
    "'≡ƒÉì'": "'🦋'",
    # gradient-product -> 💎 (gem / product)
    "'≡ƒĿ'": "'💎'",
    # bw-dramatic -> 🎭 (drama / contrast)
    "'≡ƒÄ╣'": "'🎭'",
    # shadow-play -> 🌑 (shadow / light)
    "'≡ƒţ∩╕Å'": "'🌑'",
    # bold-typography -> 🔡 (type / text)
    "'≡ƒöá'": "'🔡'",
    # collection-showcase -> ✨ (sparkle / collection)
    "'≡ƒÆÄ'": "'✨'",
    # macro-detail -> 🔬 (zoom / detail)
    "'≡ƒöì'": "'🔬'",
    # wet-element -> 💧 (water)
    "'≡ƒƺ'": "'💧'",
    # architectural-context -> 🏛️ (architecture)
    "'≡ƒŢ∩╕Å'": "'🏛️'",
    # flat-lay -> 📐 (layout / overhead)
    "'≡ƒÄì'": "'📐'",
    # motion-blur -> 💨 (flow / motion)
    "'≡ƒƿ'": "'💨'",
    # cinematic-portrait -> 🎬 (cinema)
    "'≡ƒļ'": "'🎬'",
    # mirror-reflection -> 🪞 (mirror)
    "'≡ƒ¬₧'": "'🪞'",
    # texture-contrast -> 🪨 (stone/texture)
    "'≡ƒ¬¿'": "'🪨'",
    # desert-mirage -> 🌅 (sunset/desert)
    "'≡ƒîå'": "'🌅'",
    # neon-cyberpunk -> 🌆 (neon city)
    "'≡ƒîå'": "'🌆'",
    # nature-botanical -> 🌺 (botanical)
    "'≡ƒîâ'": "'🌺'",
    # minimalist-space -> ⬜ (minimalism)
    "'≡ƒŁæ'": "'⬜'",
    # seasonal-holiday -> 🎁 (celebration)
    "'≡ƒéá'": "'🎁'",
    # vintage-nostalgia -> 📷 (vintage camera)
    "'≡ƒôÇ'": "'📷'",
    # lifestyle-moment -> ☕ (lifestyle)
    "'≡ƒõÑ'": "'☕'",
    # heritage-moroccan -> 🏺 (heritage/moroccan)
    "'≡ƒÅΩ∩╕Å'": "'🏺'",
    # masculine-editorial -> 🧔 (male model)
    "'≡ƒ¿Å'": "'🧔'",
    # surface-lean -> 🪑 (lean/sit)
    "'≡ƒªæ'": "'🪑'",
    # hair-drama -> 💇'": 
    "'≡ƒ¬Å'": "'💇'",
    # Any other broken patterns - use generic fallbacks
}

# Also handle these patterns in the icon field (with double quotes)
ICON_MAP_DOUBLE = {k.replace("'", '"'): v.replace("'", '"') for k, v in ICON_MAP.items()}

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

print('=== FIXING ICONS IN PROMPT-STUDIO.JS ===')
fixed_count = 0

# Strategy: find all icon: '...' fields and check for mojibake
# Mojibake pattern: contains ≡ƒ or ΓÇ which are not valid emoji
import re

# Find all icon field values
icon_pattern = re.compile(r"icon:\s*'([^']*)'")
matches = list(icon_pattern.finditer(js))
print(f'Found {len(matches)} icon fields')

# Show all current icons
for m in matches:
    val = m.group(1)
    is_bad = '≡' in val or 'Γ' in val or 'ƒ' in val
    print(f'  {"BAD" if is_bad else "OK "}: {repr(val[:30])}')

# Apply replacements
for old, new in ICON_MAP.items():
    if old in js:
        js = js.replace(old, new)
        fixed_count += 1
        print(f'  Fixed: {old} -> {new}')
for old, new in ICON_MAP_DOUBLE.items():
    if old in js:
        js = js.replace(old, new)

# Double-check: find any remaining broken icons
remaining_broken = icon_pattern.findall(js)
still_bad = [v for v in remaining_broken if '≡' in v or 'ƒ' in v]

if still_bad:
    print(f'\nSTILL BAD ICONS ({len(still_bad)}):')
    for b in still_bad:
        print(f'  {repr(b)}')
    # Replace them with reasonable defaults based on context
    # Find them in context to identify the archetype
    for bad_icon in still_bad:
        pattern = re.compile(rf"id:\s*'([^']*)'[^{{}}]*?icon:\s*'{re.escape(bad_icon)}'", re.DOTALL)
        match = pattern.search(js)
        if match:
            arch_id = match.group(1)
            print(f'  -> archetype: {arch_id}')
        # Replace with ⭐ as fallback
        js = js.replace(f"icon: '{bad_icon}'", "icon: '⭐'")
        print(f'  -> replaced with ⭐')

print(f'\nFixed {fixed_count} icon replacements')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('JS saved.')

# ===================================================================
# FIX 2: CSS Layout fixes
# ===================================================================
print('\n=== FIXING CSS LAYOUT ===')

css = open('css/styles.css', 'r', encoding='utf-8').read()

# Fix 1: html, body overflow:hidden -> allow scrolling
# The html/body should NOT have overflow:hidden because it prevents page scroll
old_body = """html, body {
    height: 100%;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    background: var(--bg-primary);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
}"""

new_body = """html, body {
    height: 100%;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text-primary);
    background: var(--bg-primary);
    -webkit-font-smoothing: antialiased;
    overflow: hidden; /* sidebar layout: scroll happens in .main-content */
}"""

# Actually the overflow:hidden on html/body is intentional for the sidebar layout
# The main-content has overflow-y: auto which handles the scroll
# The real issue is that the page-container max-width: 1400px may be too narrow
# Let's check: sidebar is 240px, page-container has padding 32px*2=64px
# Available width = viewport - 240px sidebar
# At 1400px viewport: 1400 - 240 = 1160px for content
# 3 columns: 300 + 20 + (flex:1) + 20 + 280 = 620px minimum for the grid
# This should be fine. The issue is probably that ps-right is absolute positioned or something

# Let's check the actual .ps-layout CSS to see if it has overflow:hidden
layout_check = css.find('.ps-layout')
print(f'ps-layout at char {layout_check}')
print(css[layout_check:layout_check+200])
