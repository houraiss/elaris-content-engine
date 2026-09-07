/**
 * prompt-studio-beta.js — iOS 26 Liquid Glass Prompt Engineering Studio v10.
 *
 * Changes in v10:
 *  - Camera tab: Added Depth of Field select + ISO Range select (selectable, not just display)
 *  - AI Chooses now default for Wardrobe & Outfit, Color Palette Harmony, Surface & Backdrop
 *  - New Model modifier: Body Part Focus (wrist, neck, face, etc.)
 *  - New Styling modifiers: Film Style, Environment / Background, Mood Intensity, Season & Time of Day
 *  - All new params integrated into fallback prompt builder
 *  - All prior v9 features preserved
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
        // AI Chooses is now the default for max diversity across 100+ generations
        surface: 'ai-choice',
        palette: 'ai-choice',
        styling: 'ai-choice',
        jewelryStyle: [],
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
        // New in v10
        bodyFocus: 'auto',
        dof: 'auto',
        isoRange: 'auto',
        filmStyle: 'auto',
        environment: 'auto',
        moodIntensity: 'balanced',
        seasonTime: 'auto',
        setComposition: ['ring', 'necklace', 'earrings'],
        activeModTab: 'model',
        expertOpen: false,
        modalOpen: false,
        modalCategory: 'all',
        modalSearch: '',
        modalSortAZ: false,
        modalV3Only: false,
        lightingFilter: 'all',
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
            if (raw) {
                const parsed = JSON.parse(raw);
                // Filter out any stale/corrupt items missing required fields
                this.state.history = Array.isArray(parsed)
                    ? parsed.filter(item => item && typeof item.prompt === 'string' && item.prompt.length > 0)
                    : [];
            }
        } catch (e) {
            this.state.history = [];
            try { localStorage.removeItem('elaris_psb_history'); } catch (_) {}
        }
    },

    _saveHistory() {
        try {
            localStorage.setItem('elaris_psb_history', JSON.stringify(this.state.history.slice(0, 15)));
        } catch (e) {}
    },

    // ── Category Inference ────────────────────────────────────────
    // Archetypes in prompt-studio.js lack a .category field.
    // We infer it from the archetype ID using the same classification as the main studio.
    _HUMAN_IDS: new Set([
        'body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur',
        'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama',
        'lifestyle-moment', 'heritage-moroccan', 'architectural-context', 'wet-element',
        'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture', 'cinematic-color-story',
        'surreal-scale', 'ghost-double-exposure', 'outdoor-masculine', 'harsh-sun-beauty',
        'mouth-lips-editorial', 'dark-moody-editorial',
        'desert-mirage', 'neon-cyberpunk', 'vintage-nostalgia',
        'frozen-subject', 'vehicle-lifestyle',
        'weather-drama', 'prop-power-play', 'skin-canvas', 'reaching-gesture',
        'power-stance', 'stacked-maximalist', 'sculptural-headpiece',
        'equestrian-luxury', 'pop-color-portrait', 'urban-glass-power',
        'artisan-at-work', 'bridal-trousseau', 'souk-editorial', 'heirloom-generational',
        'futuristic-chrome', 'submerged-beauty', 'surreal-material-fusion',
        'luxury-leather-editorial', 'monochrome-jewelry-ad',
    ]),

    _ORGANIC_IDS: new Set([
        'object-pairing', 'nature-botanical', 'wet-element', 'surreal-animal',
        'texture-contrast', 'seasonal-holiday',
    ]),

    _MOOD_IDS: new Set([
        'shadow-play', 'heritage-moroccan', 'bw-dramatic', 'celestial-mythic',
        'dark-moody-editorial', 'cinematic-color-story', 'ghost-double-exposure',
        'desert-mirage', 'neon-cyberpunk', 'vintage-nostalgia',
    ]),

    // ── V3.0 Archetype IDs (mirrors master prompt-studio.js V3_ARCHETYPES set) ────
    _V3_IDS: new Set([
        'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture', 'cinematic-color-story',
        'surreal-scale', 'ghost-double-exposure', 'outdoor-masculine', 'harsh-sun-beauty',
        'product-page-clean', 'textured-prop', 'mouth-lips-editorial', 'dark-moody-editorial',
        'frozen-subject', 'micro-surreal', 'vehicle-lifestyle',
        'weather-drama', 'prop-power-play', 'skin-canvas', 'reaching-gesture',
        'power-stance', 'stacked-maximalist', 'sculptural-headpiece',
        'equestrian-luxury', 'pop-color-portrait', 'urban-glass-power',
        'artisan-at-work', 'bridal-trousseau', 'souk-editorial', 'heirloom-generational',
        'futuristic-chrome', 'submerged-beauty', 'surreal-material-fusion',
        'luxury-leather-editorial', 'monochrome-jewelry-ad',
    ]),

    _inferCategory(arch) {
        const id = (arch.id || '').toLowerCase();
        // Explicit category if archetype already has one
        if (arch.category) return arch.category.toLowerCase();
        // Watch archetypes
        if (id.startsWith('watch-') || id.includes('horology')) return 'watch';
        // Set archetypes
        if (id.startsWith('set-')) return 'set';
        // Mood/artistic (check before human since some overlap)
        if (this._MOOD_IDS.has(id)) return 'mood';
        // Organic/nature
        if (this._ORGANIC_IDS.has(id)) return 'organic';
        // Human/model
        if (this._HUMAN_IDS.has(id)) return 'human';
        // Product fallback (gradient-, product-, flat-lay, mirror-, minimalist-, etc.)
        return 'product';
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
            { id: 'watch-macro-horology',name: 'Horology Micro Engineering',category: 'watch',   tag: 'V3.0', tagline: 'Macro precision of guilloche dials and tourbillon',            icon: '⌚', desc: 'Ultra-sharp focus on sapphire crystal, chamfered bevels, and movement' },
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

    // ── Complete Modifier Data Sources (Synced with Master PromptStudio) ────
    _getAngles() {
        if (window.PromptStudio && typeof window.PromptStudio.angles !== 'undefined' && Array.isArray(window.PromptStudio.angles) && window.PromptStudio.angles.length > 0) {
            return window.PromptStudio.angles;
        }
        return [
            // Classic & Portrait
            { id: 'eye-level', label: 'Eye Level', group: 'Classic & Portrait' },
            { id: '45-degree', label: '45° Three-Quarter', group: 'Classic & Portrait' },
            { id: 'side-profile', label: 'Side Profile', group: 'Classic & Portrait' },
            { id: 'glance-down', label: 'Glance Down', group: 'Classic & Portrait' },
            { id: 'overhead', label: "Overhead / Bird's Eye", group: 'Classic & Portrait' },
            { id: 'low-angle', label: 'Low Angle (Hero)', group: 'Classic & Portrait' },
            { id: 'dutch', label: 'Dutch Angle', group: 'Classic & Portrait' },
            { id: 'over-shoulder', label: 'Over the Shoulder', group: 'Classic & Portrait' },
            { id: 'from-behind', label: 'From Behind (Nape)', group: 'Classic & Portrait' },
            // Macro & Product
            { id: 'macro', label: 'Macro Close-Up', group: 'Macro & Product' },
            { id: 'extreme-macro', label: 'Extreme Macro (Gem Facets)', group: 'Macro & Product' },
            { id: 'flat-lay', label: 'Flat Lay (Top-Down)', group: 'Macro & Product' },
            { id: 'knuckle-level', label: 'Knuckle Level (Table-Height)', group: 'Macro & Product' },
            // Cinematic & Trending
            { id: 'worms-eye', label: "Worm's Eye (Looking Up)", group: 'Cinematic & Atmospheric' },
            { id: 'silhouette', label: 'Silhouette (Backlit)', group: 'Cinematic & Atmospheric' },
            { id: 'golden-hour', label: 'Golden Hour (Rim Light)', group: 'Cinematic & Atmospheric' },
            { id: 'through-glass', label: 'Through Glass / Crystal', group: 'Cinematic & Atmospheric' },
            { id: 'candid', label: 'Candid / Stolen Moment', group: 'Cinematic & Atmospheric' },
            { id: 'tilt-shift', label: 'Tilt-Shift (Selective Plane)', group: 'Cinematic & Atmospheric' },
            // Editorial & High Fashion
            { id: 'top-down-hand', label: 'Top-Down Hand (Aerial Wrist)', group: 'Editorial & High Fashion' },
            { id: 'chin-up', label: 'Chin Up (Looking Down Lens)', group: 'Editorial & High Fashion' },
            { id: 'foreground-blur', label: 'Foreground Blur (Bokeh Frame)', group: 'Editorial & High Fashion' },
            { id: 'wind-blown', label: 'Wind-Blown (Field Motion)', group: 'Editorial & High Fashion' },
            { id: 'extreme-close-crop', label: 'Extreme Close Crop (Eyes Fill Frame)', group: 'Editorial & High Fashion' },
            { id: 'fabric-reveal', label: 'Fabric Reveal (Veil Pull)', group: 'Editorial & High Fashion' },
            { id: 'three-quarter-above', label: 'Three-Quarter Above (Diagonal Down)', group: 'Editorial & High Fashion' },
            // Artistic & Tactile Close-ups
            { id: 'mouth-bite', label: 'Mouth Bite (Lips & Jewelry)', group: 'Artistic & Tactile' },
            { id: 'neck-close-up', label: 'Neck Close-Up (Collarbone)', group: 'Artistic & Tactile' },
            { id: 'hand-on-face', label: 'Hand on Face (Touch Frame)', group: 'Artistic & Tactile' },
            { id: 'wrist-cross', label: 'Crossed Wrists (Stacked)', group: 'Artistic & Tactile' },
            { id: 'mirror-angle', label: 'Mirror Reflection Angle', group: 'Artistic & Tactile' },
            { id: 'upward-gaze', label: 'Upward Gaze (Sculptural Neck)', group: 'Artistic & Tactile' },
            // Environmental & Dynamic
            { id: 'frozen-in-crowd', label: 'Frozen in Crowd (Motion Blur)', group: 'Environmental & Dynamic' },
            { id: 'vehicle-frame', label: 'Vehicle Frame (Window/Door)', group: 'Environmental & Dynamic' },
            { id: 'profile-accessory', label: 'Profile + Accessory Stack', group: 'Environmental & Dynamic' },
            { id: 'macro-with-creature', label: 'Macro with Micro-Fauna', group: 'Environmental & Dynamic' },
            { id: 'through-windshield', label: 'Through Windshield (Car Interior)', group: 'Environmental & Dynamic' },
            { id: 'hands-toward-camera', label: 'Hands Toward Camera (Reaching)', group: 'Environmental & Dynamic' },
            { id: 'face-flora-frame', label: 'Face Flora Frame (Botanical Mask)', group: 'Environmental & Dynamic' },
            { id: 'watch-on-eye', label: 'Watch on Eye (Product Viewfinder)', group: 'Environmental & Dynamic' },
            { id: 'full-body-power', label: 'Full Body Power Stance', group: 'Environmental & Dynamic' },
            { id: 'hood-peek', label: 'Hood Peek (Fabric Slit)', group: 'Environmental & Dynamic' },
            // POV & Reflected
            { id: 'pov-ring-reach', label: 'POV Ring Reach (Toward Viewer)', group: 'POV & Power' },
            { id: 'grip-close-up', label: 'Grip Close-Up (Object in Hand)', group: 'POV & Power' },
            { id: 'playing-card-mirror', label: 'Playing Card Mirror (Symmetry)', group: 'POV & Power' },
            // Watch Exclusive
            { id: 'watch-wrist-roll', label: 'Wrist Roll (Dynamic Movement)', group: 'Watch Exclusive' },
            { id: 'watch-dial-macro', label: 'Dial & Complication Macro', group: 'Watch Exclusive' },
            { id: 'watch-crown-detail', label: 'Crown & Case Profile', group: 'Watch Exclusive' },
            { id: 'watch-steering-wheel', label: 'On Steering Wheel (POV Drive)', group: 'Watch Exclusive' },
        ];
    },

    _getLightingMoods() {
        // Always use local categorized list — master lightingMoods lacks .category field
        // which is required for the lighting filter chip UI to work correctly.
        return [
            // Natural
            { id: 'natural', label: 'Natural Daylight (Window)', category: 'natural' },
            { id: 'golden-hour', label: 'Golden Hour Sunlight', category: 'natural' },
            { id: 'dappled', label: 'Dappled Sunlight (Flora)', category: 'natural' },
            { id: 'harsh-sun', label: 'Harsh Sun High-Noon', category: 'natural' },
            { id: 'overcast', label: 'Soft Overcast Diffused', category: 'natural' },
            { id: 'window-light', label: 'Window Light (Side Fill)', category: 'natural' },
            { id: 'blue-hour', label: 'Blue Hour (Twilight)', category: 'natural' },
            { id: 'candlelight', label: 'Candlelight Warm Ambient', category: 'natural' },
            // Studio
            { id: 'editorial', label: 'Editorial & Sharp Studio', category: 'studio' },
            { id: 'studio', label: 'Clean High-Key Studio', category: 'studio' },
            { id: 'soft', label: 'Soft & Romantic Softbox', category: 'studio' },
            { id: 'warm', label: 'Warm & Inviting Studio', category: 'studio' },
            { id: 'cool', label: 'Cool & Modern Platinum', category: 'studio' },
            { id: 'backlit', label: 'Backlit / Rim Light', category: 'studio' },
            { id: 'split-light', label: 'Split Lighting (50/50)', category: 'studio' },
            { id: 'hard-flash', label: 'Hard Flash / Paparazzi', category: 'studio' },
            { id: 'solid-color-backdrop', label: 'Solid Color Backdrop (Power)', category: 'studio' },
            { id: 'crimson-studio', label: 'Crimson Studio (Red Backdrop)', category: 'studio' },
            // Cinematic & Dramatic
            { id: 'dramatic', label: 'Dramatic Shadows', category: 'cinematic' },
            { id: 'chiaroscuro', label: 'Chiaroscuro (Rembrandt)', category: 'cinematic' },
            { id: 'surreal', label: 'Surreal & Dreamy', category: 'cinematic' },
            { id: 'mystical', label: 'Mystical & Dark', category: 'cinematic' },
            { id: 'candid', label: 'Candid & Lifestyle', category: 'cinematic' },
            { id: 'avant-garde', label: 'Avant-Garde Fashion', category: 'cinematic' },
            { id: 'neon-glow', label: 'Neon Glow Color Gel', category: 'cinematic' },
            { id: 'neon-tube-glow', label: 'Neon Tube Glow (Club/Bar)', category: 'cinematic' },
            { id: 'neon-bar-warm', label: 'Neon Bar Warm (Amber Tubes)', category: 'cinematic' },
            // Atmospheric
            { id: 'shimmer-particle', label: 'Shimmer Particles (Skin Glow)', category: 'atmospheric' },
            { id: 'transit-streak', label: 'Transit Streak (Motion Light)', category: 'atmospheric' },
            { id: 'rain-diffused', label: 'Rain Diffused (Wet Atmosphere)', category: 'atmospheric' },
            { id: 'color-gel-backlit', label: 'Color Gel Backlit (Vivid Rim)', category: 'atmospheric' },
            { id: 'bronzed-beauty', label: 'Bronzed Beauty (Skin Glow)', category: 'atmospheric' },
            // Reflective & Horology
            { id: 'chrome-bounce', label: 'Chrome Bounce (Reflective Metal)', category: 'special' },
            { id: 'chrome-wrap', label: 'Chrome Wrap Light (360° Reflection)', category: 'special' },
            { id: 'submerged-diffused', label: 'Submerged Diffused (Underwater)', category: 'special' },
            { id: 'leather-highlight', label: 'Leather Highlight (Specular)', category: 'special' },
            { id: 'sapphire-crystal-bounce', label: 'Sapphire Crystal Bounce (Anti-Glare)', category: 'special' },
            { id: 'lume-glow-dark', label: 'Luminescent Glow (Low Light)', category: 'special' },
            { id: 'metallic-case-contrast', label: 'Metallic Case Contrast (Steel/Gold)', category: 'special' },
        ];
    },

    _getCameraProfiles() {
        // Extended lens library — always use local list for consistent labeling
        return [
            { id: 'auto',            label: 'Auto (Angle Driven)',            desc: 'Camera choice driven by optimal archetype angle' },
            { id: 'hasselblad-85',   label: '✦ Hasselblad 85mm Medium Format', desc: 'Exceptional tonal gradation, film-like depth, creamy skin tones' },
            { id: 'leica-50',        label: 'Leica 50mm Summilux f/1.4',      desc: 'Classic reportage rendering, natural unforced perspective, timeless' },
            { id: 'sony-35-gm',      label: 'Sony 35mm f/1.4 G-Master',       desc: 'Slightly wider environment inclusion, modern sharp rendering' },
            { id: 'canon-135-l',     label: 'Canon 135mm f/2L',               desc: 'Telephoto compression, buttery bokeh, subject pop' },
            { id: 'macro-100',       label: '100mm f/2.8 Macro',              desc: 'Razor-thin depth of field, individual stone settings and metal grain' },
            { id: 'macro-180',       label: '180mm f/3.5 Super Macro',        desc: '2:1 extreme magnification, hallmark stamps, micro gem facets' },
            { id: 'anamorphic-40',   label: 'Anamorphic 40mm',                desc: 'Horizontal blue flares, cinematic oval bokeh, widescreen feel' },
            { id: 'phase-one-iq4',   label: 'Phase One IQ4 150MP',            desc: 'Extraordinary color depth and resolution, luxury catalog perfection' },
            { id: 'nikon-z9-85',     label: 'Nikon Z9 85mm f/1.8 S',          desc: 'Ultra-fast mirrorless AF, clinical sharpness, exceptional skin rendering' },
            { id: 'fuji-gfx-110',    label: 'Fujifilm GFX 100S 110mm',        desc: '102MP medium format, film-like analog color science, vast dynamic range' },
            { id: 'zeiss-otus-55',   label: 'Zeiss Otus 55mm APO',            desc: 'Apochromatic zero chromatic aberration, scientific gem facet precision' },
            { id: 'tilt-shift-90',   label: 'Tilt-Shift 90mm TS-E',           desc: 'Selective focus plane, miniature editorial effect, rising front movements' },
            { id: 'sigma-85-art',    label: 'Sigma 85mm f/1.4 Art',           desc: 'Ultra-wide f/1.4 aperture, silky bokeh balls, portrait compression' },
            { id: 'voigtlander-75',  label: 'Voigtländer 75mm f/1.5',         desc: 'Vintage optical character, warm bokeh, classic analog rendering' },
        ];
    },

    _getSurfaces() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.surfaces) && window.PromptStudio.surfaces.length > 0) {
            // Prepend AI Chooses if not already present
            const base = window.PromptStudio.surfaces;
            if (!base.find(s => s.id === 'ai-choice')) {
                return [{ id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' }, ...base];
            }
            return base;
        }
        return [
            { id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' },
            { id: 'none', label: 'Default (Archetype Setting)' },
            { id: 'marble', label: 'Polished Carrara Marble' },
            { id: 'velvet', label: 'Midnight Crushed Velvet' },
            { id: 'sand', label: 'Fine Sahara Sand' },
            { id: 'concrete', label: 'Raw Architectural Concrete' },
            { id: 'water', label: 'Water Surface & Caustic Reflections' },
            { id: 'silk', label: 'Draped Pure Mulberry Silk' },
            { id: 'skin', label: 'Bare Warm Skin Canvas' },
            { id: 'stone-wall', label: 'Weathered Natural Stone Wall' },
            { id: 'wood', label: 'Raw Untreated Wood Grain' },
            { id: 'terracotta', label: 'Traditional Terracotta / Zellige' },
            { id: 'mirrored-glass', label: 'Sharp Mirrored Glass' },
            { id: 'satin', label: 'Smooth Lustrous Satin Fabric' },
            { id: 'linen', label: 'Textured Raw Linen / Burlap' },
            { id: 'ice', label: 'Frozen Ice & Crystalline Surface' },
            { id: 'petals', label: 'Rose & Jasmine Petals Scattered' },
            { id: 'obsidian', label: 'Polished Black Obsidian Stone' },
        ];
    },

    _getPalettes() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.palettes) && window.PromptStudio.palettes.length > 0) {
            const base = window.PromptStudio.palettes;
            if (!base.find(p => p.id === 'ai-choice')) {
                return [{ id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' }, ...base];
            }
            return base;
        }
        return [
            { id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' },
            { id: 'auto', label: 'Auto / Scene Matched' },
            { id: 'neutral', label: 'Neutral Beige & Warm Cream' },
            { id: 'warm-earth', label: 'Warm Earth (Amber & Terracotta)' },
            { id: 'cool-steel', label: 'Cool Steel & Platinum Blue' },
            { id: 'monochrome', label: 'Monochrome Black & Silver' },
            { id: 'jewel-tones', label: 'Rich Royal Jewel Tones' },
            { id: 'deep-ocean', label: 'Deep Ocean Navy & Emerald' },
            { id: 'blush-rose', label: 'Soft Blush & Dusty Rose' },
            { id: 'noir', label: 'Cinematic High-Contrast Film Noir' },
            { id: 'desert-gold', label: 'Desert Gold & Sandy Copper' },
            { id: 'forest-green', label: 'Forest Moss & Sage Green' },
            { id: 'amethyst', label: 'Amethyst Purple & Lavender' },
        ];
    },

    _getStylings() {
        if (window.PromptStudio && Array.isArray(window.PromptStudio.stylings) && window.PromptStudio.stylings.length > 0) {
            const base = window.PromptStudio.stylings;
            if (!base.find(s => s.id === 'ai-choice')) {
                return [{ id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' }, ...base];
            }
            return base;
        }
        return [
            { id: 'ai-choice', label: '✦ AI Chooses (Max Diversity)' },
            { id: 'auto', label: 'Auto / Scene Matched' },
            { id: 'minimal', label: 'Minimal / Nude Skin Canvas' },
            { id: 'black-dress', label: 'Elegant Black Dress / Tuxedo' },
            { id: 'silk-cami', label: 'Fitted Silk Camisole / Silk Shirt' },
            { id: 'blazer', label: 'Tailored Power Suit / Wool Blazer' },
            { id: 'caftan', label: 'Traditional Moroccan Caftan' },
            { id: 'white-shirt', label: 'Crisp White Button-Down Shirt' },
            { id: 'evening-gown', label: 'Floor-Length Red Carpet Gown' },
            { id: 'streetwear', label: 'Elevated Luxury Streetwear' },
            { id: 'linen-set', label: 'Relaxed Linen Co-ord Set' },
            { id: 'leather-jacket', label: 'Leather Moto Jacket & Jeans' },
            { id: 'abaya', label: 'Embellished Luxury Abaya' },
            { id: 'bikini-resort', label: 'Resort Swimwear & Cover-Up' },
        ];
    },

    // ── New v10 Data Getters ────────────────────────────────────
    _getBodyFocusOptions() {
        return [
            { id: 'auto',         label: '✦ AI Chooses (Max Diversity)' },
            { id: 'wrist-hand',   label: '✋ Wrist & Hand (Ring / Bracelet)' },
            { id: 'neck-collar',  label: '🦢 Neck & Collarbone (Necklace)' },
            { id: 'ear-face',     label: '👂 Ear & Side Profile (Earrings)' },
            { id: 'finger-close', label: '💍 Finger Close-Up (Ring)' },
            { id: 'full-body',    label: '🧍 Full Body Editorial Stance' },
            { id: 'face-close',   label: '👁 Face Close-Up (Lash / Eye)' },
            { id: 'torso',        label: '💫 Torso / Décolletage (Pendant)' },
            { id: 'ankle-foot',   label: '🦵 Ankle & Foot (Anklet)' },
            { id: 'silhouette',   label: '🌑 Full Silhouette (Atmosphere)' },
        ];
    },

    _getDOFOptions() {
        return [
            { id: 'auto',           label: '✦ AI / Archetype Driven' },
            { id: 'razor-thin',     label: 'Razor-Thin (f/1.4–f/2.8) — Dreamy Gem Isolation' },
            { id: 'shallow',        label: 'Shallow (f/2.8–f/4) — Subject Pop' },
            { id: 'moderate',       label: 'Moderate (f/4–f/5.6) — Balanced Detail' },
            { id: 'deep',           label: 'Deep (f/8–f/11) — Environmental Context' },
            { id: 'macro-extreme',  label: 'Macro Extreme (f/16–f/22) — Full Gem Facet Sharpness' },
            { id: 'tilt-plane',     label: 'Tilt-Shift Plane — Selective Focus Line' },
        ];
    },

    _getISOOptions() {
        return [
            { id: 'auto',        label: '✦ AI / Scene Driven' },
            { id: 'iso-50',      label: 'ISO 50 — Studio Perfection (Noiseless)' },
            { id: 'iso-100',     label: 'ISO 100 — Tripod Studio / Daylight' },
            { id: 'iso-200',     label: 'ISO 200 — Bright Natural Light' },
            { id: 'iso-400',     label: 'ISO 400 — Versatile Ambient' },
            { id: 'iso-800',     label: 'ISO 800 — Soft Indoor / Shade' },
            { id: 'iso-1600',    label: 'ISO 1600 — Atmospheric / Low Light' },
            { id: 'iso-3200',    label: 'ISO 3200 — Cinematic Grain & Mood' },
            { id: 'iso-6400',    label: 'ISO 6400+ — Raw Grain Aesthetic' },
        ];
    },

    _getFilmStyleOptions() {
        return [
            { id: 'auto',           label: '✦ AI Chooses (Max Diversity)' },
            { id: 'clean-digital',  label: 'Clean Digital — Modern Sharp Clarity' },
            { id: 'analog-film',    label: 'Analog Film — Kodak Portra 400 Grain' },
            { id: 'faded-vintage',  label: 'Faded Vintage — Desaturated 70s Tones' },
            { id: 'teal-orange',    label: 'Teal & Orange — Cinematic Hollywood Grade' },
            { id: 'high-contrast',  label: 'High Contrast — Ink-Black Shadows' },
            { id: 'matte-lift',     label: 'Matte Lift — Lifted Blacks, Soft Tones' },
            { id: 'bleach-bypass',  label: 'Bleach Bypass — Desaturated Silver Halide' },
            { id: 'cross-process',  label: 'Cross-Process — Vivid Color Shift' },
            { id: 'infrared',       label: 'Infrared — Ethereal White Foliage Glow' },
        ];
    },

    _getEnvironmentOptions() {
        return [
            { id: 'auto',              label: '✦ AI Chooses (Max Diversity)' },
            { id: 'studio-infinity',   label: '🎥 Studio Infinity Wall' },
            { id: 'rooftop',           label: '🏙 Urban Rooftop (City Skyline)' },
            { id: 'desert-dunes',      label: '🏜 Desert Dunes (Sahara / Arabia)' },
            { id: 'moroccan-riad',     label: '🕌 Moroccan Riad & Zellige Tiles' },
            { id: 'botanical-garden',  label: '🌿 Lush Botanical Garden' },
            { id: 'marble-palace',     label: '🏛 Marble Palace Interior' },
            { id: 'ocean-shore',       label: '🌊 Ocean Shore & Sea Foam' },
            { id: 'dark-hotel-suite',  label: '🛋 Dark Luxury Hotel Suite' },
            { id: 'forest-mist',       label: '🌲 Misty Forest Floor' },
            { id: 'souq-market',       label: '🛍 Vibrant Souq / Night Market' },
            { id: 'glass-greenhouse',  label: '🪴 Glass Greenhouse (Tropical)' },
            { id: 'car-interior',      label: '🚗 Luxury Car Interior' },
            { id: 'art-gallery',       label: '🖼 Minimalist Art Gallery' },
        ];
    },

    _getMoodIntensityOptions() {
        return [
            { id: 'balanced',   label: 'Balanced — Natural Campaign Tone' },
            { id: 'subtle',     label: 'Subtle — Soft & Understated Elegance' },
            { id: 'dramatic',   label: 'Dramatic — High Contrast Tension' },
            { id: 'cinematic',  label: 'Cinematic — Movie-Grade Atmosphere' },
            { id: 'ethereal',   label: 'Ethereal — Dreamy Soft Light Haze' },
            { id: 'raw',        label: 'Raw — Unfiltered Gritty Realism' },
            { id: 'opulent',    label: 'Opulent — Over-the-Top Luxury Richness' },
        ];
    },

    _getSeasonTimeOptions() {
        return [
            { id: 'auto',             label: '✦ AI Chooses (Max Diversity)' },
            { id: 'golden-hour',      label: '🌅 Golden Hour (Warm Dusk)' },
            { id: 'blue-hour',        label: '🌆 Blue Hour (Twilight)' },
            { id: 'midday-sun',       label: '☀ High Noon (Harsh Sunlight)' },
            { id: 'overcast-day',     label: '🌥 Overcast Day (Diffused)' },
            { id: 'night-ambient',    label: '🌙 Night Ambient (Artificial Light)' },
            { id: 'spring-bloom',     label: '🌸 Spring Bloom (Soft Pastels)' },
            { id: 'summer-vivid',     label: '🌿 Summer Vivid (Saturated)' },
            { id: 'autumn-warm',      label: '🍂 Autumn Warmth (Orange & Gold)' },
            { id: 'winter-frost',     label: '❄ Winter Frost (Cool & Crisp)' },
            { id: 'pre-dawn',         label: '🌃 Pre-Dawn (Dark Blue Stillness)' },
        ];
    },

    _getHijabStyles() {
        return [
            { id: 'classic', label: 'Classic Draped' },
            { id: 'draped', label: 'Draped Silk' },
            { id: 'turban', label: 'Fashion Turban' },
            { id: 'niqab', label: 'Niqab ✦' },
            { id: 'modern', label: 'Modern Minimal' },
            { id: 'sheer-veil', label: 'Sheer Veil' },
        ];
    },

    _getBrandTouches() {
        return [
            { id: 'logomark', label: '⭐ Four-Pointed Star Brooch (Lapel Pin)' },
            { id: 'wordmark', label: 'ELARIS Wordmark Embroidered on Garment' },
            { id: 'logo-embedded', label: '🖼️ Logo Embedded (Luxury Campaign Composited)' },
        ];
    },

    _getEthnicities() {
        return [
            { id: 'diverse', label: 'Diverse / Global Appeal (Randomized)' },
            { id: 'fair', label: 'Light / Fair Ivory Skin' },
            { id: 'olive', label: 'Mediterranean Olive Skin' },
            { id: 'warm', label: 'Warm / Sun-Kissed Golden Tan' },
            { id: 'caramel', label: 'Caramel Bronze Complexion' },
            { id: 'deep', label: 'Deep / Rich Espresso Brown' },
        ];
    },

    _getFacialExpressions() {
        return [
            { id: 'none', label: 'Neutral / Editorial Poised' },
            { id: 'serene', label: 'Serene & Peaceful' },
            { id: 'smile', label: 'Subtle Confident Smile' },
            { id: 'joy', label: 'Radiant Joy / Soft Laugh' },
            { id: 'intense', label: 'Intense & Piercing Editorial Gaze' },
            { id: 'sultry', label: 'Sultry & Dramatic' },
            { id: 'thoughtful', label: 'Thoughtful & Contemplative' },
        ];
    },

    // ── Scoring Algorithm for Top 10 Archetypes ──────────────────
    // Uses each archetype's actual `compat` data (30–95 range per piece type)
    // instead of generic keyword matching. Adds small contextual bonuses.
    _calculateArchetypeScore(arch) {
        const cat = this.state.category;
        const archId = (arch.id || '').toLowerCase();

        // ── 1. Base score from compat data (the real numbers) ──
        let score = 50; // default if no compat data
        if (arch.compat) {
            // Map category IDs to compat keys
            const compatKey = {
                'ring': 'ring',
                'necklace': 'necklace',
                'pendant': 'pendant',
                'bracelet': 'bracelet',
                'earrings': 'earrings',
                'bangle': 'bangles',
                'bangles': 'bangles',
                'anklet': 'anklet',
                'brooch': 'brooch',
                'body-jewelry': 'body-jewelry',
                'jewelry-set': 'jewelry-set',
                'watch': 'watch',
            }[cat] || cat;

            if (arch.compat[compatKey] !== undefined) {
                score = arch.compat[compatKey];
            } else if (arch.compat[cat] !== undefined) {
                score = arch.compat[cat];
            } else {
                // No compat entry for this piece type — infer from archetype category
                const inferredCat = this._inferCategory(arch);
                if (inferredCat === 'watch' && cat !== 'watch') score = 30;
                else if (inferredCat === 'set' && cat !== 'jewelry-set') score = 35;
                else if (cat === 'watch' && inferredCat !== 'watch') score = 25;
                else score = 45;
            }
        }

        // ── 2. Contextual bonuses (small, additive) ──
        // Gender synergy
        if (this.state.modelGender === 'male' && (archId.includes('masculine') || archId.includes('outdoor-masculine'))) score += 5;
        if (this.state.modelGender === 'none') {
            const inferredCat = this._inferCategory(arch);
            if (inferredCat === 'product' || inferredCat === 'organic') score += 3;
        }

        // Stone synergy — macro/detail archetypes benefit from gemstones
        if (this.state.stone !== 'none' && (archId.includes('macro') || archId.includes('gradient') || archId.includes('detail'))) score += 3;

        // Hijab synergy
        if (this.state.hijabi && (archId.includes('veiled') || archId.includes('heritage') || archId.includes('bridal'))) score += 4;

        // Currently selected archetype gets a tiny boost for UI stability
        if (this.state.archetypeId === arch.id) score += 2;

        return Math.min(99, Math.max(25, Math.round(score)));
    },

    _getTop10Archetypes() {
        const all = this._getArchetypes();
        const scored = all.map(arch => ({ arch, score: this._calculateArchetypeScore(arch) }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 10);
    },

    // ── Smart Guide Database ────────────────────────────────────
    _getGuideData(archId) {
        // 1. Try window.PromptStudio._getGuideDB() — returns full data (angle+lighting+camera+tips)
        //    once renderSmartGuide has run; returns lighting-only before that.
        if (window.PromptStudio && typeof window.PromptStudio._getGuideDB === 'function') {
            const db = window.PromptStudio._getGuideDB();
            const entry = db[archId];
            // Only use if it has the full data (not just lighting)
            if (entry && entry.tips && entry.tips.length > 0 && entry.angle) {
                return entry;
            }
        }
        // 2. Also try the cached guideDB property (set after renderSmartGuide runs)
        if (window.PromptStudio && window.PromptStudio.guideDB && window.PromptStudio.guideDB[archId]) {
            const entry = window.PromptStudio.guideDB[archId];
            if (entry && entry.tips && entry.tips.length > 0) return entry;
        }
        // 3. Built-in detailed fallbacks for most common archetypes
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
                lighting: ['studio', 'soft-box', 'editorial'],
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
        if (fallbacks[archId]) return fallbacks[archId];

        // 4. Smart category-based fallback — uses _inferCategory() since arch.category is often empty
        const arch = this._getArchetypes().find(a => a.id === archId);
        const cat  = arch ? this._inferCategory(arch) : 'product';
        const id   = archId.toLowerCase();
        const name = arch ? arch.name : archId;

        if (cat === 'human') {
            return { angle: ['eye-level','45-degree','chin-up'], lighting: ['editorial','studio','dramatic'], camera: ['hasselblad-85','canon-135-l','leica-50'],
                tips: [`${name} calls for strong editorial energy — model front and center with intentional posing.`, 'Hasselblad 85mm delivers medium-format luxury depth and flattering skin tones.', 'Try Dramatic or Studio lighting for the crispest gem-to-skin contrast.'] };
        }
        if (cat === 'product') {
            return { angle: ['45-degree','flat-lay','overhead'], lighting: ['studio','soft-box','editorial'], camera: ['phase-one-iq4','hasselblad-85','macro-100'],
                tips: [`${name} excels in clean product-focused compositions — no model distractions.`, 'Phase One IQ4 150MP captures microscopic surface textures and gem facets with extraordinary clarity.', 'Pair with a Color Palette and Surface Material for a cohesive, branded look.'] };
        }
        if (cat === 'organic') {
            return { angle: ['macro','eye-level','knuckle-level'], lighting: ['natural','dappled','soft-box'], camera: ['macro-100','hasselblad-85','sony-35-gm'],
                tips: [`${name} thrives with organic textures — dew, petals, or natural stone as the canvas.`, 'Macro 100mm f/2.8 reveals the tension and luminosity of water droplets and leaf surfaces.', 'Use Natural Daylight or Dappled Sunlight for the most authentic botanical atmosphere.'] };
        }
        if (cat === 'mood') {
            return { angle: ['flat-lay','low-angle','side-profile'], lighting: ['dramatic','chiaroscuro','candlelight'], camera: ['leica-50','sony-35-gm','anamorphic-40'],
                tips: [`${name} is built for atmosphere — lean into contrast, shadow, and texture.`, 'Anamorphic 40mm adds subtle cinematic flares that enhance the moody editorial quality.', 'Set Model to None for pure silhouette and shadow art compositions.'] };
        }
        if (cat === 'set') {
            return { angle: ['flat-lay','overhead','from-behind'], lighting: ['studio','editorial','soft-box'], camera: ['hasselblad-85','phase-one-iq4','canon-135-l'],
                tips: [`${name} showcases a coordinated jewelry suite — arrange pieces with intentional spacing.`, 'Flat Lay Top-Down gives the clearest overview of the full set composition.', 'Use Hasselblad 85mm to maintain equal focal clarity across all pieces simultaneously.'] };
        }
        if (cat === 'watch') {
            return { angle: ['45-degree','macro','extreme-macro'], lighting: ['studio','editorial','directional'], camera: ['macro-100','phase-one-iq4','hasselblad-85'],
                tips: [`${name} demands precision — focus on the dial, indices, and movement with razor sharpness.`, 'Macro 100mm reveals guilloche patterns, applied indices, and sapphire crystal reflections.', 'Directional or Studio lighting creates the classic horological product photography look.'] };
        }
        // Generic fallback
        return {
            angle: ['45-degree', 'eye-level'],
            lighting: ['studio', 'editorial'],
            camera: ['hasselblad-85', 'macro-100'],
            tips: [
                `${name} — calibrated for optimal jewelry clarity and cinematic lighting balance.`,
                'Use 85mm or 100mm Macro lens for premium shallow depth of field.',
                'Adjust Color Palette and Surface to match the creative vision.',
            ]
        };
    },

    // ── Build Prompt Logic ──────────────────────────────────────
    // ── Aspect Ratio ↔ Format ID mapping (master _buildPrompt uses format ID) ────
    _AR_TO_FORMAT: { '1:1':'square','4:5':'portrait','9:16':'story','16:9':'landscape','2:3':'pinterest','3:4':'portrait-3-4','21:9':'landscape' },

    // ── DOF recommendation based on guide data ─────────────────────────────────
    _getGuideDOF(guideData) {
        const cam = (guideData.camera && guideData.camera[0]) || '';
        if (cam.includes('macro')) return 'Razor-Thin (f/2.8–f/5.6)';
        if (cam === 'hasselblad-85' || cam === 'canon-135-l' || cam === 'sigma-85-art') return 'Shallow (f/1.4–f/2.8)';
        if (cam === 'phase-one-iq4' || cam === 'fuji-gfx-110') return 'Medium (f/4–f/8)';
        if (cam === 'anamorphic-40' || cam === 'sony-35-gm') return 'Environmental (f/2–f/4)';
        return 'Moderate (f/2.8–f/5.6)';
    },

    // ── ISO recommendation based on archetype category ─────────────────────────
    _getGuideISO(arch) {
        const cat = this._inferCategory(arch);
        if (cat === 'product') return 'ISO 50–100 (Tripod)';
        if (cat === 'organic') return 'ISO 100–400';
        if (cat === 'watch')   return 'ISO 50–200 (Tripod)';
        if (cat === 'mood')    return 'ISO 400–1600';
        if (cat === 'human')   return 'ISO 100–800';
        return 'ISO 100–400';
    },

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
                    // Fix: master _buildPrompt reads state.format (e.g. 'square') not state.aspectRatio ('1:1')
                    // Convert the beta's aspectRatio chip value back to the format ID the master expects
                    ps.format              = this._AR_TO_FORMAT[this.state.aspectRatio] || this.state.format || 'square';
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

        // Surface — AI Chooses signals open creative freedom
        if (this.state.surface === 'ai-choice') {
            parts.push('surface and backdrop: AI-selected for maximum visual diversity and uniqueness');
        } else if (this.state.surface && this.state.surface !== 'none') {
            parts.push(`Resting on an artisanal ${this.state.surface.replace(/-/g, ' ')} backdrop`);
        }

        // Palette — AI Chooses
        if (this.state.palette === 'ai-choice') {
            parts.push('color grading: AI-selected unique campaign palette for maximum diversity');
        } else if (this.state.palette && this.state.palette !== 'auto') {
            parts.push(`Curated ${this.state.palette.replace(/-/g, ' ')} color harmony`);
        }

        // Styling — AI Chooses
        if (this.state.styling === 'ai-choice' && this.state.modelGender !== 'none') {
            parts.push('wardrobe and outfit: AI-selected unique editorial styling for maximum diversity');
        }

        // Body Part Focus (v10)
        if (this.state.bodyFocus && this.state.bodyFocus !== 'auto') {
            const focusMap = {
                'wrist-hand': 'primary focus on wrist and hand', 'neck-collar': 'primary focus on neck and collarbone',
                'ear-face': 'primary focus on ear and side profile', 'finger-close': 'extreme close-up on finger and ring',
                'full-body': 'full body editorial composition', 'face-close': 'intimate face and eye close-up',
                'torso': 'torso and décolletage as primary canvas', 'ankle-foot': 'ankle and foot in sharp focus',
                'silhouette': 'atmospheric full-body silhouette composition',
            };
            parts.push(focusMap[this.state.bodyFocus] || this.state.bodyFocus.replace(/-/g, ' '));
        }

        // Environment (v10)
        if (this.state.environment && this.state.environment !== 'auto') {
            const envMap = {
                'studio-infinity': 'photographed in a clean studio with seamless infinity wall background',
                'rooftop': 'shot on an urban luxury rooftop with glittering city skyline behind',
                'desert-dunes': 'set against sweeping golden Sahara desert dunes at dusk',
                'moroccan-riad': 'interior of a traditional Moroccan riad with ornate zellige tilework',
                'botanical-garden': 'surrounded by lush botanical garden tropical foliage',
                'marble-palace': 'inside a grand marble palace with high ceilings and columns',
                'ocean-shore': 'shot at the ocean shoreline with waves and sea foam',
                'dark-hotel-suite': 'inside a moody dark luxury hotel suite with ambient candlelight',
                'forest-mist': 'deep in a misty ancient forest with dappled light through canopy',
                'souq-market': 'vibrant colorful souq or night market setting',
                'glass-greenhouse': 'inside a tropical glass greenhouse with lush green plants',
                'car-interior': 'inside a luxury sports car interior with leather and chrome',
                'art-gallery': 'inside a minimalist white-walled art gallery space',
            };
            parts.push(envMap[this.state.environment] || `environment: ${this.state.environment.replace(/-/g, ' ')}`);
        }

        // Season & Time of Day (v10)
        if (this.state.seasonTime && this.state.seasonTime !== 'auto') {
            const stMap = {
                'golden-hour': 'during golden hour with warm amber sunlight and long shadows',
                'blue-hour': 'at blue hour twilight with cool indigo ambient glow',
                'midday-sun': 'under harsh high-noon direct sunlight with sharp shadows',
                'overcast-day': 'on an overcast day with diffused soft shadowless light',
                'night-ambient': 'at night lit by artificial ambient and neon light sources',
                'spring-bloom': 'in spring bloom with soft pastel floral atmosphere',
                'summer-vivid': 'in peak summer with vivid saturated colors and warm haze',
                'autumn-warm': 'in autumn warmth with rich amber gold and terracotta tones',
                'winter-frost': 'in winter frost with crisp cool blue-white atmosphere',
                'pre-dawn': 'in pre-dawn dark blue stillness before sunrise',
            };
            parts.push(stMap[this.state.seasonTime] || this.state.seasonTime.replace(/-/g, ' '));
        }

        // Mood Intensity (v10)
        if (this.state.moodIntensity && this.state.moodIntensity !== 'balanced') {
            const moodMap = {
                'subtle': 'subtle understated elegance, quiet luxury, whispered sophistication',
                'dramatic': 'dramatic high-contrast scene with intense emotional tension',
                'cinematic': 'cinematic movie-grade atmosphere with masterful visual storytelling',
                'ethereal': 'ethereal dreamy haze with soft light diffusion and otherworldly glow',
                'raw': 'raw unfiltered gritty realism, authentic and unretouched energy',
                'opulent': 'over-the-top opulent richness, extravagant maximalist luxury',
            };
            parts.push(moodMap[this.state.moodIntensity] || this.state.moodIntensity);
        }

        // DOF (v10)
        if (this.state.dof && this.state.dof !== 'auto') {
            const dofMap = {
                'razor-thin': 'razor-thin depth of field f/1.4–f/2.8 with extreme background blur',
                'shallow': 'shallow depth of field f/2.8–f/4 with creamy bokeh subject separation',
                'moderate': 'moderate depth of field f/4–f/5.6 with balanced foreground and background detail',
                'deep': 'deep depth of field f/8–f/11 with sharp environmental context throughout frame',
                'macro-extreme': 'macro depth of field f/16–f/22 with maximum gem facet sharpness',
                'tilt-plane': 'tilt-shift selective focus plane with miniature editorial effect',
            };
            parts.push(dofMap[this.state.dof] || this.state.dof.replace(/-/g, ' '));
        }

        // ISO (v10)
        if (this.state.isoRange && this.state.isoRange !== 'auto') {
            const isoMap = {
                'iso-50': 'ISO 50 noiseless tripod studio perfection',
                'iso-100': 'ISO 100 tripod daylight pristine clarity',
                'iso-200': 'ISO 200 bright natural light clean render',
                'iso-400': 'ISO 400 versatile ambient balanced exposure',
                'iso-800': 'ISO 800 soft indoor warm ambient glow',
                'iso-1600': 'ISO 1600 atmospheric low light subtle grain',
                'iso-3200': 'ISO 3200 cinematic visible grain moody texture',
                'iso-6400': 'ISO 6400 heavy grain raw aesthetic intentional noise',
            };
            parts.push(isoMap[this.state.isoRange] || this.state.isoRange);
        }

        // Film Style (v10)
        if (this.state.filmStyle && this.state.filmStyle !== 'auto') {
            const filmMap = {
                'clean-digital': 'clean sharp modern digital rendering',
                'analog-film': 'Kodak Portra 400 analog film grain, warm halation, gentle color shift',
                'faded-vintage': 'faded vintage desaturated 1970s photography aesthetic',
                'teal-orange': 'teal and orange Hollywood cinematic color grade',
                'high-contrast': 'high contrast deep ink-black shadows and blown-out highlights',
                'matte-lift': 'lifted blacks matte finish soft tone grade',
                'bleach-bypass': 'bleach bypass desaturated silver halide reduced saturation',
                'cross-process': 'cross-process vivid unexpected color shift',
                'infrared': 'infrared photography ethereal white foliage luminous glow',
            };
            parts.push(filmMap[this.state.filmStyle] || this.state.filmStyle.replace(/-/g, ' '));
        }

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

    // ── Filter Archetypes Helper ─────────────────────────────────
    _filterArchetypes(all, category, search) {
        let filtered = all.filter(a => {
            const archCat = this._inferCategory(a);
            const catLower = category.toLowerCase();
            const matchesCat = catLower === 'all' ||
                archCat === catLower ||
                (catLower === 'sets'    && (archCat === 'set'   || archCat === 'sets'))    ||
                (catLower === 'watches' && (archCat === 'watch' || archCat === 'watches')) ||
                (catLower === 'human'   && archCat === 'human') ||
                (catLower === 'product' && archCat === 'product') ||
                (catLower === 'organic' && archCat === 'organic') ||
                (catLower === 'mood'    && archCat === 'mood');
            const matchesSearch = !search ||
                (a.name    && a.name.toLowerCase().includes(search))    ||
                (a.tagline && a.tagline.toLowerCase().includes(search)) ||
                (a.desc    && a.desc.toLowerCase().includes(search))    ||
                (a.id      && a.id.toLowerCase().includes(search));
            const matchesV3 = !this.state.modalV3Only || (a.tag && a.tag.includes('V3'));
            return matchesCat && matchesSearch && matchesV3;
        });
        if (this.state.modalSortAZ) {
            filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
        return filtered;
    },

    // ── Partial: Update carousel active state only (no re-render) ─
    _updateCarouselActive() {
        const top10 = this._getTop10Archetypes();
        this.container.querySelectorAll('.psb-arch-card').forEach(card => {
            const isActive = card.dataset.id === this.state.archetypeId;
            card.classList.toggle('active', isActive);
            const badge = card.querySelector('.psb-arch-score-badge');
            const ring  = card.querySelector('.psb-ring-fill');
            const found = top10.find(({ arch }) => arch.id === card.dataset.id);
            if (found) {
                const sc = found.score;
                const color = sc >= 85 ? '#34d399' : sc >= 75 ? '#fbbf24' : '#94a3b8';
                if (badge) { badge.textContent = `${sc}% Match`; badge.style.color = color; }
                if (ring)  ring.style.stroke = color;
            }
        });
        // Scroll carousel track horizontally to active card — no page scroll
        const track      = this.container.querySelector('#psb-carousel-track');
        const activeCard = track && track.querySelector('.psb-arch-card.active');
        if (track && activeCard) {
            const scrollLeft = activeCard.offsetLeft - (track.offsetWidth / 2) + (activeCard.offsetWidth / 2);
            track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
        }
    },

    // ── Human-Readable Modifier Label Resolvers ────────────────
    _getLabelForAngle(id) {
        if (!id) return '45° Three-Quarter';
        const found = this._getAngles().find(a => a.id === id);
        return found ? found.label : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    _getLabelForLighting(id) {
        if (!id) return 'Studio Lighting';
        const found = this._getLightingMoods().find(m => m.id === id);
        return found ? found.label : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    _getLabelForCamera(id) {
        if (!id || id === 'auto') return 'Auto Lens (Angle Driven)';
        const found = this._getCameraProfiles().find(c => c.id === id);
        return found ? found.label.replace(/^✦\s*/, '') : id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    // ── Partial: Update Smart Guide panel only (no re-render) ────
    _updateSmartGuide() {
        const guidePanel = this.container.querySelector('.psb-right-col');
        if (!guidePanel) return;
        const archetypes  = this._getArchetypes();
        const activeArch  = archetypes.find(a => a.id === this.state.archetypeId) || archetypes[0];
        const guideData   = this._getGuideData(activeArch.id);
        const activeScore = this._calculateArchetypeScore(activeArch);
        const scoreColor  = activeScore >= 85 ? '#34d399' : activeScore >= 70 ? '#fbbf24' : '#f87171';

        const iconEl     = guidePanel.querySelector('.psb-guide-icon');
        const titleEl    = guidePanel.querySelector('.psb-guide-title');
        const subEl      = guidePanel.querySelector('.psb-guide-sub');
        const bodyEl     = guidePanel.querySelector('.psb-guide-body');
        const bestforEl  = guidePanel.querySelector('.psb-guide-bestfor');
        if (iconEl)    iconEl.textContent   = activeArch.icon || '💎';
        if (titleEl)   titleEl.textContent  = activeArch.name;
        if (subEl)     subEl.textContent    = activeArch.tagline || '';
        if (bodyEl)    bodyEl.textContent   = activeArch.desc || 'Optimized archetype for cinematic realism.';
        if (bestforEl) bestforEl.textContent = activeArch.bestFor || '';

        // V3 badge
        const v3badge = guidePanel.querySelector('.psb-guide-v3-badge');
        if (v3badge) v3badge.style.display = this._V3_IDS.has(activeArch.id) ? '' : 'none';

        // All stat values — ordered as rendered in template
        const stats = guidePanel.querySelectorAll('.psb-guide-stat-value');
        if (stats[0]) { stats[0].textContent = `${activeScore}%`;  stats[0].style.color = scoreColor; }
        if (stats[1]) { stats[1].textContent = this._inferCategory(activeArch).replace(/\b\w/g, l => l.toUpperCase()); }
        if (stats[2]) { stats[2].textContent = activeScore >= 85 ? 'Excellent ✦' : activeScore >= 70 ? 'Good' : 'Low'; stats[2].style.color = scoreColor; }
        if (stats[3]) stats[3].textContent = this._getLabelForAngle(guideData.angle && guideData.angle[0]);
        if (stats[4]) stats[4].textContent = guideData.angle && guideData.angle[1] ? this._getLabelForAngle(guideData.angle[1]) : '—';
        if (stats[5]) stats[5].textContent = this._getLabelForLighting(guideData.lighting && guideData.lighting[0]);
        if (stats[6]) stats[6].textContent = guideData.lighting && guideData.lighting[1] ? this._getLabelForLighting(guideData.lighting[1]) : '—';
        if (stats[7]) stats[7].textContent = this._getLabelForCamera(guideData.camera && guideData.camera[0]);
        if (stats[8]) stats[8].textContent = guideData.camera && guideData.camera[1] ? this._getLabelForCamera(guideData.camera[1]) : '—';
        if (stats[9]) stats[9].textContent = this._getGuideDOF(guideData);
        if (stats[10]) stats[10].textContent = this._getGuideISO(activeArch);

        const tipsList = guidePanel.querySelector('.psb-guide-tips-list');
        if (tipsList) {
            const tips = guideData.tips || [
                'Calibrated for optimal jewelry clarity and cinematic lighting balance.',
                'Use 85mm or 100mm Macro lens for premium shallow depth of field.',
                'Adjust Color Palette and Surface to match the creative vision.',
            ];
            tipsList.innerHTML = tips.map(t => `<li class="psb-guide-tip-item">${t}</li>`).join('');
        }
    },

    // ── Update modal result count label ─────────────────────────
    _updateModalCount() {
        const countEl = this.container.querySelector('.psb-modal-count');
        if (!countEl) return;
        const all      = this._getArchetypes();
        const search   = (this.state.modalSearch || '').toLowerCase();
        const category = this.state.modalCategory || 'all';
        const filtered = this._filterArchetypes(all, category, search);
        countEl.textContent = `${filtered.length} archetypes`;
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

        const categories        = this._getCategories();
        const materials         = this._getMaterials();
        const stones            = this._getStones();
        const jewelryStyles     = this._getJewelryStyles();
        const angles            = this._getAngles();
        const lightingMoods     = this._getLightingMoods();
        const cameraProfiles    = this._getCameraProfiles();
        const surfaces          = this._getSurfaces();
        const palettes          = this._getPalettes();
        const stylings          = this._getStylings();
        const hijabStyles       = this._getHijabStyles();
        const brandTouches      = this._getBrandTouches();
        const ethnicities       = this._getEthnicities();
        const facialExpressions = this._getFacialExpressions();
        const top10             = this._getTop10Archetypes();
        const activeArch        = this._getArchetypes().find(a => a.id === this.state.archetypeId) || top10[0].arch;
        const guideData         = this._getGuideData(activeArch.id);
        const activeScore       = this._calculateArchetypeScore(activeArch);
        const isSet             = this.state.category === 'jewelry-set';

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
                                    const scoreColor = score >= 85 ? '#34d399' : score >= 75 ? '#fbbf24' : '#94a3b8';
                                    const ringColor  = scoreColor;
                                    const inferredCat = this._inferCategory(arch);
                                    const badgeHTML = inferredCat === 'watch'
                                        ? '<span class="psb-arch-type-badge psb-badge-watch">WATCH</span>'
                                        : (inferredCat === 'set'
                                            ? '<span class="psb-arch-type-badge psb-badge-set">SET</span>'
                                            : (arch.tag
                                                ? `<span class="psb-arch-type-badge psb-badge-v3">${arch.tag}</span>`
                                                : ''));
                                    return `
                                        <div class="psb-arch-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                                            ${badgeHTML}
                                            <div class="psb-score-ring-wrap">
                                                <svg class="psb-score-ring" viewBox="0 0 52 52">
                                                    <circle class="psb-ring-bg"   cx="26" cy="26" r="22"></circle>
                                                    <circle class="psb-ring-fill" cx="26" cy="26" r="22" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="stroke:${ringColor}"></circle>
                                                </svg>
                                                <span class="psb-arch-emoji">${arch.icon || '💎'}</span>
                                            </div>
                                            <div class="psb-arch-card-name" title="${arch.name}">${arch.name}</div>
                                            <div class="psb-arch-card-tag">${arch.tagline || arch.desc || ''}</div>
                                            <div class="psb-arch-score-badge" style="color:${scoreColor}">${score}% Match</div>
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

                                    <!-- New v10: Body Part Focus -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">🎯 Body Part Focus <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">Which zone the shot emphasizes</span></label>
                                        <select class="psb-select" id="psb-bodyfocus-select">
                                            ${this._getBodyFocusOptions().map(b => `
                                                <option value="${b.id}" ${this.state.bodyFocus === b.id ? 'selected' : ''}>${b.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    ${this.state.modelGender !== 'none' ? `
                                        <div class="psb-form-group">
                                            <label class="psb-label">Complexion &amp; Skin Tone</label>
                                            <select class="psb-select" id="psb-ethnicity-select">
                                                ${ethnicities.map(e => `
                                                    <option value="${e.id}" ${this.state.modelEthnicity === e.id ? 'selected' : ''}>${e.label}</option>
                                                `).join('')}
                                            </select>
                                        </div>

                                        <div class="psb-form-group">
                                            <label class="psb-label">Facial Expression</label>
                                            <select class="psb-select" id="psb-expr-select">
                                                ${facialExpressions.map(ex => `
                                                    <option value="${ex.id}" ${this.state.facialExpression === ex.id ? 'selected' : ''}>${ex.label}</option>
                                                `).join('')}
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
                                                    ${hijabStyles.map(st => `
                                                        <button type="button" class="psb-chip psb-hijabstyle-chip ${this.state.hijabStyle === st.id ? 'active' : ''}" data-style="${st.id}">
                                                            ${st.label}
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
                                        <div class="psb-chips" style="margin-bottom:8px;">
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'all'         ? 'active' : ''}" data-lf="all">All</button>
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'natural'     ? 'active' : ''}" data-lf="natural">🌤 Natural</button>
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'studio'      ? 'active' : ''}" data-lf="studio">🎥 Studio</button>
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'cinematic'   ? 'active' : ''}" data-lf="cinematic">🌑 Cinematic</button>
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'atmospheric' ? 'active' : ''}" data-lf="atmospheric">🌫 Atmos</button>
                                            <button type="button" class="psb-chip psb-lf-chip ${this.state.lightingFilter === 'special'     ? 'active' : ''}" data-lf="special">✨ Special</button>
                                        </div>
                                        <select class="psb-select" id="psb-lighting-select">
                                            <optgroup label="🌤 Natural Light" data-lf="natural" ${this.state.lightingFilter !== 'all' && this.state.lightingFilter !== 'natural' ? 'style="display:none"' : ''}>
                                                ${lightingMoods.filter(m => m.category === 'natural').map(m => `
                                                    <option value="${m.id}" ${this.state.lightingMood === m.id ? 'selected' : ''}>${m.label}</option>
                                                `).join('')}
                                            </optgroup>
                                            <optgroup label="🎥 Studio Lighting" data-lf="studio" ${this.state.lightingFilter !== 'all' && this.state.lightingFilter !== 'studio' ? 'style="display:none"' : ''}>
                                                ${lightingMoods.filter(m => m.category === 'studio').map(m => `
                                                    <option value="${m.id}" ${this.state.lightingMood === m.id ? 'selected' : ''}>${m.label}</option>
                                                `).join('')}
                                            </optgroup>
                                            <optgroup label="🌑 Cinematic &amp; Dramatic" data-lf="cinematic" ${this.state.lightingFilter !== 'all' && this.state.lightingFilter !== 'cinematic' ? 'style="display:none"' : ''}>
                                                ${lightingMoods.filter(m => m.category === 'cinematic').map(m => `
                                                    <option value="${m.id}" ${this.state.lightingMood === m.id ? 'selected' : ''}>${m.label}</option>
                                                `).join('')}
                                            </optgroup>
                                            <optgroup label="🌫 Atmospheric" data-lf="atmospheric" ${this.state.lightingFilter !== 'all' && this.state.lightingFilter !== 'atmospheric' ? 'style="display:none"' : ''}>
                                                ${lightingMoods.filter(m => m.category === 'atmospheric').map(m => `
                                                    <option value="${m.id}" ${this.state.lightingMood === m.id ? 'selected' : ''}>${m.label}</option>
                                                `).join('')}
                                            </optgroup>
                                            <optgroup label="✨ Special &amp; Reflective" data-lf="special" ${this.state.lightingFilter !== 'all' && this.state.lightingFilter !== 'special' ? 'style="display:none"' : ''}>
                                                ${lightingMoods.filter(m => m.category === 'special').map(m => `
                                                    <option value="${m.id}" ${this.state.lightingMood === m.id ? 'selected' : ''}>${m.label}</option>
                                                `).join('')}
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Camera Lens Profile <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">⭐ = recommended for active archetype</span></label>
                                        <select class="psb-select" id="psb-camera-select">
                                            ${(() => {
                                                const recCam = (guideData.camera || [])[0];
                                                const altCam = (guideData.camera || [])[1];
                                                return cameraProfiles.map(c => {
                                                    const isBest = c.id === recCam;
                                                    const isAlt  = c.id === altCam;
                                                    const prefix = isBest ? '⭐ ' : isAlt ? '✦ ' : '';
                                                    return `<option value="${c.id}" ${this.state.cameraProfile === c.id ? 'selected' : ''}>${prefix}${c.label}</option>`;
                                                }).join('');
                                            })()}
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">Camera Shot Angle</label>
                                        <select class="psb-select" id="psb-angle-select">
                                            ${['Classic & Portrait', 'Macro & Product', 'Cinematic & Atmospheric', 'Editorial & High Fashion', 'Artistic & Tactile', 'Environmental & Dynamic', 'POV & Power', 'Watch Exclusive'].map(groupName => {
                                                const groupAngles = angles.filter(a => (a.group || 'Classic & Portrait') === groupName);
                                                if (!groupAngles.length) return '';
                                                return `
                                                    <optgroup label="${groupName}">
                                                        ${groupAngles.map(a => `
                                                            <option value="${a.id}" ${this.state.angle === a.id ? 'selected' : ''}>${a.label}</option>
                                                        `).join('')}
                                                    </optgroup>
                                                `;
                                            }).join('')}
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
                                        <label class="psb-label">👗 Wardrobe &amp; Outfit <span style="font-size:9px;color:#34d399;font-weight:600;">✦ AI Chooses = max variety</span></label>
                                        <select class="psb-select" id="psb-styling-select">
                                            ${stylings.map(st => `
                                                <option value="${st.id}" ${this.state.styling === st.id ? 'selected' : ''}>${st.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">🎨 Color Palette Harmony <span style="font-size:9px;color:#34d399;font-weight:600;">✦ AI Chooses = max variety</span></label>
                                        <select class="psb-select" id="psb-palette-select">
                                            ${palettes.map(pal => `
                                                <option value="${pal.id}" ${this.state.palette === pal.id ? 'selected' : ''}>${pal.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <div class="psb-form-group">
                                        <label class="psb-label">🪨 Surface &amp; Backdrop Material <span style="font-size:9px;color:#34d399;font-weight:600;">✦ AI Chooses = max variety</span></label>
                                        <select class="psb-select" id="psb-surface-select">
                                            ${surfaces.map(s => `
                                                <option value="${s.id}" ${this.state.surface === s.id ? 'selected' : ''}>${s.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <!-- New v10: Environment / Background -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">🌍 Environment / Background <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">Location context beyond surface</span></label>
                                        <select class="psb-select" id="psb-environment-select">
                                            ${this._getEnvironmentOptions().map(e => `
                                                <option value="${e.id}" ${this.state.environment === e.id ? 'selected' : ''}>${e.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <!-- New v10: Film Style -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">🎞 Film Style &amp; Grade <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">Post-processing look &amp; color science</span></label>
                                        <select class="psb-select" id="psb-filmstyle-select">
                                            ${this._getFilmStyleOptions().map(f => `
                                                <option value="${f.id}" ${this.state.filmStyle === f.id ? 'selected' : ''}>${f.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <!-- New v10: Mood Intensity -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">⚡ Mood Intensity <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">Overall emotional register of the scene</span></label>
                                        <select class="psb-select" id="psb-moodintensity-select">
                                            ${this._getMoodIntensityOptions().map(m => `
                                                <option value="${m.id}" ${this.state.moodIntensity === m.id ? 'selected' : ''}>${m.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <!-- New v10: Season & Time of Day -->
                                    <div class="psb-form-group">
                                        <label class="psb-label">🕐 Season &amp; Time of Day <span style="font-size:9px;color:var(--psb-text-3);font-weight:400;">Temporal atmosphere &amp; color temperature</span></label>
                                        <select class="psb-select" id="psb-seasontime-select">
                                            ${this._getSeasonTimeOptions().map(s => `
                                                <option value="${s.id}" ${this.state.seasonTime === s.id ? 'selected' : ''}>${s.label}</option>
                                            `).join('')}
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
                                                ${brandTouches.map(b => `
                                                    <option value="${b.id}" ${this.state.brandTouch === b.id ? 'selected' : ''}>${b.label}</option>
                                                `).join('')}
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

                        <!-- Archetype Header -->
                        <div class="psb-guide-top">
                            <div class="psb-guide-icon">${activeArch.icon || '💎'}</div>
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                                    <div class="psb-guide-title">${activeArch.name}</div>
                                    ${this._V3_IDS.has(activeArch.id) ? '<span class="psb-guide-v3-badge">V3.0</span>' : ''}
                                </div>
                                <div class="psb-guide-sub">${activeArch.tagline || ''}</div>
                            </div>
                        </div>

                        ${activeArch.bestFor ? `<div class="psb-guide-bestfor">${activeArch.bestFor}</div>` : ''}
                        <div class="psb-guide-body">${activeArch.desc || 'Optimized archetype for cinematic realism.'}</div>

                        <div class="psb-guide-divider"></div>

                        <!-- Scene Intelligence -->
                        <div class="psb-guide-section-label">◈ Scene Intelligence</div>
                        <div class="psb-guide-stat-row">
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Compatibility</span>
                                <span class="psb-guide-stat-value" style="color:${activeScore >= 85 ? '#34d399' : activeScore >= 70 ? '#fbbf24' : '#f87171'}">${activeScore}%</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Category</span>
                                <span class="psb-guide-stat-value">${this._inferCategory(activeArch).replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Piece Synergy</span>
                                <span class="psb-guide-stat-value" style="color:${activeScore >= 85 ? '#34d399' : activeScore >= 70 ? '#fbbf24' : '#f87171'}">${activeScore >= 85 ? 'Excellent ✦' : activeScore >= 70 ? 'Good' : 'Low'}</span>
                            </div>
                        </div>

                        <div class="psb-guide-divider"></div>

                        <!-- Optimal Setup -->
                        <div class="psb-guide-section-label">◈ Optimal Setup</div>
                        <div class="psb-guide-stat-row">
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Shot Angle #1</span>
                                <span class="psb-guide-stat-value">${this._getLabelForAngle(guideData.angle && guideData.angle[0])}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Shot Angle #2</span>
                                <span class="psb-guide-stat-value">${guideData.angle && guideData.angle[1] ? this._getLabelForAngle(guideData.angle[1]) : '—'}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Lighting #1</span>
                                <span class="psb-guide-stat-value">${this._getLabelForLighting(guideData.lighting && guideData.lighting[0])}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Lighting #2</span>
                                <span class="psb-guide-stat-value">${guideData.lighting && guideData.lighting[1] ? this._getLabelForLighting(guideData.lighting[1]) : '—'}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">⭐ Lens Profile</span>
                                <span class="psb-guide-stat-value">${this._getLabelForCamera(guideData.camera && guideData.camera[0])}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Alt Lens</span>
                                <span class="psb-guide-stat-value">${guideData.camera && guideData.camera[1] ? this._getLabelForCamera(guideData.camera[1]) : '—'}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">Depth of Field</span>
                                <span class="psb-guide-stat-value">${this._getGuideDOF(guideData)}</span>
                            </div>
                            <div class="psb-guide-stat">
                                <span class="psb-guide-stat-label">ISO Range</span>
                                <span class="psb-guide-stat-value">${this._getGuideISO(activeArch)}</span>
                            </div>
                        </div>

                        <button type="button" class="psb-guide-apply-btn" id="psb-apply-guide-btn" title="Auto-select recommended Angle, Lighting, and Camera Lens Profile">
                            ⚡ Apply Recommended Setup
                        </button>

                        <div class="psb-guide-divider" style="margin-top:14px;"></div>

                        <!-- Director Tips -->
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
                                : this.state.history.map(item => {
                                    const safePrompt = (item && item.prompt) ? item.prompt : '';
                                    const safeArch   = (item && item.archetype) ? item.archetype : 'Unknown';
                                    const safeTime   = (item && item.timestamp) ? item.timestamp : '';
                                    return `<div class="psb-history-item" data-prompt="${encodeURIComponent(safePrompt)}">
                                        <div class="psb-history-arch">${safeArch}${safeTime ? ` • <span style="color:var(--psb-text-3);">${safeTime}</span>` : ''}</div>
                                        <div class="psb-history-preview">${safePrompt.substring(0, 120)}${safePrompt.length > 120 ? '…' : ''}</div>
                                        <button type="button" class="psb-history-copy">Copy</button>
                                    </div>`;
                                }).join('')}
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

    // ── Render Archetype Library Modal ───────────────────────────
    _renderModal() {
        if (!this.state.modalOpen) return '';

        const all      = this._getArchetypes();
        const search   = (this.state.modalSearch || '').toLowerCase();
        const category = this.state.modalCategory || 'all';
        const filtered = this._filterArchetypes(all, category, search);

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
                    <div class="psb-modal-sort-bar">
                        <button type="button" class="psb-modal-sort-btn ${this.state.modalV3Only ? 'active' : ''}" id="psb-modal-v3-filter">🏷 V3 Only</button>
                        <button type="button" class="psb-modal-sort-btn ${this.state.modalSortAZ ? 'active' : ''}" id="psb-modal-sort-az">A–Z</button>
                        <span class="psb-modal-count">${filtered.length} archetypes</span>
                    </div>
                    <div class="psb-modal-body">
                        ${filtered.length === 0 ? `<div class="psb-empty">No archetypes found. Try a different search or adjust filters.</div>` : ''}
                        <div class="psb-modal-grid">
                            ${filtered.map(arch => {
                                const score    = this._calculateArchetypeScore(arch);
                                const isActive = arch.id === this.state.archetypeId;
                                const scoreColor = score >= 85 ? '#34d399' : score >= 75 ? '#fbbf24' : '#94a3b8';
                                const inferredCat = this._inferCategory(arch);
                                const catBadge = inferredCat === 'watch'
                                    ? '<span style="font-size:8px;font-weight:800;color:#38bdf8;background:rgba(56,189,248,0.15);padding:1px 5px;border-radius:8px;">WATCH</span>'
                                    : (inferredCat === 'set'
                                        ? '<span style="font-size:8px;font-weight:800;color:#fb923c;background:rgba(251,146,60,0.15);padding:1px 5px;border-radius:8px;">SET</span>'
                                        : (arch.tag
                                            ? `<span style="font-size:8px;font-weight:800;color:#a78bfa;background:rgba(167,139,250,0.15);padding:1px 5px;border-radius:8px;">${arch.tag}</span>`
                                            : ''));
                                return `
                                    <div class="psb-modal-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                                        <div style="font-size:26px;line-height:1;flex-shrink:0;padding-top:2px;">${arch.icon || '💎'}</div>
                                        <div style="flex:1;min-width:0;">
                                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;gap:6px;">
                                                <div style="font-size:12.5px;font-weight:700;color:var(--psb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${arch.name}</div>
                                                <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
                                                    ${catBadge}
                                                    <span style="font-size:9.5px;font-weight:800;color:${scoreColor};background:${score >= 85 ? 'rgba(52,211,153,0.15)' : score >= 75 ? 'rgba(245,166,35,0.15)' : 'rgba(148,163,184,0.15)'};padding:2px 6px;border-radius:10px;">${score}%</span>
                                                </div>
                                            </div>
                                            <div style="font-size:10.5px;color:var(--psb-text-2);font-style:italic;line-height:1.3;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arch.tagline || ''}</div>
                                            ${arch.bestFor ? `<div style="font-size:9.5px;color:#fbbf24;font-weight:600;letter-spacing:0.01em;line-height:1.3;margin-bottom:3px;">${arch.bestFor}</div>` : ''}
                                            <div style="font-size:10px;color:var(--psb-text-3);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${arch.desc || ''}</div>
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
        histEl.innerHTML = this.state.history.map(item => {
            const safePrompt = (item && item.prompt) ? item.prompt : '';
            const safeArch   = (item && item.archetype) ? item.archetype : 'Unknown';
            const safeTime   = (item && item.timestamp) ? item.timestamp : '';
            return `
            <div class="psb-history-item" data-prompt="${encodeURIComponent(safePrompt)}">
                <div class="psb-history-arch">${safeArch}${safeTime ? ` • <span style="color:var(--psb-text-3);">${safeTime}</span>` : ''}</div>
                <div class="psb-history-preview">${safePrompt.substring(0, 120)}${safePrompt.length > 120 ? '…' : ''}</div>
                <button type="button" class="psb-history-copy">Copy</button>
            </div>`;
        }).join('');
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

        // Description input removed (Design Details section removed in v4)

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

        // Aspect ratio chips — sync both state.aspectRatio AND state.format
        // (master _buildPrompt reads state.format, not state.aspectRatio directly)
        this.container.querySelectorAll('.psb-aspect-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.aspectRatio = chip.dataset.ar;
                this.state.format = this._AR_TO_FORMAT[chip.dataset.ar] || 'square';
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

        // Archetype carousel cards — partial DOM update (no full re-render, no scroll jump)
        this.container.querySelectorAll('.psb-arch-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this._updateCarouselActive();
                this._updateSmartGuide();
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

        // DOF (new v10)
        const dofSel = q('#psb-dof-select');
        if (dofSel) dofSel.addEventListener('change', (e) => { this.state.dof = e.target.value; });

        // ISO Range (new v10)
        const isoSel = q('#psb-iso-select');
        if (isoSel) isoSel.addEventListener('change', (e) => { this.state.isoRange = e.target.value; });

        // Body Focus (new v10)
        const bodyFocusSel = q('#psb-bodyfocus-select');
        if (bodyFocusSel) bodyFocusSel.addEventListener('change', (e) => { this.state.bodyFocus = e.target.value; });

        // Lighting filter chips
        this.container.querySelectorAll('.psb-lf-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.state.lightingFilter = chip.dataset.lf;
                this.container.querySelectorAll('.psb-lf-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const lightSel = this.container.querySelector('#psb-lighting-select');
                if (lightSel) {
                    lightSel.querySelectorAll('optgroup').forEach(og => {
                        og.style.display = (this.state.lightingFilter === 'all' || og.dataset.lf === this.state.lightingFilter) ? '' : 'none';
                    });
                }
            });
        });

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

        // Environment (new v10)
        const envSel = q('#psb-environment-select');
        if (envSel) envSel.addEventListener('change', (e) => { this.state.environment = e.target.value; });

        // Film Style (new v10)
        const filmSel = q('#psb-filmstyle-select');
        if (filmSel) filmSel.addEventListener('change', (e) => { this.state.filmStyle = e.target.value; });

        // Mood Intensity (new v10)
        const moodSel = q('#psb-moodintensity-select');
        if (moodSel) moodSel.addEventListener('change', (e) => { this.state.moodIntensity = e.target.value; });

        // Season & Time of Day (new v10)
        const seasonSel = q('#psb-seasontime-select');
        if (seasonSel) seasonSel.addEventListener('change', (e) => { this.state.seasonTime = e.target.value; });

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

        // Smart Guide: 1-Tap Apply Recommended Setup
        const applyGuideBtn = q('#psb-apply-guide-btn');
        if (applyGuideBtn) {
            applyGuideBtn.addEventListener('click', () => {
                const archetypes = this._getArchetypes();
                const activeArch = archetypes.find(a => a.id === this.state.archetypeId) || archetypes[0];
                const guideData = this._getGuideData(activeArch.id);
                
                const recAngle = guideData.angle && guideData.angle[0];
                const recLighting = guideData.lighting && guideData.lighting[0];
                const recCamera = guideData.camera && guideData.camera[0];

                if (recAngle) {
                    this.state.angle = recAngle;
                    const angleEl = this.container.querySelector('#psb-angle-select');
                    if (angleEl) angleEl.value = recAngle;
                }
                if (recLighting) {
                    this.state.lightingMood = recLighting;
                    const lightEl = this.container.querySelector('#psb-lighting-select');
                    if (lightEl) lightEl.value = recLighting;
                }
                if (recCamera) {
                    this.state.cameraProfile = recCamera;
                    const camEl = this.container.querySelector('#psb-camera-select');
                    if (camEl) camEl.value = recCamera;
                }

                // Ensure expert drawer is open on the camera tab so the user sees the applied selection
                if (!this.state.expertOpen) {
                    this.state.expertOpen = true;
                    this.state.activeModTab = 'camera';
                    const drawer = this.container.querySelector('#psb-expert-drawer');
                    const toggleBtn = this.container.querySelector('#psb-expert-toggle');
                    if (drawer) drawer.classList.add('open');
                    if (toggleBtn) toggleBtn.classList.add('active');
                    this.container.querySelectorAll('.psb-mod-tab').forEach(t => t.classList.toggle('active', t.dataset.modtab === 'camera'));
                    this.container.querySelectorAll('.psb-mod-content').forEach(c => c.classList.toggle('active', c.id === 'psb-modtab-camera'));
                }

                this._showToast(`⚡ Applied setup: ${this._getLabelForAngle(recAngle)} + ${this._getLabelForLighting(recLighting)}`);
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

        // Modal category tabs — partial grid re-render (no full re-render)
        this.container.querySelectorAll('.psb-cat-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.state.modalCategory = tab.dataset.cat;
                this.container.querySelectorAll('.psb-cat-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._renderModalGrid();
                this._updateModalCount();
            });
        });

        // Modal card select — no scroll jump; scroll carousel track after close
        this.container.querySelectorAll('.psb-modal-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this.state.modalOpen   = false;
                this._render(); this._bindEvents();
                // Horizontally scroll the carousel track to the active card (no page scroll)
                setTimeout(() => {
                    const track      = this.container.querySelector('#psb-carousel-track');
                    const activeCard = track && track.querySelector('.psb-arch-card.active');
                    if (track && activeCard) {
                        const scrollLeft = activeCard.offsetLeft - (track.offsetWidth / 2) + (activeCard.offsetWidth / 2);
                        track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
                    }
                }, 50);
            });
        });

        // Modal V3 filter button
        const v3FilterBtn = q('#psb-modal-v3-filter');
        if (v3FilterBtn) v3FilterBtn.addEventListener('click', () => {
            this.state.modalV3Only = !this.state.modalV3Only;
            v3FilterBtn.classList.toggle('active', this.state.modalV3Only);
            this._renderModalGrid();
            this._updateModalCount();
        });

        // Modal A-Z sort button
        const sortAZBtn = q('#psb-modal-sort-az');
        if (sortAZBtn) sortAZBtn.addEventListener('click', () => {
            this.state.modalSortAZ = !this.state.modalSortAZ;
            sortAZBtn.classList.toggle('active', this.state.modalSortAZ);
            this._renderModalGrid();
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
            // Scroll toggle into view (not drawer) to prevent full-page jump
            if (toggle) toggle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

        const filtered = this._filterArchetypes(all, category, search);

        if (filtered.length === 0) {
            gridEl.innerHTML = '<div class="psb-empty">No archetypes found. Try a different search or adjust filters.</div>';
            this._updateModalCount();
            return;
        }

        gridEl.innerHTML = filtered.map(arch => {
            const score    = this._calculateArchetypeScore(arch);
            const isActive = arch.id === this.state.archetypeId;
            const scoreColor = score >= 85 ? '#34d399' : score >= 75 ? '#fbbf24' : '#94a3b8';
            const inferredCat = this._inferCategory(arch);
            const catBadge = inferredCat === 'watch'
                ? '<span style="font-size:8px;font-weight:800;color:#38bdf8;background:rgba(56,189,248,0.15);padding:1px 5px;border-radius:8px;">WATCH</span>'
                : (inferredCat === 'set'
                    ? '<span style="font-size:8px;font-weight:800;color:#fb923c;background:rgba(251,146,60,0.15);padding:1px 5px;border-radius:8px;">SET</span>'
                    : (arch.tag
                        ? `<span style="font-size:8px;font-weight:800;color:#a78bfa;background:rgba(167,139,250,0.15);padding:1px 5px;border-radius:8px;">${arch.tag}</span>`
                        : ''));
            return `
                <div class="psb-modal-card ${isActive ? 'active' : ''}" data-id="${arch.id}">
                    <div style="font-size:26px;line-height:1;flex-shrink:0;padding-top:2px;">${arch.icon || '💎'}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;gap:6px;">
                            <div style="font-size:12.5px;font-weight:700;color:var(--psb-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${arch.name}</div>
                            <div style="display:flex;gap:4px;align-items:center;flex-shrink:0;">
                                ${catBadge}
                                <span style="font-size:9.5px;font-weight:800;color:${scoreColor};background:${score >= 85 ? 'rgba(52,211,153,0.15)' : score >= 75 ? 'rgba(245,166,35,0.15)' : 'rgba(148,163,184,0.15)'};padding:2px 6px;border-radius:10px;">${score}%</span>
                            </div>
                        </div>
                        <div style="font-size:10.5px;color:var(--psb-text-2);font-style:italic;line-height:1.3;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${arch.tagline || ''}</div>
                        ${arch.bestFor ? `<div style="font-size:9.5px;color:#fbbf24;font-weight:600;line-height:1.3;margin-bottom:3px;">${arch.bestFor}</div>` : ''}
                        <div style="font-size:10px;color:var(--psb-text-3);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${arch.desc || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
        this._updateModalCount();

        // Re-bind modal card clicks
        this.container.querySelectorAll('.psb-modal-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.archetypeId = card.dataset.id;
                this.state.modalOpen   = false;
                this._render(); this._bindEvents();
                setTimeout(() => {
                    const track      = this.container.querySelector('#psb-carousel-track');
                    const activeCard = track && track.querySelector('.psb-arch-card.active');
                    if (track && activeCard) {
                        const scrollLeft = activeCard.offsetLeft - (track.offsetWidth / 2) + (activeCard.offsetWidth / 2);
                        track.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
                    }
                }, 50);
            });
        });
    },
};

// Global Entry Point for Elaris Router
window.render_promptstudiobeta = function(container) {
    PromptStudioBeta.init(container);
};
window.PromptStudioBeta = PromptStudioBeta;
