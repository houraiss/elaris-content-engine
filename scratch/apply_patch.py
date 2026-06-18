import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def patch():
    js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
    changes = 0

    # ─── 1. Add jewelryStyles array + modelGender to state ───────────────────
    # Insert jewelryStyles array right before state: { block
    if '    jewelryStyles:' not in js:
        target = '    state: {\n        pieceDesc:'
        assert target in js, "State block not found!"
        replacement = """    jewelryStyles: [
        { id: 'none', label: 'None' },
        { id: 'nano', label: 'Nano' },
        { id: 'minimalist', label: 'Minimalist' },
        { id: 'bohemian', label: 'Bohemian' },
        { id: 'art-deco', label: 'Art Deco' },
        { id: 'berber-traditional', label: 'Berber Traditional' },
        { id: 'gothic', label: 'Gothic' },
        { id: 'contemporary', label: 'Contemporary' },
        { id: 'vintage', label: 'Vintage' },
        { id: 'streetwear', label: 'Streetwear' },
    ],

    state: {\n        pieceDesc:"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: jewelryStyles added")
    else:
        print("SKIP: jewelryStyles already exists")

    # ─── 2. Add modelGender + jewelryStyle to state object ───────────────────
    if 'modelGender:' not in js:
        target = "        hallmarkEnabled: false,\n        history: [],\n        jewelryCount: 0,\n        consistencyOn: false,\n        activeProfileId: 'lina',"
        assert target in js, "State fields not found! " + repr(js[43300:43700])
        replacement = """        hallmarkEnabled: false,
        history: [],
        jewelryCount: 0,
        consistencyOn: false,
        modelGender: 'female',
        jewelryStyle: [],
        activeProfileId: 'lina',"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: modelGender + jewelryStyle added to state")
    else:
        print("SKIP: modelGender already in state")

    # ─── 3. Add male profiles + _getFilteredProfiles ─────────────────────────
    if 'Amir' not in js:
        target = """                id: 'lina', name: 'Lina',
                descriptor: 'Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture',
                referenceImage: null, color: '#c9a96e'
            },
            {
                id: 'sara', name: 'Sara',
                descriptor: 'Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression',
                referenceImage: null, color: '#a67c52'
            }
        ];
        this._saveProfiles();
    },"""
        assert target in js, "Profile defaults not found!"
        replacement = """                id: 'lina', name: 'Lina', gender: 'female',
                descriptor: 'Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture',
                referenceImage: null, color: '#c9a96e'
            },
            {
                id: 'sara', name: 'Sara', gender: 'female',
                descriptor: 'Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression',
                referenceImage: null, color: '#a67c52'
            },
            {
                id: 'amir', name: 'Amir', gender: 'male',
                descriptor: 'Man, 30 years old, olive Moroccan skin tone, strong defined jawline, deep-set dark brown eyes, sharp angular features, well-groomed dark beard stubble, athletic build, broad shoulders, confident editorial posture',
                referenceImage: null, color: '#6e9fc9'
            },
            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 27 years old, warm caramel skin tone, elegant refined features, almond-shaped dark eyes, clean-shaven, defined cheekbones, slim composed posture, sophisticated and understated expression',
                referenceImage: null, color: '#52a67c'
            },
        ];
        this._saveProfiles();
    },

    _getFilteredProfiles() {
        const gender = this.state.modelGender || 'female';
        return this.state.profiles.filter(p => (p.gender || 'female') === gender);
    },"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: Amir + Tariq + _getFilteredProfiles() added")
    else:
        print("SKIP: Male profiles already exist")

    # ─── 4. Add new archetypes ────────────────────────────────────────────────
    if 'surface-lean' not in js:
        target = "        {\r\n            id: 'royal-opulence',"
        if target not in js:
            target = "        {\n            id: 'royal-opulence',"
        assert target in js, "Royal opulence archetype not found!"
        replacement = """        {
            id: 'surface-lean',
            name: 'Surface Lean',
            icon: '\U0001f48e',
            tagline: 'Maximum Jewelry Visibility',
            bestFor: 'Best for: Rings, Bracelets, Mens collections, multi-piece shots',
            desc: 'Model leaning on a surface to frame the jewelry naturally with chin-on-hand poses',
            color: '#1e2a2a',
            subjects: [
                'model with elbow on marble table, chin resting on closed fist, {piece} prominently displayed, editorial close-crop',
                'model leaning forward, both forearms resting on surface, {piece} visible from wrist to knuckle',
                'model propping chin with interlaced fingers, {piece} rings stacked on display at center frame',
                'model with one hand placed flat on surface, other hand lightly resting over it, {piece} on both hands',
                'model leaning into camera with wrist bent back showing bracelet {piece}, casual cool editorial',
            ],
            scene: 'low editorial angle, surface as anchor, warm studio or ambient window light, model looking relaxed and confident, jewelry in sharp focus at the foreground plane',
            compat: { ring: 98, necklace: 60, earrings: 65, bracelet: 95, bangles: 90, anklet: 30, brooch: 50, pendant: 55, 'body-jewelry': 40 },
        },
        {
            id: 'hair-drama',
            name: 'Hair Drama',
            icon: '\U0001f487',
            tagline: 'Ring Road, All Eyes on the Jewelry',
            bestFor: 'Best for: Rings, Stacking rings, Earrings, Editorial female model',
            desc: 'Hands running through or arranging hair — a natural gesture that frames earrings and rings simultaneously',
            color: '#2a1a2a',
            subjects: [
                'model running fingers through long hair, both hands raised, rings on every finger catching the light',
                'model lifting hair off neck with one hand to reveal {piece} earring, sensual editorial gesture',
                'hands pulling hair back into loose updo, {piece} rings and bracelets all visible against the hair',
                'model tousling sun-kissed hair, face partially obscured, {piece} earrings swinging mid-motion',
                'close-up of hands gathering hair at nape, {piece} stacked rings at every knuckle, golden hour backlight',
            ],
            scene: 'editorial fashion photography, hair in natural motion, backlighting to create rim-light halo on hair and jewelry, skin warm and glowing, creative finger placement',
            compat: { ring: 98, necklace: 50, earrings: 98, bracelet: 85, bangles: 80, anklet: 20, brooch: 30, pendant: 45, 'body-jewelry': 40 },
        },
        {
            id: 'masculine-editorial',
            name: 'Masculine Editorial',
            icon: '\U0001f935',
            tagline: "Men's Jewelry \u2014 Bold and Intentional",
            bestFor: "Best for: Mens rings, necklaces, chains, bracelets, cuffs, signet rings",
            desc: 'Strong masculine editorial \u2014 suited or casual male model wearing jewelry with intention',
            color: '#1a1a1a',
            subjects: [
                'man in dark blazer, hand in pocket showing {piece} signet ring at cuff edge, sophisticated editorial',
                'man with rolled sleeves showing strong forearms, {piece} chunky chain bracelet draped casually',
                'close-up of man hand gripping steering wheel, {piece} ring clearly visible, golden hour light',
                'man adjusting jacket lapel, {piece} chain necklace visible at open collar, confident gaze',
                "man's hand resting on a wooden bar top, {piece} ring prominent, warm candlelight illumination",
                'man standing in archway, arm raised against the doorframe, {piece} bracelet sliding down wrist',
            ],
            scene: 'masculine editorial, strong confident mood, tailored or relaxed clothing, directional dramatic lighting, deep shadows and highlights, silver against dark clothing for maximum contrast',
            compat: { ring: 95, necklace: 90, earrings: 50, bracelet: 95, bangles: 60, anklet: 30, brooch: 55, pendant: 85, 'body-jewelry': 50 },
        },
        {
            id: 'royal-opulence',"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: New archetypes added (surface-lean, hair-drama, masculine-editorial)")
    else:
        print("SKIP: New archetypes already exist")

    # ─── 5. Add Gender toggle to _render() ────────────────────────────────────
    if 'ps-gender-select' not in js:
        target = """                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="ps_model_consistency">Model Consistency & Attachments</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_jewelry_shots">Jewelry Shots</label>"""
        assert target in js, "Model consistency card not found! Looking for: " + repr(target[:60])
        replacement = """                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Model &amp; Human Elements</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model Gender</label>
                            <div id="ps-gender-select" class="ps-chip-group" style="margin-bottom:0">
                                <button class="ps-chip ${this.state.modelGender === 'female' ? 'active' : ''}" data-val="female">\u2640 Female</button>
                                <button class="ps-chip ${this.state.modelGender === 'male' ? 'active' : ''}" data-val="male">\u2642 Male</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_jewelry_shots">Jewelry Shots</label>"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: Gender selector added to Model card")
    else:
        print("SKIP: Gender selector already exists")

    # ─── 6. Update profile list rendering to use filtered profiles ────────────
    if '_getFilteredProfiles' in js and 'this.state.profiles.map(p =>' in js:
        target = "                                ${this.state.profiles.map(p => `"
        replacement = "                                ${this._getFilteredProfiles().map(p => `"
        if target in js:
            js = js.replace(target, replacement, 1)
            changes += 1
            print("OK: Profile list now uses _getFilteredProfiles()")
        else:
            print("SKIP: Profile map already updated")
    else:
        print("SKIP: Profile map - _getFilteredProfiles not available or already applied")

    # ─── 7. Add Jewelry Style selector in Describe Your Piece ────────────────
    if 'ps-jewelry-style' not in js:
        target = """                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>"""
        assert target in js, "Piece desc not found!"
        replacement = """                        <div class="form-group">
                            <label class="form-label">Jewelry Style</label>
                            <div class="ps-chip-group" id="ps-jewelry-style" style="flex-wrap:wrap">
                                ${this.jewelryStyles.map(s => `<button class="ps-chip ${(this.state.jewelryStyle||[]).includes(s.id) ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: Jewelry Style chips added")
    else:
        print("SKIP: Jewelry style already exists")

    # ─── 8. Add Gender binding to _bind() ────────────────────────────────────
    if 'genderGroup' not in js:
        target = "        // Hallmark toggle\n        q('#ps-hallmark-toggle')"
        assert target in js, "Hallmark toggle binding not found!"
        replacement = """        // Gender selector
        const genderGroup = q('#ps-gender-select');
        if (genderGroup) {
            genderGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                genderGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.modelGender = chip.dataset.val;
                const filtered = this._getFilteredProfiles();
                if (filtered.length > 0) this.state.activeProfileId = filtered[0].id;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }

        // Jewelry Style multi-select chips
        const jsGroup = q('#ps-jewelry-style');
        if (jsGroup) {
            jsGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                const val = chip.dataset.val;
                if (val === 'none') {
                    this.state.jewelryStyle = [];
                    jsGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                } else {
                    if (!this.state.jewelryStyle) this.state.jewelryStyle = [];
                    const idx = this.state.jewelryStyle.indexOf(val);
                    if (idx >= 0) {
                        this.state.jewelryStyle.splice(idx, 1);
                        chip.classList.remove('active');
                    } else {
                        this.state.jewelryStyle.push(val);
                        chip.classList.add('active');
                        const noneChip = jsGroup.querySelector('[data-val="none"]');
                        if (noneChip) noneChip.classList.remove('active');
                    }
                }
            });
        }

        // Hallmark toggle
        q('#ps-hallmark-toggle')"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: Gender + JewelryStyle bindings added to _bind()")
    else:
        print("SKIP: Gender binding already exists")

    # ─── 9. Update human archetypes lists ────────────────────────────────────
    old_ha1 = "['body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic', 'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan', 'celestial-mythic', 'architectural-context']"
    new_ha1 = "['body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic', 'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan', 'celestial-mythic', 'architectural-context', 'masculine-editorial', 'surface-lean', 'hair-drama']"
    if old_ha1 in js:
        js = js.replace(old_ha1, new_ha1, 1)
        changes += 1
        print("OK: Archetype grid human list updated")

    old_ha2 = "['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic']"
    new_ha2 = "['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama', 'lifestyle-moment', 'heritage-moroccan', 'architectural-context']"
    if old_ha2 in js:
        js = js.replace(old_ha2, new_ha2, 1)
        changes += 1
        print("OK: Build prompt human list updated")

    # ─── 10. Add jewelryStyle to _buildPrompt ────────────────────────────────
    if 'jewelryStyleDesc' not in js:
        target = "        const paletteDesc = paletteMap[this.state.palette] || '';"
        assert target in js, "paletteDesc not found!"
        replacement = """        const paletteDesc = paletteMap[this.state.palette] || '';

        // Jewelry Style direction
        let jewelryStyleDesc = '';
        if (this.state.jewelryStyle && this.state.jewelryStyle.length > 0) {
            const styleTexts = {
                'nano': 'ultra-fine nano jewelry aesthetic, delicate miniaturist craftsmanship',
                'minimalist': 'clean minimalist design language, understated elegant forms',
                'bohemian': 'free-spirited bohemian styling, organic shapes and natural textures',
                'art-deco': 'geometric Art Deco motifs, symmetrical precision and luxury patterns',
                'berber-traditional': 'authentic Berber traditional silverwork, tribal heritage motifs',
                'gothic': 'bold gothic aesthetic, dark romantic design language',
                'contemporary': 'modern contemporary luxury, clean architectural lines',
                'vintage': 'vintage-inspired styling, antique romantic craftsmanship',
                'streetwear': 'elevated streetwear aesthetic, urban bold and confident',
            };
            const texts = this.state.jewelryStyle
                .filter(s => s !== 'none' && styleTexts[s])
                .map(s => styleTexts[s]);
            if (texts.length > 0) jewelryStyleDesc = texts.join(', ');
        }"""
        js = js.replace(target, replacement, 1)
        changes += 1
        print("OK: jewelryStyleDesc added to _buildPrompt")

    # add it to the prompt parts
    target2 = "            stylingDesc ? stylingDesc + '.' : '',\n            hallmarkDesc"
    replacement2 = "            stylingDesc ? stylingDesc + '.' : '',\n            jewelryStyleDesc ? `Style direction: ${jewelryStyleDesc}.` : '',\n            hallmarkDesc"
    if target2 in js and 'jewelryStyleDesc ?' not in js:
        js = js.replace(target2, replacement2, 1)
        changes += 1
        print("OK: jewelryStyleDesc added to prompt parts")

    # ─── Write final file ─────────────────────────────────────────────────────
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(js)

    print(f"\n=== PATCH COMPLETE: {changes} changes applied ===")
    print(f"File size: {len(js)} chars, {js.count(chr(10))} lines")

if __name__ == '__main__':
    patch()
