import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# FIX 1 — ai-choice styling option
# ════════════════════════════════════════════════════════════════════

# 1a. Add to stylings getter (between 'auto' and 'minimal')
OLD_STYLINGS_AUTO = "            { id: 'auto', label: 'Auto / Scene' },"
NEW_STYLINGS_AUTO  = """            { id: 'auto', label: 'Auto / Scene' },
            { id: 'ai-choice', label: 'AI Chooses ✦' },"""

if OLD_STYLINGS_AUTO in ps:
    ps = ps.replace(OLD_STYLINGS_AUTO, NEW_STYLINGS_AUTO)
    fixes.append('FIX 1a OK: ai-choice added to stylings getter')
else:
    fixes.append('FIX 1a MISS: stylings auto entry not found')

# 1b. Add ai-choice to styleMap with a creative brief
# Key: don't specify the garment, just the brief + jewelry-visibility constraint
OLD_STYLEMAP_AUTO = """                'auto': this._getRandomOutfit(modelGenderForStyling, this.state.material),   // auto: palette-matched random outfit"""

NEW_STYLEMAP_AUTO  = """                'auto': this._getRandomOutfit(modelGenderForStyling, this.state.material),   // auto: palette-matched random outfit
                'ai-choice': `outfit creatively chosen by the art director — high-fashion luxury jewelry campaign, neckline naturally open to display the ${category} piece, elevated editorial styling, garment silhouette and color chosen by the photographer to best complement the jewelry`,"""

if OLD_STYLEMAP_AUTO in ps:
    ps = ps.replace(OLD_STYLEMAP_AUTO, NEW_STYLEMAP_AUTO)
    fixes.append('FIX 1b OK: ai-choice entry in styleMap')
else:
    fixes.append('FIX 1b MISS: styleMap auto line not found')


# ════════════════════════════════════════════════════════════════════
# FIX 2 — Model consistency: suppress _getRandomSkinTone when profile active
# The profile descriptor (e.g. Amir: "olive Moroccan skin tone, strong jaw...")
# already contains appearance details. Injecting a RANDOM skin tone on top of it
# creates contradictions — the AI picks one or mixes them.
# When consistencyOn + activeProfile, skip the random skin tone entirely.
# ════════════════════════════════════════════════════════════════════

# 2a. After the consistency flags are computed (hasModelDesc), derive a flag
#     that tells us whether a specific named profile is active.
OLD_CONSISTENCY_FLAGS = """        const hasModelDesc  = this.state.consistencyOn;               // model descriptor enabled
            const hasModelImage = hasModelDesc && this.state.modelImageAttached; // ALSO has photo attached"""

NEW_CONSISTENCY_FLAGS  = """        const hasModelDesc  = this.state.consistencyOn;               // model descriptor enabled
            const hasModelImage = hasModelDesc && this.state.modelImageAttached; // ALSO has photo attached
            // When a named profile is active, its descriptor defines the model's appearance.
            // We must NOT inject random skin tone or random styling on top of it — it contradicts.
            const hasNamedProfile = hasModelDesc && !!this.state.profiles.find(
                prof => prof.id === this.state.activeProfileId
            );"""

if OLD_CONSISTENCY_FLAGS in ps:
    ps = ps.replace(OLD_CONSISTENCY_FLAGS, NEW_CONSISTENCY_FLAGS)
    fixes.append('FIX 2a OK: hasNamedProfile flag computed after consistency flags')
else:
    fixes.append('FIX 2a MISS: consistency flags block not found')
    idx = ps.find('const hasModelDesc  = this.state.consistencyOn')
    print(repr(ps[idx:idx+200]))

# 2b. In bodyParts, gate _getRandomSkinTone on !hasNamedProfile
OLD_SKIN_TONE_INJECT = "            isHuman ? this._getRandomSkinTone() + '.' : '',"
NEW_SKIN_TONE_INJECT  = "            (isHuman && !hasNamedProfile) ? this._getRandomSkinTone() + '.' : '',  // suppressed when named profile active"

if OLD_SKIN_TONE_INJECT in ps:
    ps = ps.replace(OLD_SKIN_TONE_INJECT, NEW_SKIN_TONE_INJECT)
    fixes.append('FIX 2b OK: _getRandomSkinTone suppressed for named profiles')
else:
    fixes.append('FIX 2b MISS: skin tone inject line not found')

# 2c. Also suppress random outfit (auto) when a named profile is active AND
#     the user hasn't picked a specific styling — the profile may have an implied style.
# Actually we KEEP styling for now (outfit affects garment, not face/skin).
# But we DO suppress the random poseDesc/expressionDesc conflict:
# The profile's descriptor implies the model's typical presence.
# For now, just add a note in the subject: when hasNamedProfile, reference profile by name.

# Find where the subject is built (already has "model in..." structure)
# Add a modifier: prepend the profile name as a reference tag
idx_subj = ps.find("subject = this._getUniqueSubject(archetype)")
print(f'subject build at {idx_subj}: {repr(ps[idx_subj:idx_subj+100])}')

# 2d. When hasNamedProfile, the "model" in the subject text should reference the profile
# Rather than prepend, we'll add a "Model Reference" sentence after bodyParts
# (it's already added via the hasModelDesc block: "Model Details: ${activeProf.descriptor}")
# The REAL fix is to suppress _getRandomSkinTone — which 2b handles.
# Also suppress the realism pool (skin texture, wrinkles) to avoid contradictions.
# These are only useful without a profile — the profile's descriptor already defines appearance.

# Check: does the existing hasModelDesc block suppress realismDesc?
# No — so let's also gate realismDesc on !hasNamedProfile
# Actually, realismDesc is from user-controlled sliders (skinTexture, wrinkles, etc.)
# It's fine to keep those since they specify QUALITY not appearance.
# The key suppression is skin tone (appearance = what the person looks like).

# Summary: FIX 2b is the critical fix. The profile descriptor is injected AFTER bodyParts
# as "Model Details: ..." but if skin tone from _getRandomSkinTone() appears BEFORE it,
# the AI reads the skin tone first and latches onto it.

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

print()
for fix in fixes: print(f'  {fix}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ("{ id: 'ai-choice', label: 'AI Chooses ✦' }" in ps2,   'ai-choice in stylings getter'),
    ("'ai-choice':" in ps2,                                   'ai-choice in styleMap'),
    ('art director' in ps2,                                   'ai-choice brief has art director language'),
    ('neckline naturally open' in ps2,                        'ai-choice enforces jewelry visibility'),
    ('hasNamedProfile' in ps2,                                'hasNamedProfile flag exists'),
    ('!hasNamedProfile' in ps2,                               'hasNamedProfile gates skin tone'),
    ('suppressed when named profile active' in ps2,            'Suppression comment'),
    ("this.state.profiles.find" in ps2,                       'Profile lookup for hasNamedProfile'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')

bt = ps2.count('`')
ob = ps2.count('{')
cb = ps2.count('}')
print(f'\n  Backticks: {bt} (even: {bt%2==0}), Braces diff: {ob-cb}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
