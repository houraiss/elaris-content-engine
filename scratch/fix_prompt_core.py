"""
Root-cause fixes for _buildPrompt:
  1. Gender pronoun hardcoded ("her"/"woman") → use modelGender
  2. Model Details placement AFTER negative prompt → move BEFORE tail
  3. Material triple-duplication → subject uses piece-only (no material prefix)
  4. Camera "eye-level perspective" conflicting with archetype scene angle → strip from map
  5. Duplicate dead skinDetailMap2 → remove
  6. Pose pool has embedded skin/wrinkle phrases → strip them out
  7. Refactor standardParts into body + tail so model details slots in cleanly
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print(f'File: {len(ps)} chars')

# ── FIX 1: Material deduplication — subject should NOT embed material ──────
OLD_SUBJECT_BUILD = r"const subject = this._getUniqueSubject(archetype).replace(/\{piece\}/g, `${material} ${piece}`);"
NEW_SUBJECT_BUILD =  "const subject = this._getUniqueSubject(archetype).replace(/\\{piece\\}/g, piece);"
if OLD_SUBJECT_BUILD in ps:
    ps = ps.replace(OLD_SUBJECT_BUILD, NEW_SUBJECT_BUILD)
    print('FIX 1 ✓  Material removed from {piece} substitution')
else:
    print('FIX 1 ✗  Could not find subject build line')

# ── FIX 2: Camera — remove "eye-level perspective" from eye-level entry ────
OLD_CAMERA_EL = "'eye-level':     'shot on 85mm f/1.4 lens, shallow depth of field, natural eye-level perspective',"
NEW_CAMERA_EL =  "'eye-level':     'shot on 85mm f/1.4 portrait lens, shallow depth of field',"
if OLD_CAMERA_EL in ps:
    ps = ps.replace(OLD_CAMERA_EL, NEW_CAMERA_EL)
    print('FIX 2 ✓  Removed "natural eye-level perspective" from cameraMap')
else:
    print('FIX 2 ✗  Could not find eye-level camera entry')

# ── FIX 3: Pose pool — strip embedded wrinkle/skin notes ──────────────────
# body-intimate: "hand touching chin with wrinkled skin texture visible, {piece} on finger"
ps = ps.replace(
    "'hand touching chin with wrinkled skin texture visible, {piece} on finger'",
    "'hand touching chin, {piece} centered on finger'"
)
# surface-lean: "one elbow on surface, head tilted, hand loosely at cheek — natural skin wrinkle"
ps = ps.replace(
    "'one elbow on surface, head tilted, hand loosely at cheek — natural skin wrinkle'",
    "'one elbow on surface, head tilted, hand loosely at cheek'"
)
print('FIX 3 ✓  Stripped embedded skin/wrinkle notes from pose pool')

# ── FIX 4: Remove dead skinDetailMap2 duplicate ───────────────────────────
OLD_DEAD_MAP = """            // Skin detail
            const skinDetailMap2 = {
                'none':        '',
                'veins':       'subtle veins visible beneath skin, dermal translucency',
                'freckles':    'natural freckles and sun spots visible on skin',
                'translucent': 'skin translucency with subsurface scattering, light passing through thin skin areas',
            };

            if (realismParts.length > 0) {"""
NEW_DEAD_MAP = """            if (realismParts.length > 0) {"""
if OLD_DEAD_MAP in ps:
    ps = ps.replace(OLD_DEAD_MAP, NEW_DEAD_MAP)
    print('FIX 4 ✓  Removed dead skinDetailMap2 duplicate')
else:
    print('FIX 4 ✗  skinDetailMap2 not found (may already be removed)')

# ── FIX 5 + 6 + 7: Restructure standardParts + fix gender + Model Details placement ──
# The multi-image CONSISTENCY section needs restructuring.
# Current flow (broken):
#   p = header + standardPrompt (which INCLUDES negativePrompt at end)
#   p += "\n\nModel Details: ..."   ← appended AFTER negative prompt
#
# New flow:
#   p = header
#   p += bodyPrompt (scene description only, NO tail)
#   p += "\n\nModel Details: ..." (before quality tail)
#   p += "\n\n" + tailPrompt (quality + anatomy + ratio + negative)

OLD_PARTS = """        // ── FIX #5: Subject-first prompt structure for better AI weighting ──────────────────────
        // Most important visual element (the jewelry) comes first.
        const standardParts = [
            subject + '.',
            `${material}, ${silverDesc}.`,
            archetype.scene + '.',
            `${cameraDesc}.`,
            `${mood} mood, ${lighting}.`,
            poseDesc ? `Pose: ${poseDesc}.` : '',
            expressionDesc ? `Expression: ${expressionDesc}.` : '',
            realismDesc ? realismDesc + '.' : '',
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            stylingDesc ? stylingDesc + '.' : '',
            jewelryStyleDesc ? `Style direction: ${jewelryStyleDesc}.` : '',
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
            'Sharp critical focus on jewelry, perfect geometric proportions, 8K resolution, style photographic, professional commercial photography, RAW quality.',
            anatomyConstraint,
            `Aspect ratio ${ratio}.`,
            negativePrompt,
        ];
        const standardPrompt = standardParts.filter(Boolean).join(' ');

        // ── MULTI-IMAGE CONSISTENCY LOGIC ──────────────────────
        if (this.state.jewelryCount > 0) {
            const jc = this.state.jewelryCount;
            const hasModel = this.state.consistencyOn;
            let p = `[IMAGE REFERENCES]\\n`;
            p += jc === 1 ? `Image 1 shows the exact jewelry piece to be featured.\\n` : `Images 1 to ${jc} show the exact jewelry piece to be featured.\\n`;
            if (hasModel) {
                p += `Image ${jc + 1} is the model reference - keep her face, features, and skin tone perfectly identical.\\n`;
            }
            p += `\\n[JEWELRY RECONSTRUCTION]\\n`;
            p += `Use ALL jewelry image(s) to reconstruct the ${this.state.category || 'piece'}. Maintain exact metal color, stone placement, and proportions.\\n`;
            
            p += `\\n[SCENE DIRECTION]\\n`;
            if (hasModel) {
                p += `Generate a photo of the exact same woman from Image ${jc + 1} wearing the jewelry. `;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry. `;
            }
            p += standardPrompt;

            if (hasModel) {
                const activeProf = this.state.profiles.find(prof => prof.id === this.state.activeProfileId);
                if (activeProf) {
                    p += `\\n\\nModel Details: ${activeProf.descriptor}`;
                }
            }
            return p;
        }

        return standardPrompt;
    }"""

NEW_PARTS = """        // ── Prompt structure: body (scene) + tail (quality + constraints) ──────────────────────
        // Splitting into body/tail allows Model Details to be injected BEFORE the
        // technical tail in consistency mode, ensuring the model descriptor has
        // higher token weight than the negative prompt.
        const bodyParts = [
            // SUBJECT — jewelry piece at the center, material injected cleanly on next line
            subject + '.',
            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,
            // SCENE — archetype visual story (lighting, composition, mood)
            archetype.scene + '.',
            // CAMERA — lens, aperture, depth of field (no angle conflict)
            `${cameraDesc}.`,
            // MOOD & LIGHTING
            `${mood} mood, ${lighting}.`,
            // POSE (human only, no embedded skin notes)
            poseDesc ? `Pose: ${poseDesc}.` : '',
            // EXPRESSION (human only)
            expressionDesc ? `Expression: ${expressionDesc}.` : '',
            // REALISM (skin texture, wrinkles, body hair, skin detail — user controlled)
            realismDesc ? realismDesc + '.' : '',
            // SURFACE / PALETTE / STYLING
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            stylingDesc ? stylingDesc + '.' : '',
            // JEWELRY STYLE DIRECTION
            jewelryStyleDesc ? `Style direction: ${jewelryStyleDesc}.` : '',
            // BRAND HALLMARK (optional)
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
        ];

        const tailParts = [
            'Sharp critical focus on jewelry, perfect geometric proportions, 8K resolution, style photographic, professional commercial photography, RAW quality.',
            anatomyConstraint,
            `Aspect ratio ${ratio}.`,
            negativePrompt,
        ];

        const standardPrompt = [...bodyParts, ...tailParts].filter(Boolean).join(' ');

        // ── MULTI-IMAGE CONSISTENCY LOGIC ──────────────────────
        if (this.state.jewelryCount > 0) {
            const jc = this.state.jewelryCount;
            const hasModel = this.state.consistencyOn;

            // Gender-correct pronouns
            const modelGender  = this.state.modelGender || 'female';
            const genderNoun   = modelGender === 'male' ? 'man'  : 'woman';
            const genderHisHer = modelGender === 'male' ? 'his'  : 'her';

            let p = `[IMAGE REFERENCES]\\n`;
            p += jc === 1
                ? `Image 1 shows the exact jewelry piece to be featured.\\n`
                : `Images 1 to ${jc} show the exact jewelry piece to be featured.\\n`;
            if (hasModel) {
                p += `Image ${jc + 1} is the model reference — keep ${genderHisHer} face, features, and skin tone perfectly identical.\\n`;
            }
            p += `\\n[JEWELRY RECONSTRUCTION]\\n`;
            p += `Use ALL jewelry image(s) to reconstruct the ${this.state.category || 'piece'}. Maintain exact metal color, stone placement, and proportions.\\n`;

            p += `\\n[SCENE DIRECTION]\\n`;
            if (hasModel) {
                p += `Generate a photo of the exact same ${genderNoun} from Image ${jc + 1} wearing the jewelry.\\n`;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry.\\n`;
            }

            // Body prompt (scene description)
            p += bodyParts.filter(Boolean).join(' ');

            // Model Details BEFORE the technical tail — higher token priority
            if (hasModel) {
                const activeProf = this.state.profiles.find(prof => prof.id === this.state.activeProfileId);
                if (activeProf) {
                    p += `\\n\\nModel Details: ${activeProf.descriptor}.`;
                }
            }

            // Technical tail last
            p += '\\n\\n' + tailParts.filter(Boolean).join(' ');

            return p;
        }

        return standardPrompt;
    }"""

if OLD_PARTS in ps:
    ps = ps.replace(OLD_PARTS, NEW_PARTS)
    print('FIX 5+6+7 ✓  Restructured standardParts → body+tail, fixed gender pronouns, moved Model Details before tail')
else:
    print('FIX 5+6+7 ✗  Could not find standardParts block')
    # Show what we're looking for
    idx = ps.find('const standardParts = [')
    print(f'  standardParts at: {idx}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('\nJS saved.')

# Bump JS version in index.html
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# ── VERIFICATION ──────────────────────────────────────────────────────────────
print('\n=== VERIFICATION ===')
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
checks = [
    # Fix 1: material not in {piece} replacement
    ('replace(/\\{piece\\}/g, piece)' in ps2,              'FIX 1: {piece} → piece only (no material prefix)'),
    # Fix 2: eye-level no longer has "perspective" direction word
    ('eye-level perspective' not in ps2,                   'FIX 2: eye-level camera no longer says "perspective"'),
    ('85mm f/1.4 portrait lens' in ps2,                    'FIX 2: eye-level has portrait lens description'),
    # Fix 3: pose pool is clean
    ('wrinkled skin texture visible' not in ps2,           'FIX 3: wrinkle phrase removed from body-intimate pose'),
    ('natural skin wrinkle' not in ps2,                    'FIX 3: skin wrinkle phrase removed from surface-lean pose'),
    # Fix 4: dead map removed
    ('skinDetailMap2' not in ps2,                          'FIX 4: skinDetailMap2 dead code removed'),
    # Fix 5+6+7: restructured flow
    ('const bodyParts = [' in ps2,                         'FIX 5: bodyParts array defined'),
    ('const tailParts = [' in ps2,                         'FIX 5: tailParts array defined'),
    ('genderNoun' in ps2,                                  'FIX 6: genderNoun variable (man/woman)'),
    ('genderHisHer' in ps2,                                'FIX 6: genderHisHer variable (his/her)'),
    ('keep ${genderHisHer} face' in ps2,                   'FIX 6: "her face" is now dynamic'),
    ('exact same ${genderNoun}' in ps2,                    'FIX 6: "same woman" is now dynamic'),
    ('Model Details BEFORE' in ps2,                        'FIX 7: Model Details moved before technical tail'),
    ('keep her face' not in ps2,                           'FIX 6: hardcoded "her" eliminated'),
    ('exact same woman' not in ps2,                        'FIX 6: hardcoded "woman" eliminated'),
]

all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')

print()
print('✅ ALL FIXES APPLIED' if all_ok else '⚠️  SOME FIXES NEED ATTENTION')
