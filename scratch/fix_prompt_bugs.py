import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ══════════════════════════════════════════════════════════════════
# FIX 1 — PLACEMENT rule must be gated by isHuman in bodyParts
# ══════════════════════════════════════════════════════════════════
OLD_P = "            // PLACEMENT RULE — early placement prevents AI misplacing the jewelry\n            placementRule ? `${placementRule}.` : '',"
NEW_P  = "            // PLACEMENT RULE — only for human archetypes (product shots have no finger)\n            (isHuman && placementRule) ? `${placementRule}.` : '',"
if OLD_P in ps:
    ps = ps.replace(OLD_P, NEW_P)
    fixes.append('FIX 1 OK: placementRule gated by isHuman in bodyParts')
else:
    fixes.append('FIX 1 MISS: placementRule pattern not found')
    idx = ps.find('PLACEMENT RULE')
    print(f'  PLACEMENT RULE at {idx}: {repr(ps[idx:idx+120])}')

# ══════════════════════════════════════════════════════════════════
# FIX 2 — Model direction must be gated by isHuman
# ══════════════════════════════════════════════════════════════════
OLD_MD = """} else if (hasModelDesc) {
                // No photo: instruct AI to use the text descriptor as sole model reference
                p += `Generate a photo of a ${genderNoun} matching the Model Details description below, wearing the jewelry.\\n`;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry.\\n`;
            }"""
NEW_MD  = """} else if (hasModelDesc && isHuman) {
                // No photo: instruct AI to use the text descriptor as sole model reference
                p += `Generate a photo of a ${genderNoun} matching the Model Details description below, wearing the jewelry.\\n`;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry.\\n`;
            }
            // Product archetypes: no model direction — scene description speaks for itself"""
if OLD_MD in ps:
    ps = ps.replace(OLD_MD, NEW_MD)
    fixes.append('FIX 2 OK: hasModelDesc gated by isHuman in scene direction')
else:
    fixes.append('FIX 2 MISS: model direction pattern not found')
    idx = ps.find('if (hasModelDesc)')
    print(f'  if(hasModelDesc) at {idx}: {repr(ps[idx:idx+200])}')

# Also gate Model Details injection at the tail
OLD_MDAT = "            // Model Details BEFORE the technical tail — higher token priority\n            // Injected for BOTH image-attached and text-only consistency modes\n            if (hasModelDesc) {"
NEW_MDAT  = "            // Model Details BEFORE the technical tail — higher token priority\n            // Only injected for human archetypes (product shots don't have a model)\n            if (hasModelDesc && isHuman) {"
if OLD_MDAT in ps:
    ps = ps.replace(OLD_MDAT, NEW_MDAT)
    fixes.append('FIX 2b OK: Model Details tail injection gated by isHuman')
else:
    fixes.append('FIX 2b MISS: Model Details pattern not found')
    idx = ps.find('Model Details BEFORE')
    if idx > 0: print(f'  at {idx}: {repr(ps[idx:idx+150])}')

# ══════════════════════════════════════════════════════════════════
# FIX 3 — Placement negatives must be gated by isHuman
# ══════════════════════════════════════════════════════════════════
OLD_PLACNEG = "        const placementNeg = placement[category] || '';"
NEW_PLACNEG  = "        const placementNeg = isHuman ? (placement[category] || '') : '';  // product shots intentionally have no finger"
if OLD_PLACNEG in ps:
    ps = ps.replace(OLD_PLACNEG, NEW_PLACNEG)
    fixes.append('FIX 3 OK: placement negatives gated by isHuman in _buildCategoryNegatives')
else:
    fixes.append('FIX 3 MISS: placementNeg pattern not found')
    idx = ps.find('placementNeg')
    print(f'  placementNeg at {idx}: {repr(ps[idx:idx+80])}')

# ══════════════════════════════════════════════════════════════════
# FIX 4 — Add wet-element to humanArchetypes and HUMAN set
# ══════════════════════════════════════════════════════════════════
# 4a: humanArchetypes array in _buildPrompt
OLD_HA = "humanArchetypes = ['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama', 'lifestyle-moment', 'heritage-moroccan', 'architectural-context'];"
NEW_HA  = "humanArchetypes = ['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama', 'lifestyle-moment', 'heritage-moroccan', 'architectural-context', 'wet-element'];"
if OLD_HA in ps:
    ps = ps.replace(OLD_HA, NEW_HA)
    fixes.append('FIX 4a OK: wet-element added to humanArchetypes')
else:
    fixes.append('FIX 4a MISS: humanArchetypes pattern not found')

# 4b: HUMAN Set in _computeScore
OLD_HS = """const HUMAN = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama',
        ]);"""
NEW_HS  = """const HUMAN = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama', 'wet-element',
        ]);"""
if OLD_HS in ps:
    ps = ps.replace(OLD_HS, NEW_HS)
    fixes.append('FIX 4b OK: wet-element added to HUMAN Set in _computeScore')
else:
    fixes.append('FIX 4b MISS: HUMAN Set pattern not found')

# ══════════════════════════════════════════════════════════════════
# FIX 5 — Mirror & Reflection: remove hardcoded "earring" from subject
# ══════════════════════════════════════════════════════════════════
OLD_MIR = "                'model applying {piece} earring in ornate vintage mirror, reflection showing the piece from another angle',"
NEW_MIR  = "                'model wearing {piece} in ornate vintage mirror, reflection showing the piece from a complementary angle',"
if OLD_MIR in ps:
    ps = ps.replace(OLD_MIR, NEW_MIR)
    fixes.append('FIX 5 OK: mirror-reflection earring template bug fixed')
else:
    fixes.append('FIX 5 MISS: mirror earring pattern not found')
    idx = ps.find('applying {piece}')
    print(f'  at {idx}: {repr(ps[idx:idx+100])}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.\n')

# Version bump
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}\n')

print('=== FIXES ===')
for f in fixes: print(f'  {f}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('(isHuman && placementRule)' in ps2,                      'FIX 1: placement rule gated by isHuman'),
    ('hasModelDesc && isHuman' in ps2,                          'FIX 2: model direction gated by isHuman'),
    ("'wet-element']; // product shots" not in ps2,             'FIX 3: not a false positive'),
    ("isHuman ? (placement[category]" in ps2,                  'FIX 3: category negatives gated by isHuman'),
    ("'architectural-context', 'wet-element'];" in ps2,         'FIX 4a: wet-element in humanArchetypes'),
    ("'surface-lean', 'hair-drama', 'wet-element'," in ps2,     'FIX 4b: wet-element in HUMAN Set'),
    ('wearing {piece} in ornate vintage mirror' in ps2,          'FIX 5: mirror template fixed'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
