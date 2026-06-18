import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# FIX 1 — Brand placement: randomized, category-aware, NOT cuff/wrist
# ════════════════════════════════════════════════════════════════════

# 1a. Add _getBrandPlacement method before _getRandomSkinTone
NEW_PLACEMENT_METHOD = """    _getBrandPlacement(category) {
        // Returns a placement description for the Elaris wordmark.
        // AVOID: cuff/sleeve near wrist (AI defaults there; also near ring/bracelet jewelry focus).
        // Placement is category-aware: don't put mark where jewelry draws the eye.
        const lapelPlacements = [
            'discreetly embroidered on the lapel, left side',
            'on the lapel edge, small and precise',
            'at the lapel near the collarbone',
        ];
        const collarPlacements = [
            'on the inner collar fold, just visible at the neckline',
            'at the collar stand, barely visible, like a luxury label',
            'on the shirt collar underside, as a refined interior brand detail',
        ];
        const pocketPlacements = [
            'on the breast pocket edge',
            'at the chest pocket, positioned precisely',
            'on the pocket facing, understated and refined',
        ];
        const backCollarPlacements = [
            'on the back of the collar as an interior label detail',
            'at the nape-facing collar fold, subtle brand signature',
        ];

        // For necklace/pendant: avoid chest area — use lapel or back collar
        if (category === 'necklace' || category === 'pendant') {
            const pool = [...lapelPlacements, ...backCollarPlacements];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        // For ring/bracelet: avoid wrist area — use lapel, collar, pocket
        if (category === 'ring' || category === 'bracelet' || category === 'bangle' || category === 'anklet') {
            const pool = [...lapelPlacements, ...collarPlacements, ...pocketPlacements];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        // For earring/brooch: any placement is fine
        const pool = [...lapelPlacements, ...collarPlacements, ...pocketPlacements];
        return pool[Math.floor(Math.random() * pool.length)];
    },

    """

TARGET_SKIN = "_getRandomSkinTone() {"
if TARGET_SKIN in ps:
    ps = ps.replace(TARGET_SKIN, NEW_PLACEMENT_METHOD + TARGET_SKIN)
    fixes.append('FIX 1a OK: _getBrandPlacement method added')
else:
    fixes.append('FIX 1a MISS: _getRandomSkinTone not found')

# 1b. Update the wordmark description to use _getBrandPlacement
OLD_WORDMARK = """            brandTouchDesc = 'a small "Elaris" embroidery detail on the garment — fine single-thread stitching at the cuff edge, collar fold, or chest area, no larger than 2–3 cm in real scale, thread color naturally chosen to contrast the fabric for quiet legibility, styled as an authentic luxury clothing label seamlessly integrated into the garment design, reads as a genuine brand signature not a graphic overlay';"""

NEW_WORDMARK  = """            const _wPlacement = this._getBrandPlacement(this.state.category);
            brandTouchDesc = `a small "Elaris" embroidery detail on the garment — fine single-thread stitching ${_wPlacement}, no larger than 2 cm in real scale, NOT on the sleeve or wrist area, thread color naturally contrasting the fabric for quiet legibility, styled as an authentic luxury clothing label integrated into the garment, reads as a genuine brand signature not a graphic overlay`;"""

if OLD_WORDMARK in ps:
    ps = ps.replace(OLD_WORDMARK, NEW_WORDMARK)
    fixes.append('FIX 1b OK: wordmark uses _getBrandPlacement with NOT-sleeve clause')
else:
    fixes.append('FIX 1b MISS: wordmark desc not matched')
    idx = ps.find('brandTouchDesc = \'a small "Elaris" embroidery')
    print(repr(ps[idx:idx+200]))


# ════════════════════════════════════════════════════════════════════
# FIX 2 — Outfit pool: jewelry-campaign-appropriate garments only
# Replace the entire femaleOutfits + maleOutfits in _getRandomOutfit
# ════════════════════════════════════════════════════════════════════

OLD_OUTFIT_POOLS = """        const femaleOutfits = [
            { t: 'wearing a soft camel ribbed turtleneck and tailored wide-leg trousers', p: 'warm' },
            { t: 'in a crisp white linen button-down shirt, collar open, sleeves casually rolled', p: 'cool' },
            { t: 'wearing a dusty-rose cashmere cardigan loosely draped over the shoulders', p: 'warm' },
            { t: 'in a structured terracotta blazer over a simple white fitted tee', p: 'warm' },
            { t: 'wearing a deep forest-green silk blouse, elegantly draped', p: 'cool' },
            { t: 'in a light grey oversized knit sweater with clean minimalist styling', p: 'cool' },
            { t: 'wearing a charcoal wrap coat, belt tied loosely at the waist', p: 'cool' },
            { t: 'in a cobalt blue fitted turtleneck, clean and editorial', p: 'cool' },
            { t: 'wearing a cream textured linen midi dress', p: 'neutral' },
            { t: 'in a burgundy velvet blazer with a white camisole underneath', p: 'warm' },
            { t: 'wearing a mustard yellow silk blouse, relaxed and editorial', p: 'warm' },
            { t: 'in a black tailored suit with subtle gold button detail', p: 'neutral' },
            { t: 'wearing a pale ivory wrap dress with a delicate abstract print', p: 'neutral' },
            { t: 'in a sage green knit co-ord set, relaxed contemporary', p: 'cool' },
            { t: 'wearing a striped navy and white Breton top with wide trousers', p: 'cool' },
            { t: 'in a chocolate brown suede jacket over a cream knit', p: 'warm' },
            { t: 'wearing an off-white flowing linen shirt-dress, effortless and airy', p: 'neutral' },
            { t: 'in a muted olive trench coat over dark essentials', p: 'neutral' },
            { t: 'wearing a rich copper-toned satin blouse with wide trousers', p: 'warm' },
            { t: 'in a soft ecru ribbed knit dress, minimal and tactile', p: 'neutral' },
        ];
        const maleOutfits = [
            { t: 'in a clean white Oxford shirt, collar open, sleeves rolled', p: 'neutral' },
            { t: 'wearing a slim-cut navy wool blazer over a white tee', p: 'cool' },
            { t: 'in a camel overcoat over a black turtleneck', p: 'warm' },
            { t: 'wearing a charcoal grey crewneck sweater with dark trousers', p: 'cool' },
            { t: 'in a light beige linen suit, Mediterranean editorial', p: 'warm' },
            { t: 'wearing a deep burgundy crew-neck over clean-cut dark denim', p: 'warm' },
            { t: 'in a structured slate blue blazer with no tie, relaxed formal', p: 'cool' },
            { t: 'wearing a soft olive field jacket over a simple white shirt', p: 'neutral' },
            { t: 'in a classic black turtleneck, timeless editorial', p: 'neutral' },
            { t: 'wearing a warm rust-colored knit pullover with clean trousers', p: 'warm' },
            { t: 'in an unstructured ecru linen suit, relaxed and modern', p: 'warm' },
            { t: 'wearing a dark indigo denim shirt with rolled sleeves', p: 'cool' },
            { t: 'in a stone-coloured chore coat over a slim grey turtleneck', p: 'neutral' },
            { t: 'wearing a soft brown suede jacket over a white crewneck', p: 'warm' },
            { t: 'in a rich terracotta linen shirt, sleeves half-rolled, effortlessly editorial', p: 'warm' },
            { t: 'wearing a pale sky-blue Oxford over clean straight-cut grey trousers', p: 'cool' },
        ];"""

NEW_OUTFIT_POOLS = """        // ── JEWELRY-CAMPAIGN OUTFITS ──────────────────────────────────────────
        // Inspired by Cartier, Tiffany, Van Cleef & Arpels, Bulgari campaign styling.
        // Key principle: shows neck/décolletage (necklaces), ears (earrings), wrists (bracelets).
        // Never oversized, chunky knitwear, or garments that obscure jewelry.
        const femaleOutfits = [
            // Deep necklines — best for necklace/pendant visibility
            { t: 'in a deep V-neck black silk dress, décolletage open, neckline clean and unobstructed', p: 'neutral' },
            { t: 'wearing an off-shoulder ivory satin top, collarbone and shoulders fully exposed', p: 'neutral' },
            { t: 'in a draped one-shoulder champagne silk dress, asymmetric editorial elegance', p: 'warm' },
            { t: 'wearing a strapless deep bordeaux velvet bodice, shoulders and chest open', p: 'warm' },
            { t: 'in a plunging-V cream satin blouse, softly draped, wide neckline for jewelry display', p: 'neutral' },
            // Open collar — versatile for most jewelry types
            { t: 'in an open-collar white silk button-down, first three buttons undone, crisp editorial', p: 'cool' },
            { t: 'wearing a stone-colored linen blazer open over a nude silk camisole', p: 'neutral' },
            { t: 'in a tailored deep navy blazer with nothing underneath, collar wide open', p: 'cool' },
            { t: 'wearing an open-collar copper-toned silk shirt, the neckline relaxed and visible', p: 'warm' },
            { t: 'in a terracotta linen open-collar shirt, effortlessly luxurious, neckline exposed', p: 'warm' },
            // Fine knits that reveal rather than hide
            { t: 'wearing a fitted deep-V camel cashmere sweater, fine-gauge, showing the collarbone', p: 'warm' },
            { t: 'in a fitted black fine-knit V-neck top, minimal and jewelry-focused', p: 'neutral' },
            { t: 'wearing a burgundy fine-knit scoop-neck sweater, clean and editorial', p: 'warm' },
            // Camisoles and silk tops
            { t: 'in a fine ivory silk camisole with delicate straps, minimal and luxurious', p: 'neutral' },
            { t: 'wearing a dusty-rose silk camisole, softly draped, shoulder and neck exposed', p: 'warm' },
            { t: 'in a midnight blue silk slip top, thin straps, décolletage prominently visible', p: 'cool' },
            // Sophisticated blazers
            { t: 'wearing a fitted white power blazer, single button, bare underneath, editorial chic', p: 'neutral' },
            { t: 'in a structured forest-green blazer, lapels wide open, minimal underneath', p: 'cool' },
            // Moroccan-influenced elegant options
            { t: 'in an embroidered ivory kaftan, open at the front neckline, elegant occasion wear', p: 'neutral' },
            { t: 'wearing a fitted champagne-gold Moroccan-inspired dress with subtle brocade, décolletage visible', p: 'warm' },
        ];
        const maleOutfits = [
            // Open collar / dress shirts — shows chain/necklace at chest
            { t: 'in a crisp white dress shirt with collar fully open, two buttons undone, sleeves 3/4 rolled', p: 'neutral' },
            { t: 'wearing a pale blue cotton dress shirt, collar open, slim cut, Mediterranean elegance', p: 'cool' },
            { t: 'in a black dress shirt with collar unbuttoned, showing a chain at the chest, editorial', p: 'neutral' },
            { t: 'wearing an ecru linen shirt open at the collar, fine fabric, relaxed luxury', p: 'warm' },
            // V-necks that show necklace
            { t: 'in a fine black merino V-neck, slim silhouette, neckline showing jewelry', p: 'neutral' },
            { t: 'wearing a camel V-neck cashmere pullover, fine gauge, collarbone visible', p: 'warm' },
            // Suits / blazers for formal jewelry shoots
            { t: 'in a classic black suit, white dress shirt with collar open, no tie, distinguished', p: 'neutral' },
            { t: 'wearing a tailored charcoal grey suit, shirt open at collar revealing a chain', p: 'cool' },
            { t: 'in a cream linen suit, shirt open two buttons, warm Mediterranean editorial', p: 'warm' },
            { t: 'wearing a navy wool blazer with an open-collar white shirt, sophisticated and clean', p: 'cool' },
            // Simple but jewelry-focused
            { t: 'in a fitted white V-neck tee, clean and minimal, jewelry as the centerpiece', p: 'neutral' },
            { t: 'wearing a deep bordeaux open-collar shirt, slim cut, 3/4 sleeves showing wrist', p: 'warm' },
        ];"""

if OLD_OUTFIT_POOLS in ps:
    ps = ps.replace(OLD_OUTFIT_POOLS, NEW_OUTFIT_POOLS)
    fixes.append('FIX 2 OK: Outfit pool replaced with jewelry-campaign garments')
else:
    fixes.append('FIX 2 MISS: outfit pools not matched')
    idx = ps.find("{ t: 'wearing a soft camel ribbed turtleneck")
    print(f'First outfit at {idx}: {repr(ps[idx:idx+80])}')


# ════════════════════════════════════════════════════════════════════
# FIX 3 — Prompt deduplication: separate environment from time-of-day
# Move time-of-day entries to a dedicated lighting sub-pool
# sceneVariant now returns ONLY environment (location)
# Time-of-day goes through _getLightingForScene only
# ════════════════════════════════════════════════════════════════════

OLD_HUMAN_ENVS = """        const humanEnvs = [
            // Time of day / light
            'early morning golden light streaming through tall windows',
            'dusk with warm amber light casting long shadows',
            'blue hour, soft twilight diffused light',
            'bright midday Mediterranean light, sun-bleached surfaces',
            'overcast soft-box sky, even diffused daylight',
            // Interiors
            'inside a warmly lit café, wooden tables and steam from cups',
            'a sleek modern hotel lobby, marble floors and moody lighting',
            'a quiet home library surrounded by stacked books and soft lamplight',
            'a rooftop terrace overlooking a city skyline at golden hour',
            'a bright Scandinavian-style loft with white walls and oak floors',
            'a Moroccan riad courtyard with zellige tiles and afternoon shadow patterns',
            'a sun-drenched terrace in the south of France, potted lavender nearby',
            'an elegant dressing room with warm vanity lights and a large mirror',
            // Exteriors
            'a cobblestone Parisian side street in the rain',
            'a Mediterranean harbour with boats and turquoise water in the background',
            'an open desert landscape at golden hour, warm dusty tones',
            'a lush garden with dappled sunlight through leaves',
            'a modern glass skyscraper reflection, urban geometry',
            // Lifestyle moments
            'inside a car, leather seat and dashboard visible',
            'at a marble kitchen counter preparing an espresso',
            'at an outdoor café table in a sunlit square',
            'in a bookshop between tall shelves, soft ambient reading light',
            'at a rooftop pool bar, blue water reflecting light',
            // ── Moroccan / North African cultural occasions ──────────────────
            'warm Ramadan evening atmosphere, lantern light and ornate zellige tile setting',
            'festive Eid morning, soft pastel light and celebration energy',
            'summer rooftop in Marrakech, warm night air and medina skyline lights',
            'cool Moroccan medina morning, intricate archways and carved plaster light play',
            'a traditional riad garden at dusk, fountain reflection and jasmine scent implied',
            'a Moroccan wedding celebration context, gold candlelight and embroidered textiles',
        ];"""

NEW_HUMAN_ENVS = """        // ── ENVIRONMENT-ONLY pool (pure locations — NO time-of-day language) ──────
        // Time-of-day is handled exclusively by _getLightingForScene() to prevent
        // duplicate lighting descriptions in the generated prompt.
        const humanEnvs = [
            // ── Elegant interiors ────────────────────────────────────────────
            'inside a warmly lit café, wooden tables and ceramic cups on the counter',
            'a sleek modern hotel lobby with marble floors and architectural lighting',
            'a quiet home library surrounded by stacked books and warm lamplight',
            'a rooftop terrace with city skyline as backdrop',
            'a bright Scandinavian-style loft with white walls and oak floors',
            'a Moroccan riad courtyard with intricate zellige tile patterns',
            'a sun-drenched south-of-France terrace with potted lavender nearby',
            'an elegant dressing room with a floor-length mirror and vanity lighting',
            'a luxurious boutique hotel suite with European interior design',
            'a Parisian apartment living room with tall windows and parquet floors',
            // ── Moroccan / North African settings ────────────────────────────
            'a traditional riad garden with a central fountain and lush green plants',
            'a Moroccan medina alleyway framed by carved archways and plaster walls',
            'a rooftop in Marrakech with the medina panorama visible in the background',
            'a Moroccan wedding venue with embroidered textiles and ornate lanterns',
            'a Moroccan hammam anteroom with zellige floors and arched doorways',
            // ── Aspirational exteriors ───────────────────────────────────────
            'a cobblestone street in a Mediterranean old town',
            'a Mediterranean harbour with terracotta buildings and blue water',
            'a lush private garden with dappled shade and stone pathways',
            'a modern rooftop pool area with clean geometric lines',
            'a sunlit outdoor terrace at a luxury resort',
            // ── Lifestyle settings ───────────────────────────────────────────
            'inside a luxury car interior, leather seat and clean dashboard visible',
            'at a polished marble kitchen counter with minimalist design',
            'at a quiet outdoor café table in a sunlit courtyard',
            'in a design bookshop between floor-to-ceiling shelves',
            'at a rooftop bar with panoramic views',
        ];"""

if OLD_HUMAN_ENVS in ps:
    ps = ps.replace(OLD_HUMAN_ENVS, NEW_HUMAN_ENVS)
    fixes.append('FIX 3a OK: humanEnvs — time-of-day removed, now pure location pool')
else:
    fixes.append('FIX 3a MISS: humanEnvs pool not matched')

# 3b. When lightingCoherent was overridden (different from selectedLighting),
#     skip the sceneVariant in bodyParts to avoid two lighting sentences.
#     Instead, only inject sceneVariant when it's a LOCATION (not light override).
# The check: if lightingCoherent !== lighting (override happened), don't add sceneVariant.
# We add a flag for this.

OLD_LIGHTING_LINE = """        const sceneVariant = this._getSceneVariant(archetype.id);
        // Coherent lighting: if scene has time-of-day language, align lighting desc
        const lightingCoherent = this._getLightingForScene(sceneVariant, lighting);"""

NEW_LIGHTING_LINE  = """        const sceneVariant = this._getSceneVariant(archetype.id);
        // Coherent lighting: if scene has time-of-day language, align lighting desc
        // Since humanEnvs is now pure-location, lighting override only happens when
        // the selected lighting option itself contains time-of-day keywords.
        const lightingCoherent = this._getLightingForScene(sceneVariant, lighting);
        // Only inject sceneVariant as a bodyPart if it's a location (not a time-of-day variant)
        // This prevents two lighting descriptions in the same prompt.
        const _sceneIsLight = /morning|dusk|twilight|blue hour|candlelit|overcast|midday|golden light|lantern light/i.test(sceneVariant);
        const sceneVariantPart = _sceneIsLight ? '' : sceneVariant;"""

if OLD_LIGHTING_LINE in ps:
    ps = ps.replace(OLD_LIGHTING_LINE, NEW_LIGHTING_LINE)
    fixes.append('FIX 3b OK: sceneVariantPart flag added — pure-location filter')
else:
    fixes.append('FIX 3b MISS: lighting line not found')

# 3c. Use sceneVariantPart instead of sceneVariant in bodyParts
OLD_BODYPART_SCENE = "            subject + '.', sceneVariant + '.',"
NEW_BODYPART_SCENE  = "            subject + '.', sceneVariantPart ? sceneVariantPart + '.' : '',"

if OLD_BODYPART_SCENE in ps:
    ps = ps.replace(OLD_BODYPART_SCENE, NEW_BODYPART_SCENE)
    fixes.append('FIX 3c OK: bodyParts uses sceneVariantPart (no duplicate lighting)')
else:
    fixes.append('FIX 3c MISS: bodyPart subject line not found')

# 3d. Fix ordering: move STYLING before SCENE in bodyParts
# Current order: scene → camera → mood+lighting → skin → realism → styling → brand
# Better: skin → styling → scene → camera → mood+lighting → realism → brand
# Actually, looking at the example prompt, the main issue is:
# - archetype.scene often describes composition/art-direction (fine to keep)
# - styling (outfit) appears after realism — should be closer to subject
# Let's move stylingDesc BEFORE surfaceDesc/paletteDesc (currently it's after)
# and add a clear "no background conflict" note

# Find and reorder: surfaceDesc, paletteDesc, stylingDesc
OLD_SURFACE_PALETTE_STYLE = """            // SURFACE / PALETTE / STYLING
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            stylingDesc ? stylingDesc + '.' : '',"""

NEW_SURFACE_PALETTE_STYLE  = """            // STYLING (outfit) — placed before realism; clearly defines garment
            stylingDesc ? stylingDesc + '.' : '',
            // SURFACE / PALETTE — product/environment descriptors
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',"""

if OLD_SURFACE_PALETTE_STYLE in ps:
    ps = ps.replace(OLD_SURFACE_PALETTE_STYLE, NEW_SURFACE_PALETTE_STYLE)
    fixes.append('FIX 3d OK: Styling moved before surface/palette in bodyParts order')
else:
    fixes.append('FIX 3d MISS: surface/palette/styling block not found')


# ════════════════════════════════════════════════════════════════════
# Save + version bump
# ════════════════════════════════════════════════════════════════════
with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

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
    ('_getBrandPlacement' in ps2,                     'Brand placement method'),
    ('NOT on the sleeve or wrist area' in ps2,         'Sleeve exclusion in wordmark'),
    ('_wPlacement' in ps2,                            'Dynamic placement used in wordmark'),
    ('deep V-neck black silk dress' in ps2,           'V-neck silk dress in female pool'),
    ('off-shoulder ivory satin' in ps2,               'Off-shoulder top in female pool'),
    ('grey oversized knit' not in ps2,                'Oversized knit REMOVED'),
    ('décolletage' in ps2,                            'Décolletage in outfit descriptions'),
    ('ENVIRONMENT-ONLY pool' in ps2,                  'Clean env pool comment'),
    ('Time-of-day is handled exclusively' in ps2,     'Time-of-day dedup note'),
    ('sceneVariantPart' in ps2,                       'sceneVariantPart filter'),
    ('sceneVariantPart ? sceneVariantPart' in ps2,    'sceneVariantPart in bodyParts'),
    ('STYLING (outfit)' in ps2,                       'Styling reordered before surface'),
    ('Moroccan riad courtyard with intricate' in ps2, 'New riad entry in env pool'),
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
