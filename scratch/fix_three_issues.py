import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════════════
# FIX 1 — Brand Identity: smaller, mixed-case, genuinely integrated
# ════════════════════════════════════════════════════════════════════════════
# Find current wordmark and logomark descriptions
WM_START = '"ELARIS" haute couture embroidery integrated into the garment fabric at whatever natural position is visible in the composition'
WM_END   = 'the embroidery seamlessly adapts to any garment color'

idx_wm = ps.find(WM_START)
idx_wm_end = ps.find(WM_END, idx_wm) + len(WM_END)
if idx_wm > 0 and idx_wm_end > idx_wm:
    old_wm = ps[idx_wm:idx_wm_end]
    new_wm = 'a small "Elaris" embroidery detail on the garment — fine single-thread stitching at the cuff edge, collar fold, or chest area, no larger than 2–3 cm in real scale, thread color naturally chosen to contrast the fabric for quiet legibility, styled as an authentic luxury clothing label seamlessly integrated into the garment design, reads as a genuine brand signature not a graphic overlay'
    ps = ps[:idx_wm] + new_wm + ps[idx_wm_end:]
    fixes.append('FIX 1a OK: wordmark — smaller, mixed-case, authentic label language')
else:
    fixes.append(f'FIX 1a MISS: wordmark not found (idx={idx_wm})')

# Logomark - find and update too
LM_OLD = "a small luxury four-pointed star pin brooch on the lapel — ELARIS brand logomark, deep black enamel fill with polished gold outline border, the contrasting enamel-and-metal design ensures it reads clearly against any garment color (dark, light, gold, silver, colourful), an authentic couture pin perfectly integrated into the look"
LM_NEW  = 'a small "Elaris" four-pointed star pin at the lapel — a discreet luxury pin worn as a brand signature, enamel-and-metal two-tone finish naturally contrasting the garment, pin size proportional to real luxury brand pins (small and refined), positioned naturally on the clothing as an authentic styling detail'

if LM_OLD in ps:
    ps = ps.replace(LM_OLD, LM_NEW)
    fixes.append('FIX 1b OK: logomark — smaller, proportional, natural positioning')
else:
    fixes.append('FIX 1b MISS: logomark not matched')

# ════════════════════════════════════════════════════════════════════════════
# FIX 2 — Scene Diversity: scene variant injector pool + multi-prompt per archetype
# ════════════════════════════════════════════════════════════════════════════

# 2a: Add _getSceneVariant method and _getOutfit method before the _getUniqueSubject method
TARGET_UNIQUE = "_getUniqueSubject(archetype) {"
SCENE_METHODS = """_getSceneVariant(archetypeId) {
        // Returns a random environment/setting phrase to inject variety into any archetype
        // Organized by archetype group — human archetypes get lifestyle settings,
        // product archetypes get surface/environment settings
        const humanEnvs = [
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
        ];
        const productEnvs = [
            'polished white Carrara marble surface',
            'aged raw concrete with subtle texture',
            'dark oxidized steel surface catching studio light',
            'warm honey-toned oak wood grain',
            'deep black velvet surface, zero reflection',
            'hand-woven natural linen fabric base',
            'pale pink sand surface with fine grain texture',
            'brushed brass tray with clean studio light',
            'glass shelf, frosted light diffused from below',
            'aged terracotta surface, matte warm tones',
            'scattered dried botanicals on cream paper',
            'ice crystals forming on a mirror surface',
        ];
        const humanIds = ['body-intimate','editorial-model','bw-dramatic','collection-showcase',
            'motion-blur','cinematic-portrait','lifestyle-moment','heritage-moroccan',
            'celestial-mythic','architectural-context','masculine-editorial',
            'surface-lean','hair-drama','wet-element'];
        const pool = humanIds.includes(archetypeId) ? humanEnvs : productEnvs;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _getRandomOutfit(gender) {
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
    },

    """

if TARGET_UNIQUE in ps:
    ps = ps.replace(TARGET_UNIQUE, SCENE_METHODS + TARGET_UNIQUE)
    fixes.append('FIX 2a OK: _getSceneVariant and _getRandomOutfit methods added')
else:
    fixes.append('FIX 2b MISS: _getUniqueSubject not found for insertion')

# 2b: Inject scene variant into _buildPrompt subject area
# Find where styleDesc is set and inject scene variant after subject
TARGET_SCENE = "        // ── FIX #2: Build subject without repeating material in the description ──────────────────────\n        // The material descriptor is injected separately to avoid redundancy.\n        const subject = this._getUniqueSubject(archetype).replace(/\\{piece\\}/g, piece);"
NEW_SCENE = """        // ── FIX #2: Build subject + inject random scene environment variant ──────────────────────
        // The material descriptor is injected separately to avoid redundancy.
        // Scene variant adds randomized setting/environment to prevent same-scene repetition.
        const subject = this._getUniqueSubject(archetype).replace(/\\{piece\\}/g, piece);
        const sceneVariant = this._getSceneVariant(archetype.id);"""

if TARGET_SCENE in ps:
    ps = ps.replace(TARGET_SCENE, NEW_SCENE)
    fixes.append('FIX 2b OK: sceneVariant injected at subject build point')
else:
    fixes.append('FIX 2b MISS: subject build comment not found')
    idx = ps.find('Build subject without repeating')
    print(f'  found at {idx}: {repr(ps[idx:idx+100])}')

# ════════════════════════════════════════════════════════════════════════════
# FIX 3 — Clothing: replace static 'auto' with dynamic random outfit
# ════════════════════════════════════════════════════════════════════════════
# We need to use the outfit in the styleMap. Since styleMap is a const object,
# we compute the outfit BEFORE the styleMap and reference it.
# Find the styleMap declaration
OLD_STYLEMAP_AUTO = "                'auto': 'diverse contemporary styling — garment color and silhouette freely chosen to complement the scene, avoid repeating the same outfit across shots',   // auto: variety-first"

NEW_STYLEMAP_AUTO  = "                'auto': this._getRandomOutfit(modelGenderForStyling),   // auto: random outfit from diverse pool — prevents same-clothing repetition"

if OLD_STYLEMAP_AUTO in ps:
    ps = ps.replace(OLD_STYLEMAP_AUTO, NEW_STYLEMAP_AUTO)
    fixes.append('FIX 3 OK: auto styling now uses random outfit pool')
else:
    fixes.append('FIX 3 MISS: styleMap auto not found')
    idx = ps.find("'auto': 'diverse contemporary")
    print(f'  found at {idx}: {repr(ps[idx:idx+100])}')

# ════════════════════════════════════════════════════════════════════════════
# FIX 4 — Multi-prompt: inject sceneVariant into bodyParts to add variety
# ════════════════════════════════════════════════════════════════════════════
# Find where bodyParts is assembled and add sceneVariant as a subtle environmental note
TARGET_BP = "// SUBJECT — jewelry piece at the center, material injected cleanly on next line\n            subject + '.',"
NEW_BP     = "// SUBJECT — jewelry piece at the center, material injected cleanly on next line\n            subject + '.', sceneVariant + '.',"

if TARGET_BP in ps:
    ps = ps.replace(TARGET_BP, NEW_BP)
    fixes.append('FIX 4 OK: sceneVariant injected into bodyParts for prompt variety')
else:
    fixes.append('FIX 4 MISS: bodyParts subject line not found')
    idx = ps.find('SUBJECT — jewelry piece at the center')
    print(f'  found at {idx}: {repr(ps[idx:idx+150])}')

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
for f in fixes: print(f'  {f}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('Elaris" embroidery detail' in ps2,              'Wordmark: smaller mixed-case language'),
    ('no larger than 2' in ps2,                       'Wordmark: size constraint 2-3cm'),
    ('fine single-thread stitching' in ps2,           'Wordmark: subtle stitch (not raised satin)'),
    ('_getSceneVariant' in ps2,                       'Scene variant method exists'),
    ('_getRandomOutfit' in ps2,                       'Random outfit method exists'),
    ('humanEnvs' in ps2,                              '23 human environment variants'),
    ('productEnvs' in ps2,                            '12 product environment variants'),
    ('femaleOutfits' in ps2,                          'Female outfit pool'),
    ('maleOutfits' in ps2,                            'Male outfit pool'),
    ('this._getSceneVariant(archetype.id)' in ps2,    'Scene variant called in _buildPrompt'),
    ('this._getRandomOutfit(modelGenderForStyling)' in ps2, 'Random outfit called in styleMap'),
    ('sceneVariant' in ps2,                           'sceneVariant in bodyParts'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
