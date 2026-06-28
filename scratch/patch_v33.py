"""v3.3 Patch - fixed version"""
import sys

PATH = r'C:\Users\User\Default Project\elaris-content-engine\js\prompt-studio.js'

with open(PATH, 'r', encoding='utf-8') as f:
    src = f.read()

changes = []

def sr(src, old, new, label):
    if old not in src:
        # find first line for debugging
        first = old.strip().split('\n')[0].strip()[:60]
        for i, line in enumerate(src.split('\n')):
            if first in line:
                print(f"  Found partial at line {i+1}")
                break
        print(f"!! MATCH FAILED: {label}")
        print(f"   First 80: {repr(old[:80])}")
        sys.exit(1)
    r = src.replace(old, new, 1)
    changes.append(label)
    return r

# === 1. STATE: Add modelEthnicity ===
src = sr(src,
    "hijabStyle: 'classic',    // 'classic' | 'draped' | 'turban' | 'niqab' | 'modern'",
    "hijabStyle: 'classic',    // 'classic' | 'draped' | 'turban' | 'niqab' | 'modern'\n        modelEthnicity: 'diverse', // 'diverse' | 'fair' | 'olive' | 'warm' | 'caramel' | 'deep'",
    "1: modelEthnicity state"
)

# === 2. UI: Skin Tone chips (insert before Hijabi) ===
SKIN_TONE_UI = '''<!-- Skin Tone selector (hidden for no-model) -->
                        <div class="form-group" style="padding-top:10px;border-top:1px dashed var(--border);${this.state.modelGender === 'none' ? 'display:none' : ''}">
                            <label class="form-label" style="margin-bottom:2px">\U0001f3a8 Skin Tone</label>
                            <p class="text-sm text-muted" style="line-height:1.4;max-width:220px;margin:0;margin-bottom:6px">Choose the model's skin tone or let it vary automatically.</p>
                            <div class="ps-chip-group" id="ps-ethnicity" style="flex-wrap:wrap">
                                <button class="ps-chip ${this.state.modelEthnicity === 'diverse' ? 'active' : ''}" data-val="diverse" title="Random diverse skin tones each generation">\U0001f3b2 Diverse</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'fair' ? 'active' : ''}" data-val="fair" title="Fair ivory skin with cool undertones">\U0001f33e Light / Fair</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'olive' ? 'active' : ''}" data-val="olive" title="Olive Mediterranean complexion">\u2600\ufe0f Olive</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'warm' ? 'active' : ''}" data-val="warm" title="Warm golden sun-kissed skin">\U0001f305 Warm / Tan</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'caramel' ? 'active' : ''}" data-val="caramel" title="Caramel medium complexion">\U0001f36f Caramel</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'deep' ? 'active' : ''}" data-val="deep" title="Deep rich brown skin">\U0001f330 Deep / Rich</button>
                            </div>
                        </div>

                        <!-- Hijabi Toggle (hidden for male / no-model) -->'''

src = sr(src,
    '<!-- Hijabi Toggle (hidden for male / no-model) -->',
    SKIN_TONE_UI,
    "2: Skin Tone UI"
)

# === 3. BIND: ethnicity chip binding ===
src = sr(src,
    "this._bindChipGroup('ps-realism-level', 'realismLevel');",
    "this._bindChipGroup('ps-realism-level', 'realismLevel');\n        this._bindChipGroup('ps-ethnicity', 'modelEthnicity');",
    "3: ethnicity binding"
)

# === 4. _getRandomSkinTone -> ethnicity-aware ===
src = sr(src,
    "// Diverse skin tone descriptions",
    "// v3.3: Ethnicity-aware skin tone",
    "4a: comment"
)
src = sr(src,
    "const tones = [",
    "const diversePool = [",
    "4b: rename tones"
)
src = sr(src,
    "return tones[Math.floor(Math.random() * tones.length)];",
    """const fixedTones = {
            'fair':    'model has fair ivory skin with cool rose undertones, delicate and luminous complexion',
            'olive':   'model has medium olive complexion, Mediterranean warm undertones, healthy sun-kissed glow',
            'warm':    'model has light warm golden skin, sun-kissed undertones, smooth radiant texture',
            'caramel': 'model has caramel medium complexion, even warm tone, approachable and photogenic',
            'deep':    'model has warm deep brown skin, rich luminous tone with natural warmth and depth',
        };
        const eth = this.state.modelEthnicity || 'diverse';
        if (eth !== 'diverse' && fixedTones[eth]) return fixedTones[eth];
        return diversePool[Math.floor(Math.random() * diversePool.length)];""",
    "4c: ethnicity selection"
)

# === 5. BADGE: letter spacing ===
src = sr(src,
    'capitalized spaced serif lettering',
    'capitalized tight-kerned serif lettering with minimal letter spacing, letters nearly touching like a real luxury clothing label',
    "5a: tight-kerned"
)
src = sr(src,
    "reads as a genuine brand signature not a graphic overlay`",
    "reads as a genuine brand signature not a graphic overlay, NOT widely spaced, NOT spread apart letters`",
    "5b: negative constraint"
)
src = sr(src,
    '"ELARIS" embroidered on lapel or collar',
    '"ELARIS" embroidered on visible garment area',
    "5c: hint text"
)

# === 6. BADGE: scene-aware placement ===
src = sr(src,
    "// Returns a placement description for the Elaris wordmark.",
    "// v3.3: Returns a scene-aware placement description for the Elaris wordmark.",
    "6a: header"
)

src = sr(src,
    "'at the nape-facing collar fold, subtle brand signature',\n        ];\n\n        // For necklace/pendant",
    """'at the nape-facing collar fold, subtle brand signature',
        ];
        // v3.3: Lower-body placements for anklet/leg-only scenes
        const hemPlacements = [
            'embroidered at the hem of the pants or trouser cuff near the ankle, small and visible',
            'on the trouser leg near the shoe line, a subtle brand signature on the garment',
            'on the visible clothing near the ankle, pants hem or sock band',
            'embroidered on the pant leg above the ankle, naturally framed in the shot',
        ];
        const waistPlacements = [
            'embroidered at the waistband, tucked discreetly',
            'on the belt line or hip area, small and precise brand detail',
        ];
        const _angle = this.state.angle || 'eye-level';
        const isLowerBody = category === 'anklet' || _angle === 'knuckle-level';
        if (isLowerBody) {
            const pool = [...hemPlacements, ...waistPlacements];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // For necklace/pendant""",
    "6b: lower-body placements"
)

# === 7. CAMERA MAP: mouth-bite + new angles ===
src = sr(src,
    "'three-quarter-above':  'elevated 45-degree diagonal angle looking down at subject, 85mm f/1.8, dimensional depth with slight overhead authority, editorial and elegant',\n        };",
    """'three-quarter-above':  'elevated 45-degree diagonal angle looking down at subject, 85mm f/1.8, dimensional depth with slight overhead authority, editorial and elegant',
            // v3.3: New angles with full camera descriptions
            'mouth-bite':           'extreme close-up on 100mm f/2.8 macro lens, model gently biting down on the jewelry piece physically held between her front teeth, lips parted naturally around the metal, real physical contact between teeth and jewelry, visible jaw tension and slight lip pressure from biting, the jewelry is gripped by the teeth NOT floating or hovering near the mouth, intimate sensual editorial, lip texture and skin pores visible',
            'neck-close-up':        'tight close-up on 100mm f/2.8 lens focused on the neck and collarbone area, necklace or pendant as central subject, skin texture and chain detail visible, elegant vertical composition',
            'hand-on-face':         'model with hand placed against face or cheek on 85mm f/1.4 lens, ring or bracelet framed by face contact, intimate touch-frame composition, natural finger placement',
            'wrist-cross':          'both wrists crossed or stacked in frame on 85mm f/1.8 lens, bracelets and rings on full display, editorial hand composition, geometric arm arrangement',
            'mirror-angle':         'shot through or against a mirror on 85mm f/1.4 lens, dual perspective showing jewelry from two angles simultaneously, reflection composition, infinite depth effect',
            'upward-gaze':          'camera positioned below chin level on 85mm f/1.8 lens, model gazing upward, elongated neck line showcasing necklace or earrings, dramatic editorial perspective, jaw and neck as sculptural lines',
        };""",
    "7: mouth-bite + new angles"
)

# === 8. REALISM: prefix at START ===
src = sr(src,
    "const standardPrompt = [...bodyParts, ...tailParts].filter(Boolean).join(' ');",
    """// v3.3: Inject realism prefix at the START of the prompt for higher token priority
        const realismPrefix = (() => {
            const rl = this.state.realismLevel || 'standard';
            if (rl === 'high') return 'Hyper-realistic editorial photograph. Real photography, not AI-generated. Natural imperfections: slight lens vignetting, organic film grain, authentic skin texture with visible pores, natural color cast from real lighting.';
            if (rl === 'ultra') return 'Indistinguishable from a real photograph taken by a professional photographer on a real camera sensor. Visible: natural sensor noise, chromatic aberration at frame edges, organic film grain, fabric thread texture, individual skin pores and micro-hairs, subsurface light scattering through thin skin and earlobes, natural lens barrel distortion, captured in RAW format with real DNG color profile. NOT CGI, NOT 3D render, NOT illustration, NOT digital art.';
            return '';
        })();
        const standardPrompt = [realismPrefix, ...bodyParts, ...tailParts].filter(Boolean).join(' ');""",
    "8: realism prefix"
)

# === 9. LIGHTING: helpers ===
GUIDE_DB = """{
            'body-intimate': { lighting: ['soft-box','natural','ring-light'] },
            'object-pairing': { lighting: ['natural','soft-box','studio'] },
            'editorial-model': { lighting: ['studio','dramatic','soft-box'] },
            'surreal-animal': { lighting: ['natural','dramatic','studio'] },
            'gradient-product': { lighting: ['studio','soft-box','dramatic'] },
            'bw-dramatic': { lighting: ['dramatic','chiaroscuro','harsh'] },
            'shadow-play': { lighting: ['dramatic','directional','natural'] },
            'bold-typography': { lighting: ['studio','natural','soft-box'] },
            'collection-showcase': { lighting: ['studio','natural','soft-box'] },
            'macro-detail': { lighting: ['ring-light','soft-box','studio'] },
            'wet-element': { lighting: ['natural','rim-light','soft-box'] },
            'architectural-context': { lighting: ['natural','dramatic','studio'] },
            'flat-lay-composition': { lighting: ['natural','soft-box','studio'] },
            'motion-blur': { lighting: ['natural','golden-hour-light','overcast'] },
            'cinematic-portrait': { lighting: ['dramatic','chiaroscuro','rim-light'] },
            'mirror-reflection': { lighting: ['natural','studio','rim-light'] },
            'texture-contrast': { lighting: ['natural','rim-light','dramatic'] },
            'celestial-mythic': { lighting: ['dramatic','rim-light','ethereal'] },
            'seasonal-holiday': { lighting: ['natural','soft-box','warm'] },
            'lifestyle-moment': { lighting: ['natural','golden-hour-light','soft-box'] },
            'nature-botanical': { lighting: ['natural','dappled','soft-box'] },
            'heritage-moroccan': { lighting: ['natural','warm','golden-hour-light'] },
            'minimalist-space': { lighting: ['natural','soft-box','studio'] },
            'surface-lean': { lighting: ['natural','studio','soft-box'] },
            'hair-drama': { lighting: ['rim-light','natural','golden-hour-light'] },
            'masculine-editorial': { lighting: ['studio','dramatic','natural'] },
            'royal-opulence': { lighting: ['dramatic','rim-light','studio'] },
            'raw-field-editorial': { lighting: ['natural','harsh-sun','golden-hour-light'] },
            'veiled-mystery': { lighting: ['natural','soft-box','window'] },
            'avant-garde-couture': { lighting: ['studio','dramatic','soft-box'] },
            'cinematic-color-story': { lighting: ['dramatic','studio','natural'] },
            'surreal-scale': { lighting: ['dramatic','natural','studio'] },
            'ghost-double-exposure': { lighting: ['dramatic','natural','rim-light'] },
            'outdoor-masculine': { lighting: ['natural','golden-hour-light','overcast'] },
            'harsh-sun-beauty': { lighting: ['natural','harsh-sun','direct'] },
            'desert-mirage': { lighting: ['harsh-sun','golden-hour-light','natural'] },
            'neon-cyberpunk': { lighting: ['dramatic','studio','rim-light'] },
            'vintage-nostalgia': { lighting: ['harsh','direct','natural'] },
            'zero-gravity': { lighting: ['studio','dramatic','ring-light'] },
            'textured-prop': { lighting: ['natural','warm','window-light'] },
            'mouth-lips-editorial': { lighting: ['dramatic','chiaroscuro','natural','soft'] },
            'dark-moody-editorial': { lighting: ['dramatic','chiaroscuro','mystical','split-light'] },
            'product-page-clean': { lighting: ['studio','soft-box','natural'] },
        }"""

LIGHTING_HELPER = '''    // v3.3: Returns lighting moods sorted by archetype recommendation
    _getLightingForArchetypes(selectedArchetypes) {
        const guideDB = this._getGuideDB();
        if (!guideDB || !selectedArchetypes || selectedArchetypes.length === 0) {
            return this.lightingMoods;
        }
        const freq = {};
        selectedArchetypes.forEach(id => {
            const guide = guideDB[id];
            if (guide && guide.lighting) {
                guide.lighting.forEach((lid, idx) => {
                    freq[lid] = (freq[lid] || 0) + (guide.lighting.length - idx);
                });
            }
        });
        if (Object.keys(freq).length === 0) return this.lightingMoods;
        const idMapping = {
            'soft-box': 'soft-box', 'natural': 'natural', 'ring-light': 'ring-light',
            'dramatic': 'dramatic', 'studio': 'studio', 'chiaroscuro': 'chiaroscuro',
            'rim-light': 'backlit', 'golden-hour-light': 'golden-hour',
            'harsh-sun': 'hard-flash', 'harsh': 'hard-flash', 'direct': 'hard-flash',
            'window': 'window-light', 'window-light': 'window-light',
            'overcast': 'overcast', 'ethereal': 'surreal', 'dappled': 'dappled',
            'warm': 'warm', 'soft': 'soft-romantic', 'mystical': 'mystical',
            'split-light': 'split-light', 'directional': 'dramatic',
        };
        const scored = this.lightingMoods.map(m => {
            let score = 0;
            if (freq[m.id]) score += freq[m.id] * 10;
            Object.entries(idMapping).forEach(([guideId, moodId]) => {
                if (moodId === m.id && freq[guideId]) score += freq[guideId] * 10;
            });
            return { mood: m, score };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.mood);
    },

    _getGuideDB() {
        return ''' + GUIDE_DB + ''';
    },

    _getLightingForScene(sceneVariant, selectedLighting) {'''

src = sr(src,
    "    _getLightingForScene(sceneVariant, selectedLighting) {",
    LIGHTING_HELPER,
    "9: lighting helpers"
)

# === 10. LIGHTING UI: dynamic sorted ===
OLD_LR = 'this.lightingMoods.map(m => `<button class="ps-chip ${m.id === this.state.lightingMood ? \'active\' : \'\'}" data-val="${m.id}">${m.label}</button>`).join(\'\')'
NEW_LR = 'this._getLightingForArchetypes(this.state.selectedArchetypes).map((m, i) => `<button class="ps-chip ${m.id === this.state.lightingMood ? \'active\' : \'\'}" data-val="${m.id}" style="${i < 3 && this.state.selectedArchetypes.length > 0 ? \'border-color:rgba(168,85,247,0.5);\' : \'\'}">${i < 3 && this.state.selectedArchetypes.length > 0 ? \'\u2b50 \' : \'\'}${m.label}</button>`).join(\'\')'
src = sr(src, OLD_LR, NEW_LR, "10: lighting sort UI")

# === VALIDATE & WRITE ===
ob = src.count('{')
cb = src.count('}')
print(f"Braces: {ob}/{cb} (diff {ob-cb})")
print(f"Lines:  {len(src.splitlines())}")
if ob != cb:
    print("!! BRACE MISMATCH")
    sys.exit(1)
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(src)
for c in changes:
    print(f"  OK {c}")
print(f"\n=== {len(changes)} patches applied ===")
