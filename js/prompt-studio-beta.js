/**
 * prompt-studio-beta.js — iOS 26 Liquid Glass Prompt Engineering Studio v2.
 *
 * Changes in v2:
 *  - Added Jewelry Style multi-select chips (Styling & Scene tab)
 *  - Added Variation Count (generate 1–5 prompt variations)
 *  - Added Prompt Quality Level (Standard / Detailed / Ultra)
 *  - Fixed expert drawer tab switching (was broken by flex-direction:column)
 *  - Fixed history copy button (always visible on touch, not only on hover)
 *  - Fixed modal search (debounced to preserve mobile keyboard focus)
 *  - Fixed mobile dock button navigation
 *  - Full responsive layout and light/dark mode support via CSS v2
 */

const PromptStudioBeta = {
    // ── State ───────────────────────────────────────────────────
    state: {
        category: 'ring',
        material: 'sterling-silver',
        stone: 'none',
        pieceDesc: '',
        archetypeId: 'body-intimate',
        lightingMood: 'editorial',
        cameraProfile: 'auto',
        angle: '45-degree',
        format: 'square',
        aspectRatio: '1:1',
        surface: 'none',
        palette: 'auto',
        jewelryStyle: [],
        styling: 'none',
        hallmarkEnabled: true,
        brandIdentityEnabled: false,
        brandTouch: 'logomark',
        realismLevel: 'standard',
        promptQuality: 'detailed',
        variationCount: 1,
        skinTexture: true,
        wrinkles: false,
        bodyHair: false,
        skinDetail: true,
        modelGender: 'female',
        modelEthnicity: 'diverse',
        facialExpression: 'none',
        hijabi: false,
        hijabStyle: 'classic',
        setComposition: ['ring', 'necklace', 'earrings'],
        activeModTab: 'model',
        expertOpen: false,
        modalOpen: false,
        modalCategory: 'all',
        modalSearch: '',
        generatedPrompt: '',
        history: [],
    },

    // ── Init ────────────────────────────────────────────────────
    init(container) {
        this.container = container;
        this._loadSavedHistory();
        this._render();
        this._bindEvents();
        this._initMotionSpotlight();
    },

    // ── History Persistence ─────────────────────────────────────
    _loadSavedHistory() {
        try {
            const raw = localStorage.getItem('elaris_psb_history');
            if (raw) this.state.history = JSON.parse(raw);
        } catch (e) { this.state.history = []; }
    },

    _saveHistory() {
        try {
            localStorage.setItem('elaris_psb_history', JSON.stringify(this.state.history.slice(0, 15)));
        } catch (e) {}
    },

    // ── Data Sources (with safety fallbacks) ────────────────────
    _getArchetypes() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.archetypes) && window.PromptStudio.archetypes.length > 0) {
            return window.PromptStudio.archetypes;
        }
        return [
            { id: 'body-intimate',       name: 'Body-Intimate Macro',      category: 'human',   tag: 'V3.0', tagline: 'Hyper-intimate jewelry placement against bare skin',       icon: '💍', desc: 'Extreme macro close-up highlighting textures of silver on skin' },
            { id: 'editorial-model',     name: 'Editorial Fashion Model',   category: 'human',   tag: 'V3.0', tagline: 'Vogue-style luxury editorial fashion shoot',                 icon: '📸', desc: 'High-fashion editorial model with dramatic studio lighting' },
            { id: 'gradient-product',    name: 'Gradient Product Studio',   category: 'product', tag: 'V3.0', tagline: 'Minimalist studio with smooth tonal gradient backdrop',       icon: '💎', desc: 'Clean product-focused render on seamless gradient plane' },
            { id: 'wet-element',         name: 'Liquid & Dew Element',      category: 'organic', tag: 'V3.0', tagline: 'Jewelry immersed in crystal clear water droplets',            icon: '💧', desc: 'Organic water interaction with glistening reflections' },
            { id: 'collection-showcase', name: 'Full Collection Set',       category: 'sets',    tag: 'V3.0', tagline: 'Coordinated suite of matching luxury jewelry pieces',          icon: '✨', desc: 'Harmonious composition showcasing matching jewelry pieces' },
            { id: 'shadow-play',         name: 'Dramatic Shadow Play',      category: 'mood',    tag: 'V3.0', tagline: 'Harsh directional light casting bold geometric shadows',       icon: '🌑', desc: 'Chiaroscuro high-contrast lighting with graphic silhouette interplay' },
            { id: 'nature-botanical',    name: 'Botanical Harmony',         category: 'organic', tag: 'V3.0', tagline: 'Entwined with exotic flora and botanical textures',            icon: '🌿', desc: 'Jewelry resting naturally among dew-covered exotic leaves' },
            { id: 'heritage-moroccan',   name: 'Moroccan Heritage',         category: 'mood',    tag: 'V3.0', tagline: 'Handcrafted Berber aesthetic with warm terracotta',            icon: '🏺', desc: 'Warm artisanal atmosphere with zellige tiles and carved silver' },
            { id: 'watch-macro-horology',name: 'Horology Micro Engineering',category: 'watches', tag: 'V3.0', tagline: 'Macro precision of guilloche dials and tourbillon',            icon: '⌚', desc: 'Ultra-sharp focus on sapphire crystal, chamfered bevels, and movement' },
            { id: 'masculine-editorial', name: 'Masculine Editorial',        category: 'human',   tag: 'V3.0', tagline: 'Bold, structured luxury jewelry for men',                     icon: '👔', desc: 'Clean jawline, textured wool blazer, and bold silver statement rings' },
        ];
    },

    _getCategories() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.categories) && window.PromptStudio.categories.length > 0) {
            // wrap bare strings into objects if needed
            return window.PromptStudio.categories.map(c =>
                typeof c === 'string'
                    ? { id: c, label: c.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase()) }
                    : c
            );
        }
        return [
            { id: 'ring',        label: '💍 Ring' },
            { id: 'necklace',    label: '📿 Necklace' },
            { id: 'pendant',     label: '✨ Pendant' },
            { id: 'bracelet',    label: '💫 Bracelet' },
            { id: 'earrings',    label: '👂 Earrings' },
            { id: 'bangle',      label: '⭕ Bangle' },
            { id: 'jewelry-set', label: '👑 Full Set / Pack' },
            { id: 'watch',       label: '⌚ Luxury Watch' },
        ];
    },

    _getMaterials() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.materials) && window.PromptStudio.materials.length > 0) {
            return window.PromptStudio.materials;
        }
        return [
            { id: 'sterling-silver',     label: 'Sterling Silver 925' },
            { id: 'high-polish',         label: 'High-Polish Rhodium Silver' },
            { id: 'oxidized-silver',     label: 'Oxidized / Antique Silver' },
            { id: 'brushed-silver',      label: 'Brushed Satin Silver' },
            { id: 'hammered-silver',     label: 'Hammered Artisan Silver' },
            { id: 'yellow-gold-vermeil', label: '18K Yellow Gold Vermeil' },
            { id: 'rose-gold-vermeil',   label: '18K Rose Gold Vermeil' },
        ];
    },

    _getStones() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.stones) && window.PromptStudio.stones.length > 0) {
            return window.PromptStudio.stones;
        }
        return [
            { id: 'none',      label: 'No Gemstone (Solid Metal)' },
            { id: 'diamond',   label: 'Brilliant Cut Diamond' },
            { id: 'sapphire',  label: 'Deep Royal Sapphire' },
            { id: 'emerald',   label: 'Colombian Emerald' },
            { id: 'ruby',      label: 'Pigeon Blood Ruby' },
            { id: 'pearl',     label: 'Akoya White Pearl' },
            { id: 'black-onyx',label: 'Polished Black Onyx' },
            { id: 'amethyst',  label: 'Royal Purple Amethyst' },
            { id: 'turquoise', label: 'Tibetan Natural Turquoise' },
        ];
    },

    // ── Jewelry Style Options ───────────────────────────────────
    _getJewelryStyles() {
        return [
            { id: 'geometric',     label: '⬡ Geometric' },
            { id: 'organic',       label: '🌊 Organic' },
            { id: 'floral',        label: '🌸 Floral' },
            { id: 'vintage',       label: '🕰 Vintage' },
            { id: 'minimalist',    label: '◻ Minimalist' },
            { id: 'bold-statement',label: '🔶 Bold Statement' },
            { id: 'ethnic-tribal', label: '🏺 Ethnic / Tribal' },
            { id: 'filigree',      label: '🕸 Filigree' },
            { id: 'art-deco',      label: '⬟ Art Déco' },
            { id: 'celestial',     label: '✦ Celestial' },
            { id: 'sculptural',    label: '🗿 Sculptural' },
            { id: 'nature-inspired',label: '🍃 Nature-Inspired' },
        ];
    },

    // ── Scoring Algorithm for Top 10 Archetypes ──────────────────
    _calculateArchetypeScore(arch) {
        let score = 75;
        const cat = this.state.category;
        const archCat = (arch.category || '').toLowerCase();
        const archId = arch.id.toLowerCase();

        if (cat === 'ring'        && (archId.includes('intimate') || archId.includes('macro') || archId.includes('gradient'))) score += 18;
        if (cat === 'necklace'    && (archId.includes('editorial') || archId.includes('cinematic') || archId.includes('veiled'))) score += 17;
        if (cat === 'earrings'    && (archId.includes('hair') || archId.includes('intimate') || archId.includes('editorial'))) score += 16;
        if (cat === 'jewelry-set' && (archId.includes('collection') || archId.includes('flat-lay') || archId.includes('royal'))) score += 22;
        if (cat === 'watch'       && (archId.includes('watch') || archId.includes('horology') || archId.includes('masculine'))) score += 24;

        if (this.state.modelGender === 'male' && (archId.includes('masculine') || archId.includes('outdoor-masculine'))) score += 20;
        if (this.state.modelGender === 'none' && (archCat === 'product' || archCat === 'organic')) score += 15;
        if (this.state.stone !== 'none' && (archId.includes('macro') || archId.includes('gradient') || archId.includes('wet'))) score += 8;
        if (this.state.hijabi && (archId.includes('veiled') || archId.includes('heritage') || archId.includes('cinematic'))) score += 14;
        if (this.state.archetypeId === arch.id) score += 5;

        return Math.min(99, Math.max(70, score));
    },

    _getTop10Archetypes() {
        const all = this._getArchetypes();
        const scored = all.map(arch => ({ arch, score: this._calculateArchetypeScore(arch) }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 10);
    },

    // ── Smart Guide Database ────────────────────────────────────
    _getGuideData(archId) {
        if (window.PromptStudio && window.PromptStudio.guideDB && window.PromptStudio.guideDB[archId]) {
            return window.PromptStudio.guideDB[archId];
        }
        const fallbacks = {
            'body-intimate': {
                angle: ['macro', 'extreme-macro', 'eye-level'],
                lighting: ['soft-box', 'natural', 'ring-light'],
                camera: ['macro-100', 'macro-180', 'hasselblad-85'],
                tips: [
                    'Use Macro or Extreme Macro angles for the most impactful jewelry close-ups.',
                    'Pair with 100mm f/2.8 Macro lens for extraordinary skin pore and gem clarity.',
                    'Keep styling minimal — raw skin is the primary canvas here.',
                ]
            },
            'editorial-model': {
                angle: ['eye-level', '45-degree', 'chin-up'],
                lighting: ['studio', 'dramatic', 'soft-box'],
                camera: ['hasselblad-85', 'canon-135-l', 'leica-50'],
                tips: [
                    '45° Three-Quarter or Chin-Up angle gives the strongest editorial high-fashion energy.',
                    'Hasselblad 85mm creates the medium-format luxury depth seen in Vogue campaigns.',
                    'Dramatic or Studio lighting gives the crispest gem contrast.',
                ]
            },
            'gradient-product': {
                angle: ['45-degree', 'flat-lay', 'low-angle'],
                lighting: ['studio', 'soft-box', 'dramatic'],
                camera: ['hasselblad-85', 'phase-one-iq4', 'canon-135-l'],
                tips: [
                    '45° Three-Quarter shows the dimensional depth of polished surfaces best.',
                    'Phase One IQ4 gives extraordinary tonal range for smooth gradient transitions.',
                    'Choose a Color Palette to match or complement the background gradient hue.',
                ]
            },
            'wet-element': {
                angle: ['eye-level', 'macro', 'knuckle-level'],
                lighting: ['natural', 'rim-light', 'soft-box'],
                camera: ['macro-100', 'hasselblad-85', 'leica-50'],
                tips: [
                    'Macro angle reveals crystalline water droplet tension in hyper-sharp focus.',
                    'Rim lighting creates luminous droplet highlights and adds rich depth.',
                    'Knuckle Level gives an intimate surface-height view of glistening beads.',
                ]
            },
            'collection-showcase': {
                angle: ['eye-level', 'from-behind', 'over-shoulder'],
                lighting: ['studio', 'natural', 'soft-box'],
                camera: ['hasselblad-85', 'canon-135-l', 'leica-50'],
                tips: [
                    'From Behind (Nape) angle reveals earrings and necklace simultaneously.',
                    'Over the Shoulder creates an intimate editorial unveiling of the collection.',
                    'Hasselblad 85mm gives clean separation and equal focal clarity to each piece.',
                ]
            },
            'shadow-play': {
                angle: ['flat-lay', 'overhead', 'knuckle-level'],
                lighting: ['dramatic', 'directional', 'natural'],
                camera: ['sony-35-gm', 'leica-50', 'hasselblad-85'],
                tips: [
                    'Flat Lay Top-Down produces the cleanest geometric shadow projection.',
                    'Sony 35mm f/1.4 GM captures wide, sweeping shadow patterns without distortion.',
                    'Set Model Gender to "No Model" for pure object and silhouette art.',
                ]
            },
            'masculine-editorial': {
                angle: ['eye-level', '45-degree', 'low-angle'],
                lighting: ['studio', 'dramatic', 'natural'],
                camera: ['hasselblad-85', 'canon-135-l', 'leica-50'],
                tips: [
                    'Set Model Gender to Male for seamless masculine styling and proportions.',
                    'Low Angle adds strong authority and structural elegance to the composition.',
                    'Hasselblad 85mm renders masculine skin tones and tailored fabrics with immense depth.',
                ]
            },
        };
        return fallbacks[archId] || {
            angle: ['45-degree', 'eye-level'],
            lighting: ['studio', 'natural'],
            camera: ['hasselblad-85', 'macro-100'],
            tips: [
                'Calibrated for optimal jewelry clarity and cinematic lighting balance.',
                'Use 85mm or 100mm Macro lens for premium shallow depth of field.',
                'Adjust Color Palette and Surface to match the creative vision.',
            ]
        };
    },

    // ── Build Prompt Logic ──────────────────────────────────────
    _buildSinglePrompt(arch) {
        // Prefer master compiler from global PromptStudio
        if (window.PromptStudio && typeof window.PromptStudio._buildPrompt === 'function') {
            try {
                const ps = window.PromptStudio.state;
                if (ps) {
                    ps.category            = this.state.category;
                    ps.material            = this.state.material;
                    ps.stone               = this.state.stone;
                    ps.pieceDesc           = this.state.pieceDesc;
                    ps.lightingMood        = this.state.lightingMood;
                    ps.cameraProfile       = this.state.cameraProfile;
                    ps.angle               = this.state.angle;
                    ps.format              = this.state.format;
                    ps.aspectRatio         = this.state.aspectRatio;
                    ps.surface             = this.state.surface;
                    ps.palette             = this.state.palette;
                    ps.jewelryStyle        = this.state.jewelryStyle;
                    ps.hallmarkEnabled     = this.state.hallmarkEnabled;
                    ps.brandIdentityEnabled = this.state.brandIdentityEnabled;
                    ps.brandTouch          = this.state.brandTouch;
                    ps.realismLevel        = this.state.realismLevel;
                    ps.skinTexture         = this.state.skinTexture;
                    ps.wrinkles            = this.state.wrinkles;
                    ps.bodyHair            = this.state.bodyHair;
                    ps.skinDetail          = this.state.skinDetail;
                    ps.modelGender         = this.state.modelGender;
                    ps.modelEthnicity      = this.state.modelEthnicity;
                    ps.facialExpression    = this.state.facialExpression;
                    ps.hijabi              = this.state.hijabi;
                    ps.hijabStyle          = this.state.hijabStyle;
                    ps.styling             = this.state.styling;
                    ps.setComposition      = this.state.setComposition;
                }
                const prompt = window.PromptStudio._buildPrompt(arch);
                if (prompt && prompt.length > 30) return prompt;
            } catch (err) {
                console.warn('[PSBeta] Fallback to internal builder:', err);
            }
        }

        // Internal Fallback Builder
        const parts = [];
        const qualityPrefix = {
            standard: 'Professional luxury jewelry photography,',
            detailed: 'Cinematic ultra-luxury editorial commercial photography for fine jewelry,',
            ultra:    'Hyperrealistic ultra-premium editorial campaign photography for fine jewelry, National Geographic-grade technical perfection,',
        }[this.state.promptQuality] || 'Cinematic ultra-luxury editorial commercial photography for fine jewelry,';

        parts.push(`${qualityPrefix} archetype: ${arch.name}`);

        const matLabel   = this.state.material.replace(/-/g, ' ');
        const catLabel   = this.state.category.replace(/-/g, ' ');
        const stoneLabel = this.state.stone !== 'none' ? `featuring radiant ${this.state.stone.replace(/-/g, ' ')}` : 'pure solid metal craftsmanship';
        const customDesc = this.state.pieceDesc ? `, ${this.state.pieceDesc}` : '';
        const styleTag   = this.state.jewelryStyle.length > 0
            ? `, ${this.state.jewelryStyle.map(s => s.replace(/-/g, ' ')).join(' & ')} design aesthetic`
            : '';
        parts.push(`Featuring a handcrafted solid ${matLabel} ${catLabel} ${stoneLabel}${styleTag}${customDesc}, micro-beveled edges, mirror-polished luster`);

        if (this.state.modelGender !== 'none') {
            const gender  = this.state.modelGender === 'male' ? 'male model' : 'female model';
            const ethn    = this.state.modelEthnicity !== 'diverse' ? `${this.state.modelEthnicity} complexion` : 'diverse natural skin';
            const hijTag  = this.state.hijabi ? `, wearing an elegant ${this.state.hijabStyle} luxury silk hijab with graceful drape` : '';
            const expr    = this.state.facialExpression !== 'none' ? `, ${this.state.facialExpression} facial expression` : '';
            const stylTag = this.state.styling !== 'none' ? `, dressed in ${this.state.styling.replace(/-/g, ' ')}` : '';
            parts.push(`Adorned on a high-fashion ${gender} with ${ethn}${hijTag}${expr}${stylTag}`);
        } else {
            parts.push('Clean studio still-life composition with no human model present');
        }

        const lensMap = {
            'macro-100':    '100mm f/2.8 Macro lens, extreme facet clarity and shallow depth of field',
            'hasselblad-85':'Hasselblad 85mm medium format luxury portrait lens with creamy natural bokeh',
            'canon-135-l':  'Canon 135mm f/2L telephoto compression with striking subject separation',
            'leica-50':     'Leica 50mm f/1.4 Summilux lens with timeless natural perspective',
            'sony-35-gm':   'Sony 35mm f/1.4 G-Master lens capturing rich environmental context',
            'anamorphic-40':'Anamorphic 40mm cinematic lens with subtle horizontal light flares',
            'phase-one-iq4':'Phase One IQ4 150MP commercial medium-format sensor capturing immense microscopic texture',
            'auto':         'high-end commercial prime lens configured for maximum optical resolution',
        };
        parts.push(`Shot on ${lensMap[this.state.cameraProfile] || lensMap['auto']}, camera angle: ${this.state.angle.replace(/-/g, ' ')}`);
        parts.push(`Lighting: ${this.state.lightingMood.replace(/-/g, ' ')} lighting mood with sculpted specular highlights across silver contours and authentic light transmission`);

        if (this.state.surface !== 'none')  parts.push(`Resting on an artisanal ${this.state.surface.replace(/-/g, ' ')} backdrop`);
        if (this.state.palette !== 'auto')  parts.push(`Curated ${this.state.palette.replace(/-/g, ' ')} color harmony`);

        if (this.state.promptQuality === 'ultra' || this.state.realismLevel === 'ultra') {
            parts.push('RAW DNG uncompressed photograph, natural filmic grain, microscopic skin pores, authentic sensor noise, chromatic aberration, non-retouched realism');
        } else if (this.state.realismLevel === 'high') {
            parts.push('High-end DSLR capture, micro skin textures, authentic optical depth of field, no CGI artifacts');
        }

        if (this.state.skinTexture) parts.push('visible natural skin pores');
        if (this.state.skinDetail)  parts.push('subtle veins and freckles');
        if (this.state.bodyHair)    parts.push('fine natural arm hair');
        if (this.state.wrinkles)    parts.push('natural micro-lines and expression lines');

        if (this.state.hallmarkEnabled)     parts.push('Discreet microscopic 925 hallmark laser-engraving on inner band');
        if (this.state.brandIdentityEnabled) parts.push(`Subtle luxury brand detail: ${this.state.brandTouch.replace(/-/g, ' ')}`);

        parts.push(`--ar ${this.state.aspectRatio} --v 6.1 --style raw`);
        return parts.join(', ');
    },

    buildPrompt() {
        const archetypes = this._getArchetypes();
        const arch = archetypes.find(a => a.id === this.state.archetypeId) || archetypes[0];
        return this._buildSinglePrompt(arch);
    },

    // ── Generate & Copy Prompt ──────────────────────────────────
    generatePrompt() {
        const archetypes = this._getArchetypes();
        const arch = archetypes.find(a => a.id === this.state.archetypeId) || archetypes[0];
        const count = Math.max(1, Math.min(5, this.state.variationCount || 1));

        let finalPrompt = '';
        if (count === 1) {
            finalPrompt = this._buildSinglePrompt(arch);
        } else {
            const variations = [];
            // Slight style variation for each copy
            const variationTweaks = [
                { angle: this.state.angle, palette: this.state.palette },
                { angle: 'eye-level',      palette: this.state.palette },
                { angle: 'macro',          palette: 'neutral' },
                { angle: 'flat-lay',       palette: 'monochrome' },
                { angle: 'low-angle',      palette: 'warm-earth' },
            ];
            const savedAngle   = this.state.angle;
            const savedPalette = this.state.palette;
            for (let i = 0; i < count; i++) {
                const tweak = variationTweaks[i] || variationTweaks[0];
                this.state.angle   = tweak.angle;
                this.state.palette = tweak.palette;
                variations.push(`[Variation ${i + 1}]\n${this._buildSinglePrompt(arch)}`);
            }
            this.state.angle   = savedAngle;
            this.state.palette = savedPalette;
            finalPrompt = variations.join('\n\n─────────────────────────────────\n\n');
        }

        this.state.generatedPrompt = finalPrompt;

        this.state.history.unshift({
            id: Date.now(),
            archetype: arch.name,
            prompt: finalPrompt,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this._saveHistory();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalPrompt).catch(() => {});
        }

        if (window.Elaris && typeof window.Elaris.showToast === 'function') {
            const label = count > 1 ? `✦ ${count} variations generated & copied!` : '✦ Prompt generated & copied to clipboard!';
            window.Elaris.showToast(label, 'success');
        }

        this._updateOutputCard();
        this._updateHistoryList();
    },

    // ── Motion-reactive spotlight tracker ───────────────────────
    _initMotionSpotlight() {
        if (!this.container) return;
        this.container.addEventListener('mousemove', (e) => {
            const panels = this.container.querySelectorAll('.psb-panel');
            panels.forEach(p => {
                const rect = p.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                p.style.setProperty('--psb-mx', `${x}%`);
                p.style.setProperty('--psb-my', `${y}%`);
            });
        });
    },

    // ── Render ──────────────────────────────────────────────────
    _render() {
        if (!this.container) return;

        const categories  = this._getCategories();
        const materials   = this._getMaterials();
        const stones      = this._getStones();
        const jewelryStyles = this._getJewelryStyles();
        const top10       = this._getTop10Archetypes();
        const activeArch  = this._getArchetypes().find(a => a.id === this.state.archetypeId) || top10[0].arch;
        const guideData   = this._getGuideData(activeArch.id);
        const activeScore = this._calculateArchetypeScore(activeArch);
        const isSet       = this.state.category === 'jewelry-set';

        this.container.innerHTML = `
            <div class="psb-root">
                <!-- Background Mesh -->
                <div class="psb-mesh"></div>

                <!-- Header Strip -->
                <header class="psb-header">
                    <div class="psb-beta-badge">
                        <span class="psb-beta-dot"></span>
                        iOS 26 Studio Beta
                    </div>
                    <h1 class="psb-header-title">Prompt Studio Beta</h1>
                    <span class="psb-header-sub">Liquid Glass Dynamic Prompt Engineering Sandbox</span>
                </header>

                <!-- 3-Column Glass Layout -->
                <main class="psb-layout">

                    <!-- ══ Left Column: Quick Configurator ══ -->
                    <section class="psb-panel psb-left-col">
                        <div class="psb-spot"></div>

                        <div class="psb-section-title">💍 Piece Configurator</div>

                        <!-- Category -->
                        <div class="psb-form-group">
                            <label class="psb-label">Category</label>
                            <select class="psb-select" id="psb-category-select">
                                ${categories.map(c => `<option value="${c.id}" ${c.id === this.state.category ? 'selected' : ''}>${c.label}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Material -->
                        <div class="psb-form-group">
                            <label class="psb-label">Precious Metal</label>
                            <select class="psb-select" id="psb-material-select">
                                ${materials.map(m => `<option value="${m.id}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Stone -->
                        <div class="psb-form-group">
                            <label class="psb-label">Center Gemstone</label>
                            <select class="psb-select" id="psb-stone-select">
                                ${stones.map(s => `<option value="${s.id}" ${s.id === this.state.stone ? 'selected' : ''}>${s.label}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Custom Description -->
                        <div class="psb-form-group">
                            <label class="psb-label">Design Details</label>
                            <textarea class="psb-textarea" id="psb-desc-input" placeholder="e.g. geometric Moroccan filigree, diamond pavé halo, textured organic band...">${this.state.pieceDesc}</textarea>
                        </div>

                        <!-- Set Composition (jewelry-set only) -->
                        <div class="psb-form-group" id="psb-set-group" style="display:${isSet ? 'block' : 'none'};">
                            <label class="psb-label">Set Pieces Included</label>
                            <div class="psb-chips">
                                ${['ring', 'necklace', 'earrings', 'bracelet', 'bangle'].map(p => `
                                    <button type="button" class="psb-chip psb-set-chip ${this.state.setComposition.includes(p) ? 'active' : ''}" data-piece="${p}">
                                        ${p.charAt(0).toUpperCase() + p.slice(1)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Aspect Ratio -->
                        <div class="psb-form-group" style="margin-top:16px;">
                            <label class="psb-label">Aspect Ratio</label>
                            <div class="psb-aspect-bar">
                                ${[
                                    { ar: '1:1',  name: 'Square',   w: 14, h: 14 },
                                    { ar: '4:5',  name: 'Portrait', w: 13, h: 16 },
                                    { ar: '9:16', name: 'Story',    w: 10, h: 18 },
                                    { ar: '16:9', name: 'Wide',     w: 18, h: 10 },
                                    { ar: '2:3',  name: 'Editorial',w: 12, h: 18 },
                                    { ar: '3:4',  name: 'Lookbook', w: 13, h: 17 },
                                    { ar: '21:9', name: 'Cinema',   w: 20, h: 9  },
                                ].map(item => `
                                    <button type="button" class="psb-aspect-chip ${this.state.aspectRatio === item.ar ? 'active' : ''}" data-ar="${item.ar}">
                                        <span class="psb-aspect-thumb" style="width:${item.w}px;height:${item.h}px;"></span>
                                        <span>${item.ar}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Prompt Quality Level -->
                        <div class="psb-form-group" style="margin-top:14px;">
                            <label class="psb-label">Prompt Detail Level</label>
                            <div class="psb-chips">
                                <button type="button" class="psb-chip psb-quality-chip ${this.state.promptQuality === 'standard' ? 'active' : ''}" data-quality="standard">🔹 Standard</button>
                                <button type="button" class="psb-chip psb-quality-chip ${this.state.promptQuality === 'detailed' ? 'active' : ''}" data-quality="detailed">🔷 Detailed</button>
                                <button type="button" class="psb-chip psb-quality-chip ${this.state.promptQuality === 'ultra' ? 'active' : ''}" data-quality="ultra">💎 Ultra</button>
                            </div>
                        </div>

                        <!-- Realism Engine -->
                        <div class="psb-form-group" style="margin-top:14px;">
                            <label class="psb-label">Realism Engine</label>
                            <div class="psb-chips">
                                <button type="button" class="psb-chip psb-realism-chip ${this.state.realismLevel === 'standard' ? 'active' : ''}" data-level="standard">✨ Standard</button>
                                <button type="button" class="psb-chip psb-realism-chip ${this.state.realismLevel === 'high' ? 'active' : ''}" data-level="high">📸 DSLR Realism</button>
                                <button type="button" class="psb-chip psb-realism-chip ${this.state.realismLevel === 'ultra' ? 'active' : ''}" data-level="ultra">🔬 RAW Film</button>
                            </div>
                        </div>
                    </section>

                    <!-- ══ Center Column: Archetype Carousel + Deep Modifiers + Generate ══ -->
                    <section class="psb-center-col">

                        <!-- Top 10 Carousel Panel -->
                        <div class="psb-panel">
                            <div class="psb-spot"></div>

                            <div class="psb-carousel-header">
                                <div class="psb-section-title" style="margin-bottom:0;">🌟 Top 10 Recommended Archetypes</div>
                                <button type="button" class="psb-view-all-btn" id="psb-open-modal-btn">
                                    ⚡ Full Library (+70)
                                </button>
                            </div>

                            <!-- Carousel Track -->
                            <div class="psb-carousel-track" id="psb-carousel-track">
                                ${top10.map(({ arch, score }) => {
                                    const circumference = 2 * Math.PI * 22;
                                    const offset = circumference - (score / 100) * circumference;
                                    const isActive = arch.id === this.state.archetypeId;
                                    return `
                                        <div class="psb-arch-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                                            <div class="psb-score-ring-wrap">
                                                <svg class="psb-score-ring" viewBox="0 0 52 52">
                                                    <circle class="psb-ring-bg"   cx="26" cy="26" r="22"></circle>
                                                    <circle class="psb-ring-fill" cx="26" cy="26" r="22" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                                                </svg>
                                                <span class="psb-arch-emoji">${arch.icon || '💎'}</span>
                                            </div>
                                            <div class="psb-arch-card-name" title="${arch.name}">${arch.name}</div>
                                            <div class="psb-arch-card-tag">${arch.tagline || arch.desc || ''}</div>
                                            <div class="psb-arch-score-badge">${score}% Match</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>

                            <!-- Deep Modifiers Collapsible Trigger -->
                            <button type="button" class="psb-expert-toggle ${this.state.expertOpen ? 'open' : ''}" id="psb-expert-toggle">
                                <span>⚙ Deep Modifiers &amp; Creative Control</span>
                                <span class="psb-expert-arrow">▼</span>
                            </button>

                            <!-- Deep Modifiers Drawer — display:block when open, tabs switch via JS -->
                            <div class="psb-expert-drawer ${this.state.expertOpen ? 'open' : ''}" id="psb-expert-drawer">

                                <!-- Tab Bar -->
                                <div class="psb-mod-tabs">
                                    <button type="button" class="psb-mod-tab ${this.state.activeModTab === 'model'   ? 'active' : ''}" data-modtab="model">👤 Model</button>
                                    <button type="button" class="psb-mod-tab ${this.state.activeModTab === 'camera'  ? 'active' : ''}" data-modtab="camera">📸 Camera</button>
                                    <button type="button" class="psb-mod-tab ${this.state.activeModTab === 'styling' ? 'active' : ''}" data-modtab="styling">🎨 Styling</button>
                                    <button type="button" class="psb-mod-tab ${this.state.activeModTab === 'brand'   ? 'active' : ''}" data-modtab="brand">💎 Brand</button>
                                </div>

                                <!-- ─── Tab 1: Model & Hijabi ─── -->
                                <div class="psb-mod-content ${this.state.activeModTab === 'model' ? 'active' : ''}" id="psb-modtab-model">
                                    <div class="psb-form-group">
                                        <label class="psb-label">Model Subject</label>
                                        <div class="psb-chips">
                                            <button type="button" class="psb-chip psb-gender-chip ${this.state.modelGender === 'female' ? 'active' : ''}" data-gender="female">👩 Female Model</button>
                                            <button type="button" class="psb-chip psb-gender-chip ${this.state.modelGender === 'male'   ? 'active' : ''}" data-gender="male">👨 Male Model</button>
                                            <button type="button" class="psb-chip psb-gender-chip ${this.state.modelGender === 'none'   ? 'active' : ''}" data-gender="none">🚫 No Model (Pure Product)</button>
                                        </div>
                                    </div>

                                    ${this.state.modelGender !== 'none' ? `
                                        <div class="psb-form-group">
                                            <label class="psb-label">Complexion &amp; Skin Tone</label>
                                            <select class="psb-select" id="psb-ethnicity-select">
                                                <option value="diverse"  ${this.state.modelEthnicity === 'diverse'  ? 'selected' : ''}>Diverse / Global Appeal</option>
                                                <option value="fair"     ${this.state.modelEthnicity === 'fair'     ? 'selected' : ''}>Fair Ivory Complexion</option>
                                                <option value="olive"    ${this.state.modelEthnicity === 'olive'    ? 'selected' : ''}>Mediterranean Olive Skin</option>
                                                <option value="golden"   ${this.state.modelEthnicity === 'golden'   ? 'selected' : ''}>Warm Golden Tone</option>
                                                <option value="caramel"  ${this.state.modelEthnicity === 'caramel'  ? 'selected' : ''}>Caramel Bronze Skin</option>
                                                <option value="deep"     ${this.state.modelEthnicity === 'deep'     ? 'selected' : ''}>Deep Rich Espresso</option>
                                            </select>
                                        </div>

                                        <div class="psb-form-group">
                                            <label class="psb-label">Facial Expression</label>
                                            <select class="psb-select" id="psb-expr-select">
                                                <option value="none"        ${this.state.facialExpression === 'none'        ? 'selected' : ''}>Natural / Neutral Editorial</option>
                                                <option value="serene"      ${this.state.facialExpression === 'serene'      ? 'selected' : ''}>Serene &amp; Peaceful</option>
                                                <option value="smile"       ${this.state.facialExpression === 'smile'       ? 'selected' : ''}>Subtle Confident Smile</option>
                                                <option value="joy"         ${this.state.facialExpression === 'joy'         ? 'selected' : ''}>Radiant Joy</option>
                                                <option value="intense"     ${this.state.facialExpression === 'intense'     ? 'selected' : ''}>Intense &amp; Piercing Gaze</option>
                                                <option value="sultry"      ${this.state.facialExpression === 'sultry'      ? 'selected' : ''}>Sultry &amp; Dramatic</option>
                                                <option value="thoughtful"  ${this.state.facialExpression === 'thoughtful'  ? 'selected' : ''}>Thoughtful &amp; Contemplative</option>
                                            </select>
                                        </div>

                                        <!-- Hijabi Toggle -->
                                        <div class="psb-toggle-row">
                                            <div class="psb-toggle-label">
                                                <span class="psb-toggle-title">🧕 Hijabi &amp; Modest Fashion</span>
                                                <span class="psb-toggle-desc">Enable luxury silk hijab drape and modest neckline</span>
                                            </div>
                                            <label class="psb-switch">
                                                <input type="checkbox" id="psb-hijabi-toggle" ${this.state.hijabi ? 'checked' : ''}>
                                                <span class="psb-slider"></span>
                                            </label>
                                        </div>

                                        ${this.state.hijabi ? `
                                            <div class="psb-form-group">
                                                <label class="psb-label">Hijab Wrap Style</label>
                                                <div class="psb-chips">
                                                    ${['classic', 'draped', 'turban', 'modern', 'hood'].map(st => `
                                                        <button type="button" class="psb-chip psb-hijabstyle-chip ${this.state.hijabStyle === st ? 'active' : ''}" data-style="${st}">
                                                            ${st.charAt(0).toUpperCase() + st.slice(1)}
                                                        </button>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    ` : ''}
                                </div>

                                <!-- ─── Tab 2: Camera & Light ─── -->
                                <div class="psb-mod-content ${this.state.activeModTab === 'camera' ? 'active' : ''}" id="psb-modtab-camera">
                                    <div class="psb-form-group">
                                        <label class="psb-label">Lighting Mood</label>
                                        <select class="psb-select" id="psb-lighting-select">
                                            <optgroup label="Natural Light">
                                                <option value="natural"           ${this.state.lightingMood === 'natural'           ? 'selected' : ''}>Natural Daylight (Window)</option>
                                                <option value="golden-hour-light" ${this.state.lightingMood === 'golden-hour-light' ? 'selected' : ''}>Golden Hour Sunlight</option>
                                                <option value="dappled"           ${this.state.lightingMood === 'dappled'           ? 'selected' : ''}>Dappled Sunlight through Flora</option>
                                                <option value="harsh-sun"         ${this.state.lightingMood === 'harsh-sun'         ? 'selected' : ''}>Harsh High-Noon Sun</option>
                                                <option value="overcast"          ${this.state.lightingMood === 'overcast'          ? 'selected' : ''}>Soft Overcast Cloud Diffusion</option>
                                            </optgroup>
                                            <optgroup label="Studio Lighting">
                                                <option value="editorial"  ${this.state.lightingMood === 'editorial'  ? 'selected' : ''}>Editorial Commercial Studio</option>
                                                <option value="studio"     ${this.state.lightingMood === 'studio'     ? 'selected' : ''}>Clean High-Key Studio</option>
                                                <option value="soft-box"   ${this.state.lightingMood === 'soft-box'   ? 'selected' : ''}>Diffused Softbox Studio</option>
                                                <option value="ring-light" ${this.state.lightingMood === 'ring-light' ? 'selected' : ''}>Ring Light (Symmetrical Catchlights)</option>
                                                <option value="rim-light"  ${this.state.lightingMood === 'rim-light'  ? 'selected' : ''}>Rim Light / Edge Separation</option>
                                                <option value="split-light"${this.state.lightingMood === 'split-light'? 'selected' : ''}>Split Lighting (Half-Shadow)</option>
                                            </optgroup>
                                            <optgroup label="Cinematic &amp; Dramatic">
                                                <option value="dramatic"     ${this.state.lightingMood === 'dramatic'     ? 'selected' : ''}>Dramatic Chiaroscuro</option>
                                                <option value="chiaroscuro"  ${this.state.lightingMood === 'chiaroscuro'  ? 'selected' : ''}>Deep Renaissance Shadow</option>
                                                <option value="moody-film"   ${this.state.lightingMood === 'moody-film'   ? 'selected' : ''}>Moody 35mm Film Light</option>
                                                <option value="candlelight"  ${this.state.lightingMood === 'candlelight'  ? 'selected' : ''}>Warm Candlelight Glow</option>
                                                <option value="backlit"      ${this.state.lightingMood === 'backlit'      ? 'selected' : ''}>Backlit Silhouette Halo</option>
                                                <option value="neon-glow"    ${this.state.lightingMood === 'neon-glow'    ? 'selected' : ''}>Neon Color Gel Wash</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Camera Lens Profile</label>
                                        <select class="psb-select" id="psb-camera-select">
                                            <option value="auto"          ${this.state.cameraProfile === 'auto'          ? 'selected' : ''}>✦ Auto AI Choice (Calibrated to Archetype)</option>
                                            <option value="hasselblad-85" ${this.state.cameraProfile === 'hasselblad-85' ? 'selected' : ''}>Hasselblad 85mm Medium Format</option>
                                            <option value="macro-100"     ${this.state.cameraProfile === 'macro-100'     ? 'selected' : ''}>100mm f/2.8 Macro (Extreme Gem Detail)</option>
                                            <option value="canon-135-l"   ${this.state.cameraProfile === 'canon-135-l'   ? 'selected' : ''}>Canon 135mm f/2L (Telephoto Compression)</option>
                                            <option value="leica-50"      ${this.state.cameraProfile === 'leica-50'      ? 'selected' : ''}>Leica 50mm f/1.4 Summilux (Documentary)</option>
                                            <option value="sony-35-gm"    ${this.state.cameraProfile === 'sony-35-gm'    ? 'selected' : ''}>Sony 35mm f/1.4 GM (Environmental)</option>
                                            <option value="anamorphic-40" ${this.state.cameraProfile === 'anamorphic-40' ? 'selected' : ''}>Anamorphic 40mm (Cinematic Flares)</option>
                                            <option value="phase-one-iq4" ${this.state.cameraProfile === 'phase-one-iq4' ? 'selected' : ''}>Phase One IQ4 150MP (Micro Detail)</option>
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Camera Shot Angle</label>
                                        <select class="psb-select" id="psb-angle-select">
                                            <option value="45-degree"     ${this.state.angle === '45-degree'     ? 'selected' : ''}>45° Three-Quarter View</option>
                                            <option value="eye-level"     ${this.state.angle === 'eye-level'     ? 'selected' : ''}>Direct Eye Level Portrait</option>
                                            <option value="macro"         ${this.state.angle === 'macro'         ? 'selected' : ''}>Macro Close-Up Crop</option>
                                            <option value="extreme-macro" ${this.state.angle === 'extreme-macro' ? 'selected' : ''}>Extreme Facet Micro-Macro</option>
                                            <option value="flat-lay"      ${this.state.angle === 'flat-lay'      ? 'selected' : ''}>Flat Lay (Top-Down 90°)</option>
                                            <option value="overhead"      ${this.state.angle === 'overhead'      ? 'selected' : ''}>Overhead Bird's Eye</option>
                                            <option value="low-angle"     ${this.state.angle === 'low-angle'     ? 'selected' : ''}>Low Angle Heroic View</option>
                                            <option value="knuckle-level" ${this.state.angle === 'knuckle-level' ? 'selected' : ''}>Knuckle Level Surface Glance</option>
                                            <option value="side-profile"  ${this.state.angle === 'side-profile'  ? 'selected' : ''}>Side Profile Silhouette</option>
                                            <option value="over-shoulder" ${this.state.angle === 'over-shoulder' ? 'selected' : ''}>Over the Shoulder Glance</option>
                                            <option value="from-behind"   ${this.state.angle === 'from-behind'   ? 'selected' : ''}>From Behind (Nape &amp; Neck)</option>
                                            <option value="chin-up"       ${this.state.angle === 'chin-up'       ? 'selected' : ''}>Chin-Up High Fashion</option>
                                            <option value="candid"        ${this.state.angle === 'candid'        ? 'selected' : ''}>Candid Documentary</option>
                                            <option value="wind-blown"    ${this.state.angle === 'wind-blown'    ? 'selected' : ''}>Wind-Blown Dynamic Motion</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- ─── Tab 3: Styling & Scene ─── -->
                                <div class="psb-mod-content ${this.state.activeModTab === 'styling' ? 'active' : ''}" id="psb-modtab-styling">

                                    <!-- Jewelry Style multi-select -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">Jewelry Design Style (multi-select)</label>
                                        <div class="psb-chips">
                                            ${jewelryStyles.map(js => `
                                                <button type="button" class="psb-chip psb-jstyle-chip ${this.state.jewelryStyle.includes(js.id) ? 'active' : ''}" data-jstyle="${js.id}">
                                                    ${js.label}
                                                </button>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Wardrobe &amp; Outfit</label>
                                        <select class="psb-select" id="psb-styling-select">
                                            <option value="none"                ${this.state.styling === 'none'                ? 'selected' : ''}>No Outfit Specifics (Minimal)</option>
                                            <option value="black-turtleneck"    ${this.state.styling === 'black-turtleneck'    ? 'selected' : ''}>Sleek Black Turtleneck</option>
                                            <option value="white-silk"          ${this.state.styling === 'white-silk'          ? 'selected' : ''}>White Silk Button-Down</option>
                                            <option value="slip-dress"          ${this.state.styling === 'slip-dress'          ? 'selected' : ''}>Silk Satin Slip Dress</option>
                                            <option value="tailored-blazer"     ${this.state.styling === 'tailored-blazer'     ? 'selected' : ''}>Oversized Tailored Wool Blazer</option>
                                            <option value="traditional-caftan"  ${this.state.styling === 'traditional-caftan'  ? 'selected' : ''}>Traditional Hand-Embroidered Caftan</option>
                                            <option value="berber-djellaba"     ${this.state.styling === 'berber-djellaba'     ? 'selected' : ''}>Artisanal Berber Djellaba</option>
                                            <option value="velvet-evening"      ${this.state.styling === 'velvet-evening'      ? 'selected' : ''}>Deep Velvet Evening Gown</option>
                                            <option value="linen-resort"        ${this.state.styling === 'linen-resort'        ? 'selected' : ''}>Relaxed Resort Linen</option>
                                            <option value="structured-suit"     ${this.state.styling === 'structured-suit'     ? 'selected' : ''}>Structured Power Suit</option>
                                            <option value="off-shoulder"        ${this.state.styling === 'off-shoulder'        ? 'selected' : ''}>Off-Shoulder Lace Top</option>
                                            <option value="streetwear"          ${this.state.styling === 'streetwear'          ? 'selected' : ''}>Luxury Streetwear</option>
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Color Palette Harmony</label>
                                        <select class="psb-select" id="psb-palette-select">
                                            <option value="auto"        ${this.state.palette === 'auto'        ? 'selected' : ''}>✦ Auto Color Grading</option>
                                            <option value="neutral"     ${this.state.palette === 'neutral'     ? 'selected' : ''}>Neutral Beige &amp; Warm Cream</option>
                                            <option value="warm-earth"  ${this.state.palette === 'warm-earth'  ? 'selected' : ''}>Warm Terracotta &amp; Ochre Earth</option>
                                            <option value="cool-steel"  ${this.state.palette === 'cool-steel'  ? 'selected' : ''}>Cool Steel &amp; Platinum Blue</option>
                                            <option value="monochrome"  ${this.state.palette === 'monochrome'  ? 'selected' : ''}>Monochrome Black &amp; Silver</option>
                                            <option value="jewel-tones" ${this.state.palette === 'jewel-tones' ? 'selected' : ''}>Rich Royal Jewel Tones</option>
                                            <option value="deep-ocean"  ${this.state.palette === 'deep-ocean'  ? 'selected' : ''}>Deep Ocean Navy &amp; Emerald</option>
                                            <option value="blush-rose"  ${this.state.palette === 'blush-rose'  ? 'selected' : ''}>Blush Rose &amp; Soft Champagne</option>
                                            <option value="noir"        ${this.state.palette === 'noir'        ? 'selected' : ''}>Cinematic High-Contrast Noir</option>
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Surface &amp; Backdrop Material</label>
                                        <select class="psb-select" id="psb-surface-select">
                                            <option value="none"                ${this.state.surface === 'none'                ? 'selected' : ''}>✦ Seamless Studio Void</option>
                                            <option value="carrara-marble"      ${this.state.surface === 'carrara-marble'      ? 'selected' : ''}>Polished Carrara Marble</option>
                                            <option value="raw-concrete"        ${this.state.surface === 'raw-concrete'        ? 'selected' : ''}>Raw Architectural Concrete</option>
                                            <option value="terracotta-zellige"  ${this.state.surface === 'terracotta-zellige'  ? 'selected' : ''}>Handcrafted Terracotta Zellige</option>
                                            <option value="crushed-velvet"      ${this.state.surface === 'crushed-velvet'      ? 'selected' : ''}>Deep Midnight Crushed Velvet</option>
                                            <option value="dune-sand"           ${this.state.surface === 'dune-sand'           ? 'selected' : ''}>Fine Sahara Dune Sand</option>
                                            <option value="water-ripple"        ${this.state.surface === 'water-ripple'        ? 'selected' : ''}>Liquid Glass &amp; Water Ripple</option>
                                            <option value="pure-silk"           ${this.state.surface === 'pure-silk'           ? 'selected' : ''}>Draped Pure Mulberry Silk</option>
                                            <option value="dark-walnut"         ${this.state.surface === 'dark-walnut'         ? 'selected' : ''}>Solid Dark Walnut Wood</option>
                                            <option value="mirrored-glass"      ${this.state.surface === 'mirrored-glass'      ? 'selected' : ''}>Infinitely Mirrored Glass</option>
                                            <option value="organic-stone"       ${this.state.surface === 'organic-stone'       ? 'selected' : ''}>Rough Natural Stone</option>
                                            <option value="aged-parchment"      ${this.state.surface === 'aged-parchment'      ? 'selected' : ''}>Aged Parchment Paper</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- ─── Tab 4: Brand & Details ─── -->
                                <div class="psb-mod-content ${this.state.activeModTab === 'brand' ? 'active' : ''}" id="psb-modtab-brand">

                                    <div class="psb-toggle-row">
                                        <div class="psb-toggle-label">
                                            <span class="psb-toggle-title">🔍 925 Hallmark Engraving</span>
                                            <span class="psb-toggle-desc">Discreet microscopic authenticity hallmark on silver shank</span>
                                        </div>
                                        <label class="psb-switch">
                                            <input type="checkbox" id="psb-hallmark-toggle" ${this.state.hallmarkEnabled ? 'checked' : ''}>
                                            <span class="psb-slider"></span>
                                        </label>
                                    </div>

                                    <div class="psb-toggle-row">
                                        <div class="psb-toggle-label">
                                            <span class="psb-toggle-title">✨ Brand Identity Touch</span>
                                            <span class="psb-toggle-desc">Embed luxury branding detail on apparel or packaging</span>
                                        </div>
                                        <label class="psb-switch">
                                            <input type="checkbox" id="psb-brand-toggle" ${this.state.brandIdentityEnabled ? 'checked' : ''}>
                                            <span class="psb-slider"></span>
                                        </label>
                                    </div>

                                    ${this.state.brandIdentityEnabled ? `
                                        <div class="psb-form-group">
                                            <label class="psb-label">Brand Touch Type</label>
                                            <select class="psb-select" id="psb-brandtouch-select">
                                                <option value="star-pin"      ${this.state.brandTouch === 'star-pin'      ? 'selected' : ''}>Enamel Lapel Star Pin</option>
                                                <option value="wordmark"      ${this.state.brandTouch === 'wordmark'      ? 'selected' : ''}>Embroidered Luxury Wordmark Label</option>
                                                <option value="campaign-logo" ${this.state.brandTouch === 'campaign-logo' ? 'selected' : ''}>Dior/Chanel Style Embossed Campaign Logo</option>
                                                <option value="packaging"     ${this.state.brandTouch === 'packaging'     ? 'selected' : ''}>Silk Packaging Ribbon with Gold Foil</option>
                                                <option value="embossed-seal" ${this.state.brandTouch === 'embossed-seal' ? 'selected' : ''}>Embossed Wax Seal on Box Lid</option>
                                            </select>
                                        </div>
                                    ` : ''}

                                    <div class="psb-form-group" style="margin-top:12px;">
                                        <label class="psb-label">Micro-Realism Elements</label>
                                        <div class="psb-chips">
                                            <button type="button" class="psb-chip psb-skin-chip ${this.state.skinTexture ? 'active' : ''}" data-feat="skinTexture">✦ Natural Pores</button>
                                            <button type="button" class="psb-chip psb-skin-chip ${this.state.skinDetail  ? 'active' : ''}" data-feat="skinDetail">✦ Veins &amp; Freckles</button>
                                            <button type="button" class="psb-chip psb-skin-chip ${this.state.bodyHair    ? 'active' : ''}" data-feat="bodyHair">✦ Subtle Arm Hair</button>
                                            <button type="button" class="psb-chip psb-skin-chip ${this.state.wrinkles   ? 'active' : ''}" data-feat="wrinkles">✦ Natural Micro-Lines</button>
                                        </div>
                                    </div>
                                </div>
                            </div><!-- /psb-expert-drawer -->

                            <!-- Variation Count + Generate -->
                            <div class="psb-count-row">
                                <span class="psb-count-label">Variations</span>
                                <button type="button" class="psb-count-btn" id="psb-count-minus">−</button>
                                <span class="psb-count-val" id="psb-count-val">${this.state.variationCount}</span>
                                <button type="button" class="psb-count-btn" id="psb-count-plus">+</button>
                            </div>

                            <button type="button" class="psb-generate-btn" id="psb-generate-btn">
                                <span>⚡ Generate${this.state.variationCount > 1 ? ` ${this.state.variationCount} Variations` : ' Prompt'} &amp; Copy</span>
                            </button>

                            <!-- Output Card -->
                            <div class="psb-output-card" id="psb-output-card" style="display:${this.state.generatedPrompt ? 'block' : 'none'};">
                                <div class="psb-output-header">
                                    <div class="psb-output-label">
                                        <span class="psb-output-dot"></span>
                                        Compiled Production Prompt
                                    </div>
                                    <div class="psb-output-actions">
                                        <button type="button" class="psb-btn psb-btn-glass psb-btn-sm" id="psb-copy-output-btn">📋 Copy</button>
                                        <button type="button" class="psb-btn psb-btn-glass psb-btn-sm" id="psb-send-motion-btn">🎬 Motion Studio</button>
                                    </div>
                                </div>
                                <div class="psb-output-body" id="psb-output-body">${this.state.generatedPrompt}</div>
                            </div>
                        </div><!-- /psb-panel carousel -->
                    </section><!-- /center col -->

                    <!-- ══ Right Column: Smart Guide Live & History ══ -->
                    <section class="psb-panel psb-right-col">
                        <div class="psb-spot"></div>

                        <div class="psb-section-title">🧭 Smart Guide Live</div>

                        <div class="psb-guide-top">
                            <div class="psb-guide-icon">${activeArch.icon || '💎'}</div>
                            <div>
                                <div class="psb-guide-title">${activeArch.name}</div>
                                <div class="psb-guide-sub">${activeArch.tagline || activeArch.category || ''}</div>
                            </div>
                        </div>

                        <div class="psb-guide-body">${activeArch.desc || 'Optimized archetype for cinematic realism.'}</div>

                        <div class="psb-guide-divider"></div>

                        <div class="psb-guide-stat-row">
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Compatibility Match</span>
                                <span class="psb-guide-stat-value" style="color:#fbbf24;">${activeScore}%</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Optimal Shot Angle</span>
                                <span class="psb-guide-stat-value">${(guideData.angle && guideData.angle[0]) ? guideData.angle[0].replace(/-/g,' ').toUpperCase() : '45° THREE-QUARTER'}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Recommended Lighting</span>
                                <span class="psb-guide-stat-value">${(guideData.lighting && guideData.lighting[0]) ? guideData.lighting[0].replace(/-/g,' ').toUpperCase() : 'STUDIO EDITORIAL'}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Optimal Lens Profile</span>
                                <span class="psb-guide-stat-value">${(guideData.camera && guideData.camera[0]) ? guideData.camera[0].replace(/-/g,' ').toUpperCase() : 'HASSELBLAD 85MM'}</span>
                            </div>
                        </div>

                        <div class="psb-guide-divider"></div>

                        <div class="psb-guide-tips-title">✦ Director Photography Tips</div>
                        <ul class="psb-guide-tips-list">
                            ${(guideData.tips || [
                                'Pair with high-polish silver for rich specular highlights.',
                                'Use shallow depth of field to isolate gem facets.',
                                'Keep background texture complementary to the metal tone.',
                            ]).map(t => `<li class="psb-guide-tip-item">${t}</li>`).join('')}
                        </ul>

                        <div class="psb-guide-divider" style="margin-top:18px;"></div>

                        <div class="psb-section-title" style="margin-top:14px;">🕒 Recent Generations</div>
                        <div class="psb-history-list" id="psb-history-list">
                            ${this.state.history.length === 0
                                ? `<div style="font-size:11px;color:var(--psb-text-3);text-align:center;padding:16px;">No recent prompts yet. Tap Generate!</div>`
                                : this.state.history.map(item => `
                                    <div class="psb-history-item" data-prompt="${encodeURIComponent(item.prompt)}">
                                        <div class="psb-history-arch">${item.archetype} • <span style="color:var(--psb-text-3);">${item.timestamp}</span></div>
                                        <div class="psb-history-preview">${item.prompt.substring(0, 120)}…</div>
                                        <button type="button" class="psb-history-copy">Copy</button>
                                    </div>
                                `).join('')}
                        </div>
                    </section>

                </main><!-- /psb-layout -->

                <!-- Archetype Library Modal -->
                ${this._renderModal()}

                <!-- Mobile Floating Bottom Dock -->
                <nav class="psb-dock">
                    <button type="button" class="psb-dock-btn active" id="psb-dock-studio">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"/></svg>
                        <span>Studio</span>
                    </button>
                    <button type="button" class="psb-dock-btn" id="psb-dock-library">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                        <span>Library</span>
                    </button>
                    <button type="button" class="psb-dock-gen" id="psb-dock-generate">
                        <span>⚡ Generate</span>
                    </button>
                    <button type="button" class="psb-dock-btn" id="psb-dock-guide">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        <span>Guide</span>
                    </button>
                    <button type="button" class="psb-dock-btn" id="psb-dock-modifiers">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        <span>Expert</span>
                    </button>
                </nav>
            </div>
        `;
    },

    // ── Render Archetype Library Modal ──────────────────────────
    _renderModal() {
        if (!this.state.modalOpen) return '';

        const all      = this._getArchetypes();
        const search   = (this.state.modalSearch || '').toLowerCase();
        const category = this.state.modalCategory || 'all';

        const filtered = all.filter(a => {
            const matchesCat    = category === 'all' || (a.category && a.category.toLowerCase() === category.toLowerCase());
            const matchesSearch = !search ||
                (a.name    && a.name.toLowerCase().includes(search)) ||
                (a.tagline && a.tagline.toLowerCase().includes(search)) ||
                (a.desc    && a.desc.toLowerCase().includes(search)) ||
                (a.id      && a.id.toLowerCase().includes(search));
            return matchesCat && matchesSearch;
        });

        const cats = [
            { id: 'all',     label: `All (${all.length})` },
            { id: 'human',   label: '👤 Model & Human' },
            { id: 'product', label: '💎 Product & Studio' },
            { id: 'organic', label: '🌿 Organic & Nature' },
            { id: 'mood',    label: '🌑 Artistic & Mood' },
            { id: 'sets',    label: '👑 Sets & Suites' },
            { id: 'watches', label: '⌚ Watches' },
        ];

        return `
            <div class="psb-modal-backdrop" id="psb-modal-backdrop">
                <div class="psb-modal-window">
                    <div class="psb-modal-header">
                        <h2 class="psb-modal-title">💎 Fine Jewelry Archetype Library (${all.length})</h2>
                        <button type="button" class="psb-modal-close-btn" id="psb-modal-close-btn">✕</button>
                    </div>
                    <div class="psb-modal-search-row">
                        <input type="text" class="psb-input" id="psb-modal-search-input"
                            placeholder="🔍 Search by name, theme, or description..."
                            value="${this.state.modalSearch}">
                    </div>
                    <div class="psb-cat-tabs">
                        ${cats.map(c => `
                            <button type="button" class="psb-cat-tab ${c.id === category ? 'active' : ''}" data-cat="${c.id}">
                                ${c.label}
                            </button>
                        `).join('')}
                    </div>
                    <div class="psb-modal-body">
                        ${filtered.length === 0 ? `<div class="psb-empty">No archetypes found. Try a different search.</div>` : ''}
                        <div class="psb-modal-grid">
                            ${filtered.map(arch => {
                                const score    = this._calculateArchetypeScore(arch);
                                const isActive = arch.id === this.state.archetypeId;
                                return `
                                    <div class="psb-modal-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                                        <div style="font-size:26px;line-height:1;flex-shrink:0;">${arch.icon || '💎'}</div>
                                        <div style="flex:1;min-width:0;">
                                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;gap:6px;">
                                                <div style="font-size:12.5px;font-weight:700;color:var(--psb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${arch.name}</div>
                                                <span style="font-size:9.5px;font-weight:800;color:#fbbf24;background:rgba(245,166,35,0.15);padding:2px 6px;border-radius:10px;flex-shrink:0;">${score}%</span>
                                            </div>
                                            <div style="font-size:10.5px;color:var(--psb-text-3);font-style:italic;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${arch.tagline || arch.desc || ''}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ── Update Output Card ──────────────────────────────────────
    _updateOutputCard() {
        const card = this.container.querySelector('#psb-output-card');
        const body = this.container.querySelector('#psb-output-body');
        if (card && body) {
            body.textContent = this.state.generatedPrompt;
            card.style.display = 'block';
            card.classList.remove('psb-animate-in');
            void card.offsetWidth;
            card.classList.add('psb-animate-in');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    // ── Update History List ─────────────────────────────────────
    _updateHistoryList() {
        const histEl = this.container.querySelector('#psb-history-list');
        if (!histEl) return;
        if (this.state.history.length === 0) {
            histEl.innerHTML = '<div style="font-size:11px;color:var(--psb-text-3);text-align:center;padding:16px;">No recent prompts yet. Tap Generate!</div>';
            return;
        }
        histEl.innerHTML = this.state.history.map(item => `
            <div class="psb-history-item" data-prompt="${encodeURIComponent(item.prompt)}">
                <div class="psb-history-arch">${item.archetype} • <span style="color:var(--psb-text-3);">${item.timestamp}</span></div>
                <div class="psb-history-preview">${item.prompt.substring(0, 120)}…</div>
                <button type="button" class="psb-history-copy">Copy</button>
            </div>
        `).join('');
        // Re-bind history copy
        this._bindHistoryCopy();
    },

    // ── Bind History Copy buttons ───────────────────────────────
    _bindHistoryCopy() {
        this.container.querySelectorAll('.psb-history-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item   = btn.closest('.psb-history-item');
                const prompt = item ? decodeURIComponent(item.dataset.prompt || '') : '';
                if (navigator.clipboard && prompt) {
                    navigator.clipboard.writeText(prompt).then(() => {
                        if (window.Elaris && window.Elaris.showToast) window.Elaris.showToast('📋 History prompt copied!', 'success');
                    });
                }
                btn.textContent = '✓';
                setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
            });
        });
        this.container.querySelectorAll('.psb-history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('psb-history-copy')) return;
                const prompt = decodeURIComponent(item.dataset.prompt || '');
                if (navigator.clipboard && prompt) {
                    navigator.clipboard.writeText(prompt).then(() => {
                        if (window.Elaris && window.Elaris.showToast) window.Elaris.showToast('📋 History prompt copied!', 'success');
                    });
                }
            });
        });
    },

    // ── Bind Interactive Events ─────────────────────────────────
    _bindEvents() {
        if (!this.container) return;
        const q = sel => this.container.querySelector(sel);

        // Category
        const catSel = q('#psb-category-select');
        if (catSel) catSel.addEventListener('change', (e) => {
            this.state.category = e.target.value;
            this._render(); this._bindEvents();
        });

        // Material
        const matSel = q('#psb-material-select');
        if (matSel) matSel.addEventListener('change', (e) => { this.state.material = e.target.value; });

        // Stone
        const stoneSel = q('#psb-stone-select');
        if (stoneSel) stoneSel.addEventListener('change', (e) => { this.state.stone = e.target.value; });

        // Description
        const descIn = q('#psb-desc-input');
        if (descIn) descIn.addEventListener('input', (e) => { this.state.pieceDesc = e.target.value; });

        // Set composition chips
        this.container.querySelectorAll('.psb-set-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const piece = chip.dataset.piece;
                if (this.state.setComposition.includes(piece)) {
                    this.state.setComposition = this.state.setComposition.filter(p => p !== piece);
                } else {
                    this.state.setComposition.push(piece);
                }
                chip.classList.toggle('active', this.state.setComposition.includes(piece));
            });
        });

        // Aspect ratio chips
        this.container.querySelectorAll('.psb-aspect-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.aspectRatio = chip.dataset.ar;
                this.container.querySelectorAll('.psb-aspect-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Prompt quality chips
        this.container.querySelectorAll('.psb-quality-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.promptQuality = chip.dataset.quality;
                this.container.querySelectorAll('.psb-quality-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Realism chips
        this.container.querySelectorAll('.psb-realism-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.realismLevel = chip.dataset.level;
                this.container.querySelectorAll('.psb-realism-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Archetype carousel cards
        this.container.querySelectorAll('.psb-arch-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this._render(); this._bindEvents();
            });
        });

        // Expert drawer toggle
        const expertToggle = q('#psb-expert-toggle');
        if (expertToggle) {
            expertToggle.addEventListener('click', () => {
                this.state.expertOpen = !this.state.expertOpen;
                const drawer = q('#psb-expert-drawer');
                expertToggle.classList.toggle('open', this.state.expertOpen);
                if (drawer) drawer.classList.toggle('open', this.state.expertOpen);
            });
        }

        // Modifier Sub-tabs — fixed: use CSS class 'active' on .psb-mod-content
        this.container.querySelectorAll('.psb-mod-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.modtab;
                this.state.activeModTab = tabId;
                // Update tab buttons
                this.container.querySelectorAll('.psb-mod-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Show matching content panel, hide others
                this.container.querySelectorAll('.psb-mod-content').forEach(c => {
                    c.classList.toggle('active', c.id === `psb-modtab-${tabId}`);
                });
            });
        });

        // Gender chips
        this.container.querySelectorAll('.psb-gender-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.modelGender = chip.dataset.gender;
                this._render(); this._bindEvents();
            });
        });

        // Ethnicity
        const ethSel = q('#psb-ethnicity-select');
        if (ethSel) ethSel.addEventListener('change', (e) => { this.state.modelEthnicity = e.target.value; });

        // Facial expression
        const exprSel = q('#psb-expr-select');
        if (exprSel) exprSel.addEventListener('change', (e) => { this.state.facialExpression = e.target.value; });

        // Hijabi toggle
        const hijabiTog = q('#psb-hijabi-toggle');
        if (hijabiTog) hijabiTog.addEventListener('change', (e) => {
            this.state.hijabi = e.target.checked;
            this._render(); this._bindEvents();
        });

        // Hijab style chips
        this.container.querySelectorAll('.psb-hijabstyle-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.hijabStyle = chip.dataset.style;
                this.container.querySelectorAll('.psb-hijabstyle-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            });
        });

        // Lighting
        const lightSel = q('#psb-lighting-select');
        if (lightSel) lightSel.addEventListener('change', (e) => { this.state.lightingMood = e.target.value; });

        // Camera profile
        const camSel = q('#psb-camera-select');
        if (camSel) camSel.addEventListener('change', (e) => { this.state.cameraProfile = e.target.value; });

        // Angle
        const angleSel = q('#psb-angle-select');
        if (angleSel) angleSel.addEventListener('change', (e) => { this.state.angle = e.target.value; });

        // Jewelry style multi-select chips
        this.container.querySelectorAll('.psb-jstyle-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const id = chip.dataset.jstyle;
                if (this.state.jewelryStyle.includes(id)) {
                    this.state.jewelryStyle = this.state.jewelryStyle.filter(s => s !== id);
                } else {
                    this.state.jewelryStyle.push(id);
                }
                chip.classList.toggle('active', this.state.jewelryStyle.includes(id));
            });
        });

        // Styling (wardrobe)
        const stylSel = q('#psb-styling-select');
        if (stylSel) stylSel.addEventListener('change', (e) => { this.state.styling = e.target.value; });

        // Palette
        const palSel = q('#psb-palette-select');
        if (palSel) palSel.addEventListener('change', (e) => { this.state.palette = e.target.value; });

        // Surface
        const surfSel = q('#psb-surface-select');
        if (surfSel) surfSel.addEventListener('change', (e) => { this.state.surface = e.target.value; });

        // Hallmark toggle
        const hmTog = q('#psb-hallmark-toggle');
        if (hmTog) hmTog.addEventListener('change', (e) => { this.state.hallmarkEnabled = e.target.checked; });

        // Brand identity toggle
        const brandTog = q('#psb-brand-toggle');
        if (brandTog) brandTog.addEventListener('change', (e) => {
            this.state.brandIdentityEnabled = e.target.checked;
            this._render(); this._bindEvents();
        });

        // Brand touch type
        const brandTouchSel = q('#psb-brandtouch-select');
        if (brandTouchSel) brandTouchSel.addEventListener('change', (e) => { this.state.brandTouch = e.target.value; });

        // Skin detail chips (multi-toggle)
        this.container.querySelectorAll('.psb-skin-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const feat = chip.dataset.feat;
                this.state[feat] = !this.state[feat];
                chip.classList.toggle('active', this.state[feat]);
            });
        });

        // Variation count buttons
        const countMinus = q('#psb-count-minus');
        const countPlus  = q('#psb-count-plus');
        const countVal   = q('#psb-count-val');
        if (countMinus && countPlus && countVal) {
            countMinus.addEventListener('click', () => {
                if (this.state.variationCount > 1) {
                    this.state.variationCount--;
                    this._updateCountUI();
                }
            });
            countPlus.addEventListener('click', () => {
                if (this.state.variationCount < 5) {
                    this.state.variationCount++;
                    this._updateCountUI();
                }
            });
        }

        // Generate button
        const genBtn = q('#psb-generate-btn');
        if (genBtn) genBtn.addEventListener('click', () => this.generatePrompt());

        // Copy output
        const copyOutBtn = q('#psb-copy-output-btn');
        if (copyOutBtn) copyOutBtn.addEventListener('click', () => {
            if (this.state.generatedPrompt && navigator.clipboard) {
                navigator.clipboard.writeText(this.state.generatedPrompt).then(() => {
                    if (window.Elaris && window.Elaris.showToast) window.Elaris.showToast('📋 Prompt copied!', 'success');
                    copyOutBtn.textContent = '✓ Copied!';
                    setTimeout(() => { copyOutBtn.textContent = '📋 Copy'; }, 2000);
                });
            }
        });

        // Send to Motion Studio
        const sendMotionBtn = q('#psb-send-motion-btn');
        if (sendMotionBtn) sendMotionBtn.addEventListener('click', () => {
            if (window.Elaris && typeof window.Elaris.navigate === 'function') {
                window.Elaris.navigate('motionstudio');
                if (window.MotionStudio && typeof window.MotionStudio.setPrompt === 'function') {
                    window.MotionStudio.setPrompt(this.state.generatedPrompt);
                }
            }
        });

        // Open Modal
        const openModal = q('#psb-open-modal-btn');
        if (openModal) openModal.addEventListener('click', () => {
            this.state.modalOpen = true;
            this._render(); this._bindEvents();
        });

        // Close Modal (button + backdrop)
        const closeModal = q('#psb-modal-close-btn');
        if (closeModal) closeModal.addEventListener('click', () => {
            this.state.modalOpen = false;
            this._render(); this._bindEvents();
        });
        const modalBackdrop = q('#psb-modal-backdrop');
        if (modalBackdrop) modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                this.state.modalOpen = false;
                this._render(); this._bindEvents();
            }
        });

        // Modal search — debounced to prevent re-render loop on mobile keyboards
        const searchIn = q('#psb-modal-search-input');
        if (searchIn) {
            searchIn.focus();
            searchIn.setSelectionRange(searchIn.value.length, searchIn.value.length);
            clearTimeout(this._searchTimer);
            searchIn.addEventListener('input', (e) => {
                const val = e.target.value;
                clearTimeout(this._searchTimer);
                this._searchTimer = setTimeout(() => {
                    this.state.modalSearch = val;
                    this._renderModalGrid();
                }, 160);
            });
        }

        // Modal category tabs
        this.container.querySelectorAll('.psb-cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.state.modalCategory = tab.dataset.cat;
                this._render(); this._bindEvents();
            });
        });

        // Modal card select
        this.container.querySelectorAll('.psb-modal-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this.state.modalOpen   = false;
                this._render(); this._bindEvents();
                const active = this.container.querySelector(`.psb-arch-card[data-id="${this.state.archetypeId}"]`);
                if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            });
        });

        // History copy + click
        this._bindHistoryCopy();

        // ── Mobile Dock Buttons ──────────────────────────────────
        const dockStudio = q('#psb-dock-studio');
        if (dockStudio) dockStudio.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.container.querySelectorAll('.psb-dock-btn').forEach(b => b.classList.remove('active'));
            dockStudio.classList.add('active');
        });

        const dockLib = q('#psb-dock-library');
        if (dockLib) dockLib.addEventListener('click', () => {
            this.state.modalOpen = true;
            this._render(); this._bindEvents();
            this.container.querySelectorAll('.psb-dock-btn').forEach(b => b.classList.remove('active'));
            dockLib.classList.add('active');
        });

        const dockGen = q('#psb-dock-generate');
        if (dockGen) dockGen.addEventListener('click', () => this.generatePrompt());

        const dockGuide = q('#psb-dock-guide');
        if (dockGuide) dockGuide.addEventListener('click', () => {
            const rightCol = this.container.querySelector('.psb-right-col');
            if (rightCol) rightCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.container.querySelectorAll('.psb-dock-btn').forEach(b => b.classList.remove('active'));
            dockGuide.classList.add('active');
        });

        const dockMods = q('#psb-dock-modifiers');
        if (dockMods) dockMods.addEventListener('click', () => {
            this.state.expertOpen = true;
            const drawer = q('#psb-expert-drawer');
            const toggle = q('#psb-expert-toggle');
            if (drawer) drawer.classList.add('open');
            if (toggle) toggle.classList.add('open');
            if (drawer) drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.container.querySelectorAll('.psb-dock-btn').forEach(b => b.classList.remove('active'));
            dockMods.classList.add('active');
        });
    },

    // ── Update Variation Count UI Without Full Re-render ────────
    _updateCountUI() {
        const countVal = this.container.querySelector('#psb-count-val');
        const genBtn   = this.container.querySelector('#psb-generate-btn span');
        if (countVal) countVal.textContent = this.state.variationCount;
        if (genBtn) {
            genBtn.textContent = this.state.variationCount > 1
                ? `⚡ Generate ${this.state.variationCount} Variations & Copy`
                : '⚡ Generate Prompt & Copy';
        }
    },

    // ── Partial Modal Grid Re-render (for search without full re-render) ─
    _renderModalGrid() {
        const gridEl = this.container.querySelector('.psb-modal-grid');
        if (!gridEl) return;

        const all      = this._getArchetypes();
        const search   = (this.state.modalSearch || '').toLowerCase();
        const category = this.state.modalCategory || 'all';

        const filtered = all.filter(a => {
            const matchesCat    = category === 'all' || (a.category && a.category.toLowerCase() === category.toLowerCase());
            const matchesSearch = !search ||
                (a.name && a.name.toLowerCase().includes(search)) ||
                (a.tagline && a.tagline.toLowerCase().includes(search)) ||
                (a.desc && a.desc.toLowerCase().includes(search)) ||
                (a.id && a.id.toLowerCase().includes(search));
            return matchesCat && matchesSearch;
        });

        gridEl.innerHTML = filtered.map(arch => {
            const score    = this._calculateArchetypeScore(arch);
            const isActive = arch.id === this.state.archetypeId;
            return `
                <div class="psb-modal-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                    <div style="font-size:26px;line-height:1;flex-shrink:0;">${arch.icon || '💎'}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;gap:6px;">
                            <div style="font-size:12.5px;font-weight:700;color:var(--psb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${arch.name}</div>
                            <span style="font-size:9.5px;font-weight:800;color:#fbbf24;background:rgba(245,166,35,0.15);padding:2px 6px;border-radius:10px;flex-shrink:0;">${score}%</span>
                        </div>
                        <div style="font-size:10.5px;color:var(--psb-text-3);font-style:italic;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${arch.tagline || arch.desc || ''}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Re-bind modal card clicks
        this.container.querySelectorAll('.psb-modal-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this.state.modalOpen   = false;
                this._render(); this._bindEvents();
                const active = this.container.querySelector(`.psb-arch-card[data-id="${this.state.archetypeId}"]`);
                if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            });
        });
    },
};

// Global Entry Point for Elaris Router
window.render_promptstudiobeta = function(container) {
    PromptStudioBeta.init(container);
};
window.PromptStudioBeta = PromptStudioBeta;
