import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── Find the full _renderArchetypeGrid to replace ────────────────────────
OLD_GRID = """    // ── Render Archetype Grid (dynamic, re-sortable) ──────────────────────
    _renderArchetypeGrid() {
        const grid = this.container.querySelector('#ps-archetypes');
        if (!grid) return;

        const cat = this.state.category || 'ring';
        let sorted = [...this.archetypes];

        if (this._sortMode === 'recommended') {
            const humanArchetypes = ['body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic', 'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan', 'celestial-mythic', 'architectural-context', 'masculine-editorial', 'surface-lean', 'hair-drama'];
            sorted.sort((a, b) => {
                let scoreA = (a.compat && a.compat[cat]) || 50;
                let scoreB = (b.compat && b.compat[cat]) || 50;
                
                if (this.state.consistencyOn) {
                    if (humanArchetypes.includes(a.id)) scoreA += 50;
                    if (humanArchetypes.includes(b.id)) scoreB += 50;
                }

                return scoreB - scoreA;
            });
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.innerHTML = sorted.map(a => {
            const score = (a.compat && a.compat[cat]) || 50;
            const isSelected = this.state.selectedArchetypes.includes(a.id);
            const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : score >= 50 ? '#f97316' : '#f87171';"""

NEW_GRID = """    // ── Compute a single consistent score for sort + display ──────────────────────
    // This guarantees that badge rank = visual rank. Score is always 0-100.
    _computeScore(archetype, state) {
        const HUMAN = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama',
        ]);
        const cat     = state.category || 'ring';
        const isHuman = HUMAN.has(archetype.id);

        // Base score from category compatibility table
        let score = (archetype.compat && archetype.compat[cat]) || 50;

        // ── Consistency mode adjustments ───────────────────────────────
        // When a model reference is active, human archetypes are preferred.
        if (state.consistencyOn) {
            if (isHuman)  score += 18;   // human archetype + consistency → strong boost
            else          score -= 8;    // product-only archetypes are less relevant
        }

        // ── No reference images: product archetypes are equally valid ──
        // When jewelryCount === 0 there is no multi-image context, so
        // product archetypes that work well alone should rank higher.
        if (!state.consistencyOn && state.jewelryCount === 0 && !isHuman) {
            score += 5;
        }

        // ── Gender-specific archetype adjustments ──────────────────────
        if (state.modelGender === 'male') {
            if (archetype.id === 'masculine-editorial') score += 15; // ideal male archetype
            if (archetype.id === 'hair-drama')          score -= 10; // less natural for men
            if (archetype.id === 'body-intimate')       score -=  5; // slightly less fitting
        } else {
            // female default
            if (archetype.id === 'masculine-editorial') score -= 10; // intended for men
            if (archetype.id === 'hair-drama')          score +=  5; // great for long hair
        }

        // Clamp to 0-100
        return Math.max(0, Math.min(100, Math.round(score)));
    },

    // ── Render Archetype Grid (dynamic, re-sortable) ──────────────────────
    _renderArchetypeGrid() {
        const grid = this.container.querySelector('#ps-archetypes');
        if (!grid) return;

        let sorted = [...this.archetypes];

        if (this._sortMode === 'recommended') {
            sorted.sort((a, b) => {
                const scoreA = this._computeScore(a, this.state);
                const scoreB = this._computeScore(b, this.state);
                // Stable tiebreaker: alphabetical by name
                if (scoreB !== scoreA) return scoreB - scoreA;
                return a.name.localeCompare(b.name);
            });
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.innerHTML = sorted.map(a => {
            // Use the SAME score for display as used for sorting
            const score = this._computeScore(a, this.state);
            const isSelected = this.state.selectedArchetypes.includes(a.id);
            const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : score >= 50 ? '#f97316' : '#f87171';"""

if OLD_GRID in ps:
    ps = ps.replace(OLD_GRID, NEW_GRID)
    print('✓ Replaced _renderArchetypeGrid with _computeScore + fixed ranking')
else:
    print('✗ Could not find _renderArchetypeGrid block')
    idx = ps.find('_renderArchetypeGrid()')
    print(f'  at: {idx}')
    print(repr(ps[idx:idx+200]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Bump version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('_computeScore(archetype, state)' in ps2,   '_computeScore method defined'),
    ('_computeScore(a, this.state)' in ps2,       '_computeScore used in sort'),
    ('_computeScore(a, this.state)' in ps2,       '_computeScore used in display (same call)'),
    ('Math.max(0, Math.min(100' in ps2,           'Score clamped 0-100'),
    ('masculine-editorial) score += 15' in ps2,   'masculine-editorial boosted for male'),
    ('hair-drama)          score -= 10' in ps2,   'hair-drama reduced for male'),
    ('feminine' in ps2 or 'female default' in ps2,'Female gender adjustments'),
    ('Stable tiebreaker' in ps2,                  'Stable alphabetical tiebreaker'),
    ('scoreB !== scoreA' in ps2,                  'Tiebreaker only when equal'),
    # Old raw score assignment should be gone
    ("const score = (a.compat && a.compat[cat]) || 50;" not in ps2, 'Old raw score removed from display'),
]
all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  CHECK ISSUES')
