import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# Batch 2 – Fix 8b: Similarity scan + Moroccan occasions in sceneVariant
# ════════════════════════════════════════════════════════════════════

# 8b: Add archId to prompt objects + similarity scan after building
OLD_PROMPT_BUILD = """        const prompts = [];
        for (const archId of selected) {
            const arch = this.archetypes.find(a => a.id === archId);
            if (!arch) continue;
            const prompt = this._buildPrompt(arch);
            prompts.push({ archetype: arch.name, icon: arch.icon, text: prompt, id: Date.now() + Math.random() });
        }"""

NEW_PROMPT_BUILD = """        const prompts = [];
        for (const archId of selected) {
            const arch = this.archetypes.find(a => a.id === archId);
            if (!arch) continue;
            const prompt = this._buildPrompt(arch);
            prompts.push({ archetype: arch.name, icon: arch.icon, text: prompt, archId: arch.id, similar: false, id: Date.now() + Math.random() });
        }

        // ── Similarity scan: flag prompt pairs with >55% keyword overlap ─────
        for (let i = 0; i < prompts.length; i++) {
            for (let j = i + 1; j < prompts.length; j++) {
                if (this._computePromptSimilarity(prompts[i].text, prompts[j].text) > 0.55) {
                    prompts[j].similar = true;  // flag the later / lower-ranked duplicate
                }
            }
        }"""

if OLD_PROMPT_BUILD in ps:
    ps = ps.replace(OLD_PROMPT_BUILD, NEW_PROMPT_BUILD)
    fixes.append('FIX 8b OK: similarity scan added after prompt loop')
else:
    fixes.append('FIX 8b MISS: prompt build loop not matched')


# ════════════════════════════════════════════════════════════════════
# Batch 3 – Fix 9: Per-prompt Regenerate button + Similarity badge in UI
# ════════════════════════════════════════════════════════════════════

OLD_RENDER = """        list.innerHTML = prompts.map((p, i) => `
            <div class="ps-prompt-block" data-idx="${i}">
                <div class="ps-prompt-header">
                    <span>${p.icon} ${p.archetype}</span>
                    <button class="btn btn-sm btn-secondary ps-copy-one" data-idx="${i}">📋 Copy</button>
                </div>
                <div class="ps-prompt-text" id="ps-prompt-${i}">${p.text}</div>
            </div>"""

NEW_RENDER = """        list.innerHTML = prompts.map((p, i) => `
            <div class="ps-prompt-block ${p.similar ? 'ps-prompt-similar' : ''}" data-idx="${i}" data-arch-id="${p.archId}">
                <div class="ps-prompt-header">
                    <span>${p.icon} ${p.archetype}${p.similar ? ' <span class="ps-similar-badge" title="This prompt has significant overlap with another prompt in this batch — consider regenerating">⚠️ Similar</span>' : ''}</span>
                    <div class="ps-prompt-actions">
                        <button class="btn btn-sm btn-outline ps-regen-one" data-idx="${i}" data-arch-id="${p.archId}" title="Regenerate this prompt with a different scene">↺ New</button>
                        <button class="btn btn-sm btn-secondary ps-copy-one" data-idx="${i}">📋 Copy</button>
                    </div>
                </div>
                <div class="ps-prompt-text" id="ps-prompt-${i}">${p.text}</div>
                <div class="ps-caption-block" id="ps-caption-${i}" style="display:none"></div>
            </div>"""

if OLD_RENDER in ps:
    ps = ps.replace(OLD_RENDER, NEW_RENDER)
    fixes.append('FIX 9 OK: regen button + similarity badge + caption slot added to render')
else:
    fixes.append('FIX 9 MISS: render template not matched')
    idx = ps.find('list.innerHTML = prompts.map')
    print(repr(ps[idx:idx+200]))


# ════════════════════════════════════════════════════════════════════
# Batch 3 – Fix 10: Wire up the ↺ Regen button event listener
# ════════════════════════════════════════════════════════════════════
# Find the copy-one event listener and add regen listener next to it
TARGET_COPY_EVT = "        list.addEventListener('click', e => {\n            const btn = e.target.closest('.ps-copy-one');\n            if (!btn) return;"

if TARGET_COPY_EVT not in ps:
    # Try to find the copy listener differently
    idx_copy = ps.find("'.ps-copy-one'")
    print(f'.ps-copy-one listener at {idx_copy}')
    print(repr(ps[max(0,idx_copy-80):idx_copy+200]))

NEW_REGEN_EVT = """        // ↺ Regenerate single prompt
        list.addEventListener('click', e => {
            const btn = e.target.closest('.ps-regen-one');
            if (!btn) return;
            const archId  = btn.dataset.archId;
            const idx     = parseInt(btn.dataset.idx, 10);
            const arch    = this.archetypes.find(a => a.id === archId);
            if (!arch) return;
            const newText = this._buildPrompt(arch);
            // Update display
            const block   = list.querySelector(`[data-idx="${idx}"]`);
            if (block) {
                block.querySelector('.ps-prompt-text').textContent = newText;
                block.classList.remove('ps-prompt-similar');
                const badge = block.querySelector('.ps-similar-badge');
                if (badge) badge.remove();
            }
            Elaris.toast('Prompt regenerated with new scene ✨', 'info');
        });

        """

# Insert before the copy listener
TARGET_COPY_EVT2 = "        list.addEventListener('click', e => {"
idx_target = ps.find(TARGET_COPY_EVT2)
if idx_target > 0:
    ps = ps[:idx_target] + NEW_REGEN_EVT + ps[idx_target:]
    fixes.append('FIX 10 OK: ↺ regen event listener added')
else:
    fixes.append('FIX 10 MISS: click listener insertion point not found')


# ════════════════════════════════════════════════════════════════════
# Batch 4 – Fix 11: Moroccan/Seasonal Occasion Pool in _getSceneVariant
# ════════════════════════════════════════════════════════════════════
OLD_HUMAN_ENVS_END = """            'at a rooftop pool bar, blue water reflecting light',
        ];"""

NEW_HUMAN_ENVS_END = """            'at a rooftop pool bar, blue water reflecting light',
            // ── Moroccan / North African cultural occasions ──────────────────
            'warm Ramadan evening atmosphere, lantern light and ornate zellige tile setting',
            'festive Eid morning, soft pastel light and celebration energy',
            'summer rooftop in Marrakech, warm night air and medina skyline lights',
            'cool Moroccan medina morning, intricate archways and carved plaster light play',
            'a traditional riad garden at dusk, fountain reflection and jasmine scent implied',
            'a Moroccan wedding celebration context, gold candlelight and embroidered textiles',
        ];"""

if OLD_HUMAN_ENVS_END in ps:
    ps = ps.replace(OLD_HUMAN_ENVS_END, NEW_HUMAN_ENVS_END)
    fixes.append('FIX 11 OK: Moroccan/seasonal occasion pool added to sceneVariant')
else:
    fixes.append('FIX 11 MISS: humanEnvs end not matched')


# ════════════════════════════════════════════════════════════════════
# Batch 4 – Fix 12: Caption Layer — generator method + CSS
# ════════════════════════════════════════════════════════════════════

CAPTION_METHOD = """
    _generateCaption(archetypeId, piece, material) {
        // Build a social media caption from archetype vibe + piece + brand voice
        const hooks = {
            'lifestyle-moment':    'This is the detail that changes everything.',
            'editorial-model':     'Jewelry that speaks before words do.',
            'cinematic-portrait':  'Wear your story.',
            'body-intimate':       'Crafted to be felt, not just seen.',
            'surface-lean':        'Quiet luxury. Loud impression.',
            'hair-drama':          'The detail you notice last — remembered first.',
            'bw-dramatic':         'Timeless is not a style. It is a standard.',
            'collection-showcase': 'One collection. Infinite expression.',
            'masculine-editorial': 'Built for those who know what they want.',
            'motion-blur':         'Even in motion, it commands attention.',
            'wet-element':         'Luxurious in any element.',
            'through-glass':       'Seen through light. Defined by craft.',
            'heritage-moroccan':   'Heritage handcrafted. Future worn.',
            'celestial-mythic':    'Born from light. Made for you.',
        };
        const hashtags = {
            'ring':     '#ElarisRing #SterlingRing #MoroccanJewelry #LuxuryRing #JewelryDesign',
            'necklace': '#ElarisNecklace #SterlingNecklace #MoroccanJewelry #LuxuryJewelry #NecklaceDesign',
            'earring':  '#ElarisEarrings #SterlingEarrings #MoroccanJewelry #LuxuryEarrings #EarringDesign',
            'bracelet': '#ElarisBracelet #SterlingBracelet #MoroccanJewelry #LuxuryBracelet #BraceletDesign',
            'pendant':  '#ElarisPendant #SterlingPendant #MoroccanJewelry #LuxuryJewelry #PendantDesign',
        };
        const cat = this.state.category || 'ring';
        const hook = hooks[archetypeId] || 'Jewelry crafted for those who know.';
        const tags = hashtags[cat] || '#ElarisJewelry #MoroccanJewelry #LuxuryJewelry';
        return `${hook}\\n\\n${material} — ${piece}.\\n\\n✦ Elaris Jewelry\\n\\n${tags} #ElarisJewelry #Elaris`;
    },

    """

# Insert before _getSceneVariant
TARGET_SCENE2 = "_getSceneVariant(archetypeId) {"
if TARGET_SCENE2 in ps:
    ps = ps.replace(TARGET_SCENE2, CAPTION_METHOD + TARGET_SCENE2)
    fixes.append('FIX 12 OK: _generateCaption method added')
else:
    fixes.append('FIX 12 MISS: _getSceneVariant not found for caption insertion')


# ════════════════════════════════════════════════════════════════════
# Fix 12b: After prompts render, populate caption blocks
# ════════════════════════════════════════════════════════════════════

TARGET_AFTER_RENDER = "        Elaris.toast('Prompt regenerated with new scene ✨', 'info');\n        });\n\n        "
CAPTION_WIRE = """        Elaris.toast('Prompt regenerated with new scene ✨', 'info');
        });

        // ── Wire up caption toggle on prompt header click ──────────────────
        // Pre-generate captions for all prompts (lazy, on first expand)
        list.addEventListener('click', e => {
            const header = e.target.closest('.ps-prompt-header');
            if (!header) return;
            if (e.target.closest('button')) return;  // don't fire on button clicks inside header
            const block  = header.closest('.ps-prompt-block');
            const idx    = parseInt(block.dataset.idx, 10);
            const capDiv = block.querySelector('.ps-caption-block');
            if (!capDiv) return;
            if (capDiv.style.display === 'none' || !capDiv.style.display) {
                // Generate caption lazily on first open
                if (!capDiv.dataset.generated) {
                    const archId   = block.dataset.archId;
                    const textDiv  = block.querySelector('.ps-prompt-text');
                    const cap      = this._generateCaption(archId, this._lastPiece || '', this._lastMaterial || '');
                    capDiv.innerHTML = `<div class="ps-caption-inner"><div class="ps-caption-label">📝 Caption</div><pre class="ps-caption-text">${cap}</pre><button class="btn btn-sm btn-secondary ps-copy-caption" data-idx="${idx}">📋 Copy Caption</button></div>`;
                    capDiv.dataset.generated = '1';
                }
                capDiv.style.display = 'block';
            } else {
                capDiv.style.display = 'none';
            }
        });

        // Copy caption
        list.addEventListener('click', e => {
            const btn = e.target.closest('.ps-copy-caption');
            if (!btn) return;
            const idx    = parseInt(btn.dataset.idx, 10);
            const capDiv = list.querySelector(`#ps-caption-${idx}`);
            if (capDiv) {
                const text = capDiv.querySelector('.ps-caption-text')?.textContent || '';
                navigator.clipboard.writeText(text).then(() => Elaris.toast('Caption copied! ✨', 'success'));
            }
        });

        """

if TARGET_AFTER_RENDER in ps:
    ps = ps.replace(TARGET_AFTER_RENDER, CAPTION_WIRE)
    fixes.append('FIX 12b OK: caption click handler + lazy generation wired up')
else:
    fixes.append('FIX 12b MISS: after-regen target not found')
    idx = ps.find("Prompt regenerated with new scene")
    print(repr(ps[max(0,idx-10):idx+100]))


# ════════════════════════════════════════════════════════════════════
# Fix 12c: Store piece/material for caption generation
# ════════════════════════════════════════════════════════════════════
# After the piece is computed in _buildPrompt, stash it on this for caption use
OLD_PIECE_FINAL = "        const piece = _rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`;"
NEW_PIECE_FINAL  = """        const piece = _rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`;
        this._lastPiece = piece;
        this._lastMaterial = material;"""

if OLD_PIECE_FINAL in ps:
    ps = ps.replace(OLD_PIECE_FINAL, NEW_PIECE_FINAL)
    fixes.append('FIX 12c OK: piece and material stashed for caption generator')
else:
    fixes.append('FIX 12c MISS: piece final line not found')

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
    ('similar: false' in ps2,              'Similarity flag in prompt objects'),
    ('_computePromptSimilarity' in ps2,    'Similarity helper exists'),
    ('ps-regen-one' in ps2,               'Regen button in render'),
    ('ps-similar-badge' in ps2,           'Similar badge in render'),
    ('ps-caption-block' in ps2,           'Caption slot in render'),
    ('ps-regen-one' in ps2,               'Regen listener wired'),
    ('ps-copy-caption' in ps2,            'Copy caption wired'),
    ('_generateCaption' in ps2,           'Caption generator method'),
    ('Ramadan evening' in ps2,            'Moroccan occasion pool'),
    ('Eid morning' in ps2,                'Eid occasion entry'),
    ('_lastPiece' in ps2,                 'piece stashed for caption'),
    ('ps-caption-inner' in ps2,           'Caption inner HTML'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
