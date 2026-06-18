"""
Add optional model reference image:
1. State: modelImageAttached (true = photo attached, false = text-only)
2. UI: sub-chip group inside consistency section ("With Image" / "Text Only")
3. _buildPrompt: two separate generation paths based on modelImageAttached
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print(f'File: {len(ps)} chars')

# ── 1. Add state variable ────────────────────────────────────────────────
OLD_STATE = """        consistencyOn: false,
        modelGender: 'female',"""
NEW_STATE = """        consistencyOn: false,
        modelImageAttached: true,   // when false: use model descriptor only (no image ref slot)
        modelGender: 'female',"""
if OLD_STATE in ps:
    ps = ps.replace(OLD_STATE, NEW_STATE)
    print('✓ Added modelImageAttached state')
else:
    print('✗ State block not found')

# ── 2. Add sub-UI inside the consistencyOn conditional block ─────────────
# Insert right before the MODEL PROFILE header inside the consistency section
OLD_PROFILE_HEADER = """                        ${this.state.consistencyOn ? `
                        <div class="form-group" style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border)">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                                <label class="form-label" style="margin:0" data-i18n="ps_model_profile">Model Profile</label>"""

NEW_PROFILE_HEADER = """                        ${this.state.consistencyOn ? `
                        <div class="form-group" style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border)">
                            <label class="form-label" style="margin-bottom:6px">Model Image Reference</label>
                            <div class="ps-chip-group" id="ps-model-image-ref" style="margin-bottom:4px">
                                <button class="ps-chip ${this.state.modelImageAttached ? 'active' : ''}" data-val="true" style="font-size:11px">
                                    📎 Image attached
                                </button>
                                <button class="ps-chip ${!this.state.modelImageAttached ? 'active' : ''}" data-val="false" style="font-size:11px">
                                    📝 Text only
                                </button>
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-bottom:0">
                                ${this.state.modelImageAttached
                                    ? 'Prompt will reference the model photo by image slot number.'
                                    : 'Prompt will use the model descriptor text only — no image slot needed.'}
                            </p>
                        </div>
                        <div class="form-group" style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border)">
                            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                                <label class="form-label" style="margin:0" data-i18n="ps_model_profile">Model Profile</label>"""

if OLD_PROFILE_HEADER in ps:
    ps = ps.replace(OLD_PROFILE_HEADER, NEW_PROFILE_HEADER)
    print('✓ Added Model Image Reference sub-UI')
else:
    print('✗ Profile header not found — checking context...')
    idx = ps.find('ps_model_profile')
    print(repr(ps[max(0,idx-300):idx+100]))

# ── 3. Bind the new ps-model-image-ref chip group ───────────────────────
OLD_BIND_CONSISTENCY = """        // consistency toggle
        const ct = this.container.querySelector('#ps-consistency-toggle');
        if (ct) {
            ct.addEventListener('change', () => {
                this.state.consistencyOn = ct.checked;
                this._render();
            });
        }"""

NEW_BIND_CONSISTENCY = """        // consistency toggle
        const ct = this.container.querySelector('#ps-consistency-toggle');
        if (ct) {
            ct.addEventListener('change', () => {
                this.state.consistencyOn = ct.checked;
                this._render();
            });
        }

        // model image reference: "With Image" / "Text Only"
        const mir = this.container.querySelector('#ps-model-image-ref');
        if (mir) {
            mir.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                mir.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.modelImageAttached = chip.dataset.val === 'true';
                this._render(); // re-render so the hint text updates
            });
        }"""

if OLD_BIND_CONSISTENCY in ps:
    ps = ps.replace(OLD_BIND_CONSISTENCY, NEW_BIND_CONSISTENCY)
    print('✓ Added modelImageAttached binding')
else:
    print('✗ Consistency toggle binding not found — searching...')
    idx = ps.find('ps-consistency-toggle')
    # Find the second occurrence (the binding, not the render)
    idx2 = ps.find('ps-consistency-toggle', idx+100)
    print(f'  First occurrence: {idx}')
    print(f'  Second occurrence: {idx2}')
    if idx2 > 0:
        print(repr(ps[max(0,idx2-100):idx2+300]))

# ── 4. Update _buildPrompt multi-image section ───────────────────────────
# Current: hasModel = this.state.consistencyOn  (always assumes image is attached)
# New: split into hasModelImage + hasModelDesc
OLD_BUILD_MULTI = """        // ── MULTI-IMAGE CONSISTENCY LOGIC ──────────────────────
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
        }"""

NEW_BUILD_MULTI = """        // ── MULTI-IMAGE CONSISTENCY LOGIC ──────────────────────
        if (this.state.jewelryCount > 0) {
            const jc = this.state.jewelryCount;
            const hasModelDesc  = this.state.consistencyOn;               // model descriptor enabled
            const hasModelImage = hasModelDesc && this.state.modelImageAttached; // ALSO has photo attached

            // Gender-correct pronouns
            const modelGender  = this.state.modelGender || 'female';
            const genderNoun   = modelGender === 'male' ? 'man'  : 'woman';
            const genderHisHer = modelGender === 'male' ? 'his'  : 'her';

            let p = `[IMAGE REFERENCES]\\n`;
            p += jc === 1
                ? `Image 1 shows the exact jewelry piece to be featured.\\n`
                : `Images 1 to ${jc} show the exact jewelry piece to be featured.\\n`;

            // Only reference an image slot if the user is actually attaching one
            if (hasModelImage) {
                p += `Image ${jc + 1} is the model reference — keep ${genderHisHer} face, features, and skin tone perfectly identical.\\n`;
            }

            p += `\\n[JEWELRY RECONSTRUCTION]\\n`;
            p += `Use ALL jewelry image(s) to reconstruct the ${this.state.category || 'piece'}. Maintain exact metal color, stone placement, and proportions.\\n`;

            p += `\\n[SCENE DIRECTION]\\n`;
            if (hasModelImage) {
                // Photo attached: instruct AI to match the specific image
                p += `Generate a photo of the exact same ${genderNoun} from Image ${jc + 1} wearing the jewelry.\\n`;
            } else if (hasModelDesc) {
                // No photo: instruct AI to use the text descriptor as sole model reference
                p += `Generate a photo of a ${genderNoun} matching the Model Details description below, wearing the jewelry.\\n`;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry.\\n`;
            }

            // Body prompt (scene description)
            p += bodyParts.filter(Boolean).join(' ');

            // Model Details BEFORE the technical tail — higher token priority
            // Injected for BOTH image-attached and text-only modes
            if (hasModelDesc) {
                const activeProf = this.state.profiles.find(prof => prof.id === this.state.activeProfileId);
                if (activeProf) {
                    if (hasModelImage) {
                        p += `\\n\\nModel Details: ${activeProf.descriptor}.`;
                    } else {
                        // Text-only: make the descriptor more prominent as the sole reference
                        p += `\\n\\nModel Details (sole appearance reference — no image attached): ${activeProf.descriptor}.`;
                    }
                }
            }

            // Technical tail last
            p += '\\n\\n' + tailParts.filter(Boolean).join(' ');

            return p;
        }"""

if OLD_BUILD_MULTI in ps:
    ps = ps.replace(OLD_BUILD_MULTI, NEW_BUILD_MULTI)
    print('✓ _buildPrompt updated — two-path generation')
else:
    print('✗ Could not find _buildPrompt multi-image block')
    idx = ps.find('MULTI-IMAGE CONSISTENCY LOGIC')
    print(f'  Block at: {idx}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('\nJS saved.')

# Bump version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# Verification
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('modelImageAttached: true' in ps2,                         'modelImageAttached in state'),
    ('ps-model-image-ref' in ps2,                              'Sub-UI chip group rendered'),
    ('Image attached' in ps2,                                   '"Image attached" chip'),
    ('Text only' in ps2,                                        '"Text only" chip'),
    ('mir.addEventListener' in ps2,                             'ps-model-image-ref binding'),
    ('hasModelDesc' in ps2,                                     'hasModelDesc variable'),
    ('hasModelImage' in ps2,                                    'hasModelImage variable'),
    ('sole appearance reference' in ps2,                        'Text-only model details label'),
    ('no image attached' in ps2.lower() or 'no image' in ps2, 'No-image descriptor marker'),
    ('this.state.modelImageAttached' in ps2,                   'state.modelImageAttached used'),
]
all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  CHECK ISSUES')
