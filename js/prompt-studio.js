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

    // ── Jewelry Categories ──────────────────────
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

    // ── 8 Creative Archetypes ──────────────────────
    archetypes: [
        {
            id: 'body-intimate',
            name: 'Body Intimate',
            icon: '🤲',
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
            icon: '🌿',
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
            icon: '🦋',
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
            icon: '💎',
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
            icon: '🎭',
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
            icon: '🌑',
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
            icon: '🔡',
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
            icon: '✨',
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
            icon: '🔬',
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
            icon: '📐',
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
                'model turning head with hair in motion, {piece} sharp and frozen mid-swing',
                'flowing silk fabric billowing around model wearing {piece}, jewelry pin-sharp against motion blur',
                'model walking, dress fabric caught mid-flow, {piece} in perfect focus',
                'wind-blown hair revealing {piece}, strands streaking across frame',
                'model spinning, {piece} frozen in sharp detail while dress blurs around her',
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
                'close-up of model\u2019s eyes and {piece}, shallow anamorphic lens flare crossing frame',
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
                'model wearing {piece} in ornate vintage mirror, reflection showing the piece from a complementary angle',
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
        // ── NEW: Seasonal ──────────────────────
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
                '{piece} in an open velvet jewelry box surrounded by wedding confetti and champagne glass, bridal season',
                '{piece} arranged with autumn leaves and warm cinnamon sticks, fall collection launch',
            ],
            scene: 'seasonal color palette and props, warm inviting atmosphere, gift-giving context, lifestyle storytelling, aspirational yet accessible, editorial product photography',
            compat: { ring: 90, necklace: 90, earrings: 85, bracelet: 85, bangles: 75, anklet: 60, brooch: 70, pendant: 90, 'body-jewelry': 50 },
        },
        // ── NEW: Lifestyle ──────────────────────
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
        // ── NEW: Nature/Botanical ──────────────────────
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
        // ── NEW: Heritage/Moroccan ──────────────────────
        {
            id: 'heritage-moroccan',
            name: 'Heritage & Moroccan',
            icon: '🏺',
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
        // ── NEW: Minimalist ──────────────────────
        {
            id: 'minimalist-space',
            name: 'Minimalist & Space',
            icon: '🤍',
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
        // ── NEW: Expansions ──────────────────────
        {
            id: 'desert-mirage',
            name: 'Desert Mirage',
            icon: '🏜️',
            tagline: 'Sahara Fashion Campaign',
            bestFor: 'Best for: Statement necklaces, bangles, large pieces',
            desc: 'Rolling sand dunes, intense sun, flowing fabrics',
            color: '#3d2b1f',
            subjects: [
                'model in flowing white fabric standing on massive sand dune wearing {piece}, intense sunlight',
                '{piece} half-buried in pristine wind-swept desert sand, golden hour lighting',
                'close-up of model face partially covered by desert scarf, {piece} visible and catching harsh sunlight',
                '{piece} resting on a sun-bleached piece of desert driftwood',
                'model walking away through desert heat haze, {piece} sparkling brightly on back/neck'
            ],
            scene: 'expansive desert landscape, intense direct sunlight, deep shadows, warm cinematic color grading, heat haze, luxury editorial travel photography',
            compat: { ring: 60, necklace: 95, earrings: 85, bracelet: 70, bangles: 95, anklet: 50, brooch: 65, pendant: 80, 'body-jewelry': 85 },
        },
        {
            id: 'neon-cyberpunk',
            name: 'Neon Cyberpunk',
            icon: '⚡',
            tagline: 'Futuristic Streetwear',
            bestFor: 'Best for: Chunky rings, chains, streetwear collections',
            desc: 'Modern edgy aesthetic, deep blacks with vibrant neon reflections',
            color: '#1a1025',
            subjects: [
                'model in dark techwear standing in neon-lit city street wearing {piece}, cyberpunk vibes',
                '{piece} resting on wet asphalt reflecting bright pink and cyan neon signs',
                'close up of {piece} illuminated entirely by blue neon light in a dark room',
                'model with glowing LED glasses wearing {piece}, futuristic editorial',
                '{piece} placed on metallic grate with purple underglow lighting'
            ],
            scene: 'cyberpunk aesthetic, vibrant neon pink and cyan lighting, deep dark shadows, gritty urban textures, highly reflective silver, modern streetwear fashion',
            compat: { ring: 95, necklace: 85, earrings: 70, bracelet: 90, bangles: 60, anklet: 40, brooch: 50, pendant: 85, 'body-jewelry': 55 },
        },
        {
            id: 'vintage-nostalgia',
            name: 'Vintage Nostalgia',
            icon: '📷',
            tagline: '90s Polaroid Aesthetic',
            bestFor: 'Best for: Rings, earrings, candid lifestyle',
            desc: 'Grainy textures, direct flash, retro fashion vibes',
            color: '#2a221f',
            subjects: [
                'candid snapshot of model laughing at a party wearing {piece}, red-eye flash effect',
                '{piece} photographed on a retro velvet sofa, disposable camera aesthetic',
                'model holding a vintage camera with {piece} visible on finger, grainy film texture',
                'close-up of {piece} with harsh direct flash creating blown-out highlights',
                'polaroid-style frame around an image of {piece} resting on a vinyl record'
            ],
            scene: 'vintage 90s film photography, disposable camera look, harsh direct paparazzi flash, heavy film grain, slightly desaturated or sepia tones, candid unposed feeling',
            compat: { ring: 90, necklace: 70, earrings: 85, bracelet: 75, bangles: 60, anklet: 50, brooch: 40, pendant: 60, 'body-jewelry': 45 },
        },
        {
            id: 'zero-gravity',
            name: 'Zero Gravity',
            icon: '🌀',
            tagline: 'Frozen in Mid-Air',
            bestFor: 'Best for: Pendants, earrings, abstract ads',
            desc: 'Jewelry suspended in mid-air surrounded by floating particles',
            color: '#151a25',
            subjects: [
                '{piece} floating in zero gravity surrounded by slowly drifting water droplets',
                '{piece} exploding out of a cloud of silver dust, frozen mid-air',
                '{piece} suspended in dark space with floating silk ribbons wrapping around it',
                'multiple {piece} floating chaotically against a pure black background',
                '{piece} falling through the air alongside floating rose petals'
            ],
            scene: 'zero gravity suspension, ultra-fast shutter speed freezing motion, floating particles or liquids, dynamic composition, pure black or dark background, high-end 3D render feel',
            compat: { ring: 80, necklace: 60, earrings: 95, bracelet: 50, bangles: 65, anklet: 40, brooch: 75, pendant: 95, 'body-jewelry': 30 },
        },
        {
            id: 'surface-lean',
            name: 'Surface Lean',
            icon: '🪑',
            tagline: 'Maximum Jewelry Visibility',
            bestFor: 'Best for: Rings, Bracelets, Mens collections, multi-piece shots',
            desc: 'Model leaning on a surface to frame the jewelry naturally with chin-on-hand poses',
            color: '#1e2a2a',
            subjects: [
                'model with elbow on marble table, chin resting on closed fist, {piece} prominently displayed, editorial close-crop',
                'model leaning forward, both forearms resting on surface, {piece} in sharp foreground focus, hands and wrists leading the eye',
                'model propping chin with interlaced fingers, {piece} displayed prominently at center frame',
                'model with both hands gently resting on surface, {piece} centered and in sharp focus',
                'model leaning into camera, wrist elegantly bent, {piece} visible at the foreground, casual editorial confidence',
            ],
            scene: 'low editorial angle, surface as anchor, warm studio or ambient window light, model looking relaxed and confident, jewelry in sharp focus at the foreground plane',
            compat: { ring: 98, necklace: 60, earrings: 65, bracelet: 95, bangles: 90, anklet: 30, brooch: 50, pendant: 55, 'body-jewelry': 40 },
        },
        {
            id: 'hair-drama',
            name: 'Hair Drama',
            icon: '💇',
            tagline: 'Ring Road, All Eyes on the Jewelry',
            bestFor: 'Best for: Rings, Stacking rings, Earrings, Editorial female model',
            desc: 'Hands running through or arranging hair — a natural gesture that frames earrings and rings simultaneously',
            color: '#2a1a2a',
            subjects: [
                'model running fingers through long hair, both hands raised, {piece} catching the light in motion',
                'model lifting hair off neck with one hand to reveal {piece}, sensual editorial gesture',
                'hands pulling hair back into loose updo, {piece} prominently displayed against the hair',
                'model tousling sun-kissed hair, face partially obscured, {piece} swinging mid-motion',
                'close-up of hands gathering hair at nape, {piece} displayed at every finger, golden hour backlight',
            ],
            scene: 'editorial fashion photography, hair in natural motion, backlighting to create rim-light halo on hair and jewelry, skin warm and glowing, creative finger placement',
            compat: { ring: 98, necklace: 50, earrings: 98, bracelet: 85, bangles: 80, anklet: 20, brooch: 30, pendant: 45, 'body-jewelry': 40 },
        },
        {
            id: 'masculine-editorial',
            name: 'Masculine Editorial',
            icon: '🧔',
            tagline: "Men's Jewelry — Bold and Intentional",
            bestFor: "Best for: Mens rings, necklaces, chains, bracelets, cuffs, signet rings",
            desc: 'Strong masculine editorial — suited or casual male model wearing jewelry with intention',
            color: '#1a1a1a',
            subjects: [
                'man in dark blazer, hand resting at cuff edge with {piece} prominently visible, sophisticated editorial',
                'man with rolled sleeves showing strong forearms, {piece} draped casually, masculine editorial detail',
                'close-up of man hand gripping steering wheel, {piece} clearly visible, golden hour light',
                'man adjusting jacket lapel, {piece} visible at open collar, confident gaze',
                "man's hand resting on a wooden bar top, {piece} prominent, warm candlelight and rich shadow",
                'man standing in archway, arm raised against the doorframe, {piece} bracelet sliding down wrist',
            ],
            scene: 'masculine editorial, strong confident mood, tailored or relaxed clothing, directional dramatic lighting, deep shadows and highlights, silver against dark clothing for maximum contrast',
            compat: { ring: 95, necklace: 90, earrings: 50, bracelet: 95, bangles: 60, anklet: 30, brooch: 55, pendant: 85, 'body-jewelry': 50 },
        },
        {
            id: 'royal-opulence',
            name: 'Royal Opulence',
            icon: '👑',
            tagline: 'The Highest Tier of Luxury',
            bestFor: 'Best for: Statement pieces, bridal, high-ticket items',
            desc: 'Heavy velvet cushions, gold leaf accents, ornate palaces',
            color: '#2a1a1f',
            subjects: [
                '{piece} resting on a deep crimson velvet royal pillow with gold tassels',
                'model in extravagant Renaissance-style gown wearing {piece} in an opulent palace room',
                '{piece} displayed next to an antique golden chalice and crown jewels',
                'close-up of {piece} nestled among layers of rich embroidered silk and gold thread',
                '{piece} sitting on a polished mahogany table next to a sealed wax letter'
            ],
            scene: 'extreme opulence and wealth, rich deep colors (crimson, gold, royal blue), antique textures, palatial setting, dramatic chiaroscuro lighting, maximalist luxury',
            compat: { ring: 85, necklace: 95, earrings: 90, bracelet: 80, bangles: 75, anklet: 30, brooch: 90, pendant: 85, 'body-jewelry': 40 },
        },
    ],

    // ── Modifiers ──────────────────────
    moods: [
        { id: 'dramatic', label: 'Dramatic' },
        { id: 'soft', label: 'Soft & Romantic' },
        { id: 'warm', label: 'Warm & Inviting' },
        { id: 'cool', label: 'Cool & Modern' },
        { id: 'surreal', label: 'Surreal & Dreamy' },
        { id: 'editorial', label: 'Editorial & Sharp' },
        { id: 'mystical', label: 'Mystical & Dark' },
        { id: 'candid', label: 'Candid & Lifestyle' },
        { id: 'avant-garde', label: 'Avant-Garde & High Fashion' },
    ],

    lightings: [
        { id: 'golden-hour', label: 'Golden Hour' },
        { id: 'studio', label: 'Studio Lighting' },
        { id: 'natural', label: 'Natural Daylight' },
        { id: 'dramatic-shadows', label: 'Dramatic Shadows' },
        { id: 'backlit', label: 'Backlit / Rim Light' },
        { id: 'soft-diffused', label: 'Soft Diffused' },
        { id: 'hard-flash', label: 'Hard Flash / Paparazzi' },
        { id: 'dappled-sunlight', label: 'Dappled Sunlight' },
    ],

    formats: [
        { id: 'square', label: '1:1 Post', ratio: '1:1' },
        { id: 'portrait', label: '4:5 Portrait', ratio: '4:5' },
        { id: 'story', label: '9:16 Story', ratio: '9:16' },
        { id: 'landscape', label: '16:9 Wide', ratio: '16:9' },
        { id: 'pinterest', label: '2:3 Pinterest', ratio: '2:3' },
        { id: 'portrait-3-4', label: '3:4 Portrait', ratio: '3:4' },
    ],

    // ── Camera Angles ──────────────────────
    get angles() {
        return [
            // ── Classic Angles ──────────────────────────────────────────
            { id: 'eye-level',      label: window.I18n ? window.I18n.t('ps_ang_eye') : 'Eye Level' },
            { id: '45-degree',      label: window.I18n ? window.I18n.t('ps_ang_45') : '45° Three-Quarter' },
            { id: 'side-profile',   label: 'Side Profile' },
            { id: 'glance-down',    label: 'Glance Down' },
            { id: 'overhead',       label: window.I18n ? window.I18n.t('ps_ang_overhead') : 'Overhead / Bird\'s Eye' },
            { id: 'low-angle',      label: window.I18n ? window.I18n.t('ps_ang_low') : 'Low Angle (Hero)' },
            { id: 'dutch',          label: window.I18n ? window.I18n.t('ps_ang_dutch') : 'Dutch Angle' },
            { id: 'over-shoulder',  label: window.I18n ? window.I18n.t('ps_ang_shoulder') : 'Over the Shoulder' },
            { id: 'from-behind',    label: 'From Behind (Nape)' },
            // ── Macro & Product Angles ──────────────────────────────────
            { id: 'macro',          label: window.I18n ? window.I18n.t('ps_ang_macro') : 'Macro Close-up' },
            { id: 'extreme-macro',  label: 'Extreme Macro (Gem Facets)' },
            { id: 'flat-lay',       label: 'Flat Lay (Top-Down)' },
            { id: 'knuckle-level',  label: 'Knuckle Level (Table-Height)' },
            // ── Cinematic & Trending ────────────────────────────────────
            { id: 'worms-eye',      label: "Worm's Eye (Looking Up)" },
            { id: 'silhouette',     label: 'Silhouette (Backlit)' },
            { id: 'golden-hour',    label: 'Golden Hour (Rim Light)' },
            { id: 'through-glass',  label: 'Through Glass / Crystal' },
            { id: 'candid',         label: 'Candid / Stolen Moment' },
            { id: 'tilt-shift',     label: 'Tilt-Shift (Selective Plane)' },
            // ── Editorial & Fashion ─────────────────────────────────────
            { id: 'top-down-hand',  label: 'Top-Down Hand (Aerial Wrist)' },
            { id: 'chin-up',        label: 'Chin Up (Looking Down the Lens)' },
            { id: 'foreground-blur', label: 'Foreground Blur (Bokeh Frame)' },
        ];
    },

    // Returns angles sorted best-to-least for the selected jewelry category
    _getAnglesForCategory(category) {
        const rankings = {
            // Ring: macro detail, then knuckle-level for product, 45° for editorial
            'ring': [
                'macro', 'extreme-macro', 'knuckle-level', '45-degree', 'glance-down',
                'top-down-hand', 'eye-level', 'flat-lay', 'low-angle', 'golden-hour',
                'through-glass', 'over-shoulder', 'overhead', 'tilt-shift', 'candid',
                'dutch', 'side-profile', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Necklace: eye-level shows chain + pendant at chest, glance-down reveals drop
            'necklace': [
                'eye-level', 'glance-down', '45-degree', 'chin-up', 'golden-hour',
                'over-shoulder', 'side-profile', 'through-glass', 'low-angle', 'silhouette',
                'macro', 'from-behind', 'candid', 'tilt-shift', 'foreground-blur',
                'overhead', 'dutch', 'flat-lay', 'extreme-macro', 'knuckle-level',
                'top-down-hand', 'worms-eye',
            ],
            // Bracelet/Bangle: top-down-hand and knuckle-level are ideal for wrist pieces
            'bracelet': [
                'top-down-hand', 'macro', 'knuckle-level', 'overhead', '45-degree',
                'glance-down', 'flat-lay', 'extreme-macro', 'eye-level', 'golden-hour',
                'through-glass', 'low-angle', 'tilt-shift', 'over-shoulder', 'side-profile',
                'candid', 'dutch', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Earring: side profile is #1, shows earring drop perfectly
            'earring': [
                'side-profile', '45-degree', 'glance-down', 'extreme-macro', 'macro',
                'from-behind', 'eye-level', 'over-shoulder', 'golden-hour', 'chin-up',
                'through-glass', 'silhouette', 'low-angle', 'tilt-shift', 'candid',
                'overhead', 'dutch', 'foreground-blur', 'flat-lay', 'knuckle-level',
                'top-down-hand', 'worms-eye',
            ],
            // Pendant: glance-down and eye-level reveal the drop at chest
            'pendant': [
                'eye-level', 'glance-down', '45-degree', 'macro', 'chin-up', 'golden-hour',
                'extreme-macro', 'over-shoulder', 'low-angle', 'side-profile', 'silhouette',
                'through-glass', 'tilt-shift', 'candid', 'foreground-blur', 'from-behind',
                'overhead', 'dutch', 'flat-lay', 'knuckle-level', 'top-down-hand', 'worms-eye',
            ],
            // Brooch: 45° shows lapel pin head-on, macro reveals craftsmanship
            'brooch': [
                '45-degree', 'macro', 'extreme-macro', 'eye-level', 'glance-down',
                'golden-hour', 'over-shoulder', 'through-glass', 'side-profile', 'tilt-shift',
                'chin-up', 'overhead', 'low-angle', 'dutch', 'candid', 'foreground-blur',
                'silhouette', 'flat-lay', 'from-behind', 'top-down-hand', 'knuckle-level', 'worms-eye',
            ],
            // Anklet: overhead and knuckle-level look down at ankle best
            'anklet': [
                'overhead', 'knuckle-level', 'glance-down', 'macro', 'flat-lay',
                'extreme-macro', 'low-angle', '45-degree', 'through-glass', 'golden-hour',
                'eye-level', 'tilt-shift', 'side-profile', 'over-shoulder', 'dutch',
                'candid', 'foreground-blur', 'from-behind', 'top-down-hand', 'worms-eye',
                'silhouette', 'chin-up',
            ],
            // Bangle: knuckle-level, macro and top-down-hand all work great for wrist
            'bangle': [
                'knuckle-level', 'macro', 'top-down-hand', 'overhead', 'flat-lay',
                '45-degree', 'extreme-macro', 'glance-down', 'eye-level', 'golden-hour',
                'through-glass', 'low-angle', 'tilt-shift', 'over-shoulder', 'side-profile',
                'candid', 'dutch', 'foreground-blur', 'from-behind', 'worms-eye',
                'silhouette', 'chin-up',
            ],
        };
        const order = rankings[category] || rankings['ring'];
        return [...this.angles].sort((a, b) => {
            const ai = order.indexOf(a.id);
            const bi = order.indexOf(b.id);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    },

    // ── Surface / Backdrop ──────────────────────
    get surfaces() {
        return [
            { id: 'none', label: window.I18n ? window.I18n.t('ps_surf_default') : 'Default (Archetype)' },
            { id: 'marble', label: window.I18n ? window.I18n.t('ps_surf_marble') : 'Marble' },
            { id: 'velvet', label: window.I18n ? window.I18n.t('ps_surf_velvet') : 'Velvet' },
            { id: 'sand', label: window.I18n ? window.I18n.t('ps_surf_sand') : 'Sand' },
            { id: 'concrete', label: window.I18n ? window.I18n.t('ps_surf_concrete') : 'Concrete' },
            { id: 'water', label: window.I18n ? window.I18n.t('ps_surf_water') : 'Water' },
            { id: 'silk', label: window.I18n ? window.I18n.t('ps_surf_silk') : 'Silk Fabric' },
            { id: 'skin', label: window.I18n ? window.I18n.t('ps_surf_skin') : 'Skin / Body' },
            { id: 'stone-wall', label: window.I18n ? window.I18n.t('ps_surf_stone') : 'Stone Wall' },
            { id: 'wood', label: window.I18n ? window.I18n.t('ps_surf_wood') : 'Raw Wood' },
            { id: 'terracotta', label: 'Terracotta / Zellige' },
            { id: 'mirrored-glass', label: 'Mirrored Glass' },
            { id: 'satin', label: 'Satin Fabric' },
        ];
    },

    // ── Color Palettes ──────────────────────
    get palettes() {
        return [
            { id: 'auto', label: 'Auto / Scene' },
            { id: 'neutral', label: window.I18n ? window.I18n.t('ps_pal_neutral') : 'Neutral Beige' },
            { id: 'warm-earth', label: window.I18n ? window.I18n.t('ps_pal_warm') : 'Warm Earth' },
            { id: 'cool-steel', label: window.I18n ? window.I18n.t('ps_pal_cool') : 'Cool Steel' },
            { id: 'monochrome', label: window.I18n ? window.I18n.t('ps_pal_mono') : 'Monochrome' },
            { id: 'jewel-tones', label: window.I18n ? window.I18n.t('ps_pal_jewel') : 'Jewel Tones' },
            { id: 'deep-ocean', label: window.I18n ? window.I18n.t('ps_pal_deep') : 'Deep Ocean' },
            { id: 'blush-rose', label: window.I18n ? window.I18n.t('ps_pal_blush') : 'Blush & Rose' },
            { id: 'noir', label: window.I18n ? window.I18n.t('ps_pal_noir') : 'Film Noir' },
        ];
    },

    // ── Model Styling (for human archetypes) ──────────────────────
    get stylings() {
        return [
            { id: 'auto', label: 'Auto / Scene' },
            { id: 'minimal', label: window.I18n ? window.I18n.t('ps_sty_minimal') : 'Minimal / Nude' },
            { id: 'black-dress', label: window.I18n ? window.I18n.t('ps_sty_black') : 'Black Dress' },
            { id: 'silk-cami', label: window.I18n ? window.I18n.t('ps_sty_silk') : 'Silk Camisole' },
            { id: 'blazer', label: window.I18n ? window.I18n.t('ps_sty_blazer') : 'Suit / Blazer' },
            { id: 'caftan', label: window.I18n ? window.I18n.t('ps_sty_caftan') : 'Traditional Caftan' },
            { id: 'white-shirt', label: window.I18n ? window.I18n.t('ps_sty_white') : 'White Shirt' },
            { id: 'evening-gown', label: window.I18n ? window.I18n.t('ps_sty_evening') : 'Evening Gown' },
            { id: 'streetwear', label: window.I18n ? window.I18n.t('ps_sty_street') : 'Elevated Streetwear' },
        ];
    },

    // ── Scene Realism getters ──────────────────────
    get skinTextures() {
        return [
            { id: 'natural',    label: '🌿 Natural' },
            { id: 'pores',      label: '🔬 Pores & Texture' },
            { id: 'smooth',     label: '✨ Polished Smooth' },
            { id: 'luminous',   label: '💫 Luminous Glow' },
        ];
    },

    get wrinkleLevels() {
        return [
            { id: 'none',       label: '✦ None' },
            { id: 'subtle',     label: '🌾 Subtle Lines' },
            { id: 'natural',    label: '🧬 Natural' },
            { id: 'character',  label: '🎭 Character Lines' },
        ];
    },

    get bodyHairLevels() {
        return [
            { id: 'none',       label: '✦ None' },
            { id: 'fine',       label: '🪶 Fine & Subtle' },
            { id: 'natural',    label: '🌱 Natural Visible' },
        ];
    },

    get skinDetails() {
        return [
            { id: 'none',         label: '✦ Standard' },
            { id: 'veins',        label: '🩸 Veins Visible' },
            { id: 'freckles',     label: '🌟 Freckles / Spots' },
            { id: 'translucent',  label: '💎 Skin Translucency' },
        ];
    },

    get facialExpressions() {
        return [
            { id: 'none',       label: '✦ Neutral' },
            { id: 'serene',     label: '😌 Serene / Calm' },
            { id: 'smile',      label: '😊 Soft Smile' },
            { id: 'joy',        label: '😄 Joy / Laugh' },
            { id: 'intense',    label: '🔥 Intense / Focus' },
            { id: 'sultry',     label: '💋 Sultry / Confident' },
            { id: 'thoughtful', label: '🤔 Thoughtful / Dream' },
        ];
    },


    // ── State ──────────────────────
    jewelryStyles: [
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
        palette: 'auto',
        styling: 'auto',
        hallmarkEnabled: false,
        history: [],
        jewelryCount: 0,
        consistencyOn: false,
        modelImageAttached: true,   // when false: use model descriptor only (no image ref slot)
        modelGender: 'female',
        jewelryStyle: [],
        activeProfileId: 'lina',
        profiles: [],
        // Realism controls
        skinTexture: 'natural',
        wrinkles: 'none',
        bodyHair: 'none',
        skinDetail: 'none',
        facialExpression: 'none',
        brandTouch: 'none',       // 'none' | 'logomark' | 'wordmark'
    },

    // ── Profiles Management ──────────────────────
    _loadProfiles() {
        // ── Built-in profiles are always guaranteed to exist ──────────────────
        // These are the hardcoded defaults. They are available on every device
        // without requiring localStorage. User edits (e.g. reference images)
        // are preserved by merging saved data over the defaults.
        const BUILT_IN = [
            {
                id: 'lina', name: 'Lina', gender: 'female',
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
            // ── Additional female profiles (Moroccan audience) ──────────────
            {
                id: 'nour', name: 'Nour', gender: 'female',
                descriptor: 'Woman, 24 years old, light olive Amazigh skin tone, warm green-brown almond eyes, delicate refined features, straight dark hair with subtle natural highlights, slim graceful build, fresh natural Moroccan radiance, gentle confident expression',
                referenceImage: null, color: '#d4a574'
            },
            {
                id: 'malak', name: 'Malak', gender: 'female',
                descriptor: 'Woman, 32 years old, warm golden-tan Moroccan skin tone, full expressive lips, deep dark soulful eyes, voluminous wavy dark brown hair past shoulders, defined cheekbones, mature confident Mediterranean beauty, powerful yet feminine presence',
                referenceImage: null, color: '#c17f4a'
            },
            {
                id: 'rania', name: 'Rania', gender: 'female',
                descriptor: 'Woman, 27 years old, deep olive Moroccan skin tone, strong bone structure, high prominent cheekbones, kohled dark expressive eyes, long straight black hair, tall elegant build, powerful editorial presence, striking North African features',
                referenceImage: null, color: '#8b6e4e'
            },
            // ── Additional male profiles (Moroccan audience) ──────────────
            {
                id: 'younes', name: 'Younes', gender: 'male',
                descriptor: 'Man, 28 years old, warm tawny Moroccan skin tone, sharp defined jawline, warm hazel eyes, dark medium-length styled hair, slim athletic build, modern confident Moroccan professional, relaxed editorial energy, lightly stubbled jaw',
                referenceImage: null, color: '#7ba7c9'
            },
            {
                id: 'mehdi', name: 'Mehdi', gender: 'male',
                descriptor: 'Man, 36 years old, deep bronze Moroccan skin tone, full dense dark beard, strong angular chiseled features, dark intense eyes, broad powerful build, commanding executive presence, sophisticated masculine gravitas',
                referenceImage: null, color: '#4a7c59'
            },
            {
                id: 'karim', name: 'Karim', gender: 'male',
                descriptor: 'Man, 23 years old, light olive Maghrebi skin tone, clean-shaven sharp angular face, youthful defined features, dark styled hair, lean energetic build, bright confident eyes, fresh contemporary Moroccan editorial energy',
                referenceImage: null, color: '#9b8ea6'
            },
        ];
        const BUILT_IN_IDS = BUILT_IN.map(p => p.id);

        let customProfiles = [];
        let savedBuiltIns  = {};

        try {
            const saved = localStorage.getItem('elaris_model_profiles');
            if (saved) {
                const savedProfiles = JSON.parse(saved);
                savedProfiles.forEach(p => {
                    if (BUILT_IN_IDS.includes(p.id)) {
                        // Preserve any user edits (reference image, etc.)
                        savedBuiltIns[p.id] = p;
                    } else {
                        // User-created custom profile — keep it
                        customProfiles.push(p);
                    }
                });
            }
        } catch (e) { console.error('Failed to load profiles', e); }

        // Merge: built-ins first (with any user edits), then custom profiles
        // This guarantees Lina, Sara, Amir & Tariq always appear on any device
        const mergedBuiltIns = BUILT_IN.map(p => savedBuiltIns[p.id] || p);
        this.state.profiles = [...mergedBuiltIns, ...customProfiles];
        this._saveProfiles();
    },

    _getFilteredProfiles() {
        const gender = this.state.modelGender || 'female';
        return this.state.profiles.filter(p => (p.gender || 'female') === gender);
    },

    _saveProfiles() {
        try {
            localStorage.setItem('elaris_model_profiles', JSON.stringify(this.state.profiles));
        } catch (e) { console.error('Failed to save profiles', e); }
    },

    // ── Init ──────────────────────
    init(container) {
        this.container = container;
        this._sortMode = 'recommended';
        this._loadProfiles();
        this._render();
        this._renderArchetypeGrid();
        this._bind();
    },

    // ── Compute a single consistent score for sort + display ──────────────────────
    // This guarantees that badge rank = visual rank. Score is always 0-100.
    _computeScore(archetype, state) {
        const HUMAN = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama', 'wet-element',
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
            const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : score >= 50 ? '#f97316' : '#f87171';
            
            // Dynamic translation for archetypes based on ID prefix
            const tPrefix = a.id === 'body-intimate' ? 'body' :
                            a.id === 'object-pairing' ? 'obj' :
                            a.id === 'macro-detail' ? 'macro' :
                            a.id === 'editorial-abstract' ? 'edit' :
                            a.id === 'lifestyle-ritual' ? 'life' :
                            a.id === 'nature-botanical' ? 'nat' :
                            a.id === 'heritage-moroccan' ? 'her' :
                            a.id === 'minimalist-space' ? 'min' :
                            null;

            const name = tPrefix && window.I18n ? window.I18n.t(`ps_arch_${tPrefix}_title`) : a.name;
            const tagline = tPrefix && window.I18n ? window.I18n.t(`ps_arch_${tPrefix}_tag`) : a.tagline;
            const bestForText = window.I18n ? window.I18n.t('ps_best_for') : 'Best for:';
            const bestForVal = a.bestFor.replace('Best for:', '').trim();

            return `
                <div class="ps-arch-card ${isSelected ? 'active' : ''}" data-arch="${a.id}">
                    <div class="ps-arch-icon" style="--arch-color:${a.color}">${a.icon}</div>
                    <div class="ps-arch-info">
                        <div class="ps-arch-name">${name}</div>
                        <div class="ps-arch-tag">${tagline}</div>
                        <div class="ps-arch-bestfor">${bestForText} ${bestForVal}</div>
                    </div>
                    <div class="ps-arch-score" style="color:${scoreColor}" title="Compatibility with ${this.state.category || 'ring'}">${score}</div>
                </div>
            `;
        }).join('');

        // Update count
        const countEl = this.container.querySelector('#ps-arch-count');
        if (countEl) countEl.textContent = `${this.state.selectedArchetypes.length} selected`;
    },

    // ── Render ──────────────────────
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
                            <label class="form-label">Jewelry Style</label>
                            <div class="ps-chip-group" id="ps-jewelry-style" style="flex-wrap:wrap">
                                ${this.jewelryStyles.map(s => `<button class="ps-chip ${(this.state.jewelryStyle||[]).includes(s.id) ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>
                            <textarea class="form-textarea" id="ps-desc" rows="3" data-i18n="ps_piece_desc_ph" placeholder="e.g. multi-band crossover ring with pavé diamond accents and intertwining silver bands"></textarea>
                        </div>
                        <button class="btn btn-sm btn-secondary" id="ps-auto-desc" style="width:100%" data-i18n="ps_auto_desc">✨ Auto-describe from category</button>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Brand Identity</span>
                        </div>
                        <div class="form-group">
                            <p class="text-sm text-muted" style="line-height:1.4;margin-bottom:8px">Add Elaris signature to the model's clothing — a subtle brand identifier so your images are unmistakably yours.</p>
                            <div class="ps-chip-group" id="ps-brand-touch">
                                <button class="ps-chip ${this.state.brandTouch === 'none' ? 'active' : ''}" data-val="none">None</button>
                                <button class="ps-chip ${this.state.brandTouch === 'logomark' ? 'active' : ''}" data-val="logomark" title="Small four-pointed star brooch on lapel">⭐ Logomark</button>
                                <button class="ps-chip ${this.state.brandTouch === 'wordmark' ? 'active' : ''}" data-val="wordmark" title="ELARIS wordmark embroidered on clothing">ELARIS Wordmark</button>
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-top:6px;margin-bottom:0">
                                ${this.state.brandTouch === 'logomark' ? '⭐ Four-pointed star pin brooch on lapel — Elaris signature.' : this.state.brandTouch === 'wordmark' ? '"ELARIS" embroidered on lapel or collar — brand always present.' : 'No brand marking added to scene.'}
                            </p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Model &amp; Human Elements</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model Gender</label>
                            <div id="ps-gender-select" class="ps-chip-group" style="margin-bottom:0">
                                <button class="ps-chip ${this.state.modelGender === 'female' ? 'active' : ''}" data-val="female">♀ Female</button>
                                <button class="ps-chip ${this.state.modelGender === 'male' ? 'active' : ''}" data-val="male">♂ Male</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_jewelry_shots">Jewelry Shots</label>
                            <div class="ps-chip-group" id="ps-jewelry-count">
                                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="ps-chip ${this.state.jewelryCount === n ? 'active' : ''}" data-val="${n}">${n === 0 ? (window.I18n ? window.I18n.t('ps_none') : 'None') : n}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="padding-top:12px;border-top:1px solid var(--border)">
                            <div style="display:flex;align-items:center;justify-content:space-between">
                                <div>
                                    <label class="form-label" style="margin-bottom:2px" data-i18n="ps_consistency_toggle">Model Consistency</label>
                                    <p class="text-sm text-muted" style="line-height:1.4;max-width:240px" data-i18n="ps_consistency_desc">Lock a virtual model across all your shots.</p>
                                </div>
                                <label class="wm-toggle-label">
                                    <input type="checkbox" id="ps-consistency-toggle" ${this.state.consistencyOn ? 'checked' : ''}>
                                    <span class="wm-toggle-switch"></span>
                                </label>
                            </div>
                        </div>
                        ${this.state.consistencyOn ? `
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
                                <label class="form-label" style="margin:0" data-i18n="ps_model_profile">Model Profile</label>
                                <button class="btn btn-sm btn-secondary" id="ps-new-profile" data-i18n="ps_new_profile">+ New</button>
                            </div>
                            <div id="ps-new-profile-form" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:12px">
                                <input type="text" id="ps-new-profile-name" placeholder="Model name" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--primary);margin-bottom:8px;padding:4px 0;outline:none">
                                <textarea id="ps-new-profile-desc" rows="2" placeholder="Physical descriptor..." style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:8px;font-size:12px;outline:none"></textarea>
                                <button class="btn btn-sm btn-primary" id="ps-save-profile" style="width:100%;margin-top:8px" data-i18n="ps_save_profile">Save Profile</button>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:8px" id="ps-profile-list">
                                ${this._getFilteredProfiles().map(p => `
                                    <div class="profile-card ${this.state.activeProfileId === p.id ? 'active' : ''}" data-id="${p.id}" style="border:1px solid ${this.state.activeProfileId === p.id ? p.color : 'var(--border)'};border-radius:8px;padding:10px;cursor:pointer;background:${this.state.activeProfileId === p.id ? p.color+'15' : 'transparent'};transition:all 0.2s">
                                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
                                            <div style="width:32px;height:32px;border-radius:50%;background:${p.referenceImage ? 'transparent' : p.color+'30'};border:1px solid ${p.color};display:flex;align-items:center;justify-content:center;color:${p.color};position:relative;overflow:hidden">
                                                ${p.referenceImage ? `<img src="${p.referenceImage}" style="width:100%;height:100%;object-fit:cover">` : p.name.charAt(0)}
                                                <label title="Upload reference image" style="position:absolute;bottom:-4px;right:-4px;background:var(--surface);border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;border:1px solid var(--border)" onclick="event.stopPropagation()">
                                                    📂<input type="file" accept="image/*" class="ps-upload-ref" data-id="${p.id}" style="display:none">
                                                </label>
                                            </div>
                                            <div style="flex:1">
                                                <div style="font-size:13px;font-weight:500;color:var(--text)">${p.name}</div>
                                                ${p.referenceImage ? `<div style="font-size:10px;color:var(--success)">✓ Ref. image</div>` : ''}
                                            </div>
                                        </div>
                                        <div style="font-size:11px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.descriptor}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
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
                        <div class="card-header"><span class="card-title" data-i18n="ps_adv_controls">Advanced Controls</span></div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_angle">Camera Angle</label>
                            <div class="ps-chip-group" id="ps-angle">
                                ${this._getAnglesForCategory(this.state.category).map((a, i) => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}" title="${i < 3 ? 'Recommended for ' + (this.state.category || 'ring') : a.label}" style="${i === 0 ? 'border-color:var(--accent);' : i < 3 ? 'border-color:var(--accent);opacity:0.85;' : ''}">${i === 0 ? '⭐ ' : ''}${a.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_surface">Surface / Backdrop</label>
                            <div class="ps-chip-group" id="ps-surface">
                                ${this.surfaces.map(s => `<button class="ps-chip ${s.id === this.state.surface ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_palette">Color Palette</label>
                            <div class="ps-chip-group" id="ps-palette">
                                ${this.palettes.map(p => `<button class="ps-chip ${p.id === this.state.palette ? 'active' : ''}" data-val="${p.id}">${p.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label"><span data-i18n="ps_styling">Model Styling</span> <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-styling">
                                ${this.stylings.map(s => `<button class="ps-chip ${s.id === this.state.styling ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>

                        <!-- ── Scene Realism Controls ─────────────────── -->
                        <div class="form-group" style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border)">
                            <label class="form-label" style="font-size:11px;letter-spacing:0.06em;opacity:0.7;text-transform:uppercase;font-weight:700">🎭 Scene Realism</label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skin Texture</label>
                            <div class="ps-chip-group" id="ps-skin-texture">
                                ${this.skinTextures.map(s => `<button class="ps-chip ${s.id === this.state.skinTexture ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Expression Lines / Wrinkles</label>
                            <div class="ps-chip-group" id="ps-wrinkles">
                                ${this.wrinkleLevels.map(w => `<button class="ps-chip ${w.id === this.state.wrinkles ? 'active' : ''}" data-val="${w.id}">${w.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Body Hair <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-body-hair">
                                ${this.bodyHairLevels.map(b => `<button class="ps-chip ${b.id === this.state.bodyHair ? 'active' : ''}" data-val="${b.id}">${b.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Skin Detail</label>
                            <div class="ps-chip-group" id="ps-skin-detail">
                                ${this.skinDetails.map(d => `<button class="ps-chip ${d.id === this.state.skinDetail ? 'active' : ''}" data-val="${d.id}">${d.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Facial Expression <span class="text-sm text-muted">(human archetypes)</span></label>
                            <div class="ps-chip-group" id="ps-facial-expression">
                                ${this.facialExpressions.map(f => `<button class="ps-chip ${f.id === this.state.facialExpression ? 'active' : ''}" data-val="${f.id}">${f.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="margin-top:6px;padding-top:12px;border-top:1px solid var(--border)">
                            <div style="display:flex;align-items:center;justify-content:space-between">
                                <div>
                                    <label class="form-label" style="margin-bottom:2px" data-i18n="ps_hallmark_title">Hallmark Injection 🏷️</label>
                                    <p class="text-sm text-muted" style="line-height:1.4;max-width:240px" data-i18n="ps_hallmark_desc">Adds "ELARIS" engraving instructions to prompts. May produce inaccurate logos — use Watermark Studio for exact branding.</p>
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
                            <span class="card-title" data-i18n="ps_arch_title">Select Archetypes</span>
                            <div style="display:flex;align-items:center;gap:8px">
                                <div class="ps-chip-group ps-sort-group" id="ps-sort-mode" style="gap:4px">
                                    <button class="ps-chip active" data-val="recommended" style="font-size:11px;padding:4px 10px" data-i18n="ps_sort_rec">+ Recommended</button>
                                    <button class="ps-chip" data-val="alpha" style="font-size:11px;padding:4px 10px" data-i18n="ps_sort_az">A–Z</button>
                                </div>
                                <span class="text-sm text-muted" id="ps-arch-count">0 <span data-i18n="ps_selected">selected</span></span>
                            </div>
                        </div>
                        <div class="ps-archetype-grid" id="ps-archetypes"></div>
                    </div>

                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="btn btn-primary btn-lg" id="ps-generate" style="flex:1" data-i18n="ps_generate">
                            ✨ Generate Prompts
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
                            <span class="card-title" data-i18n="ps_history">Prompt History</span>
                            <button class="btn btn-sm btn-secondary" id="ps-clear-history" data-i18n="ps_clear">Clear</button>
                        </div>
                        <div id="ps-history" class="ps-history-list">
                            <p class="text-sm text-muted" style="text-align:center;padding:20px">No prompts generated yet</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="ps_quick_tips">Quick Tips</span></div>
                        <div class="ps-tips">
                            <div class="ps-tip">💡 Select multiple archetypes for batch prompt generation</div>
                            <div class="ps-tip">✏️ Be specific in your piece description for best results</div>
                            <div class="ps-tip">📋 Copy prompts directly into Gemini, Midjourney, or Leonardo</div>
                            <div class="ps-tip">🔄 Re-generate for fresh variations of the same concept</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (window.I18n) window.I18n.applyLanguage();
    },

    // ── Event Binding ──────────────────────
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
        this._bindChipGroup('ps-skin-texture', 'skinTexture');
        this._bindChipGroup('ps-wrinkles', 'wrinkles');
        this._bindChipGroup('ps-body-hair', 'bodyHair');
        this._bindChipGroup('ps-skin-detail', 'skinDetail');
        this._bindChipGroup('ps-facial-expression', 'facialExpression');

        // Gender selector
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
        q('#ps-hallmark-toggle')?.addEventListener('change', e => {
            this.state.hallmarkEnabled = e.target.checked;
        });

        // Model Consistency Events
        const jcGroup = q('#ps-jewelry-count');
        if (jcGroup) {
            jcGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                jcGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.jewelryCount = parseInt(chip.dataset.val);
            });
        }

        const consToggle = q('#ps-consistency-toggle');
        if (consToggle) {
            consToggle.addEventListener('change', e => {
                this.state.consistencyOn = e.target.checked;
                this._render(); // Re-render to show/hide profile panel
                this._renderArchetypeGrid();
                this._bind();   // Re-bind events since DOM rebuilt
            });
        }

        // Model image reference: "📎 Image attached" / "📝 Text only"
        const mirGroup = q('#ps-model-image-ref');
        if (mirGroup) {
            mirGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                mirGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.modelImageAttached = chip.dataset.val === 'true';
                this._render();
                this._renderArchetypeGrid(); // must follow _render() to repopulate grid
                this._bind();
            });
        }

        // Brand Touch chips — needs _render() to update the hint text
        const btGroup = q('#ps-brand-touch');
        if (btGroup) {
            btGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                btGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.brandTouch = chip.dataset.val;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }

        const newProfBtn = q('#ps-new-profile');
        if (newProfBtn) {
            newProfBtn.addEventListener('click', () => {
                const form = q('#ps-new-profile-form');
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
            });
        }

        const saveProfBtn = q('#ps-save-profile');
        if (saveProfBtn) {
            saveProfBtn.addEventListener('click', () => {
                const nameInput = q('#ps-new-profile-name');
                const descInput = q('#ps-new-profile-desc');
                const name = nameInput.value.trim();
                const desc = descInput.value.trim();
                if (!name) return;
                const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                this.state.profiles.push({
                    id, name, descriptor: desc, referenceImage: null, color: '#c9a96e'
                });
                this.state.activeProfileId = id;
                this._saveProfiles();
                this._render();
                this._renderArchetypeGrid();
                this._bind();
                Elaris.toast('Profile saved', 'success');
            });
        }

        const profileList = q('#ps-profile-list');
        if (profileList) {
            profileList.addEventListener('click', e => {
                // Handle image upload label click
                if (e.target.closest('label') || e.target.type === 'file') return;
                
                const card = e.target.closest('.profile-card');
                if (!card) return;
                this.state.activeProfileId = card.dataset.id;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });

            profileList.querySelectorAll('.ps-upload-ref').forEach(input => {
                input.addEventListener('change', e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const id = e.target.dataset.id;
                    const reader = new FileReader();
                    reader.onload = ev => {
                        const prof = this.state.profiles.find(p => p.id === id);
                        if (prof) {
                            prof.referenceImage = ev.target.result;
                            this._saveProfiles();
                            this._render();
                            this._renderArchetypeGrid();
                            this._bind();
                            Elaris.toast('Reference image saved', 'success');
                        }
                    };
                    reader.readAsDataURL(file);
                });
            });
        }

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
            // Preserve numeric type: if the raw value is a pure integer string
            // (e.g. "0", "5", "10"), store it as a Number so === comparisons work.
            // Non-numeric values ('none', 'natural', 'female', etc.) stay as strings.
            const raw = chip.dataset.val;
            const asNum = parseFloat(raw);
            this.state[stateKey] = (!isNaN(asNum) && String(asNum) === raw) ? asNum : raw;
        });
    },

    // ── Auto-describe ──────────────────────
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
        Elaris.toast('Description auto-generated ✨', 'info');
    },

    // ── Generate Prompts ──────────────────────
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

        Elaris.toast(`${prompts.length} prompt(s) generated ✨`, 'success');

        // Scroll to output
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ── Jewelry placement instructions (injected early to prevent misplacement) ──
    _buildPlacementInstruction(category) {
        const rules = {
            'necklace': 'PLACEMENT: necklace worn at the FRONT of the neck, chain visible at the front of the chest, pendant resting at chest/décolletage — NEVER on the back or shoulders',
            'earring':  'PLACEMENT: earrings in earlobes one on each ear, visible from front or side, correctly proportioned to face size',
            'ring':     'PLACEMENT: ring fitted on a finger at correct anatomical size, ring width proportional to finger, never floating or oversized',
            'bracelet': 'PLACEMENT: bracelet on the wrist at proportional scale, sized for wrist diameter',
            'bangle':   'PLACEMENT: bangle on the wrist, correctly sized, not oversized',
            'anklet':   'PLACEMENT: anklet around the ankle, slender and proportional to ankle width',
            'pendant':  'PLACEMENT: pendant necklace at front of chest, pendant at correct scale, never on back',
            'brooch':   'PLACEMENT: brooch on lapel or upper chest of clothing, visible from front',
        };
        return rules[category] || '';
    },

    // ── Category + anatomy aware negative prompts ──────────────────────────
    // Combines anatomy negatives (for human archetypes) with category-specific
    // misplacement and scale negatives derived from real AI failure patterns.
    _buildCategoryNegatives(category, isHuman) {
        const anatomy = isHuman
            ? 'three arms, extra arms, extra limbs, malformed anatomy, extra fingers, six fingers, mutated limbs, fused fingers, asymmetrical geometry'
            : '(hand, fingers, skin, arm, human), distorted shape, asymmetrical geometry';

        // Scale: the most common AI failure — making jewelry gigantic
        const scale = 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to correct real-world scale, miniaturized accessories';

        // Placement: category-specific misplacement negatives
        const placement = {
            'necklace': 'necklace on the back, necklace hanging behind model, pendant on back, chain only visible from behind, necklace on shoulder, necklace placed at back of neck',
            'earring':  'earring too large, earring disproportionate to face size, earring larger than head, misplaced earring',
            'ring':     'ring too large for finger, ring not on finger, floating ring, ring covering entire hand',
            'bracelet': 'bracelet not on wrist, bracelet floating off body, bracelet on wrong limb',
            'bangle':   'bangle not on wrist, floating bangle, bangle on wrong body part',
            'anklet':   'anklet on wrist, anklet not on ankle, anklet floating',
            'pendant':  'pendant on back, pendant not visible from front, pendant hanging behind neck',
            'brooch':   'brooch floating off clothing, brooch not on lapel',
        };

        const placementNeg = isHuman ? (placement[category] || '') : '';  // product shots intentionally have no finger
        const parts = [anatomy, scale];
        if (placementNeg) parts.push(placementNeg);
        parts.push('AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, chromatic aberration, plastic texture, 3d render');

        return `Negative prompt: ${parts.join(', ')}.`;
    },

    // ── Build Single Prompt ──────────────────────
    _buildPrompt(archetype) {
        const piece = this.state.pieceDesc || 'jewelry piece';
        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';
        const mood = this.moods.find(m => m.id === this.state.mood)?.label.toLowerCase() || '';
        const lighting = this.lightings.find(l => l.id === this.state.lighting)?.label.toLowerCase() || '';
        const fmt = this.formats.find(f => f.id === this.state.format);
        const ratio = fmt ? fmt.ratio : '1:1';
        const angleName = this.angles.find(a => a.id === this.state.angle)?.label.toLowerCase() || '';
        const palette = this.palettes.find(p => p.id === this.state.palette)?.label.toLowerCase() || '';

        // ── FIX #2: Build subject without repeating material in the description ──────────────────────
        // The material descriptor is injected separately to avoid redundancy.
        const subject = this._getUniqueSubject(archetype).replace(/\{piece\}/g, piece);

        // ── FIX #1: Unified camera system — one lens per shot, no conflicts ──────────────────────
        // Each angle gets a complete, self-contained camera description:
        //   focal length + aperture + focus behavior + technique
        const cameraMap = {
            // ── Classic Angles ──────────────────────────────────────────────────
            'eye-level':       'shot on 85mm f/1.4 portrait lens, natural eye-level perspective, shallow depth of field',
            '45-degree':       'three-quarter angle on 85mm f/1.8 lens, natural dimensional depth and presence',
            'side-profile':    'pure side profile on 135mm f/2 lens, clean background separation, elegant silhouette',
            'glance-down':     'high angle slightly above eye level on 85mm lens, intimate glance-down perspective, emotive and delicate',
            'overhead':        'shot from directly above on 50mm f/4 lens, even focus plane across the subject',
            'low-angle':       'shot from below eye level on 35mm f/2.8 lens, hero angle creating power and drama',
            'dutch':           'camera tilted 15-25 degrees creating tension and editorial energy, 50mm f/2 lens',
            'over-shoulder':   'shot over the model\'s shoulder on 35mm f/2 lens, intimate reveal angle',
            'from-behind':     'shot from behind focusing on the nape and back details on 85mm f/1.8 lens, mysterious elegance',
            // ── Macro & Product Angles ──────────────────────────────────────────
            'macro':           'shot on 100mm f/2.8 macro lens, razor-thin depth of field, studio ring light, extreme surface detail',
            'extreme-macro':   'shot on 180mm macro lens at 2:1 magnification, individual gem facets and metal grain visible, zero breathing room around subject',
            'flat-lay':        'strict top-down flat lay on 50mm f/5.6 lens, perfectly level overhead, graphic two-dimensional composition',
            'knuckle-level':   'camera at surface height on 85mm f/1.4 lens, jewelry at exact eye level of the piece, intimate product-height perspective',
            // ── Cinematic & Trending ────────────────────────────────────────────
            'worms-eye':       'extreme upward-looking angle, camera below subject on 24mm f/2.8 lens, dramatically elongated and powerful composition',
            'silhouette':      'strong backlit silhouette against bright window or sky, form reduced to shape and outline, high contrast minimal detail',
            'golden-hour':     'shot at golden hour with warm rim-light behind subject, 85mm f/1.4, halo of warm light on jewelry and hair, deep warm bokeh',
            'through-glass':   'shot through glass, crystal prism, or water element on 85mm f/1.4, prismatic light refraction framing the piece',
            'candid':          'candid unposed natural moment on 70mm f/2.8, slight motion, real-world editorial energy, authentic and spontaneous',
            'tilt-shift':      'tilt-shift lens selective plane of focus, only a thin slice of the jewelry sharp, dreamy blur above and below',
            // ── Editorial & Fashion ─────────────────────────────────────────────
            'top-down-hand':   'aerial wrist-down shot from directly above the hand on 50mm f/2.8, ring or bracelet visible from above, arm extending from frame edge',
            'chin-up':         'model chin slightly up, looking directly down the lens on 85mm f/1.4, commanding editorial gaze, jewelry at chest level in foreground',
            'foreground-blur': 'subject in background, element of the jewelry or scene deliberately blurred in extreme foreground on 85mm f/1.4, framing bokeh effect',
        };
        const cameraDesc = cameraMap[this.state.angle] || 'shot on 85mm f/1.4 lens, shallow depth of field';

        // ── Silver-specific material descriptors ──────────────────────
        const silverDesc = this.state.material === '800-silver'
            ? 'warm oxidized patina, traditional Moroccan silverwork texture, hand-hammered artisanal finish'
            : 'rhodium-plated sheen, mirror-polished surface, brilliant metallic luster';

        // ── Surface/backdrop override ──────────────────────
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
                'terracotta': 'on traditional Moroccan terracotta zellige tile, artisanal texture',
                'mirrored-glass': 'on sharp mirrored glass surface, infinite reflections and modern polish',
                'satin': 'on smooth lustrous satin fabric, soft rolling liquid folds',
            };
            surfaceDesc = surfMap[this.state.surface] || '';
        }

        // ── Color palette direction ──────────────────────
        const paletteMap = {
            'auto': '',   // auto: no palette constraint — AI picks what fits the scene
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
        }

        // ── FIX #4: Detect if this is a product-only vs human archetype ──────────────────────
        const humanArchetypes = ['body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur', 'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama', 'lifestyle-moment', 'heritage-moroccan', 'architectural-context', 'wet-element'];
        const isHuman = humanArchetypes.includes(archetype.id);

        // Model styling (only for human archetypes) — gender-aware phrasing
        const modelGenderForStyling = this.state.modelGender || 'female';
        let stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'auto': '',   // auto: no styling constraint — AI matches the archetype scene
                'minimal': modelGenderForStyling === 'male'
                    ? 'model in minimal clean styling, strong build as the canvas'
                    : 'model in minimal styling, skin as the canvas',
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

        // Pose detail — ONLY injected for archetypes whose subject templates
        // describe a general scene (not a specific body position). For archetypes
        // like surface-lean, hair-drama, body-intimate, masculine-editorial, their
        // subject templates already fully describe the model's position — injecting
        // poseDesc on top would create two conflicting body descriptions.
        const POSE_ARCHETYPES = new Set(['editorial-model', 'bw-dramatic', 'cinematic-portrait', 'lifestyle-moment']);
        let poseDesc = '';
        if (isHuman && POSE_ARCHETYPES.has(archetype.id)) {
            const poseMap = {
                'body-intimate': [
                    'hand touching chin, {piece} centered on finger',
                    'hand placed gently on cheek, slight skin crease at fingertip, {piece} visible',
                    'fingers lightly pressed to lips, natural hand tension, {piece} prominent',
                    'hand resting against collarbone, relaxed natural wrist angle',
                    'both hands framing face loosely, natural finger drape',
                ],
                'editorial-model': [
                    'standing with one hand on hip, other loosely at side, confident gaze',
                    'arms crossed elegantly, jewelry on full display, strong editorial stance',
                    'one hand raised touching ear/earring, other dropped naturally',
                    'seated, hands resting in lap, upright elegant posture',
                    'leaning slightly forward, hands on thighs, direct camera engagement',
                ],
                'surface-lean': [
                    'both elbows on surface, chin resting on interlaced fingers, direct gaze',
                    'one elbow on surface, head tilted, hand loosely at cheek',
                    'forearms flat on surface, leaning forward, jewelry at forefront',
                ],
                'hair-drama': [
                    'both hands raised through hair, fingers spread, natural ring display',
                    'one hand lifting hair off shoulder, elbow raised, earring exposed',
                    'fingertips at crown pulling hair back, wrists bent naturally',
                ],
                'masculine-editorial': [
                    'standing with hands in jacket pockets, ring at cuff',
                    'forearm resting on ledge, sleeves rolled, bracelet prominent',
                    'both arms crossed, ring on clasped hands visible',
                ],
            };
            const poses = poseMap[archetype.id];
            if (poses && poses.length > 0) {
                // Pick random pose for variety
                poseDesc = poses[Math.floor(Math.random() * poses.length)];
            }
        }

        // Realism enhancers — wrinkles, natural skin texture for body shots
        let realismDesc = '';
        if (isHuman) {
            const realismPool = [
                'natural skin texture with subtle knuckle wrinkles adding authenticity',
                'fine skin creases at finger joints visible, photorealistic tactile quality',
                'natural hand tension and micro-wrinkles at contact points, editorial realism',
                'skin pores visible in close crop, photographic skin texture',
            ];
            // Use user-controlled realism settings if any are set
            const userSkinTexture = this.state?.skinTexture || 'natural';
            const userWrinkles = this.state?.wrinkles || 'none';
            const userBodyHair = this.state?.bodyHair || 'none';
            const userSkinDetail = this.state?.skinDetail || 'none';

            const realismParts = [];

            // Skin texture
            const skinTextureMap = {
                'natural':  'natural photorealistic skin texture with authentic micro-detail',
                'pores':    'visible skin pores and fine texture, hyperrealistic skin surface',
                'smooth':   'professionally smooth skin, polished editorial finish',
                'luminous': 'luminous skin glow, soft subsurface scattering effect',
            };
            if (userSkinTexture !== 'natural') realismParts.push(skinTextureMap[userSkinTexture] || '');

            // Wrinkles / expression lines
            const wrinkleMap = {
                'none':      '',
                'subtle':    'subtle natural expression lines, authentic skin character',
                'natural':   'natural wrinkles and skin creases visible, photorealistic authenticity',
                'character': 'prominent character expression lines, aged editorial realism',
            };
            if (userWrinkles !== 'none') realismParts.push(wrinkleMap[userWrinkles] || '');

            // Body hair
            const bodyHairMap = {
                'none':    '',
                'fine':    'fine subtle arm hair visible, natural human skin detail',
                'natural': 'natural body hair visible on arms and hands, authentic human realism',
            };
            if (userBodyHair !== 'none') realismParts.push(bodyHairMap[userBodyHair] || '');

            // Skin detail
            const skinDetailMap = {
                'none':        '',
                'veins':       'subtle veins visible beneath skin, dermal translucency',
                'freckles':    'natural freckles and sun spots visible on skin',
                'translucent': 'skin translucency with subsurface scattering, light passing through thin skin areas',
            };
            if (userSkinDetail !== 'none') realismParts.push(skinDetailMap[userSkinDetail] || '');

            if (realismParts.length > 0) {
                realismDesc = realismParts.filter(Boolean).join(', ');
            } else {
                // Fall back to the random realism pool for variety
                realismDesc = realismPool[Math.floor(Math.random() * realismPool.length)];
            }
        }

        // ── Facial Expression (human archetypes only) ──────────────────────
        let expressionDesc = '';
        if (isHuman) {
            const expressionMap = {
                'none':       '',
                'serene':     'serene calm expression, soft relaxed face, eyes slightly downcast, peaceful',
                'smile':      'gentle authentic smile, soft lips slightly parted, warmth in eyes',
                'joy':        'genuine laugh, joy visible in crinkled eyes and open smile, natural euphoria',
                'intense':    'intense focused gaze directly at camera, strong confident expression, sharp eyes',
                'sultry':     'sultry confident look, soft half-smile, eyes full of quiet confidence and sensuality',
                'thoughtful': 'thoughtful dreamy expression, eyes slightly unfocused, contemplative and poetic mood',
            };
            expressionDesc = expressionMap[this.state?.facialExpression || 'none'] || '';
        }


        // ── Anatomy constraints (only when humans are present) ──────────────────────
        let anatomyConstraint = '';
        if (isHuman || archetype.id === 'shadow-play') {
            anatomyConstraint = 'CRITICAL: Flawless human anatomy — exactly two arms, exactly two hands, exactly five fingers per hand, correct joint proportions, natural knuckle spacing, no extra or fused digits, photorealistic skin texture.';
        }

        // ── Hallmark brand injection — only when enabled ──────────────────────
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

        // ── Category-aware negative prompts (placement + scale + anatomy) ──────────────
        const category = this.state.category || 'ring';
        const negativePrompt = this._buildCategoryNegatives(category, isHuman);
        const placementRule  = this._buildPlacementInstruction(category);

        // ── Prompt structure: body (scene) + tail (quality + constraints) ──────────────────────
        // Splitting into body/tail allows Model Details to be injected BEFORE the
        // technical tail in consistency mode, ensuring the model descriptor has
        // higher token weight than the negative prompt.
        // ── Brand Touch (Elaris identity on model clothing) ──────────────────────
        let brandTouchDesc = '';
        if (isHuman && this.state.brandTouch === 'logomark') {
            // Gold metallic pin provides contrast against ANY garment color
            brandTouchDesc = 'model wearing a small polished gold four-pointed star pin brooch on the lapel or collar — the ELARIS brand logomark, gold metallic finish clearly visible against any garment color, a refined luxury styling accent';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            // High-contrast thread: gold on dark garments, charcoal on light — always legible
            brandTouchDesc = '"ELARIS" wordmark embroidered on the model\'s lapel or collar in high-contrast thread — gold embroidery on dark garments, deep charcoal on light garments — always clearly legible against the clothing, never blending into the fabric';
        }

        const bodyParts = [
            // SUBJECT — jewelry piece at the center, material injected cleanly on next line
            subject + '.',
            // PLACEMENT RULE — only for human archetypes (product shots have no finger)
            (isHuman && placementRule) ? `${placementRule}.` : '',
            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,
            // SCENE — archetype visual story (lighting, composition, mood)
            archetype.scene + '.',
            // CAMERA — lens, aperture, depth of field (no angle conflict)
            `${cameraDesc}.`,
            // MOOD & LIGHTING
            `${mood} mood, ${lighting}.`,
            // POSE (human only, no embedded skin notes)
            poseDesc ? `Pose: ${poseDesc}.` : '',
            // EXPRESSION (human only)
            expressionDesc ? `Expression: ${expressionDesc}.` : '',
            // REALISM (skin texture, wrinkles, body hair, skin detail — user controlled)
            realismDesc ? realismDesc + '.' : '',
            // SURFACE / PALETTE / STYLING
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            stylingDesc ? stylingDesc + '.' : '',
            // JEWELRY STYLE DIRECTION
            jewelryStyleDesc ? `Style direction: ${jewelryStyleDesc}.` : '',
            // BRAND HALLMARK (optional — jewelry engraving)
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
            // BRAND TOUCH — Elaris identity on model clothing (logomark / wordmark)
            brandTouchDesc ? brandTouchDesc + '.' : '',
        ];

        const tailParts = [
            'Sharp critical focus on jewelry, perfect geometric proportions, 8K resolution, style photographic, professional commercial photography, RAW quality.',
            anatomyConstraint,
            `Aspect ratio ${ratio}.`,
            negativePrompt,
        ];

        const standardPrompt = [...bodyParts, ...tailParts].filter(Boolean).join(' ');

        // ── MULTI-IMAGE CONSISTENCY LOGIC ──────────────────────
        if (this.state.jewelryCount > 0) {
            const jc = this.state.jewelryCount;
            const hasModelDesc  = this.state.consistencyOn;               // model descriptor enabled
            const hasModelImage = hasModelDesc && this.state.modelImageAttached; // ALSO has photo attached

            // Gender-correct pronouns
            const modelGender  = this.state.modelGender || 'female';
            const genderNoun   = modelGender === 'male' ? 'man'  : 'woman';
            const genderHisHer = modelGender === 'male' ? 'his'  : 'her';

            let p = `[IMAGE REFERENCES]\n`;
            p += jc === 1
                ? `Image 1 shows the exact jewelry piece to be featured.\n`
                : `Images 1 to ${jc} show the exact jewelry piece to be featured.\n`;

            // Only reference an image slot if the user is actually attaching one
            if (hasModelImage) {
                p += `Image ${jc + 1} is the model reference — keep ${genderHisHer} face, features, and skin tone perfectly identical.\n`;
            }

            p += `\n[JEWELRY RECONSTRUCTION]\n`;
            p += `Use ALL jewelry image(s) to reconstruct the ${this.state.category || 'piece'}. Maintain exact metal color, stone placement, and proportions.\n`;

            p += `\n[SCENE DIRECTION]\n`;
            if (hasModelImage) {
                // Photo attached: instruct AI to match the specific image
                p += `Generate a photo of the exact same ${genderNoun} from Image ${jc + 1} wearing the jewelry.\n`;
            } else if (hasModelDesc && isHuman) {
                // No photo: instruct AI to use the text descriptor as sole model reference
                p += `Generate a photo of a ${genderNoun} matching the Model Details description below, wearing the jewelry.\n`;
            } else if (isHuman) {
                p += `Generate a photo of a model wearing the jewelry.\n`;
            }
            // Product archetypes: no model direction — scene description speaks for itself

            // Body prompt (scene description)
            p += bodyParts.filter(Boolean).join(' ');

            // Model Details BEFORE the technical tail — higher token priority
            // Only injected for human archetypes (product shots don't have a model)
            if (hasModelDesc && isHuman) {
                const activeProf = this.state.profiles.find(prof => prof.id === this.state.activeProfileId);
                if (activeProf) {
                    if (hasModelImage) {
                        p += `\n\nModel Details: ${activeProf.descriptor}.`;
                    } else {
                        // Text-only: make the descriptor more prominent as the sole reference
                        p += `\n\nModel Details (sole appearance reference — no image attached): ${activeProf.descriptor}.`;
                    }
                }
            }

            // Technical tail last
            p += '\n\n' + tailParts.filter(Boolean).join(' ');

            return p;
        }

        return standardPrompt;
    },

    // ── Copy All ──────────────────────
    _copyAll() {
        if (!this._currentPrompts || this._currentPrompts.length === 0) return;
        const text = this._currentPrompts.map((p, i) =>
            `--- ${p.icon} ${p.archetype} ---\n${p.text}`
        ).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            Elaris.toast('All prompts copied ✓', 'success');
        });
    },

    // ── Render History ──────────────────────
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

    // ── Utility ──────────────────────
    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // ── Unique Subject Tracker ──────────────────────
    _subjectPools: {},
    _getUniqueSubject(archetype) {
        // If pool doesn't exist or is empty, create a new shuffled pool
        if (!this._subjectPools[archetype.id] || this._subjectPools[archetype.id].length === 0) {
            let indices = archetype.subjects.map((_, i) => i);
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            this._subjectPools[archetype.id] = indices;
        }
        
        // Pop the next unique index
        const idx = this._subjectPools[archetype.id].pop();
        return archetype.subjects[idx];
    },
};

window.PromptStudio = PromptStudio;

window.render_promptstudio = function(container) { PromptStudio.init(container); };
