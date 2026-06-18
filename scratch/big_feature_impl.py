# Implementation Plan — Big Feature Set
# 1. Smart angle ordering by category (+ visual indicator)
# 2. 6 new Moroccan-relatable model profiles (3F + 3M)
# 3. Elaris Brand Touch (logomark / wordmark on model clothing)
# 4. Category-specific negative prompts + placement rules (necklace-on-back fix, scale fix)

import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print(f'File: {len(ps)} chars')
fixes = []

# ══════════════════════════════════════════════════════════════════════════════
# PART 1 — State: add brandTouch
# ══════════════════════════════════════════════════════════════════════════════
OLD_STATE_END = "        facialExpression: 'none',\n    },"
NEW_STATE_END  = "        facialExpression: 'none',\n        brandTouch: 'none',       // 'none' | 'logomark' | 'wordmark'\n    },"
if OLD_STATE_END in ps:
    ps = ps.replace(OLD_STATE_END, NEW_STATE_END)
    fixes.append('✓ Added brandTouch state')
else: fixes.append('✗ State end not found')

# ══════════════════════════════════════════════════════════════════════════════
# PART 2 — 6 new model profiles
# ══════════════════════════════════════════════════════════════════════════════
OLD_BUILT_IN_END = """            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 27 years old, warm caramel skin tone, elegant refined features, almond-shaped dark eyes, clean-shaven, defined cheekbones, slim composed posture, sophisticated and understated expression',
                referenceImage: null, color: '#52a67c'
            },
        ];"""

NEW_BUILT_IN_END = """            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 27 years old, warm caramel skin tone, elegant refined features, almond-shaped dark eyes, clean-shaven, defined cheekbones, slim composed posture, sophisticated and understated expression',
                referenceImage: null, color: '#52a67c'
            },
            // ── Additional female profiles (Moroccan audience) ──────────────
            {
                id: 'nour', name: 'Nour', gender: 'female',
                descriptor: 'Woman, 24 years old, light olive Amazigh skin tone, warm green-brown almond eyes, delicate refined features, straight dark hair with subtle natural highlights, slim graceful build, fresh natural Moroccan radiance, gentle confident expression',
                referenceImage: null, color: '#d4a574'
            },
            {
                id: 'malak', name: 'Malak', gender: 'female',
                descriptor: 'Woman, 32 years old, warm golden-tan Moroccan skin tone, full expressive lips, deep dark soulful eyes, voluminous wavy dark brown hair past shoulders, defined cheekbones, mature confident Mediterranean beauty, powerful yet feminine presence',
                referenceImage: null, color: '#c17f4a'
            },
            {
                id: 'rania', name: 'Rania', gender: 'female',
                descriptor: 'Woman, 27 years old, deep olive Moroccan skin tone, strong bone structure, high prominent cheekbones, kohled dark expressive eyes, long straight black hair, tall elegant build, powerful editorial presence, striking North African features',
                referenceImage: null, color: '#8b6e4e'
            },
            // ── Additional male profiles (Moroccan audience) ──────────────
            {
                id: 'younes', name: 'Younes', gender: 'male',
                descriptor: 'Man, 28 years old, warm tawny Moroccan skin tone, sharp defined jawline, warm hazel eyes, dark medium-length styled hair, slim athletic build, modern confident Moroccan professional, relaxed editorial energy, lightly stubbled jaw',
                referenceImage: null, color: '#7ba7c9'
            },
            {
                id: 'mehdi', name: 'Mehdi', gender: 'male',
                descriptor: 'Man, 36 years old, deep bronze Moroccan skin tone, full dense dark beard, strong angular chiseled features, dark intense eyes, broad powerful build, commanding executive presence, sophisticated masculine gravitas',
                referenceImage: null, color: '#4a7c59'
            },
            {
                id: 'karim', name: 'Karim', gender: 'male',
                descriptor: 'Man, 23 years old, light olive Maghrebi skin tone, clean-shaven sharp angular face, youthful defined features, dark styled hair, lean energetic build, bright confident eyes, fresh contemporary Moroccan editorial energy',
                referenceImage: null, color: '#9b8ea6'
            },
        ];"""

if OLD_BUILT_IN_END in ps:
    ps = ps.replace(OLD_BUILT_IN_END, NEW_BUILT_IN_END)
    fixes.append('✓ Added 6 new Moroccan model profiles (Nour, Malak, Rania, Younes, Mehdi, Karim)')
else: fixes.append('✗ BUILT_IN end not found')

# ══════════════════════════════════════════════════════════════════════════════
# PART 3 — Smart angle ordering method + updated render
# ══════════════════════════════════════════════════════════════════════════════
# Add _getAnglesForCategory after the angles getter
OLD_ANGLES_END = """            { id: 'from-behind', label: 'From Behind (Nape)' },
        ];
    },"""
NEW_ANGLES_END  = """            { id: 'from-behind', label: 'From Behind (Nape)' },
        ];
    },

    // Returns angles sorted best-to-least for the selected jewelry category
    _getAnglesForCategory(category) {
        const rankings = {
            // Ring: close detail at an angle or macro to show band + stone
            'ring':     ['macro', '45-degree', 'glance-down', 'eye-level', 'low-angle', 'over-shoulder', 'overhead', 'dutch', 'side-profile', 'from-behind'],
            // Necklace: front/chest visible, side profile also shows it well
            'necklace': ['eye-level', 'glance-down', '45-degree', 'over-shoulder', 'side-profile', 'low-angle', 'macro', 'from-behind', 'overhead', 'dutch'],
            // Bracelet: overhead or macro shows it clearly on the wrist
            'bracelet': ['macro', 'overhead', '45-degree', 'glance-down', 'eye-level', 'low-angle', 'over-shoulder', 'side-profile', 'dutch', 'from-behind'],
            // Earring: side profile is ideal, then 3/4 angle
            'earring':  ['side-profile', '45-degree', 'glance-down', 'eye-level', 'over-shoulder', 'macro', 'low-angle', 'from-behind', 'overhead', 'dutch'],
            // Pendant: front chest area, glance down flatters the pendant drop
            'pendant':  ['eye-level', 'glance-down', '45-degree', 'macro', 'over-shoulder', 'low-angle', 'side-profile', 'overhead', 'dutch', 'from-behind'],
            // Brooch: 3/4 angle shows lapel brooch clearly
            'brooch':   ['45-degree', 'macro', 'eye-level', 'glance-down', 'over-shoulder', 'side-profile', 'overhead', 'low-angle', 'dutch', 'from-behind'],
            // Anklet: overhead or low-angle looking down at ankle
            'anklet':   ['overhead', 'glance-down', 'macro', 'low-angle', '45-degree', 'eye-level', 'side-profile', 'over-shoulder', 'dutch', 'from-behind'],
            // Bangle: macro or overhead shows the band around the wrist well
            'bangle':   ['macro', 'overhead', '45-degree', 'eye-level', 'low-angle', 'glance-down', 'over-shoulder', 'side-profile', 'dutch', 'from-behind'],
        };
        const order = rankings[category] || rankings['ring'];
        return [...this.angles].sort((a, b) => {
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    },"""

if OLD_ANGLES_END in ps:
    ps = ps.replace(OLD_ANGLES_END, NEW_ANGLES_END)
    fixes.append('✓ Added _getAnglesForCategory()')
else: fixes.append('✗ angles getter end not found')

# Update the angle chips render to use smart ordering + visual indicator
OLD_ANGLE_CHIPS = """${this.angles.map(a => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}">${a.label}</button>`).join('')}"""
NEW_ANGLE_CHIPS  = """${this._getAnglesForCategory(this.state.category).map((a, i) => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}" title="${i < 3 ? 'Recommended for ' + (this.state.category || 'ring') : a.label}" style="${i === 0 ? 'border-color:var(--accent);' : i < 3 ? 'border-color:var(--accent);opacity:0.85;' : ''}">${i === 0 ? '⭐ ' : ''}${a.label}</button>`).join('')}"""

if OLD_ANGLE_CHIPS in ps:
    ps = ps.replace(OLD_ANGLE_CHIPS, NEW_ANGLE_CHIPS)
    fixes.append('✓ Angle chips now show smart ordering with ⭐ best pick')
else: fixes.append('✗ angle chips render not found')

# ══════════════════════════════════════════════════════════════════════════════
# PART 4 — Brand Touch UI (insert after hallmark toggle section)
# ══════════════════════════════════════════════════════════════════════════════
# Find the hallmark section in the render template
idx_hallmark = ps.find('ps-hallmark-toggle')
print(f'hallmark toggle at: {idx_hallmark}')

# Find the section end (next form-group or </div> at same level)
# Let's search for a distinctive string after hallmark section
hallmark_section_end = """                        </div>
                        <!-- Model & Human Elements -->"""
brand_ui = """                        </div>
                        <!-- Brand Identity -->
                        <div class="form-group" style="padding-top:12px;border-top:1px solid var(--border)">
                            <label class="form-label" style="margin-bottom:4px">Brand Identity</label>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-bottom:8px">Add Elaris signature to the scene — on model clothing or lapel.</p>
                            <div class="ps-chip-group" id="ps-brand-touch">
                                <button class="ps-chip ${this.state.brandTouch === 'none' ? 'active' : ''}" data-val="none">None</button>
                                <button class="ps-chip ${this.state.brandTouch === 'logomark' ? 'active' : ''}" data-val="logomark" title="Four-pointed star badge on lapel">⭐ Logomark</button>
                                <button class="ps-chip ${this.state.brandTouch === 'wordmark' ? 'active' : ''}" data-val="wordmark" title="ELARIS wordmark on clothing">Wordmark</button>
                            </div>
                        </div>
                        <!-- Model & Human Elements -->"""

if hallmark_section_end in ps:
    ps = ps.replace(hallmark_section_end, brand_ui)
    fixes.append('✓ Added Brand Identity UI section')
else:
    # Try different pattern
    fixes.append('✗ Hallmark section end not found — need manual check')
    idx = ps.find('Model &amp; Human Elements')
    if idx < 0: idx = ps.find('Model & Human Elements')
    print(f'  Model & Human Elements at: {idx}')
    if idx > 0:
        print(repr(ps[max(0,idx-300):idx+50]))

# ══════════════════════════════════════════════════════════════════════════════
# PART 5 — Brand Touch binding
# ══════════════════════════════════════════════════════════════════════════════
OLD_BRAND_BIND_ANCHOR = """        const newProfBtn = q('#ps-new-profile');"""
NEW_BRAND_BIND_ANCHOR  = """        // Brand Touch chips
        this._bindChipGroup('ps-brand-touch', 'brandTouch');

        const newProfBtn = q('#ps-new-profile');"""

if OLD_BRAND_BIND_ANCHOR in ps:
    ps = ps.replace(OLD_BRAND_BIND_ANCHOR, NEW_BRAND_BIND_ANCHOR)
    fixes.append('✓ Brand Touch chip binding added')
else: fixes.append('✗ Brand binding anchor not found')

# ══════════════════════════════════════════════════════════════════════════════
# PART 6 — Add category-specific placement + brand touch to _buildPrompt
# ══════════════════════════════════════════════════════════════════════════════

# 6a: Add _buildPlacementInstruction and _buildCategoryNegatives as methods
# Insert before _buildPrompt
OLD_BUILD_PROMPT_START = "    _buildPrompt() {"
NEW_BUILD_PROMPT_START = """    // ── Category-specific jewelry placement instructions ──────────────────────
    // These are injected early in bodyParts to prevent misplacement (necklace on back, etc.)
    _buildPlacementInstruction(category) {
        const rules = {
            'necklace': 'PLACEMENT: necklace must be worn at the FRONT of the neck, chain visible at the front of the chest, pendant resting at chest/décolletage, fully visible from the front — NEVER placed on the back or shoulders',
            'earring':  'PLACEMENT: earrings must be worn in earlobes, one on each ear, visible from the front or side at anatomically correct scale proportional to face size',
            'ring':     'PLACEMENT: ring must be fitted on a finger at correct anatomical size, ring width proportional to finger width, never floating or oversized',
            'bracelet': 'PLACEMENT: bracelet worn on the wrist at correct proportional scale, sized for wrist diameter',
            'bangle':   'PLACEMENT: bangle worn on the wrist, correctly sized for wrist, not oversized',
            'anklet':   'PLACEMENT: anklet worn around the ankle, slender and proportional to ankle width',
            'pendant':  'PLACEMENT: pendant necklace worn at the front of the chest, pendant hanging at correct scale relative to chest area, never on back',
            'brooch':   'PLACEMENT: brooch attached to lapel or upper chest area of clothing, visible from front at correct scale',
        };
        return rules[category] || '';
    },

    // ── Category-specific negative prompts ──────────────────────
    // Combines anatomy negatives (human archetypes) with category-specific
    // misplacement and scale negatives derived from real failure patterns.
    _buildCategoryNegatives(category, isHuman) {
        const anatomy = isHuman
            ? 'three arms, extra arms, extra limbs, malformed anatomy, extra fingers, six fingers, mutated limbs, fused fingers, asymmetrical geometry, photorealistic skin texture'
            : '(hand, fingers, skin, arm, human), distorted shape, asymmetrical geometry';

        const scale = 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to scale, miniaturized jewelry';

        const placement = {
            'necklace': 'necklace on back, necklace hanging behind model, pendant on back, necklace visible only from behind, necklace on shoulder, chain around back',
            'earring':  'earring too large, earring disproportionate to face, missing earring, earring on wrong side only',
            'ring':     'ring too large for finger, ring not on finger, floating ring, ring covering entire hand',
            'bracelet': 'bracelet not on wrist, bracelet floating off body, bracelet on wrong limb',
            'bangle':   'bangle not on wrist, floating bangle, bangle on wrong body part',
            'anklet':   'anklet on wrist, anklet not on ankle, anklet floating off body',
            'pendant':  'pendant on back, pendant not visible from front, pendant hanging behind neck',
            'brooch':   'brooch floating off clothing, brooch not on lapel',
        };

        const placementNeg = placement[category] || '';
        const parts = [anatomy, scale];
        if (placementNeg) parts.push(placementNeg);
        parts.push('AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, chromatic aberration, plastic texture, 3d render');

        return `Negative prompt: ${parts.join(', ')}.`;
    },

    _buildPrompt() {"""

if OLD_BUILD_PROMPT_START in ps:
    ps = ps.replace(OLD_BUILD_PROMPT_START, NEW_BUILD_PROMPT_START, 1)
    fixes.append('✓ Added _buildPlacementInstruction() and _buildCategoryNegatives()')
else: fixes.append('✗ _buildPrompt() start not found')

# 6b: Use _buildCategoryNegatives in _buildPrompt (replace the existing negativePrompt block)
OLD_NEG_BLOCK = """        // ── FIX #3: Context-aware negative prompts ──────────────────────
        let negativePrompt;
        if (isHuman) {
            // Human archetypes: anatomy + technical negatives
            negativePrompt = 'Negative prompt: three arms, extra arms, extra limbs, malformed anatomy, extra fingers, six fingers, mutated limbs, fused fingers, asymmetrical geometry, AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, chromatic aberration, plastic texture, 3d render.';
        } else {
            // Product-only archetypes: technical + product-focused negatives (NO anatomy terms)
            negativePrompt = 'Negative prompt: (hand, fingers, skin, arm, human), chromatic aberration, overexposed highlights, plastic texture, distorted shape, asymmetrical geometry, AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, noise grain, 3d render.';
        }"""

NEW_NEG_BLOCK = """        // ── Category-aware negative prompts (placement + scale + anatomy) ──────────────
        const category = this.state.category || 'ring';
        const negativePrompt = this._buildCategoryNegatives(category, isHuman);
        const placementRule  = this._buildPlacementInstruction(category);"""

if OLD_NEG_BLOCK in ps:
    ps = ps.replace(OLD_NEG_BLOCK, NEW_NEG_BLOCK)
    fixes.append('✓ Replaced static negativePrompt with _buildCategoryNegatives()')
else: fixes.append('✗ old negativePrompt block not found')

# 6c: Inject placementRule and brandTouchDesc into bodyParts
OLD_BODY_PARTS_START = """        const bodyParts = [
            // SUBJECT — jewelry piece at the center, material injected cleanly on next line
            subject + '.',
            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,"""

NEW_BODY_PARTS_START = """        // ── Brand Touch (Elaris identity on model clothing) ──────────────────────
        let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            brandTouchDesc = 'model wearing a small elegant silver four-pointed star pin brooch on the lapel or collar — the ELARIS brand logomark, subtly present as a luxury styling detail';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            brandTouchDesc = 'subtle \"ELARIS\" wordmark delicately embroidered in fine silver thread on the model\\'s lapel or collar, brand identity quietly present in the scene';
        }

        const bodyParts = [
            // SUBJECT — jewelry piece at the center, material injected cleanly on next line
            subject + '.',
            // PLACEMENT RULE — early placement prevents AI misplacing the jewelry
            placementRule ? `${placementRule}.` : '',
            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,"""

if OLD_BODY_PARTS_START in ps:
    ps = ps.replace(OLD_BODY_PARTS_START, NEW_BODY_PARTS_START)
    fixes.append('✓ Added brandTouchDesc + placementRule to bodyParts')
else: fixes.append('✗ bodyParts start not found')

# 6d: Add brandTouchDesc to the bodyParts array (after hallmarkDesc line)
OLD_HALLMARK_IN_BODY = """            // BRAND HALLMARK (optional)
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
        ];"""

NEW_HALLMARK_IN_BODY = """            // BRAND HALLMARK (optional — jewelry engraving)
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
            // BRAND TOUCH — Elaris identity on model clothing (logomark / wordmark)
            brandTouchDesc ? brandTouchDesc + '.' : '',
        ];"""

if OLD_HALLMARK_IN_BODY in ps:
    ps = ps.replace(OLD_HALLMARK_IN_BODY, NEW_HALLMARK_IN_BODY)
    fixes.append('✓ brandTouchDesc injected into bodyParts array')
else: fixes.append('✗ hallmarkDesc line in bodyParts not found')

# Fix category variable reference in _buildCategoryNegatives calls:
# The old code used `this.state.category` in some places and `cat` in others.
# Now `category` is a const defined near the negativePrompt block.
# We already have `const category = this.state.category || 'ring'` in the new NEG_BLOCK.
# But `cat` was previously used in `_buildPrompt` for material etc. Let's check:
idx_cat_in_build = ps.find("const cat = this.state.category")
print(f'cat in _buildPrompt: {idx_cat_in_build}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Version bump
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

print('\n=== FIXES APPLIED ===')
for f in fixes: print(f'  {f}')

# Verification
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== SPOT CHECKS ===')
checks = [
    ('brandTouch' in ps2,                              'brandTouch state'),
    ("id: 'nour'" in ps2,                              'Nour profile'),
    ("id: 'malak'" in ps2,                             'Malak profile'),
    ("id: 'rania'" in ps2,                             'Rania profile'),
    ("id: 'younes'" in ps2,                            'Younes profile'),
    ("id: 'mehdi'" in ps2,                             'Mehdi profile'),
    ("id: 'karim'" in ps2,                             'Karim profile'),
    ('_getAnglesForCategory' in ps2,                   'Smart angle ordering method'),
    ('rankings[category]' in ps2,                      'Rankings map in method'),
    ('_buildPlacementInstruction' in ps2,              '_buildPlacementInstruction method'),
    ('_buildCategoryNegatives' in ps2,                 '_buildCategoryNegatives method'),
    ('necklace on back' in ps2,                        'Necklace-on-back negative'),
    ('disproportionate to body' in ps2,                'Scale negative'),
    ('PLACEMENT:' in ps2,                              'Placement rule prefix'),
    ('ps-brand-touch' in ps2,                          'Brand Touch UI chips'),
    ('four-pointed star pin brooch' in ps2,            'Logomark description'),
    ('ELARIS.*wordmark' in ps2 or 'wordmark' in ps2,   'Wordmark description'),
    ('brandTouchDesc' in ps2,                          'brandTouchDesc injected'),
]
all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  CHECK ISSUES')
