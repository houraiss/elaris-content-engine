import re

path = r"C:\Users\User\Default Project\elaris-content-engine\js\prompt-studio.js"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# ═══════════════════════════════════════════════════════════════
# PATCH A: Replace the Modifiers card (lines 1692-1706)
# with Camera Angle + Lighting + Lens/Camera + Format
# ═══════════════════════════════════════════════════════════════

new_modifiers = '''                    <div class="card">
                        <div class="card-header"><span class="card-title">Modifiers</span></div>
                        <div class="form-group">
                            <label class="form-label">📐 Camera Angle</label>
                            <div class="ps-chip-group" id="ps-angle" style="flex-wrap:wrap">
                                ${this._getAnglesForCategory(this.state.category).map((a, i) => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}" title="${i < 3 ? 'Recommended for ' + (this.state.category || 'ring') : a.label}" style="${i === 0 ? 'border-color:var(--accent);' : i < 3 ? 'border-color:var(--accent);opacity:0.85;' : ''}">${i === 0 ? '⭐ ' : ''}${a.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">💡 Lighting &amp; Mood</label>
                            <div class="ps-chip-group" id="ps-lighting-mood" style="flex-wrap:wrap">
                                ${this.lightingMoods.map(m => `<button class="ps-chip ${m.id === this.state.lightingMood ? 'active' : ''}" data-val="${m.id}">${m.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">📷 Lens / Camera Preset <span class="text-sm text-muted">(overrides angle lens)</span></label>
                            <div class="ps-chip-group" id="ps-camera-profile" style="flex-wrap:wrap">
                                ${this.cameraProfiles.map(c => `<button class="ps-chip ${c.id === this.state.cameraProfile ? 'active' : ''}" data-val="${c.id}" title="${c.desc || 'Let the selected angle determine the camera'}">${c.label}</button>`).join('')}
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-top:6px;margin-bottom:0">
                                ${(this.cameraProfiles.find(c => c.id === this.state.cameraProfile) || {}).desc || 'Camera choice driven by the selected angle above.'}
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_format">🖼️ Format</label>
                            <div class="ps-chip-group" id="ps-format">
                                ${this.formats.map(f => `<button class="ps-chip ${f.id === this.state.format ? 'active' : ''}" data-val="${f.id}" data-i18n="ps_fmt_${f.id.replace(/-/g, '_')}">${f.label}</button>`).join('')}
                            </div>
                        </div>
                    </div>
'''

# Find Modifiers card start and end
mod_start = None
mod_end = None
for i, line in enumerate(lines):
    if '<span class="card-title">Modifiers</span>' in line:
        mod_start = i - 1  # the <div class="card"> line before
    if mod_start is not None and i > mod_start + 3 and line.strip() == '</div>' and lines[i-1].strip() == '</div>':
        # Check if this closes the card
        if i == 1705:  # 0-based for line 1706
            mod_end = i
            break

if mod_start is not None and mod_end is not None:
    lines[mod_start:mod_end+1] = [new_modifiers]
    print(f"A: Replaced Modifiers card (lines {mod_start+1}-{mod_end+1})")
else:
    # Fallback: direct index (lines 1692-1706 are 0-indexed 1691-1705)
    lines[1691:1706] = [new_modifiers]
    print(f"A: Replaced Modifiers card via direct index (1692-1706)")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Re-read for next patches
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# ═══════════════════════════════════════════════════════════════
# PATCH B: Remove the old Camera Angle from Advanced Controls
# (it's now in Modifiers)
# ═══════════════════════════════════════════════════════════════
# Find the Advanced Controls card and remove the Camera Angle form-group within it
adv_start = None
for i, line in enumerate(lines):
    if 'ps_adv_controls' in line:
        adv_start = i
        break

if adv_start:
    # The Camera Angle form-group should be right after the header (next few lines)
    # Find the form-group containing ps-angle and remove it
    j = adv_start + 1
    while j < len(lines):
        if 'id="ps-angle"' in lines[j]:
            # Found it - find the form-group boundaries
            fg_start = j
            while fg_start > adv_start and '<div class="form-group">' not in lines[fg_start]:
                fg_start -= 1
            fg_end = j
            while fg_end < len(lines) and '</div>' not in lines[fg_end].strip():
                fg_end += 1
            fg_end += 1  # include closing </div> of form-group
            
            # But we need to make sure we also get the closing </div> of the form-group
            # Look for the structure: <div form-group> ... <label>Camera Angle</label> ... <div ps-chip-group id=ps-angle> ... </div> ... </div>
            # Let's count divs
            depth = 0
            for k in range(fg_start, len(lines)):
                depth += lines[k].count('<div')
                depth -= lines[k].count('</div')
                if depth <= 0:
                    fg_end = k + 1
                    break
            
            del lines[fg_start:fg_end]
            print(f"B: Removed Camera Angle from Advanced Controls (lines {fg_start+1}-{fg_end})")
            break
        j += 1

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Re-read for next patches
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# ═══════════════════════════════════════════════════════════════
# PATCH C: Remove the standalone Camera System card (now in Modifiers)
# ═══════════════════════════════════════════════════════════════
cam_sys_start = None
cam_sys_end = None
for i, line in enumerate(lines):
    if '📷 Camera System' in line:
        cam_sys_start = i - 2  # Go back to <!-- comment --> and <div class="card">
        # Find the </div> that closes this card
        depth = 0
        for k in range(i - 1, len(lines)):
            if '<div class="card">' in lines[k] or '<div class="card"' in lines[k]:
                depth += 1
            if '</div>' in lines[k]:
                depth -= 1
            if depth <= 0 and k > i:
                cam_sys_end = k + 1
                break
        break

if cam_sys_start is not None and cam_sys_end is not None:
    del lines[cam_sys_start:cam_sys_end]
    print(f"C: Removed standalone Camera System card (lines {cam_sys_start+1}-{cam_sys_end})")
else:
    print("C: WARN - Camera System card not found")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Re-read for final patches
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ═══════════════════════════════════════════════════════════════
# PATCH D: Add new lighting moods from reference analysis
# ═══════════════════════════════════════════════════════════════
old_lighting_end = "{ id: 'dappled',         label: 'Dappled Sunlight' },\n    ],"
new_lighting_end = """{ id: 'dappled',         label: 'Dappled Sunlight' },
        { id: 'chiaroscuro',     label: 'Chiaroscuro (Rembrandt)' },
        { id: 'neon-glow',       label: 'Neon Glow' },
        { id: 'window-light',    label: 'Window Light (Side)' },
        { id: 'overcast',        label: 'Overcast Diffused' },
        { id: 'candlelight',     label: 'Candlelight Warm' },
        { id: 'blue-hour',       label: 'Blue Hour (Twilight)' },
        { id: 'split-light',     label: 'Split Lighting (50/50)' },
    ],"""

if old_lighting_end in content:
    content = content.replace(old_lighting_end, new_lighting_end)
    print("D: Added 7 new lighting moods")
else:
    print("D: WARN - Could not find lighting end marker")

# ═══════════════════════════════════════════════════════════════
# PATCH E: Add new camera angles from reference analysis
# ═══════════════════════════════════════════════════════════════
old_angle_end = "{ id: 'three-quarter-above',   label: 'Three-Quarter Above (Diagonal Down)' },\n        ];"
new_angle_end = """{ id: 'three-quarter-above',   label: 'Three-Quarter Above (Diagonal Down)' },
            // ── v3.2: New angles from reference image analysis ──────────────────
            { id: 'mouth-bite',            label: 'Mouth Bite (Lips & Jewelry)' },
            { id: 'neck-close-up',         label: 'Neck Close-Up (Collarbone)' },
            { id: 'hand-on-face',          label: 'Hand on Face (Touch Frame)' },
            { id: 'wrist-cross',           label: 'Crossed Wrists (Stacked)' },
            { id: 'mirror-angle',          label: 'Mirror Reflection Angle' },
            { id: 'upward-gaze',           label: 'Upward Gaze (Looking Up)' },
        ];"""

if old_angle_end in content:
    content = content.replace(old_angle_end, new_angle_end)
    print("E: Added 6 new camera angles")
else:
    print("E: WARN - Could not find angle end marker")

# ═══════════════════════════════════════════════════════════════
# PATCH F: Add new archetypes inspired by reference images
# ═══════════════════════════════════════════════════════════════
# Insert 3 new archetypes after product-page-clean
new_archetypes = """        {
            id: 'textured-prop',
            name: 'Textured Prop Staging',
            icon: '🪢',
            tagline: 'Tactile Storytelling',
            bestFor: 'Best for: Earrings, Necklaces, Bracelets, Rings',
            desc: 'Jewelry displayed on or alongside tactile materials — rope knots, lemon slices, dried flowers, raw silk, velvet, marble slabs, or natural fibers',
            color: '#8b6914',
            subjects: [
                '{piece} draped over a thick nautical rope knot against a warm amber background, product editorial',
                '{piece} arranged on thin slices of lemon on dark green marble surface, color contrast editorial photography',
                '{piece} resting on crumpled raw silk fabric, texture contrast between metal and organic fiber',
                '{piece} balanced on the edge of a rough-hewn stone slab, raw natural backdrop, editorial product shot',
                '{piece} nestled among dried lavender stems and seed pods on a linen surface, organic luxury staging',
            ],
            scene: 'tactile material props, natural fiber textures, color contrast between metal and organic materials, warm editorial product photography, no human model, no distractions beyond the prop, luxury still-life composition',
            compat: { ring: 90, necklace: 85, earrings: 95, bracelet: 90, bangles: 85, anklet: 70, brooch: 80, pendant: 85, 'body-jewelry': 60 },
        },
        {
            id: 'mouth-lips-editorial',
            name: 'Lips & Mouth Editorial',
            icon: '👄',
            tagline: 'Sensual Close-Up',
            bestFor: 'Best for: Necklaces, Pendants, Earrings',
            desc: 'Extreme close-up of lips, mouth, or lower face with jewelry held between teeth, draped from lips, or resting on chin — provocative editorial',
            color: '#8b2252',
            subjects: [
                'extreme close-up of model biting down gently on {piece} chain, jewelry pendant hanging from between parted lips, glossy skin, editorial',
                'model with {piece} necklace draped across lower lip, mouth slightly open, natural skin texture visible, artistic beauty photography',
                'macro close-up of model chin and mouth area, {piece} earring catching light at jawline, dewy skin, moody editorial',
                'model holding {piece} chain in teeth, pendant dangling, raw skin detail with freckles visible, provocative luxury editorial',
                'lower face close-up, {piece} resting on the cupids bow of the lips, natural lip texture, high-fashion beauty shot',
            ],
            scene: 'extreme mouth/lips close-up, visible skin texture (pores, freckles, natural glow), dewy or glossy skin finish, shallow depth of field, editorial beauty photography, provocative but tasteful, high-end jewelry campaign aesthetic',
            compat: { ring: 30, necklace: 95, earrings: 80, bracelet: 20, bangles: 15, anklet: 10, brooch: 40, pendant: 98, 'body-jewelry': 60 },
        },
        {
            id: 'dark-moody-editorial',
            name: 'Dark Moody Editorial',
            icon: '🖤',
            tagline: 'Shadow & Mystery',
            bestFor: 'Best for: Earrings, Necklaces, Rings, Bracelets',
            desc: 'Deep shadow, low-key lighting, dramatic chiaroscuro — the piece emerges from darkness like a point of light',
            color: '#1a1a1a',
            subjects: [
                'model in deep shadow, only the neck and ear area lit, {piece} catching a single beam of warm light, dark moody editorial',
                'low-key portrait, model face partially hidden in shadow, {piece} ring on hand touching chin, single light source from side',
                'dark editorial, model silhouette with {piece} as the brightest element, Rembrandt lighting triangle on cheek, mystery mood',
                'chiaroscuro portrait, deep black background, model hand reaching toward camera with {piece} catching golden side-light',
                'model neck and ear in pools of shadow and light, {piece} earring as single point of brilliance, dramatic fine art portrait',
            ],
            scene: 'low-key lighting, deep shadows, single light source creating dramatic fall-off, dark background near black, chiaroscuro oil-painting quality, jewelry as the brightest element in frame, fine art editorial photography, Rembrandt or loop lighting pattern',
            compat: { ring: 85, necklace: 90, earrings: 98, bracelet: 80, bangles: 75, anklet: 30, brooch: 70, pendant: 88, 'body-jewelry': 55 },
        },
"""

# Find product-page-clean closing brace and insert after
ppc_pattern = "            compat: { ring: 98, necklace: 98, earrings: 98, bracelet: 98, bangles: 98, anklet: 98, brooch: 98, pendant: 98, 'body-jewelry': 90 },\n        },"
if ppc_pattern in content:
    content = content.replace(ppc_pattern, ppc_pattern + "\n" + new_archetypes)
    print("F: Added 3 new archetypes (textured-prop, mouth-lips-editorial, dark-moody-editorial)")
else:
    print("F: WARN - Could not find product-page-clean compat")

# ═══════════════════════════════════════════════════════════════
# PATCH G: Add V3 tags + Smart Guide for new archetypes
# ═══════════════════════════════════════════════════════════════
# Add to V3 archetypes set
old_v3 = "'harsh-sun-beauty', 'product-page-clean',"
new_v3 = "'harsh-sun-beauty', 'product-page-clean', 'textured-prop', 'mouth-lips-editorial', 'dark-moody-editorial',"
content = content.replace(old_v3, new_v3, 2)  # appears twice
print("G1: Added new archetypes to V3 set")

# Add to angle boost map
old_angle_boost = "            'product-page-clean': ['eye-level', 'flat-lay', '45-degree'],"
new_angle_boosts = """            'product-page-clean': ['eye-level', 'flat-lay', '45-degree'],
            'textured-prop': ['45-degree', 'flat-lay', 'macro'],
            'mouth-lips-editorial': ['mouth-bite', 'extreme-close-crop', 'macro'],
            'dark-moody-editorial': ['side-profile', 'eye-level', '45-degree'],"""
content = content.replace(old_angle_boost, new_angle_boosts)
print("G2: Added angle boosts for new archetypes")

# Add Smart Guide entries
old_guide = "            'product-page-clean': { angle:['eye-level','flat-lay','45-degree'],"
new_guides_line = """            'textured-prop': { angle:['45-degree','flat-lay','macro','overhead'], lighting:['natural','warm','window-light','golden-hour'], camera:['hasselblad-85','phase-one-iq4','macro-100'], tips:['Use No Model -- this is a pure product-on-prop archetype.','Natural or Window Light preserves the texture of organic materials.','45-degree or Flat Lay angles work best for showing the jewelry+prop relationship.','Choose props with complementary textures: rope, marble, citrus, dried flowers.'] },
            'mouth-lips-editorial': { angle:['mouth-bite','extreme-close-crop','macro','neck-close-up'], lighting:['dramatic','chiaroscuro','natural','soft'], camera:['canon-135-l','hasselblad-85','macro-100'], tips:['Canon 135mm L creates beautiful compression for face close-ups.','Dramatic or Chiaroscuro lighting adds editorial depth.','Use Extreme Close Crop or the new Mouth Bite angle for maximum impact.','Ultra Realism recommended -- skin pores, lip texture, and freckles sell the shot.'] },
            'dark-moody-editorial': { angle:['side-profile','eye-level','45-degree','silhouette'], lighting:['dramatic','chiaroscuro','mystical','split-light'], camera:['canon-135-l','leica-50','hasselblad-85'], tips:['Chiaroscuro or Split Lighting is essential for the dark moody aesthetic.','Side Profile or Silhouette angles maximise the shadow drama.','Keep the jewelry as the brightest element -- it should emerge from darkness.','Dark backgrounds (near black) prevent the shadow mood from being diluted.'] },
            'product-page-clean': { angle:['eye-level','flat-lay','45-degree'],"""
content = content.replace(old_guide, new_guides_line)
print("G3: Added Smart Guide for new archetypes")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n=== All patches applied ===")

# Final balance check
opens = content.count('{')
closes = content.count('}')
parens_o = content.count('(')
parens_c = content.count(')')
print(f"Braces: {opens}/{closes} (diff {opens-closes})")
print(f"Parens: {parens_o}/{parens_c} (diff {parens_o-parens_c})")
print(f"Lines: {content.count(chr(10)) + 1}")
