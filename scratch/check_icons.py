import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find all archetype blocks by searching for id: 'xxx' and icon: 'yyy' nearby
id_positions = [(m.start(), m.group(1)) for m in re.finditer(r"id:\s*'([^']+)'", js)]
icon_positions = [(m.start(), m.group(1)) for m in re.finditer(r"icon:\s*'([^']*)'", js)]

print('ALL ARCHETYPE ICONS:')
for id_pos, arch_id in id_positions:
    # Find the next icon after this id (within 300 chars)
    for icon_pos, icon_val in icon_positions:
        if icon_pos > id_pos and icon_pos < id_pos + 300:
            bad = any(c in icon_val for c in ['≡', 'ƒ', 'Γ', '\ufffd'])
            status = 'BAD' if bad else 'OK '
            print(f'  {status}: {arch_id:30s} -> {icon_val}')
            break

# Also check gradient-product still has 💎
gp_idx = js.find("id: 'gradient-product'")
if gp_idx > 0:
    icon_idx = js.find("icon:", gp_idx)
    print(f"\ngradient-product icon context: {js[icon_idx:icon_idx+20]}")
