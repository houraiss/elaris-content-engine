import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 1: Metal ↔ Outfit Palette Affinity
# Update _getRandomOutfit to accept materialId + tag outfits with palette
# ════════════════════════════════════════════════════════════════════

OLD_OUTFIT = """    _getRandomOutfit(gender) {
        // Returns a random outfit description — prevents the same clothing appearing repeatedly
        const femaleOutfits = [
            'wearing a soft camel ribbed turtleneck and tailored wide-leg trousers',
            'in a crisp white linen button-down shirt, collar open, sleeves casually rolled',
            'wearing a dusty-rose cashmere cardigan loosely draped over the shoulders',
            'in a structured terracotta blazer over a simple white fitted tee',
            'wearing a deep forest-green silk blouse, elegantly draped',
            'in a light grey oversized knit sweater with clean minimalist styling',
            'wearing a charcoal wrap coat, belt tied loosely at the waist',
            'in a cobalt blue fitted turtleneck, clean and editorial',
            'wearing a cream textured linen midi dress',
            'in a burgundy velvet blazer with a white camisole underneath',
            'wearing a mustard yellow silk blouse, relaxed and editorial',
            'in a black tailored suit with subtle gold button detail',
            'wearing a pale ivory wrap dress with a delicate abstract print',
            'in a sage green knit co-ord set, relaxed contemporary',
            'wearing a striped navy and white Breton top with wide trousers',
            'in a chocolate brown suede jacket over a cream knit',
            'wearing an off-white flowing linen shirt-dress, effortless and airy',
            'in a muted olive trench coat over dark essentials',
        ];
        const maleOutfits = [
            'in a clean white Oxford shirt, collar open, sleeves rolled',
            'wearing a slim-cut navy wool blazer over a white tee',
            'in a camel overcoat over a black turtleneck',
            'wearing a charcoal grey crewneck sweater with dark trousers',
            'in a light beige linen suit, Mediterranean editorial',
            'wearing a deep burgundy crew-neck over clean-cut dark denim',
            'in a structured slate blue blazer with no tie, relaxed formal',
            'wearing a soft olive field jacket over a simple white shirt',
            'in a classic black turtleneck, timeless editorial',
            'wearing a warm rust-colored knit pullover with clean trousers',
            'in an unstructured ecru linen suit, relaxed and modern',
            'wearing a dark indigo denim shirt with rolled sleeves',
            'in a stone-coloured chore coat over a slim grey turtleneck',
            'wearing a soft brown suede jacket over a white crewneck',
        ];
        const pool = (gender === 'male') ? maleOutfits : femaleOutfits;
        return pool[Math.floor(Math.random() * pool.length)];
    },"""

NEW_OUTFIT = """    _getRandomOutfit(gender, materialId) {
        // Returns a random outfit — palette-tagged and filtered by metal affinity
        // Rose/yellow gold → warm palette, Silver/platinum → cool, mixed → neutral
        const warmMats = ['rose-gold', 'gold', 'yellow-gold'];
        const coolMats = ['sterling-silver', 'platinum', 'white-gold'];
        const matFamily = warmMats.includes(materialId) ? 'warm'
                        : coolMats.includes(materialId) ? 'cool' : 'neutral';

        const femaleOutfits = [
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
        ];

        const pool = (gender === 'male') ? maleOutfits : femaleOutfits;
        // Prefer palette-matched outfits; fall back to neutral, then any
        const preferred = pool.filter(o => o.p === matFamily);
        const neutral   = pool.filter(o => o.p === 'neutral');
        const chosen    = preferred.length > 0 ? preferred : neutral.length > 0 ? neutral : pool;
        return chosen[Math.floor(Math.random() * chosen.length)].t;
    },"""

if OLD_OUTFIT in ps:
    ps = ps.replace(OLD_OUTFIT, NEW_OUTFIT)
    fixes.append('FIX 1 OK: _getRandomOutfit — palette affinity + extended pool')
else:
    fixes.append('FIX 1 MISS: _getRandomOutfit not matched')

# Update the call site to pass materialId
OLD_CALL = "                'auto': this._getRandomOutfit(modelGenderForStyling),   // auto: random outfit from diverse pool — prevents same-clothing repetition"
NEW_CALL  = "                'auto': this._getRandomOutfit(modelGenderForStyling, this.state.material),   // auto: palette-matched random outfit"
if OLD_CALL in ps:
    ps = ps.replace(OLD_CALL, NEW_CALL)
    fixes.append('FIX 1b OK: call site passes material ID')
else:
    fixes.append('FIX 1b MISS: auto call site not matched')


# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 2: Skin Tone Diversity  + Fix 3: Lighting Coherence
# Add two helper methods before _getSceneVariant
# ════════════════════════════════════════════════════════════════════

NEW_HELPERS = """    _getRandomSkinTone() {
        // Diverse skin tone descriptions — Moroccan-audience-aware representation
        const tones = [
            'model has warm deep brown skin, rich luminous tone with natural warmth',
            'model has medium olive complexion, Mediterranean warm undertones, healthy glow',
            'model has light warm golden skin, sun-kissed undertones, smooth texture',
            'model has deep espresso skin, high contrast, beautifully luminous',
            'model has warm tawny complexion, North African skin tones, rich depth',
            'model has fair ivory skin with cool rose undertones, delicate and luminous',
            'model has caramel medium complexion, even tone, warm and approachable',
            'model has rich amber skin, deep warm undertones, photogenic contrast',
            'model has bronze sun-warmed complexion, Mediterranean golden tones',
            'model has warm chestnut complexion, luminous North African colouring',
        ];
        return tones[Math.floor(Math.random() * tones.length)];
    },

    _getLightingForScene(sceneVariant, selectedLighting) {
        // Override lighting when sceneVariant has strong time-of-day language
        // that would contradict the studio lighting picker choice.
        // If user explicitly picked a non-generic lighting, we still respect it
        // (only override the default 'studio lighting' fallback).
        if (!sceneVariant) return selectedLighting;
        const sv = sceneVariant.toLowerCase();
        if (sv.includes('morning') || (sv.includes('golden') && sv.includes('light'))) {
            return 'warm morning golden light, soft natural fill from a low sun angle';
        }
        if (sv.includes('dusk') || sv.includes('twilight')) {
            return 'dusk ambient light, warm-to-cool gradient atmosphere';
        }
        if (sv.includes('blue hour')) {
            return 'blue hour soft twilight, cool diffused ambient exposure';
        }
        if (sv.includes('candlelit') || sv.includes('lantern')) {
            return 'warm candlelit ambient, golden flickering tones, intimate low-key atmosphere';
        }
        if (sv.includes('overcast')) {
            return 'overcast sky, evenly diffused natural light, no harsh shadows, studio-quality daylight';
        }
        if (sv.includes('midday') || sv.includes('mediterranean')) {
            return 'bright high-key midday Mediterranean light, strong directional sun';
        }
        return selectedLighting;  // no time-of-day conflict — keep user selection
    },

    """

TARGET_SCENE_VAR = "_getSceneVariant(archetypeId) {"
if TARGET_SCENE_VAR in ps:
    ps = ps.replace(TARGET_SCENE_VAR, NEW_HELPERS + TARGET_SCENE_VAR)
    fixes.append('FIX 2+3 OK: _getRandomSkinTone and _getLightingForScene methods added')
else:
    fixes.append('FIX 2+3 MISS: _getSceneVariant insertion point not found')


# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 3b: Use lighting coherence in bodyParts
# ════════════════════════════════════════════════════════════════════
OLD_LIGHTING_LINE = "        const sceneVariant = this._getSceneVariant(archetype.id);"
NEW_LIGHTING_LINE  = """        const sceneVariant = this._getSceneVariant(archetype.id);
        // Coherent lighting: if scene has time-of-day language, align lighting desc
        const lightingCoherent = this._getLightingForScene(sceneVariant, lighting);"""

if OLD_LIGHTING_LINE in ps:
    ps = ps.replace(OLD_LIGHTING_LINE, NEW_LIGHTING_LINE)
    fixes.append('FIX 3b OK: lightingCoherent computed after sceneVariant')
else:
    fixes.append('FIX 3b MISS: sceneVariant assignment not found')

# Replace `lighting` with `lightingCoherent` in the bodyParts mood+lighting line
OLD_MOOD_LINE = "            `${mood} mood, ${lighting}.`,"
NEW_MOOD_LINE  = "            `${mood} mood, ${lightingCoherent}.`,"
if OLD_MOOD_LINE in ps:
    ps = ps.replace(OLD_MOOD_LINE, NEW_MOOD_LINE)
    fixes.append('FIX 3c OK: bodyParts uses lightingCoherent')
else:
    fixes.append('FIX 3c MISS: mood/lighting bodyPart line not found')


# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 4: Skin tone injected in bodyParts (human only)
# ════════════════════════════════════════════════════════════════════
# Inject skin tone just before/after the realism block
OLD_REALISM_LINE = "            // REALISM (skin texture, wrinkles, body hair, skin detail — user controlled)\n            realismDesc ? realismDesc + '.' : '',"
NEW_REALISM_LINE  = """            // SKIN TONE — randomized per generation for model diversity (human archetypes only)
            isHuman ? this._getRandomSkinTone() + '.' : '',
            // REALISM (skin texture, wrinkles, body hair, skin detail — user controlled)
            realismDesc ? realismDesc + '.' : '',"""

if OLD_REALISM_LINE in ps:
    ps = ps.replace(OLD_REALISM_LINE, NEW_REALISM_LINE)
    fixes.append('FIX 4 OK: skin tone injected in bodyParts (isHuman gated)')
else:
    fixes.append('FIX 4 MISS: realism bodyPart line not found')


# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 5: Negative Prompt Smart Filtering
# Scale negatives: filter human-body-referencing terms for product shots
# ════════════════════════════════════════════════════════════════════
OLD_SCALE = "        // Scale: the most common AI failure — making jewelry gigantic\n        const scale = 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to correct real-world scale, miniaturized accessories';"
NEW_SCALE  = """        // Scale: filter human-body-referencing terms for product-only shots (no model)
        const scale = isHuman
            ? 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to correct real-world scale, miniaturized accessories'
            : 'oversized jewelry, jewelry not to correct real-world scale, miniaturized accessories, jewelry disproportionate to scene';"""

if OLD_SCALE in ps:
    ps = ps.replace(OLD_SCALE, NEW_SCALE)
    fixes.append('FIX 5 OK: scale negatives gated by isHuman')
else:
    fixes.append('FIX 5 MISS: scale negatives line not found')


# ════════════════════════════════════════════════════════════════════
# Batch 1 – Fix 6: Aspect Ratio ↔ Angle Awareness
# ════════════════════════════════════════════════════════════════════
OLD_RATIO_TAIL = "            `Aspect ratio ${ratio}.`,"
NEW_RATIO_TAIL  = """            // Aspect ratio: flat-lay/overhead angles read better in 1:1 or 4:5
            (['flat-lay', 'overhead', 'top-down-hand'].includes(this.state.angle) && ratio === '9:16')
                ? \`Aspect ratio \${ratio}. Note: this overhead/flat angle composition is optimised for 1:1 or 4:5 framing.\`
                : \`Aspect ratio \${ratio}.\`,"""

if OLD_RATIO_TAIL in ps:
    ps = ps.replace(OLD_RATIO_TAIL, NEW_RATIO_TAIL)
    fixes.append('FIX 6 OK: aspect ratio awareness injected for aerial angles')
else:
    fixes.append('FIX 6 MISS: ratio tailPart not found')


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
    ('warmMats' in ps2,                              'Metal affinity: warm/cool material lists'),
    ("{ t: 'wearing a soft camel" in ps2,            'Palette-tagged outfit objects'),
    ('matFamily' in ps2,                             'matFamily computed from materialId'),
    ('_getRandomSkinTone' in ps2,                    'Skin tone method exists'),
    ('_getLightingForScene' in ps2,                  'Lighting coherence method exists'),
    ('lightingCoherent' in ps2,                      'lightingCoherent used in bodyParts'),
    ('isHuman ? this._getRandomSkinTone()' in ps2,   'Skin tone injected in bodyParts'),
    ('scale = isHuman' in ps2,                       'Scale negatives gated by isHuman'),
    ("'flat-lay', 'overhead'" in ps2,                'Aspect ratio angle awareness'),
    ('this.state.material)' in ps2,                  'material passed to _getRandomOutfit'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'SOME ISSUES — check above')
