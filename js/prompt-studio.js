/**
 * prompt-studio.js — Prompt Engineering Studio for Elaris Content Engine.
 *
 * Generates battle-tested prompts by combining:
 *   1. Piece description (material, stones, style)
 *   2. Archetype templates (from reference analysis)
 *   3. Creative modifiers (mood, lighting, angle, etc.)
 *   4. Quality boosters (resolution, style keywords)
 *
 * Output: clipboard-ready prompts for Gemini / Midjourney / Leonardo / any tool.
 */

const PromptStudio = {

    // ── Jewelry Categories ───────────────────────────────────────
    categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry'],

    materials: [
        { id: 'sterling-silver', label: '925 Sterling Silver' },
        { id: '800-silver', label: '800 Moroccan Silver' },
    ],

    stones: [
        { id: 'none', label: 'No Stones' },
        { id: 'diamond', label: 'Diamonds' },
        { id: 'emerald', label: 'Emeralds' },
        { id: 'sapphire', label: 'Sapphires' },
        { id: 'ruby', label: 'Rubies' },
        { id: 'pearl', label: 'Pearls' },
        { id: 'turquoise', label: 'Turquoise' },
        { id: 'cubic-zirconia', label: 'Cubic Zirconia' },
        { id: 'mixed', label: 'Mixed Gemstones' },
    ],

    // ── 8 Creative Archetypes ────────────────────────────────────
    archetypes: [
        {
            id: 'body-intimate',
            name: 'Body Intimate',
            icon: '🖤',
            tagline: 'The Jewelry IS the Person',
            bestFor: 'Best for: Rings, Necklaces, Earrings, Bangles',
            desc: 'Close-up body shots — skin, lips, eyes, hands interacting with jewelry',
            color: '#2a1f1a',
            subjects: [
                'hand touching chin with {piece} visible on finger',
                'close-up of lips with {piece} held gently between fingers near the mouth',
                'hand covering one eye with {piece} prominently displayed',
                'wrist resting against neck showing {piece}',
                'fingers delicately touching collarbone wearing {piece}',
                'hand resting on shoulder displaying {piece}',
            ],
            scene: 'extreme close-up, warm skin tones, soft focus on face/body, sharp focus on jewelry, minimal makeup, sensual but editorial, warm studio lighting',
            compat: { ring: 95, necklace: 85, earrings: 90, bracelet: 70, bangles: 80, anklet: 50, brooch: 40, pendant: 75, 'body-jewelry': 60 },
        },
        {
            id: 'object-pairing',
            name: 'Object Pairing',
            icon: '🍋',
            tagline: 'Jewelry Meets Unexpected Props',
            bestFor: 'Best for: Rings, Brooches, Pendants',
            desc: 'Paired with organic objects — flowers, fruit, sand, rope, branches',
            color: '#3a3520',
            subjects: [
                '{piece} nestled in organic swirled sand dunes with concentric patterns',
                '{piece} elegantly placed on a pink calla lily flower stem',
                '{piece} draped over stacked citrus slices on marble surface',
                '{piece} hanging from a bare branch against clean backdrop',
                '{piece} resting on a knotted rope with warm textured background',
                '{piece} placed inside a split pomegranate showing ruby-red seeds',
                '{piece} balanced on a smooth river stone near water',
                '{piece} wrapped around a single long-stem rose',
            ],
            scene: 'clean background, natural lighting, overhead or editorial angle, visual storytelling through contrast, ultra-realistic',
            compat: { ring: 90, necklace: 60, earrings: 50, bracelet: 65, bangles: 55, anklet: 45, brooch: 85, pendant: 80, 'body-jewelry': 30 },
        },
        {
            id: 'editorial-model',
            name: 'Editorial Model',
            icon: '📸',
            tagline: 'Fashion Campaign Shoot',
            bestFor: 'Best for: Necklaces, Statement Earrings, Body Jewelry',
            desc: 'Full editorial with model wearing jewelry as centerpiece',
            color: '#1a1a2a',
            subjects: [
                'model in black clothing with {piece}, creative angle from above',
                'model posing with hands showing {piece}, expressive pose',
                'model from behind showing {piece}, elegant neckline',
                'model touching chin with {piece} visible, slicked-back hair',
                'model with hands framing face wearing {piece}',
                'model in profile view showing {piece} catching the light',
            ],
            scene: 'clean white/grey background, black clothing to let jewelry pop, expressive hand poses, fashion magazine quality, professional studio lighting',
            compat: { ring: 60, necklace: 95, earrings: 90, bracelet: 55, bangles: 60, anklet: 30, brooch: 65, pendant: 85, 'body-jewelry': 90 },
        },
        {
            id: 'surreal-animal',
            name: 'Surreal Animal',
            icon: '🐍',
            tagline: 'High Concept Campaigns',
            bestFor: 'Best for: Rings, Brooches, Pendants',
            desc: 'Exotic animals interacting with jewelry — viral, surrealist content',
            color: '#1a2a1a',
            subjects: [
                'majestic cheetah paw with {piece} placed on one claw, spotted fur visible',
                'blue macaw parrot holding {piece} in its curved beak, iridescent feathers',
                'white snake elegantly coiled around {piece}, scales glistening',
                'butterfly perched on {piece} resting on a white surface, wings spread',
                'peacock feather arrangement with {piece} nestled at the eye of the feather',
                'dove in flight with {piece} in its beak against soft sky backdrop',
            ],
            scene: 'pure white or black studio background, studio-perfect lighting, surrealist concept, ultra-sharp detail, 4K photorealistic',
            compat: { ring: 80, necklace: 50, earrings: 40, bracelet: 55, bangles: 50, anklet: 35, brooch: 85, pendant: 75, 'body-jewelry': 30 },
        },
        {
            id: 'gradient-product',
            name: 'Gradient Product',
            icon: '🎨',
            tagline: 'Floating Luxury Close-up',
            bestFor: 'Best for: All jewelry types',
            desc: 'Hero product shots with gradient backgrounds — pure product glory',
            color: '#2a2010',
            subjects: [
                '{piece} floating on warm amber gradient, dramatic angle',
                '{piece} resting on bold red/burgundy panel, Cartier-inspired',
                '{piece} among scattered ice cubes on black reflective surface',
                '{piece} on dark marble slab with gold veining',
                '{piece} hovering above reflective black surface with golden light streaks',
                '{piece} placed on velvet draped surface with moody lighting',
            ],
            scene: 'warm gradient or moody background, dramatic angles, product appears to float, zero clutter, hero shot',
            compat: { ring: 90, necklace: 85, earrings: 80, bracelet: 85, bangles: 80, anklet: 70, brooch: 80, pendant: 90, 'body-jewelry': 50 },
        },
        {
            id: 'bw-dramatic',
            name: 'B&W Dramatic',
            icon: '🌑',
            tagline: 'Monochrome Editorial',
            bestFor: 'Best for: Rings, Bracelets, Earrings',
            desc: 'Black and white photography with optional selective color on jewelry',
            color: '#1a1a1a',
            subjects: [
                'model hand touching face with {piece}, entire image in B&W except the jewelry',
                'close-up of lips and chin with {piece}, high contrast monochrome',
                'model with elegant hat, hand raised showing {piece}, selective color on stones',
                'overhead flat-lay of {piece} on textured fabric, dramatic B&W',
                'profile silhouette with {piece} catching the only light source',
            ],
            scene: 'high contrast black and white, jewelry either stays monochrome or gets selective color treatment, very editorial, fashion-forward, cinematic',
            compat: { ring: 85, necklace: 70, earrings: 80, bracelet: 75, bangles: 65, anklet: 45, brooch: 60, pendant: 70, 'body-jewelry': 60 },
        },
        {
            id: 'shadow-play',
            name: 'Shadow Play',
            icon: '🏜️',
            tagline: 'Light as Art',
            bestFor: 'Best for: Rings, Bracelets, Anklets',
            desc: 'Dramatic shadow casting creating visual narratives',
            color: '#252520',
            subjects: [
                '{piece} on off-white surface with dramatic hand shadow cast behind it',
                '{piece} with window blinds shadow pattern falling across the scene',
                '{piece} with palm leaf shadows creating tropical pattern on surface',
                '{piece} arranged with its own elongated shadow as design element',
                '{piece} with geometric shadow pattern from perforated screen',
            ],
            scene: 'overhead angle, harsh natural light, shadows as compositional element, minimal text, muted earth tones, art-directed',
            compat: { ring: 85, necklace: 50, earrings: 40, bracelet: 80, bangles: 75, anklet: 70, brooch: 55, pendant: 55, 'body-jewelry': 35 },
        },
        {
            id: 'bold-typography',
            name: 'Bold Typography',
            icon: '✦',
            tagline: 'Jewelry × Type Design',
            bestFor: 'Best for: All jewelry types',
            desc: 'Product shots with integrated brand typography as composition',
            color: '#2a2a35',
            subjects: [
                '{piece} with "ELARIS" typography woven through the composition',
                '{piece} on embossed letter background, tactile texture',
                '{piece} with brand name overlaid in elegant serif font, behind the product',
                '{piece} integrated into a typographic poster layout',
            ],
            scene: 'serif/display typography, brand name as design element, typography interacts with product, minimal color palette, premium editorial layout',
            compat: { ring: 75, necklace: 80, earrings: 70, bracelet: 75, bangles: 70, anklet: 50, brooch: 80, pendant: 80, 'body-jewelry': 55 },
        },
        {
            id: 'collection-showcase',
            name: 'Collection Showcase',
            icon: '💎',
            tagline: 'The Complete Set',
            bestFor: 'Best for: Matching Sets, Launch Campaigns',
            desc: 'Model wearing a full coordinated set — earrings, necklace, ring, bracelet',
            color: '#1f2028',
            subjects: [
                'model wearing matching {piece} set — earrings, necklace, ring, and bracelet — hand raised touching chin',
                'model in black dress showing complete {piece} collection, hand on opposite shoulder to display ring and bracelet',
                'model in silk camisole wearing full {piece} set, soft gaze down, all pieces catching the light',
                'close crop of model neck and hand showing {piece} necklace pendant, matching ring, and bracelet in harmony',
                'model touching collarbone, showing earrings, pendant, and ring from the same {piece} collection',
            ],
            scene: 'soft neutral or stone wall backdrop, black or jewel-tone clothing, all pieces visible simultaneously, editorial fashion photography, 85mm lens shallow depth of field',
            compat: { ring: 70, necklace: 95, earrings: 90, bracelet: 85, bangles: 80, anklet: 40, brooch: 50, pendant: 80, 'body-jewelry': 65 },
        },
        {
            id: 'macro-detail',
            name: 'Macro Detail',
            icon: '🔍',
            tagline: 'Craftsmanship in Focus',
            bestFor: 'Best for: All pieces, especially intricate designs',
            desc: 'Extreme close-up revealing textures, stone settings, micro-engravings',
            color: '#2a2520',
            subjects: [
                'extreme macro of {piece} showing individual stone settings and prong detail',
                'super close-up of {piece} clasp mechanism with visible hallmark stamp',
                'macro shot of {piece} surface texture showing hammer marks and artisanal finish',
                'tight crop on {piece} diamond pavé setting, individual stones catching light like stars',
                'side profile macro of {piece} showing band thickness and interior polish',
            ],
            scene: 'macro photography, 100mm macro lens, razor-thin depth of field, individual metal grain visible, studio ring light, clean black or white backdrop',
            compat: { ring: 95, necklace: 60, earrings: 70, bracelet: 65, bangles: 55, anklet: 50, brooch: 80, pendant: 75, 'body-jewelry': 40 },
        },
        {
            id: 'wet-element',
            name: 'Wet Element',
            icon: '💧',
            tagline: 'Water Meets Silver',
            bestFor: 'Best for: Rings, Bracelets, Pendants',
            desc: 'Water droplets, submerged pieces, rain on skin, ice contact',
            color: '#1a2530',
            subjects: [
                '{piece} covered in fine water droplets, each droplet refracting light on dark surface',
                '{piece} partially submerged in crystal-clear shallow water, ripples distorting reflection',
                'hand wearing {piece} under a thin stream of water, droplets frozen in mid-air',
                '{piece} resting on a melting ice block, condensation beading on silver surface',
                '{piece} on wet black marble, rain drops caught mid-splash around it',
                'model\u2019s wet hand emerging from water showing {piece}, water cascading off fingers',
            ],
            scene: 'high-speed photography to freeze water motion, dramatic side lighting hitting water droplets, dark moody backdrop, reflective surfaces, ultra-sharp detail',
            compat: { ring: 90, necklace: 55, earrings: 50, bracelet: 80, bangles: 75, anklet: 60, brooch: 45, pendant: 70, 'body-jewelry': 35 },
        },
        {
            id: 'architectural-context',
            name: 'Architectural Context',
            icon: '🏛️',
            tagline: 'Silver Meets Stone',
            bestFor: 'Best for: Necklaces, Earrings, Statement Pieces',
            desc: 'Jewelry worn against architectural backdrops — stone, marble, concrete, riads',
            color: '#2a2822',
            subjects: [
                'model leaning against raw concrete wall wearing {piece}, golden hour light',
                'model in Moroccan riad courtyard with zellige tile backdrop, showing {piece}',
                '{piece} placed on weathered stone column, ancient vs modern contrast',
                'model by marble archway wearing {piece}, architectural symmetry framing the shot',
                'model against rough sandstone wall, {piece} catching single shaft of light',
                '{piece} resting on terrazzo step, geometric pattern complementing jewelry design',
            ],
            scene: 'architectural photography meets fashion, leading lines from building elements, natural textures (stone, concrete, tile), warm Mediterranean or North African light, editorial crop',
            compat: { ring: 55, necklace: 90, earrings: 85, bracelet: 60, bangles: 65, anklet: 45, brooch: 50, pendant: 80, 'body-jewelry': 55 },
        },
        {
            id: 'flat-lay',
            name: 'Flat Lay Composition',
            icon: '🎍',
            tagline: 'Curated Overhead',
            bestFor: 'Best for: All pieces, Sets, Collections',
            desc: 'Top-down styled arrangement with carefully curated props',
            color: '#252820',
            subjects: [
                '{piece} arranged with dried flowers, linen fabric, and a ceramic dish, overhead shot',
                '{piece} on marble surface surrounded by scattered rose petals and a single candle',
                '{piece} collection displayed on velvet tray with gold tweezers and loupe',
                '{piece} arranged among natural elements — eucalyptus leaves, raw stones, cotton',
                '{piece} on open jewelry box with tissue paper, styling tools, and brand card',
                '{piece} set laid out on silk fabric with perfume bottle and dried lavender',
            ],
            scene: 'strict top-down overhead angle, carefully curated negative space, props tell a lifestyle story, soft natural window light from one side, Instagram-ready composition',
            compat: { ring: 80, necklace: 80, earrings: 80, bracelet: 80, bangles: 80, anklet: 70, brooch: 75, pendant: 80, 'body-jewelry': 45 },
        },
        {
            id: 'motion-blur',
            name: 'Motion & Flow',
            icon: '💨',
            tagline: 'Frozen in Movement',
            bestFor: 'Best for: Earrings, Necklaces, Body Jewelry',
            desc: 'Fabric flowing, hair swinging, motion — jewelry stays sharp',
            color: '#20202a',
            subjects: [
                'model turning head with hair in motion, {piece} earrings sharp and frozen mid-swing',
                'flowing silk fabric billowing around model wearing {piece}, jewelry pin-sharp against motion blur',
                'model walking, dress fabric caught mid-flow, {piece} necklace in perfect focus',
                'wind-blown hair revealing {piece} earrings, strands streaking across frame',
                'model spinning, {piece} bracelet and ring frozen in detail while dress blurs around her',
            ],
            scene: 'slow shutter speed on movement, fast flash freezing jewelry, motion blur on fabric/hair only, dramatic editorial feeling, studio or outdoor with wind machine',
            compat: { ring: 55, necklace: 80, earrings: 95, bracelet: 60, bangles: 65, anklet: 45, brooch: 35, pendant: 70, 'body-jewelry': 80 },
        },
        {
            id: 'cinematic-portrait',
            name: 'Cinematic Portrait',
            icon: '🎬',
            tagline: 'Movie-Poster Drama',
            bestFor: 'Best for: All pieces, especially statement jewelry',
            desc: 'Film-grade lighting, anamorphic bokeh, storytelling atmosphere',
            color: '#1a1520',
            subjects: [
                'model in profile wearing {piece}, single warm practical light source, deep shadows on face',
                'model looking through rain-streaked window wearing {piece}, neon reflections in glass',
                'close-up of model\u2019s eyes and {piece} earring, shallow anamorphic lens flare crossing frame',
                'model sitting at candlelit table wearing {piece}, warm chiaroscuro lighting',
                'dramatic low-angle portrait of model wearing {piece}, city lights bokeh behind',
            ],
            scene: 'cinematic color grading (teal-orange or film noir), anamorphic lens bokeh, practical light sources visible, movie-still composition, 35mm film grain, atmospheric haze',
            compat: { ring: 70, necklace: 90, earrings: 85, bracelet: 55, bangles: 50, anklet: 30, brooch: 45, pendant: 80, 'body-jewelry': 65 },
        },
        {
            id: 'mirror-reflection',
            name: 'Mirror & Reflection',
            icon: '🪞',
            tagline: 'Double Vision',
            bestFor: 'Best for: Rings, Pendants, Earrings',
            desc: 'Mirrored surfaces, water reflections, polished materials',
            color: '#222530',
            subjects: [
                '{piece} on polished black mirror surface, perfect reflection creating symmetry',
                'model applying {piece} earring in ornate vintage mirror, reflection showing the piece from another angle',
                '{piece} resting on still water surface, mirror-perfect reflection beneath',
                '{piece} surrounded by angled mirror fragments creating infinite reflections',
                'model\u2019s hands wearing {piece} reflected in a round compact mirror on dark surface',
            ],
            scene: 'reflective surfaces central to composition, symmetry and doubles, clean minimalist framing, controlled studio lighting to manage reflections, ultra-sharp focus',
            compat: { ring: 90, necklace: 60, earrings: 75, bracelet: 55, bangles: 50, anklet: 40, brooch: 45, pendant: 80, 'body-jewelry': 30 },
        },
        {
            id: 'texture-contrast',
            name: 'Texture Contrast',
            icon: '🪨',
            tagline: 'Silver Against Raw Material',
            bestFor: 'Best for: All pieces',
            desc: 'Polished silver paired with contrasting textures — velvet, concrete, moss, bark',
            color: '#28251a',
            subjects: [
                '{piece} on rough-hewn concrete block, smooth silver vs raw industrial texture',
                '{piece} draped across deep burgundy velvet, fabric folds catching shadow',
                '{piece} nestled in damp green moss on a log, nature reclaiming luxury',
                '{piece} on cracked desert clay surface, metallic sheen against earth',
                '{piece} resting on raw linen with visible weave texture, organic simplicity',
                '{piece} placed on oxidized copper plate, patina contrast with polished silver',
            ],
            scene: 'tactile texture dominates, silver jewelry as the refined element against raw material, tight crop to emphasize material contrast, side-raking light to reveal surface detail',
            compat: { ring: 80, necklace: 65, earrings: 60, bracelet: 80, bangles: 85, anklet: 70, brooch: 70, pendant: 75, 'body-jewelry': 40 },
        },
        {
            id: 'celestial-mythic',
            name: 'Celestial & Mythic',
            icon: '🌙',
            tagline: 'Divine Adornment',
            bestFor: 'Best for: Statement necklaces, Crowns, Body jewelry',
            desc: 'Greek goddess, moonlight, cosmic dust, celestial editorial themes',
            color: '#15152a',
            subjects: [
                'model styled as celestial being wearing {piece}, golden body shimmer, starfield backdrop',
                '{piece} floating among scattered stardust particles on deep navy velvet',
                'model in draped white Grecian fabric wearing {piece}, divine ethereal glow',
                '{piece} illuminated by single moonbeam against total darkness, silvery glow',
                'model with metallic face paint and {piece}, cosmic goddess editorial',
                '{piece} resting on crescent moon prop with scattered stars, fantasy product shot',
            ],
            scene: 'ethereal glowing light, cosmic or mythological atmosphere, deep blues and silvers, starfield or moonlit ambiance, otherworldly editorial, fine art photography',
            compat: { ring: 60, necklace: 95, earrings: 80, bracelet: 50, bangles: 55, anklet: 40, brooch: 70, pendant: 90, 'body-jewelry': 95 },
        },
        // ── NEW: Seasonal ────────────────────────────────────────
        {
            id: 'seasonal-holiday',
            name: 'Seasonal & Holiday',
            icon: '🎁',
            tagline: 'Calendar-Driven Campaigns',
            bestFor: 'Best for: All pieces — Valentine\'s, Eid, Christmas, Mother\'s Day',
            desc: 'Seasonal themes and holiday gift contexts that drive purchase intent',
            color: '#2a1520',
            subjects: [
                '{piece} nestled inside a gift box with satin ribbon, rose petals scattered around, Valentine\'s Day setting',
                '{piece} placed on a golden crescent moon tray with dates and lantern light, Ramadan/Eid celebration atmosphere',
                '{piece} under a miniature Christmas tree with soft bokeh fairy lights, festive gift context',
                '{piece} on a breakfast-in-bed tray with peonies and a handwritten card, Mother\'s Day morning',
                '{piece} on a velvet ring box surrounded by wedding confetti and champagne glass, bridal season',
                '{piece} arranged with autumn leaves and warm cinnamon sticks, fall collection launch',
            ],
            scene: 'seasonal color palette and props, warm inviting atmosphere, gift-giving context, lifestyle storytelling, aspirational yet accessible, editorial product photography',
            compat: { ring: 90, necklace: 90, earrings: 85, bracelet: 85, bangles: 75, anklet: 60, brooch: 70, pendant: 90, 'body-jewelry': 50 },
        },
        // ── NEW: Lifestyle ───────────────────────────────────────
        {
            id: 'lifestyle-moment',
            name: 'Lifestyle Moment',
            icon: '☕',
            tagline: 'Jewelry in Real Life',
            bestFor: 'Best for: Rings, Bracelets, Necklaces, Earrings',
            desc: 'Everyday luxury — coffee shops, travel, dinner, getting ready',
            color: '#252018',
            subjects: [
                'hand holding coffee cup in a café with {piece} on finger, morning light through window, latte art visible',
                'hand resting on car steering wheel with {piece}, golden hour light streaming through windshield, road trip mood',
                'hands typing on laptop in co-working space wearing {piece}, modern professional lifestyle',
                'model applying perfume at vanity wearing {piece}, getting-ready ritual, soft mirror light',
                'hand reaching for cocktail glass at upscale bar wearing {piece}, evening out atmosphere',
                'hand turning pages of a book in a sunlit reading nook wearing {piece}, cozy and aspirational',
                'model adjusting sunglasses on a Mediterranean balcony wearing {piece}, travel lifestyle',
            ],
            scene: 'real-world environment, natural unposed feeling, warm ambient light, lifestyle editorial, jewelry as part of a daily ritual, aspirational yet relatable, 50mm lens natural perspective',
            compat: { ring: 95, necklace: 85, earrings: 80, bracelet: 95, bangles: 85, anklet: 50, brooch: 40, pendant: 75, 'body-jewelry': 35 },
        },
        // ── NEW: Nature/Botanical ────────────────────────────────
        {
            id: 'nature-botanical',
            name: 'Nature & Botanical',
            icon: '🌿',
            tagline: 'Silver Meets the Garden',
            bestFor: 'Best for: Rings, Pendants, Earrings, Bracelets',
            desc: 'Jewelry among flowers, leaves, petals, and natural elements',
            color: '#1a2a18',
            subjects: [
                '{piece} nestled inside an open peony flower, petals cradling the silver like a jewel box',
                '{piece} draped over a curved eucalyptus branch with soft green leaves',
                '{piece} resting on a giant monstera leaf with water droplets catching light',
                '{piece} arranged among scattered dried lavender stems on raw linen surface',
                '{piece} placed on sun-warmed terracotta pot edge with trailing rosemary, herb garden setting',
                '{piece} entwined with jasmine vine blossoms, delicate white petals framing silver',
                '{piece} on a moss-covered stone in a shaded forest floor, fern fronds softly curving',
            ],
            scene: 'natural botanical elements as primary props, soft diffused natural sunlight, organic color palette (greens, creams, earth), editorial garden photography, shallow depth of field on jewelry',
            compat: { ring: 90, necklace: 80, earrings: 85, bracelet: 80, bangles: 70, anklet: 65, brooch: 75, pendant: 90, 'body-jewelry': 40 },
        },
        // ── NEW: Heritage/Moroccan ───────────────────────────────
        {
            id: 'heritage-moroccan',
            name: 'Heritage & Moroccan',
            icon: '🕌',
            tagline: 'Atlas to Mediterranean',
            bestFor: 'Best for: All pieces — YOUR brand signature',
            desc: 'Zellige tiles, riad courtyards, Moroccan doors, traditional craft textures',
            color: '#2a2015',
            subjects: [
                '{piece} on authentic Moroccan zellige mosaic tile surface, geometric star patterns in blue and white',
                'hand wearing {piece} pushing open an ornate brass-studded Moroccan wooden door, warm courtyard light beyond',
                '{piece} displayed on a hand-hammered Moroccan tea tray next to a traditional mint tea glass with gold rim',
                'model in a sunlit riad courtyard with carved plaster archway wearing {piece}, Mediterranean light filtering through',
                '{piece} placed on a hand-woven Berber carpet edge with traditional geometric motifs',
                '{piece} arranged on aged cedar wood with Moroccan lantern casting geometric shadow patterns',
                'model wearing {piece} against a traditional blue Chefchaouen wall, vibrant contrast',
            ],
            scene: 'North African architectural elements, warm golden light, artisanal textures (zellige, carved plaster, brass, cedar), cultural heritage storytelling, editorial travel photography, unique brand identity',
            compat: { ring: 85, necklace: 90, earrings: 80, bracelet: 85, bangles: 95, anklet: 80, brooch: 75, pendant: 85, 'body-jewelry': 70 },
        },
        // ── NEW: Minimalist ──────────────────────────────────────
        {
            id: 'minimalist-space',
            name: 'Minimalist & Space',
            icon: '◻️',
            tagline: 'Less is Everything',
            bestFor: 'Best for: Rings, Pendants, Earrings — perfect for ads & product pages',
            desc: 'Ultra-clean compositions with vast negative space, art gallery feel',
            color: '#28282a',
            subjects: [
                '{piece} centered on pure white surface with expansive negative space on all sides, single shadow',
                '{piece} on warm beige paper background with nothing else in frame, extreme minimalism',
                'single {piece} floating on solid soft-grey backdrop, gentle shadow beneath, catalog perfection',
                '{piece} on thin white pedestal against clean white infinity cove, gallery display',
                '{piece} resting on the edge of a single white geometric shape, architectural minimalism',
                '{piece} on matte cream surface with a single dried blade of grass as the only prop',
            ],
            scene: 'vast negative space, single focal point, clean uncluttered composition, soft even studio lighting, art gallery or luxury e-commerce aesthetic, the piece speaks entirely for itself, 100mm lens',
            compat: { ring: 95, necklace: 75, earrings: 90, bracelet: 80, bangles: 70, anklet: 65, brooch: 85, pendant: 90, 'body-jewelry': 30 },
        },
    ],

    // ── Modifiers ────────────────────────────────────────────────
    moods: [
        { id: 'dramatic', label: 'Dramatic' },
        { id: 'soft', label: 'Soft & Romantic' },
        { id: 'warm', label: 'Warm & Inviting' },
        { id: 'cool', label: 'Cool & Modern' },
        { id: 'surreal', label: 'Surreal & Dreamy' },
        { id: 'editorial', label: 'Editorial & Sharp' },
        { id: 'mystical', label: 'Mystical & Dark' },
    ],

    lightings: [
        { id: 'golden-hour', label: 'Golden Hour' },
        { id: 'studio', label: 'Studio Lighting' },
        { id: 'natural', label: 'Natural Daylight' },
        { id: 'dramatic-shadows', label: 'Dramatic Shadows' },
        { id: 'backlit', label: 'Backlit / Rim Light' },
        { id: 'soft-diffused', label: 'Soft Diffused' },
    ],

    formats: [
        { id: 'square', label: '1:1 Post', ratio: '1:1' },
        { id: 'portrait', label: '4:5 Portrait', ratio: '4:5' },
        { id: 'story', label: '9:16 Story', ratio: '9:16' },
        { id: 'landscape', label: '16:9 Wide', ratio: '16:9' },
    ],

    // ── Camera Angles ────────────────────────────────────────────
    angles: [
        { id: 'eye-level', label: 'Eye Level' },
        { id: 'overhead', label: 'Overhead / Bird\'s Eye' },
        { id: 'low-angle', label: 'Low Angle (Hero)' },
        { id: 'dutch', label: 'Dutch Angle' },
        { id: 'macro', label: 'Macro Close-up' },
        { id: 'over-shoulder', label: 'Over the Shoulder' },
        { id: '45-degree', label: '45° Three-Quarter' },
    ],

    // ── Surface / Backdrop ───────────────────────────────────────
    surfaces: [
        { id: 'none', label: 'Default (Archetype)' },
        { id: 'marble', label: 'Marble' },
        { id: 'velvet', label: 'Velvet' },
        { id: 'sand', label: 'Sand' },
        { id: 'concrete', label: 'Concrete' },
        { id: 'water', label: 'Water' },
        { id: 'silk', label: 'Silk Fabric' },
        { id: 'skin', label: 'Skin / Body' },
        { id: 'stone-wall', label: 'Stone Wall' },
        { id: 'wood', label: 'Raw Wood' },
    ],

    // ── Color Palettes ───────────────────────────────────────────
    palettes: [
        { id: 'neutral', label: 'Neutral Beige' },
        { id: 'warm-earth', label: 'Warm Earth' },
        { id: 'cool-steel', label: 'Cool Steel' },
        { id: 'monochrome', label: 'Monochrome' },
        { id: 'jewel-tones', label: 'Jewel Tones' },
        { id: 'deep-ocean', label: 'Deep Ocean' },
        { id: 'blush-rose', label: 'Blush & Rose' },
        { id: 'noir', label: 'Film Noir' },
    ],

    // ── Model Styling (for human archetypes) ─────────────────────
    stylings: [
        { id: 'minimal', label: 'Minimal / Nude' },
        { id: 'black-dress', label: 'Black Dress' },
        { id: 'silk-cami', label: 'Silk Camisole' },
        { id: 'blazer', label: 'Suit / Blazer' },
        { id: 'caftan', label: 'Traditional Caftan' },
        { id: 'white-shirt', label: 'White Shirt' },
        { id: 'evening-gown', label: 'Evening Gown' },
        { id: 'streetwear', label: 'Elevated Streetwear' },
    ],

    // ── State ────────────────────────────────────────────────────
    state: {
        pieceDesc: '',
        category: 'ring',
        material: 'sterling-silver',
        stone: 'diamond',
        selectedArchetypes: [],
        mood: 'editorial',
        lighting: 'studio',
        format: 'square',
        angle: 'eye-level',
        surface: 'none',
        palette: 'neutral',
        styling: 'minimal',
        hallmarkEnabled: false,
        history: [],
    },

    // ── Init ─────────────────────────────────────────────────────
    init(container) {
        this.container = container;
        this._sortMode = 'recommended';
        this._render();
        this._renderArchetypeGrid();
        this._bind();
    },

    // ── Render Archetype Grid (dynamic, re-sortable) ──────────
    _renderArchetypeGrid() {
        const grid = this.container.querySelector('#ps-archetypes');
        if (!grid) return;

        const cat = this.state.category || 'ring';
        let sorted = [...this.archetypes];

        if (this._sortMode === 'recommended') {
            sorted.sort((a, b) => {
                const scoreA = (a.compat && a.compat[cat]) || 50;
                const scoreB = (b.compat && b.compat[cat]) || 50;
                return scoreB - scoreA;
            });
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.innerHTML = sorted.map(a => {
            const score = (a.compat && a.compat[cat]) || 50;
            const isSelected = this.state.selectedArchetypes.includes(a.id);
            const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : score >= 50 ? '#f97316' : '#f87171';
            return `
                <div class="ps-arch-card ${isSelected ? 'active' : ''}" data-arch="${a.id}">
                    <div class="ps-arch-icon" style="background:${a.color}">${a.icon}</div>
                    <div class="ps-arch-info">
                        <div class="ps-arch-name">${a.name}</div>
                        <div class="ps-arch-tag">${a.tagline}</div>
                        <div class="ps-arch-bestfor">${a.bestFor}</div>
                    </div>
                    <div class="ps-arch-score" style="color:${scoreColor}" title="Compatibility with ${cat}">${score}</div>
                </div>
            `;
        }).join('');

        // Update count
        const countEl = this.container.querySelector('#ps-arch-count');
        if (countEl) countEl.textContent = `${this.state.selectedArchetypes.length} selected`;
    },

    // ── Render ───────────────────────────────────────────────────
    _render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="ps_title">Prompt Studio</h1>
                <p class="page-subtitle" data-i18n="ps_subtitle">Generate editorial prompts - paste into Gemini, Midjourney, or any AI tool</p>
            </div>

            <div class="ps-layout">
                <!-- LEFT: Piece Description -->
                <div class="ps-left">
                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="ps_describe_piece">Describe Your Piece</span></div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_category">Category</label>
                            <select class="form-select" id="ps-category">
                                ${this.categories.map(c => `<option value="${c}" data-i18n="ps_cat_${c.replace(/-/g, '_')}" ${c === this.state.category ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_material">Material</label>
                            <select class="form-select" id="ps-material">
                                ${this.materials.map(m => `<option value="${m.id}" data-i18n="ps_mat_${m.id.replace(/-/g, '_')}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_stones">Stones</label>
                            <select class="form-select" id="ps-stone">
                                ${this.stones.map(s => `<option value="${s.id}" data-i18n="ps_stone_${s.id.replace(/-/g, '_')}" ${s.id === this.state.stone ? 'selected' : ''}>${s.label}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>
                            <textarea class="form-textarea" id="ps-desc" rows="3" data-i18n="ps_piece_desc_ph" placeholder="e.g. multi-band crossover ring with pavé diamond accents and intertwining silver bands"></textarea>
                        </div>
                        <button class="btn btn-sm btn-secondary" id="ps-auto-desc" style="width:100%" data-i18n="ps_auto_desc">✦ Auto-describe from category</button>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="ps_modifiers">Modifiers</span></div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_mood">Mood</label>
                            <div class="ps-chip-group" id="ps-mood">
                                ${this.moods.map(m => `<button class="ps-chip ${m.id === this.state.mood ? 'active' : ''}" data-val="${m.id}" data-i18n="ps_mood_${m.id.replace(/-/g, '_')}">${m.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_lighting">Lighting</label>
                            <div class="ps-chip-group" id="ps-lighting">
                                ${this.lightings.map(l => `<button class="ps-chip ${l.id === this.state.lighting ? 'active' : ''}" data-val="${l.id}" data-i18n="ps_light_${l.id.replace(/-/g, '_')}">${l.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_format">Format</label>
                            <div class="ps-chip-group" id="ps-format">
                                ${this.formats.map(f => `<button class="ps-chip ${f.id === this.state.format ? 'active' : ''}" data-val="${f.id}" data-i18n="ps_fmt_${f.id.replace(/-/g, '_')}">${f.label}</button>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Advanced Controls</span></div>
                        <div class="form-group">
                            <label class="form-label">Camera Angle</label>
                            <div class="ps-chip-group" id="ps-angle">
                                ${this.angles.map(a => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}">${a.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Surface / Backdrop</label>
                            <div class="ps-chip-group" id="ps-surface">
                                ${this.surfaces.map(s => `<button class="ps-chip ${s.id === this.state.surface ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Color Palette</label>
                            <div class="ps-chip-group" id="ps-palette">
                                ${this.palettes.map(p => `<button class="ps-chip ${p.id === this.state.palette ? 'active' : ''}" data-val="${p.id}">${p.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model Styling <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-styling">
                                ${this.stylings.map(s => `<button class="ps-chip ${s.id === this.state.styling ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">
                            <div style="display:flex;align-items:center;justify-content:space-between">
                                <div>
                                    <label class="form-label" style="margin-bottom:2px">Hallmark Injection 🏷️</label>
                                    <p class="text-sm text-muted" style="line-height:1.4;max-width:240px">Adds "ELARIS" engraving instructions to prompts. May produce inaccurate logos — use Watermark Studio for exact branding.</p>
                                </div>
                                <label class="wm-toggle-label">
                                    <input type="checkbox" id="ps-hallmark-toggle" ${this.state.hallmarkEnabled ? 'checked' : ''}>
                                    <span class="wm-toggle-switch"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CENTER: Archetype Selector + Output -->
                <div class="ps-center">
                    <div class="card">
                        <div class="card-header" style="flex-wrap:wrap;gap:8px">
                            <span class="card-title" data-i18n="ps_archetypes">Select Archetypes</span>
                            <div style="display:flex;align-items:center;gap:8px">
                                <div class="ps-chip-group ps-sort-group" id="ps-sort-mode" style="gap:4px">
                                    <button class="ps-chip active" data-val="recommended" style="font-size:11px;padding:4px 10px" data-i18n="ps_sort_rec">⭐ Recommended</button>
                                    <button class="ps-chip" data-val="alpha" style="font-size:11px;padding:4px 10px" data-i18n="ps_sort_az">A—Z</button>
                                </div>
                                <span class="text-sm text-muted" id="ps-arch-count">0 <span data-i18n="ps_selected">selected</span></span>
                            </div>
                        </div>
                        <div class="ps-archetype-grid" id="ps-archetypes"></div>
                    </div>

                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="btn btn-primary btn-lg" id="ps-generate" style="flex:1" data-i18n="ps_generate">
                            ✦ Generate Prompts
                        </button>
                    </div>

                    <div id="ps-output-area" style="display:none">
                        <div class="card" style="margin-top:16px">
                            <div class="card-header">
                                <span class="card-title">Generated Prompts</span>
                                <button class="btn btn-sm btn-secondary" id="ps-copy-all">📋 Copy All</button>
                            </div>
                            <div id="ps-prompts-list"></div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: History -->
                <div class="ps-right">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Prompt History</span>
                            <button class="btn btn-sm btn-secondary" id="ps-clear-history">Clear</button>
                        </div>
                        <div id="ps-history" class="ps-history-list">
                            <p class="text-sm text-muted" style="text-align:center;padding:20px">No prompts generated yet</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Quick Tips</span></div>
                        <div class="ps-tips">
                            <div class="ps-tip">💡 Select multiple archetypes for batch prompt generation</div>
                            <div class="ps-tip">🎯 Be specific in your piece description for best results</div>
                            <div class="ps-tip">📋 Copy prompts directly into Gemini, Midjourney, or Leonardo</div>
                            <div class="ps-tip">🔄 Re-generate for fresh variations of the same concept</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (window.I18n) window.I18n.applyLanguage();
    },

    // ── Event Binding ────────────────────────────────────────────
    _bind() {
        // Selects
        const q = id => this.container.querySelector(id);
        q('#ps-category').addEventListener('change', e => {
            this.state.category = e.target.value;
            this._renderArchetypeGrid();
        });
        q('#ps-material').addEventListener('change', e => { this.state.material = e.target.value; });
        q('#ps-stone').addEventListener('change', e => { this.state.stone = e.target.value; });
        q('#ps-desc').addEventListener('input', e => { this.state.pieceDesc = e.target.value; });

        // Auto-describe
        q('#ps-auto-desc').addEventListener('click', () => this._autoDescribe());

        // Sort mode
        const sortGroup = q('#ps-sort-mode');
        if (sortGroup) {
            sortGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                sortGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this._sortMode = chip.dataset.val;
                this._renderArchetypeGrid();
            });
        }

        // Chip groups
        this._bindChipGroup('ps-mood', 'mood');
        this._bindChipGroup('ps-lighting', 'lighting');
        this._bindChipGroup('ps-format', 'format');
        this._bindChipGroup('ps-angle', 'angle');
        this._bindChipGroup('ps-surface', 'surface');
        this._bindChipGroup('ps-palette', 'palette');
        this._bindChipGroup('ps-styling', 'styling');

        // Hallmark toggle
        q('#ps-hallmark-toggle')?.addEventListener('change', e => {
            this.state.hallmarkEnabled = e.target.checked;
        });

        // Archetype selection (multi-select)
        q('#ps-archetypes').addEventListener('click', e => {
            const card = e.target.closest('.ps-arch-card');
            if (!card) return;
            const id = card.dataset.arch;
            const idx = this.state.selectedArchetypes.indexOf(id);
            if (idx >= 0) {
                this.state.selectedArchetypes.splice(idx, 1);
                card.classList.remove('active');
            } else {
                this.state.selectedArchetypes.push(id);
                card.classList.add('active');
            }
            const selStr = window.I18n ? window.I18n.t('ps_selected') : 'selected';
            q('#ps-arch-count').innerHTML = `${this.state.selectedArchetypes.length} <span data-i18n="ps_selected">${selStr}</span>`;
        });

        // Generate
        q('#ps-generate').addEventListener('click', () => this._generate());

        // Copy all
        q('#ps-copy-all').addEventListener('click', () => this._copyAll());

        // Clear history
        q('#ps-clear-history').addEventListener('click', () => {
            this.state.history = [];
            q('#ps-history').innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:20px">No prompts generated yet</p>';
            Elaris.toast('History cleared', 'info');
        });
    },

    _bindChipGroup(groupId, stateKey) {
        const group = this.container.querySelector(`#${groupId}`);
        group.addEventListener('click', e => {
            const chip = e.target.closest('.ps-chip');
            if (!chip) return;
            group.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.state[stateKey] = chip.dataset.val;
        });
    },

    // ── Auto-describe ────────────────────────────────────────────
    _autoDescribe() {
        const cat = this.state.category;
        const mat = this.materials.find(m => m.id === this.state.material)?.label || 'silver';
        const stone = this.stones.find(s => s.id === this.state.stone);
        const stoneText = stone && stone.id !== 'none' ? ` with ${stone.label.toLowerCase()} accents` : '';

        const templates = {
            'ring': `elegant ${mat.toLowerCase()} ring${stoneText}`,
            'necklace': `delicate ${mat.toLowerCase()} chain necklace${stoneText}`,
            'earrings': `${mat.toLowerCase()} drop earrings${stoneText}`,
            'bracelet': `${mat.toLowerCase()} link bracelet${stoneText}`,
            'bangles': `set of ${mat.toLowerCase()} bangles${stoneText}`,
            'anklet': `fine ${mat.toLowerCase()} anklet${stoneText}`,
            'brooch': `ornate ${mat.toLowerCase()} brooch${stoneText}`,
            'pendant': `${mat.toLowerCase()} pendant${stoneText} on a fine chain`,
            'body-jewelry': `${mat.toLowerCase()} body chain${stoneText}`,
        };

        const desc = templates[cat] || `${mat.toLowerCase()} ${cat}${stoneText}`;
        this.container.querySelector('#ps-desc').value = desc;
        this.state.pieceDesc = desc;
        Elaris.toast('Description auto-generated ✦', 'info');
    },

    // ── Generate Prompts ─────────────────────────────────────────
    _generate() {
        const selected = this.state.selectedArchetypes;
        if (selected.length === 0) {
            Elaris.toast('Select at least one archetype', 'error');
            return;
        }
        if (!this.state.pieceDesc.trim()) {
            this._autoDescribe();
        }

        const prompts = [];
        for (const archId of selected) {
            const arch = this.archetypes.find(a => a.id === archId);
            if (!arch) continue;
            const prompt = this._buildPrompt(arch);
            prompts.push({ archetype: arch.name, icon: arch.icon, text: prompt, id: Date.now() + Math.random() });
        }

        // Render output
        const outputArea = this.container.querySelector('#ps-output-area');
        outputArea.style.display = '';
        const list = this.container.querySelector('#ps-prompts-list');

        list.innerHTML = prompts.map((p, i) => `
            <div class="ps-prompt-block" data-idx="${i}">
                <div class="ps-prompt-header">
                    <span>${p.icon} ${p.archetype}</span>
                    <button class="btn btn-sm btn-secondary ps-copy-one" data-idx="${i}">📋 Copy</button>
                </div>
                <div class="ps-prompt-text" id="ps-prompt-${i}">${p.text}</div>
            </div>
        `).join('');

        // Copy individual buttons
        list.querySelectorAll('.ps-copy-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                navigator.clipboard.writeText(prompts[idx].text).then(() => {
                    Elaris.toast('Prompt copied ✓', 'success');
                });
            });
        });

        this._currentPrompts = prompts;

        // Add to history
        for (const p of prompts) {
            this.state.history.unshift({ ...p, timestamp: new Date().toLocaleTimeString() });
        }
        this._renderHistory();

        Elaris.toast(`${prompts.length} prompt(s) generated ✦`, 'success');

        // Scroll to output
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ── Build Single Prompt ──────────────────────────────────────
    _buildPrompt(archetype) {
        const piece = this.state.pieceDesc || 'jewelry piece';
        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';
        const mood = this.moods.find(m => m.id === this.state.mood)?.label.toLowerCase() || '';
        const lighting = this.lightings.find(l => l.id === this.state.lighting)?.label.toLowerCase() || '';
        const fmt = this.formats.find(f => f.id === this.state.format);
        const ratio = fmt ? fmt.ratio : '1:1';
        const angleName = this.angles.find(a => a.id === this.state.angle)?.label.toLowerCase() || '';
        const palette = this.palettes.find(p => p.id === this.state.palette)?.label.toLowerCase() || '';

        // ── FIX #2: Build subject without repeating material in the description ──
        // The material descriptor is injected separately to avoid redundancy.
        const subject = this._random(archetype.subjects).replace(/\{piece\}/g, `${material} ${piece}`);

        // ── FIX #1: Unified camera system — one lens per shot, no conflicts ──
        // Each angle gets a complete, self-contained camera description:
        //   focal length + aperture + focus behavior + technique
        const cameraMap = {
            'eye-level':     'shot on 85mm f/1.4 lens, shallow depth of field, natural eye-level perspective',
            'overhead':      'shot from directly above on 50mm f/4 lens, even focus plane across the frame',
            'low-angle':     'low angle hero shot on 35mm f/2.8 wide lens, dramatic perspective distortion',
            'dutch':         'dutch angle tilt on 50mm f/2 lens, dynamic visual tension',
            'macro':         'shot on 100mm f/2.8 macro lens, razor-thin depth of field, extreme close-up revealing individual metal grain and surface texture',
            'over-shoulder': 'over-the-shoulder composition on 85mm f/1.8 lens, creamy bokeh background',
            '45-degree':     'three-quarter angle on 70mm f/2.2 lens, natural dimensional perspective',
        };
        const cameraDesc = cameraMap[this.state.angle] || 'shot on 85mm f/1.4 lens, shallow depth of field';

        // ── Silver-specific material descriptors ──
        const silverDesc = this.state.material === '800-silver'
            ? 'warm oxidized patina, traditional Moroccan silverwork texture, hand-hammered artisanal finish'
            : 'rhodium-plated sheen, mirror-polished surface, brilliant metallic luster';

        // ── Surface/backdrop override ──
        let surfaceDesc = '';
        if (this.state.surface !== 'none') {
            const surfMap = {
                'marble': 'on polished white Carrara marble surface with subtle grey veining',
                'velvet': 'on deep rich velvet fabric with light catching the nap',
                'sand': 'on fine warm sand with organic ripple patterns',
                'concrete': 'on raw brushed concrete surface, industrial contrast',
                'water': 'on water surface with gentle ripples and reflections',
                'silk': 'on draped silk charmeuse fabric, lustrous folds',
                'skin': 'against warm bare skin, intimate body context',
                'stone-wall': 'against weathered natural stone wall backdrop',
                'wood': 'on raw untreated wood grain surface, organic warmth',
            };
            surfaceDesc = surfMap[this.state.surface] || '';
        }

        // ── Color palette direction ──
        const paletteMap = {
            'neutral': 'neutral beige and cream color palette, warm luxury tone',
            'warm-earth': 'warm earthy tones — amber, terracotta, sand, sienna',
            'cool-steel': 'cool steel and slate blue tones, icy elegance',
            'monochrome': 'strict monochrome palette, black white and silver only',
            'jewel-tones': 'rich jewel tones — deep emerald, sapphire blue, ruby',
            'deep-ocean': 'deep ocean blues and teals, midnight atmosphere',
            'blush-rose': 'soft blush pink and dusty rose palette, feminine warmth',
            'noir': 'film noir palette — deep blacks, sharp whites, smoky greys',
        };
        const paletteDesc = paletteMap[this.state.palette] || '';

        // ── FIX #4: Detect if this is a product-only vs human archetype ──
        const humanArchetypes = ['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic'];
        const isHuman = humanArchetypes.includes(archetype.id);

        // Model styling (only for human archetypes)
        let stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'minimal': 'model in minimal/nude styling, skin as the canvas',
                'black-dress': 'model wearing elegant black dress, jewelry as the contrast',
                'silk-cami': 'model in silk camisole, effortless luxury',
                'blazer': 'model in tailored suit/blazer, power dressing',
                'caftan': 'model in traditional Moroccan caftan, heritage styling',
                'white-shirt': 'model in crisp white button-down shirt, classic editorial',
                'evening-gown': 'model in floor-length evening gown, red carpet elegance',
                'streetwear': 'model in elevated streetwear, contemporary luxury',
            };
            stylingDesc = styleMap[this.state.styling] || '';
        }

        // ── Anatomy constraints (only when humans are present) ──
        let anatomyConstraint = '';
        if (isHuman || archetype.id === 'shadow-play') {
            anatomyConstraint = 'CRITICAL: Flawless human anatomy — exactly five fingers per hand, correct joint proportions, natural knuckle spacing, no extra or fused digits, photorealistic skin texture.';
        }

        // ── Hallmark brand injection — only when enabled ──
        let hallmarkDesc = '';
        if (this.state.hallmarkEnabled) {
            const category = this.state.category || 'general';
            const hallmarkMap = {
                'ring':      'tiny "ELARIS" engraved on the inner band, subtle 925 hallmark stamp visible at the edge',
                'necklace':  'small four-pointed star emblem on the chain clasp, delicate "ELARIS" tag on the chain end link',
                'bracelet':  'subtle "ELARIS" engraved on inner clasp plate, small star hallmark on the link near closure',
                'earring':   'microscopic "ELARIS" stamp on the earring post back, barely visible brand mark',
                'pendant':   'tiny "ELARIS" engraved on the bail, star hallmark on the pendant reverse side',
                'brooch':    '"ELARIS" hallmark on the pin clasp mechanism, brand signature subtly visible',
                'anklet':    'small "ELARIS" brand tag on the anklet chain near clasp',
                'bangle':    '"ELARIS" engraved on the inner surface of the bangle, 925 hallmark near opening',
                'general':   'subtle brand hallmark reading "ELARIS" engraved on a discreet area of the jewelry piece, small star emblem stamp',
            };
            hallmarkDesc = hallmarkMap[category] || hallmarkMap['general'];
        }

        // ── FIX #3: Context-aware negative prompts ──
        let negativePrompt;
        if (isHuman) {
            // Human archetypes: anatomy + technical negatives
            negativePrompt = 'Negative prompt: malformed anatomy, extra fingers, six fingers, mutated limbs, fused fingers, asymmetrical geometry, AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, chromatic aberration, plastic texture, 3d render.';
        } else {
            // Product-only archetypes: technical + product-focused negatives (NO anatomy terms)
            negativePrompt = 'Negative prompt: (hand, fingers, skin), chromatic aberration, overexposed highlights, plastic texture, distorted shape, asymmetrical geometry, AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, noise grain, 3d render.';
        }

        // ── FIX #5: Subject-first prompt structure for better AI weighting ──
        // Most important visual element (the jewelry) comes first.
        const parts = [
            subject + '.',
            `${material}, ${silverDesc}.`,
            archetype.scene + '.',
            `${cameraDesc}.`,
            `${mood} mood, ${lighting}.`,
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            stylingDesc ? stylingDesc + '.' : '',
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
            'Sharp critical focus on jewelry, perfect geometric proportions, 8K resolution, style photographic, professional commercial photography, RAW quality.',
            anatomyConstraint,
            `Aspect ratio ${ratio}.`,
            negativePrompt,
        ];

        return parts.filter(Boolean).join(' ');
    },

    // ── Copy All ─────────────────────────────────────────────────
    _copyAll() {
        if (!this._currentPrompts || this._currentPrompts.length === 0) return;
        const text = this._currentPrompts.map((p, i) =>
            `--- ${p.icon} ${p.archetype} ---\n${p.text}`
        ).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            Elaris.toast('All prompts copied ✓', 'success');
        });
    },

    // ── Render History ───────────────────────────────────────────
    _renderHistory() {
        const el = this.container.querySelector('#ps-history');
        const items = this.state.history.slice(0, 20);
        if (items.length === 0) {
            el.innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:20px">No prompts generated yet</p>';
            return;
        }
        el.innerHTML = items.map((h, i) => `
            <div class="ps-history-item" data-hidx="${i}">
                <div class="ps-history-head">
                    <span>${h.icon} ${h.archetype}</span>
                    <span class="text-sm text-muted">${h.timestamp}</span>
                </div>
                <div class="ps-history-preview">${h.text.substring(0, 80)}...</div>
            </div>
        `).join('');

        el.querySelectorAll('.ps-history-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.hidx);
                const h = this.state.history[idx];
                if (h) {
                    navigator.clipboard.writeText(h.text).then(() => {
                        Elaris.toast('Prompt copied from history ✓', 'success');
                    });
                }
            });
        });
    },

    // ── Utility ──────────────────────────────────────────────────
    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
};

window.PromptStudio = PromptStudio;
window.render_promptstudio = function(container) { PromptStudio.init(container); };
