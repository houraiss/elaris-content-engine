"""
Fix ALL subject template issues + poseDesc conflict + gender-aware styling
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print(f'File size: {len(ps)} chars')

fixes = []

# ══════════════════════════════════════════════════════════════
# PART A: Fix surface-lean subject templates
# ══════════════════════════════════════════════════════════════

# [1] "{piece} visible from wrist to knuckle" → generic/neutral
old = "'model leaning forward, both forearms resting on surface, {piece} visible from wrist to knuckle'"
new = "'model leaning forward, both forearms resting on surface, {piece} in sharp foreground focus, hands and wrists leading the eye'"
if old in ps: ps = ps.replace(old, new); fixes.append('surface-lean[1]: "wrist to knuckle" fixed')
else: fixes.append('MISS surface-lean[1]')

# [2] "{piece} rings stacked on display" → neutral
old = "'model propping chin with interlaced fingers, {piece} rings stacked on display at center frame'"
new = "'model propping chin with interlaced fingers, {piece} displayed prominently at center frame'"
if old in ps: ps = ps.replace(old, new); fixes.append('surface-lean[2]: "rings stacked" fixed')
else: fixes.append('MISS surface-lean[2]')

# [3] "{piece} on both hands" → single hand (physically correct for rings)
old = "'model with one hand placed flat on surface, other hand lightly resting over it, {piece} on both hands'"
new = "'model with both hands gently resting on surface, {piece} centered and in sharp focus'"
if old in ps: ps = ps.replace(old, new); fixes.append('surface-lean[3]: "on both hands" fixed')
else: fixes.append('MISS surface-lean[3]')

# [4] "showing bracelet {piece}" → remove hardcoded "bracelet"
old = "'model leaning into camera with wrist bent back showing bracelet {piece}, casual cool editorial'"
new = "'model leaning into camera, wrist elegantly bent, {piece} visible at the foreground, casual editorial confidence'"
if old in ps: ps = ps.replace(old, new); fixes.append('surface-lean[4]: hardcoded "bracelet" removed')
else: fixes.append('MISS surface-lean[4]')

# ══════════════════════════════════════════════════════════════
# PART B: Fix hair-drama subject templates
# ══════════════════════════════════════════════════════════════

# [0] "rings on every finger" — no {piece}, hardcoded
old = "'model running fingers through long hair, both hands raised, rings on every finger catching the light'"
new = "'model running fingers through long hair, both hands raised, {piece} catching the light in motion'"
if old in ps: ps = ps.replace(old, new); fixes.append('hair-drama[0]: "rings on every finger" fixed')
else: fixes.append('MISS hair-drama[0]')

# [2] "{piece} rings and bracelets all visible" — adds extra types after {piece}
old = "'hands pulling hair back into loose updo, {piece} rings and bracelets all visible against the hair'"
new = "'hands pulling hair back into loose updo, {piece} prominently displayed against the hair'"
if old in ps: ps = ps.replace(old, new); fixes.append('hair-drama[2]: "rings and bracelets" fixed')
else: fixes.append('MISS hair-drama[2]')

# [4] "{piece} stacked rings at every knuckle" — adds "stacked rings" after {piece}
old = "'close-up of hands gathering hair at nape, {piece} stacked rings at every knuckle, golden hour backlight'"
new = "'close-up of hands gathering hair at nape, {piece} displayed at every finger, golden hour backlight'"
if old in ps: ps = ps.replace(old, new); fixes.append('hair-drama[4]: "stacked rings" fixed')
else: fixes.append('MISS hair-drama[4]')

# ══════════════════════════════════════════════════════════════
# PART C: Fix masculine-editorial subject templates
# ══════════════════════════════════════════════════════════════

# [0] "{piece} signet ring at cuff" — adds "signet ring" after {piece}
old = "'man in dark blazer, hand in pocket showing {piece} signet ring at cuff edge, sophisticated editorial'"
new = "'man in dark blazer, hand resting at cuff edge with {piece} prominently visible, sophisticated editorial'"
if old in ps: ps = ps.replace(old, new); fixes.append('masc-editorial[0]: "signet ring" removed')
else: fixes.append('MISS masc-editorial[0]')

# [1] "{piece} chunky chain bracelet" — adds jewelry type after {piece}
old = "'man with rolled sleeves showing strong forearms, {piece} chunky chain bracelet draped casually'"
new = "'man with rolled sleeves showing strong forearms, {piece} draped casually, masculine editorial detail'"
if old in ps: ps = ps.replace(old, new); fixes.append('masc-editorial[1]: "chunky chain bracelet" removed')
else: fixes.append('MISS masc-editorial[1]')

# [2] "{piece} ring clearly visible" — adds "ring" after {piece}
old = "'close-up of man hand gripping steering wheel, {piece} ring clearly visible, golden hour light'"
new = "'close-up of man hand gripping steering wheel, {piece} clearly visible, golden hour light'"
if old in ps: ps = ps.replace(old, new); fixes.append('masc-editorial[2]: "ring" removed')
else: fixes.append('MISS masc-editorial[2]')

# [3] "{piece} chain necklace visible" — adds "chain necklace" after {piece}
old = "'man adjusting jacket lapel, {piece} chain necklace visible at open collar, confident gaze'"
new = "'man adjusting jacket lapel, {piece} visible at open collar, confident gaze'"
if old in ps: ps = ps.replace(old, new); fixes.append('masc-editorial[3]: "chain necklace" removed')
else: fixes.append('MISS masc-editorial[3]')

# [4] Corrupted "s hand resting..." + "{piece} ring prominent"
old = """\"s hand resting on a wooden bar top, {piece} ring prominent, warm candlelight illumination\","""
new = """'man\\'s hand resting on a polished bar top, {piece} prominent, warm candlelight and rich shadow',"""
if old in ps:
    ps = ps.replace(old, new)
    fixes.append('masc-editorial[4]: corruption fixed + "ring" removed')
else:
    # Try alternate quote styles
    old2 = '''"s hand resting on a wooden bar top, {piece} ring prominent, warm candlelight illumination"'''
    if old2 in ps:
        ps = ps.replace(old2, new)
        fixes.append('masc-editorial[4] (alt): corruption fixed')
    else:
        fixes.append('MISS masc-editorial[4] — checking raw...')
        idx = ps.find("s hand resting on a wooden bar top")
        if idx > 0:
            print(f'  Found corrupted entry at {idx}:')
            print(repr(ps[max(0,idx-20):idx+120]))

# ══════════════════════════════════════════════════════════════
# PART D: Fix poseDesc — only inject for archetypes that need it
# The subject templates for most archetypes already describe a
# specific body position. Injecting poseDesc on top creates TWO
# conflicting body position descriptions in the same prompt.
# Only keep poseDesc for archetypes with generic/scene subjects.
# ══════════════════════════════════════════════════════════════

old_pose_injection = """        // Pose variety for human archetypes — adds realism and avoids repeated chin-touching
        let poseDesc = '';
        if (isHuman) {
            const poseMap = {"""

new_pose_injection = """        // Pose detail — ONLY injected for archetypes whose subject templates
        // describe a general scene (not a specific body position). For archetypes
        // like surface-lean, hair-drama, body-intimate, masculine-editorial, their
        // subject templates already fully describe the model's position — injecting
        // poseDesc on top would create two conflicting body descriptions.
        const POSE_ARCHETYPES = new Set(['editorial-model', 'bw-dramatic', 'cinematic-portrait', 'lifestyle-moment']);
        let poseDesc = '';
        if (isHuman && POSE_ARCHETYPES.has(archetype.id)) {
            const poseMap = {"""

if old_pose_injection in ps:
    ps = ps.replace(old_pose_injection, new_pose_injection)
    fixes.append('poseDesc: now only injected for editorial-model, bw-dramatic, cinematic-portrait, lifestyle-moment')
else:
    fixes.append('MISS poseDesc guard — checking...')
    idx = ps.find('Pose variety for human archetypes')
    print(f'  poseDesc block at: {idx}')

# Also need to close the if(isHuman) → if(isHuman && POSE_ARCHETYPES...) 
# The original was: if (isHuman) { ... } 
# Now it's: if (isHuman && POSE_ARCHETYPES.has(archetype.id)) { ... }
# The closing brace pattern should be the same, so no extra changes needed.

# ══════════════════════════════════════════════════════════════
# PART E: Gender-aware styling description
# "minimal/nude styling, skin as the canvas" reads as feminine.
# For male models, use different phrasing.
# ══════════════════════════════════════════════════════════════

old_styling = """        // Model styling (only for human archetypes)
        let stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'minimal': 'model in minimal/nude styling, skin as the canvas',"""

new_styling = """        // Model styling (only for human archetypes) — gender-aware phrasing
        const modelGenderForStyling = this.state.modelGender || 'female';
        let stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'minimal': modelGenderForStyling === 'male'
                    ? 'model in minimal clean styling, strong build as the canvas'
                    : 'model in minimal styling, skin as the canvas',"""

if old_styling in ps:
    ps = ps.replace(old_styling, new_styling)
    fixes.append('stylingDesc: gender-aware "minimal" styling')
else:
    fixes.append('MISS stylingDesc block')

# ══════════════════════════════════════════════════════════════
# Save + version bump
# ══════════════════════════════════════════════════════════════
with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# ══════════════════════════════════════════════════════════════
# REPORT
# ══════════════════════════════════════════════════════════════
print('\n=== FIXES APPLIED ===')
for f in fixes:
    status = '✓' if not f.startswith('MISS') else '✗'
    print(f'  {status} {f}')

# Quick verifications
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== SPOT CHECKS ===')
spot = [
    ('wrist to knuckle' not in ps2,                  'No "wrist to knuckle" in templates'),
    ('on both hands' not in ps2,                     'No "on both hands" (impossible anatomy)'),
    ('showing bracelet {piece}' not in ps2,          'No hardcoded "bracelet" before {piece}'),
    ('rings on every finger' not in ps2,             'No hardcoded "rings on every finger"'),
    ('rings and bracelets all visible' not in ps2,   'No "rings and bracelets" hardcoded'),
    ('s hand resting on a wooden bar top' not in ps2,'Corrupted "s hand" entry fixed'),
    ('POSE_ARCHETYPES' in ps2,                       'poseDesc guarded by POSE_ARCHETYPES set'),
    ('modelGenderForStyling' in ps2,                 'Gender-aware styling desc'),
    ('strong build as the canvas' in ps2,            'Male styling desc exists'),
]
all_ok = True
for ok, desc in spot:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  CHECK MISSES')
