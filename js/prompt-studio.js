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
        // ── v3.0: From Reference Library ──────────────────────
        {
            id: 'raw-field-editorial',
            name: 'Raw Field Editorial',
            icon: '🌾',
            tagline: 'Nature as the Studio',
            bestFor: 'Best for: Necklaces, Earrings, Bracelets — outdoor lifestyle',
            desc: 'Wind-blown hair, open fields, livestock, raw outdoor natural light — earthy and completely unposed',
            color: '#2a2015',
            subjects: [
                'model with wild wind-blown hair in an open field, {piece} catching sunlight, cattle in soft focus behind',
                'close-up portrait of model in rolling grasslands wearing {piece}, hair across face, natural breeze',
                'model in loose linen shirt in open farmland, {piece} at throat, mountains in misty distance behind',
                'tight face crop of model outdoors, {piece} visible, hair partially crossing face, natural imperfect beauty',
                'model in golden wheat field at dusk wearing {piece}, warm directional light sculpting face',
                'editorial portrait among wild flowers, {piece} catching the afternoon sun, raw unretouched skin',
            ],
            scene: 'real outdoor location, natural available light only, wind-blown hair, earthy tones, Altai/Sahara/steppe editorial energy, no studio polish, raw beauty, Hasselblad 85mm shallow depth of field',
            compat: { ring: 60, necklace: 90, earrings: 85, bracelet: 80, bangles: 75, anklet: 70, brooch: 50, pendant: 85, 'body-jewelry': 65 },
        },
        {
            id: 'veiled-mystery',
            name: 'Veiled Mystery',
            icon: '👁️',
            tagline: 'Only Eyes Reveal',
            bestFor: 'Best for: Earrings, Rings, Pendants — storytelling',
            desc: 'White linen, sheer silk, or scarf partially covering the face — only eyes or partial face visible, jewelry catching light',
            color: '#1f2535',
            subjects: [
                'model with white linen fabric draped across lower face, only eyes and {piece} earring visible, dark teal studio background',
                'model pulling sheer silk veil aside to partially reveal face, {piece} on finger or ear catching light',
                'tight crop of model eye-area, white fabric wrapped loosely, {piece} earring framing the eye',
                'model with flowing white muslin covering half the face, {piece} resting at chest visible through sheer fabric',
                'model framed by pulled-apart white fabric gap, {piece} on display, intense eye contact through the gap',
                'dramatic crop — one eye, one {piece} earring, fabric creating geometry across the frame',
            ],
            scene: 'strong studio or natural window light, fabric creates texture contrast with jewelry, high visual drama, cultural editorial aesthetic, dark muted or deep teal background, serene cinematic composition',
            compat: { ring: 80, necklace: 60, earrings: 98, bracelet: 40, bangles: 35, anklet: 20, brooch: 55, pendant: 75, 'body-jewelry': 45 },
        },
        {
            id: 'avant-garde-couture',
            name: 'Avant-Garde Couture',
            icon: '🎩',
            tagline: 'Fashion as Architecture',
            bestFor: 'Best for: Earrings, Brooches, Statement Pendants',
            desc: 'Sculptural headwear, futuristic visors, paper flower headdresses — extreme high fashion where the environment IS the statement',
            color: '#28201a',
            subjects: [
                'model wearing a massive sculptural pleated black sunhat, {piece} at ear, soft blue sky backdrop, high-end fashion editorial',
                'model with a voluminous white paper flower headdress, {piece} at ear or throat, neutral beige studio backdrop',
                'model wearing a futuristic shield visor sunglasses, cream pleated dress, {piece} catching light, beach backdrop',
                'editorial portrait of model with architectural folded headpiece, {piece} as the precision accent, grey studio',
                'model in zebra-print sculptural dress with 3D petal accessories on head, {piece} visible, ethereal surreal atmosphere',
                'model in oversized avant-garde hat with dramatic brim, {piece} at neckline, fashion week editorial energy',
            ],
            scene: 'extreme high fashion, sculptural accessories dominate the look but jewelry remains the focal fine detail, luxury editorial photography, soft directional studio light, porcelain smooth skin, cinema 4D rendering aesthetic',
            compat: { ring: 55, necklace: 70, earrings: 98, bracelet: 45, bangles: 40, anklet: 20, brooch: 90, pendant: 85, 'body-jewelry': 50 },
        },
        {
            id: 'cinematic-color-story',
            name: 'Cinematic Color Story',
            icon: '🎨',
            tagline: 'One Color. Total Immersion.',
            bestFor: 'Best for: All pieces — campaign launches, mood collections',
            desc: 'Full single-color palette domination — all-orange, all-red, all-ivory — the entire scene, clothing, and backdrop breathe one hue',
            color: '#2a1510',
            subjects: [
                'model in vibrant orange sheer collared dress, warm amber gradient backdrop, {piece} as the silver counterpoint, color-saturated editorial',
                'powerful low-angle portrait of model against deep red-orange gradient background, {piece} glinting, intense dramatic mood',
                'full ivory editorial — model in cream silk, pale background, {piece} as the only visual contrast element',
                'monochromatic warm amber scene, {piece} resting on matching amber velvet, golden hour tones unified throughout',
                'model in blush-rose silk against dusty rose wall, {piece} softly catching warm reflected light, total palette unity',
                'deep navy editorial — model in midnight blue, {piece} as silver luminance against the dark monochromatic field',
            ],
            scene: 'single dominant color rules the entire frame — clothing, backdrop, and props all share the same palette; jewelry provides the metallic contrast; color grading reinforces the palette; soft directional studio or window light; ghosting/double exposure technique optional for atmosphere',
            compat: { ring: 80, necklace: 90, earrings: 85, bracelet: 80, bangles: 75, anklet: 50, brooch: 75, pendant: 90, 'body-jewelry': 60 },
        },
        {
            id: 'surreal-scale',
            name: 'Surreal Scale',
            icon: '♟️',
            tagline: 'Impossible Luxury Worlds',
            bestFor: 'Best for: Statement necklaces, Earrings, Campaign images',
            desc: 'Model placed in an impossible scaled environment — giant chess pieces, oversized architecture, unrealistic luxury settings at surreal scale',
            color: '#1a2028',
            subjects: [
                'model walking across a giant red-and-white chess board at sea, white and crimson oversized chess pieces around her, {piece} catching ocean light',
                'model standing between two enormous sculptural forms on a reflective floor, tiny against the monumental scale, {piece} as the human focal point',
                '{piece} placed on a giant marble plinth the size of a building, model standing beside it dwarfed, Mediterranean blue sky behind',
                'model in a surreal landscape where everyday objects are monumental in scale, {piece} at normal size as the only real-world anchor',
                'overhead god-view of model on a giant chessboard pattern, {piece} on hand visible from above, bold graphic composition',
                'model dwarfed by colossal architectural columns, {piece} catching the only shaft of light through the massive space',
            ],
            scene: 'surreal scale contrast between human and environment, photo-realistic CGI quality, bold geometric environments, Mediterranean or luxury coastal light, hyper-polished surfaces, impossible yet believable luxury world',
            compat: { ring: 50, necklace: 90, earrings: 85, bracelet: 55, bangles: 50, anklet: 30, brooch: 60, pendant: 85, 'body-jewelry': 70 },
        },
        {
            id: 'ghost-double-exposure',
            name: 'Ghost Double Exposure',
            icon: '👻',
            tagline: 'Two Moments. One Frame.',
            bestFor: 'Best for: Earrings, Necklaces, Statement campaign images',
            desc: 'Long exposure or digital double-exposure creates a ghosted second silhouette — one sharp model, one soft motion echo behind',
            color: '#201a2a',
            subjects: [
                'model in orange silk standing still, her ghosted motion double slightly behind and to the left, {piece} sharp on the sharp figure only',
                'double-exposure portrait — crisp model in profile with translucent echo of herself in full face, {piece} visible on both',
                'model with ghosted duplicate overlapping at shoulder, warm amber background, {piece} catching light at focal sharp figure',
                'elegant slow-shutter portrait creating soft motion ghost, {piece} pin-sharp on the still figure, dreamy editorial mood',
                'model turning mid-motion, leaving a soft directional ghost trail behind, {piece} stays in perfect focus',
            ],
            scene: 'long exposure or double-exposure blend technique, warm soft background tones (amber/sepia/muted gradient), one sharp anchor figure and one soft ghost 30-50% opacity, cinematic color grading, editorial luxury campaign mood, no text or watermarks',
            compat: { ring: 55, necklace: 85, earrings: 90, bracelet: 60, bangles: 55, anklet: 30, brooch: 40, pendant: 80, 'body-jewelry': 60 },
        },
        {
            id: 'outdoor-masculine',
            name: 'Outdoor Masculine',
            icon: '🏔️',
            tagline: 'Raw Terrain. Strong Presence.',
            bestFor: 'Best for: Mens rings, bracelets, chains, cuffs',
            desc: 'Man in outdoor terrain — tundra, mountains, camping, misty forest — jewelry worn naturally in a real-world masculine context',
            color: '#1a2020',
            subjects: [
                'man in grey windbreaker, {piece} visible at wrist, crouching by camp log in misty mountain forest, tent behind him',
                'close-up portrait of man wrapped in grey scarf against tundra sky, {piece} at wrist showing from jacket cuff, stoic expression',
                'man gripping motorcycle handlebar wearing {piece} bracelet, dark jacket, urban outdoor editorial, warm bokeh behind',
                'man in dark coat standing in rain, {piece} visible as he grips umbrella handle, misty urban backdrop',
                'man walking through wild terrain, {piece} catching movement light at wrist, natural strong masculine energy',
                'editorial close-up of man\'s hand resting on log in forest, {piece} in sharp foreground focus, pine forest soft behind',
            ],
            scene: 'authentic outdoor location, real available light, masculine editorial energy, natural textures (wood, stone, fabric, rain), muted earthy palette, no glamour — rugged honest photography, Hasselblad 85mm portrait rendering',
            compat: { ring: 90, necklace: 80, earrings: 30, bracelet: 98, bangles: 60, anklet: 20, brooch: 40, pendant: 75, 'body-jewelry': 55 },
        },
        {
            id: 'harsh-sun-beauty',
            name: 'Harsh Sun Beauty',
            icon: '☀️',
            tagline: 'Unfiltered Midday Drama',
            bestFor: 'Best for: Earrings, Necklaces, Bracelets, Rings',
            desc: 'Direct harsh overhead or midday sunlight creates deep shadows across the face — raw, unretouched, high-contrast beauty',
            color: '#2a2010',
            subjects: [
                'model in direct harsh overhead sun, one half of face in deep shadow, {piece} catching intense direct light, raw beauty',
                'close-up beauty portrait in midday sun, face partially shadowed by brim of hat, {piece} in full direct light catching sunflares',
                'model outdoors with face partially shadowed by sheer fabric, {piece} earring in direct sun creating a point of brilliance',
                'model in direct desert sun, sweat-kissed skin, {piece} at throat or wrist, contrasty midday editorial',
                'extreme close-up of model eye-area in harsh sun, {piece} creating its own small lens flare, skin texture visible',
                'model with sun behind her creating deep face shadow, {piece} picking up rim-light from behind, silhouette editorial beauty',
            ],
            scene: 'harsh direct sunlight, no fill or diffusion, deep contrasty shadows, real skin texture fully visible, golden or bleached color palette, raw editorial beauty photography, no beauty retouching, high-end Vogue editorial quality within imperfection',
            compat: { ring: 70, necklace: 90, earrings: 95, bracelet: 80, bangles: 75, anklet: 60, brooch: 50, pendant: 85, 'body-jewelry': 65 },
        },
        {
            id: 'product-page-clean',
            name: 'Product Page Clean',
            icon: '🛒',
            tagline: 'E-Commerce White Background',
            bestFor: 'Best for: All categories — product page, website, catalogue',
            desc: 'Jewelry floating on a solid white or light gray background, clean commercial product photography for e-commerce',
            color: '#f0f0f0',
            subjects: [
                '{piece} floating in center frame against a perfectly solid white background, product levitation, soft diffused shadow beneath, clean e-commerce product photography',
                '{piece} on a pure white infinity background, soft studio lighting, no props, no distractions, luxury product page hero shot',
                '{piece} hovering mid-air against a seamless light gray studio background, subtle ground shadow, professional catalogue photography',
                '{piece} centered on solid white background, perfectly even studio illumination from all sides, no harsh shadows, clean product isolation',
                '{piece} floating weightlessly against pristine white backdrop, single soft shadow grounding the piece, high-end e-commerce product shot',
            ],
            scene: 'solid pure white or very light gray (#f5f5f5) seamless background, perfectly even soft studio lighting from multiple diffused sources, absolutely no props or context objects, product floating or with minimal shadow, clean commercial catalogue photography, neutral color accuracy, sharp edge-to-edge detail, e-commerce product page aesthetic',
            compat: { ring: 98, necklace: 98, earrings: 98, bracelet: 98, bangles: 98, anklet: 98, brooch: 98, pendant: 98, 'body-jewelry': 90 },
        },
        {
            id: 'textured-prop',
            name: 'Textured Prop Staging',
            icon: '🪢',
            tagline: 'Tactile Storytelling',
            bestFor: 'Best for: Earrings, Necklaces, Bracelets, Rings',
            desc: 'Jewelry displayed on or alongside tactile materials — rope knots, lemon slices, dried flowers, raw silk, velvet, marble slabs, or natural fibers',
            color: '#8b6914',
            subjects: [
                '{piece} draped over a thick nautical rope knot against a warm amber background, product editorial',
                '{piece} arranged on thin slices of lemon on dark green marble surface, color contrast editorial photography',
                '{piece} resting on crumpled raw silk fabric, texture contrast between metal and organic fiber',
                '{piece} balanced on the edge of a rough-hewn stone slab, raw natural backdrop, editorial product shot',
                '{piece} nestled among dried lavender stems and seed pods on a linen surface, organic luxury staging',
            ],
            scene: 'tactile material props, natural fiber textures, color contrast between metal and organic materials, warm editorial product photography, no human model, no distractions beyond the prop, luxury still-life composition',
            compat: { ring: 90, necklace: 85, earrings: 95, bracelet: 90, bangles: 85, anklet: 70, brooch: 80, pendant: 85, 'body-jewelry': 60 },
        },
        {
            id: 'mouth-lips-editorial',
            name: 'Lips & Mouth Editorial',
            icon: '👄',
            tagline: 'Sensual Close-Up',
            bestFor: 'Best for: Necklaces, Pendants, Earrings',
            desc: 'Extreme close-up of lips, mouth, or lower face with jewelry held between teeth, draped from lips, or resting on chin — provocative editorial',
            color: '#8b2252',
            subjects: [
                'extreme close-up of model biting down gently on {piece} chain, jewelry pendant hanging from between parted lips, glossy skin, editorial',
                'model with {piece} necklace draped across lower lip, mouth slightly open, natural skin texture visible, artistic beauty photography',
                'macro close-up of model chin and mouth area, {piece} earring catching light at jawline, dewy skin, moody editorial',
                'model holding {piece} chain in teeth, pendant dangling, raw skin detail with freckles visible, provocative luxury editorial',
                'lower face close-up, {piece} resting on the cupids bow of the lips, natural lip texture, high-fashion beauty shot',
            ],
            scene: 'extreme mouth/lips close-up, visible skin texture (pores, freckles, natural glow), dewy or glossy skin finish, shallow depth of field, editorial beauty photography, provocative but tasteful, high-end jewelry campaign aesthetic',
            compat: { ring: 30, necklace: 95, earrings: 80, bracelet: 20, bangles: 15, anklet: 10, brooch: 40, pendant: 98, 'body-jewelry': 60 },
        },
        {
            id: 'dark-moody-editorial',
            name: 'Dark Moody Editorial',
            icon: '🖤',
            tagline: 'Shadow & Mystery',
            bestFor: 'Best for: Earrings, Necklaces, Rings, Bracelets',
            desc: 'Deep shadow, low-key lighting, dramatic chiaroscuro — the piece emerges from darkness like a point of light',
            color: '#1a1a1a',
            subjects: [
                'model in deep shadow, only the neck and ear area lit, {piece} catching a single beam of warm light, dark moody editorial',
                'low-key portrait, model face partially hidden in shadow, {piece} ring on hand touching chin, single light source from side',
                'dark editorial, model silhouette with {piece} as the brightest element, Rembrandt lighting triangle on cheek, mystery mood',
                'chiaroscuro portrait, deep black background, model hand reaching toward camera with {piece} catching golden side-light',
                'model neck and ear in pools of shadow and light, {piece} earring as single point of brilliance, dramatic fine art portrait',
            ],
            scene: 'low-key lighting, deep shadows, single light source creating dramatic fall-off, dark background near black, chiaroscuro oil-painting quality, jewelry as the brightest element in frame, fine art editorial photography, Rembrandt or loop lighting pattern',
            compat: { ring: 85, necklace: 90, earrings: 98, bracelet: 80, bangles: 75, anklet: 30, brooch: 70, pendant: 88, 'body-jewelry': 55 },
        },

    ],

    // ── v3.0: Camera System Profiles ──────────────────────
    cameraProfiles: [
        { id: 'auto',              label: 'Auto (Angle Driven)',      desc: '' },
        { id: 'hasselblad-85',     label: '✦ Hasselblad 85mm',        desc: 'Hasselblad medium format 85mm, exceptional tonal gradation, film-like depth, shallow depth portrait rendering, medium format color science' },
        { id: 'leica-50',          label: 'Leica 50mm Summilux',       desc: 'Leica 50mm Summilux f/1.4, classic reportage rendering, natural unforced perspective, timeless documentary quality' },
        { id: 'sony-35-gm',        label: 'Sony 35mm f/1.4 GM',        desc: 'Sony 35mm f/1.4 G Master, lifestyle editorial perspective, slightly wider environment inclusion, modern sharp rendering with smooth bokeh' },
        { id: 'canon-135-l',       label: 'Canon 135mm f/2 L',         desc: 'Canon EF 135mm f/2L, highly telephoto-compressed background, creamy buttery bokeh, isolated subject against abstract blur' },
        { id: 'macro-100',         label: '100mm f/2.8 Macro',         desc: '100mm f/2.8 macro lens, razor-thin depth of field, individual metal grain and stone settings visible, studio ring light' },
        { id: 'macro-180',         label: '180mm f/3.5 Macro',         desc: '180mm macro lens at 2:1 magnification, individual gem facets and hallmark stamps visible, extreme close-up detail, zero breathing room around subject' },
        { id: 'anamorphic-40',     label: 'Anamorphic 40mm',           desc: 'Anamorphic 40mm lens, horizontal blue lens flares, cinematic oval bokeh, widescreen aspect ratio feel, movie-grade cinematographic quality' },
        { id: 'phase-one-iq4',     label: 'Phase One IQ4 55mm',        desc: 'Phase One IQ4 150MP medium format digital back, 55mm lens, extraordinary color depth and tonal range, e-commerce and luxury catalog perfection' },
    ],

    // ── Modifiers ──────────────────────
    // v3.1: Unified Lighting & Mood (replaces separate moods[] and lightings[])
    lightingMoods: [
        { id: 'editorial',       label: 'Editorial & Sharp' },
        { id: 'dramatic',        label: 'Dramatic Shadows' },
        { id: 'golden-hour',     label: 'Golden Hour' },
        { id: 'studio',          label: 'Studio Lighting' },
        { id: 'natural',         label: 'Natural Daylight' },
        { id: 'soft',            label: 'Soft & Romantic' },
        { id: 'warm',            label: 'Warm & Inviting' },
        { id: 'cool',            label: 'Cool & Modern' },
        { id: 'backlit',         label: 'Backlit / Rim Light' },
        { id: 'surreal',         label: 'Surreal & Dreamy' },
        { id: 'mystical',        label: 'Mystical & Dark' },
        { id: 'candid',          label: 'Candid & Lifestyle' },
        { id: 'avant-garde',     label: 'Avant-Garde Fashion' },
        { id: 'hard-flash',      label: 'Hard Flash / Paparazzi' },
        { id: 'dappled',         label: 'Dappled Sunlight' },
        { id: 'chiaroscuro',     label: 'Chiaroscuro (Rembrandt)' },
        { id: 'neon-glow',       label: 'Neon Glow' },
        { id: 'window-light',    label: 'Window Light (Side)' },
        { id: 'overcast',        label: 'Overcast Diffused' },
        { id: 'candlelight',     label: 'Candlelight Warm' },
        { id: 'blue-hour',       label: 'Blue Hour (Twilight)' },
        { id: 'split-light',     label: 'Split Lighting (50/50)' },
    ],
    // Legacy aliases so old saved state keys still map — read-only, not rendered
    get moods() { return this.lightingMoods; },
    get lightings() { return this.lightingMoods; },

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
            // ── v3.0: New angles from reference library ──────────────────────
            { id: 'wind-blown',            label: 'Wind-Blown (Field Motion)' },
            { id: 'extreme-close-crop',    label: 'Extreme Close Crop (Eyes Fill Frame)' },
            { id: 'fabric-reveal',         label: 'Fabric Reveal (Veil Pull)' },
            { id: 'three-quarter-above',   label: 'Three-Quarter Above (Diagonal Down)' },
            // ── v3.2: New angles from reference image analysis ──────────────────
            { id: 'mouth-bite',            label: 'Mouth Bite (Lips & Jewelry)' },
            { id: 'neck-close-up',         label: 'Neck Close-Up (Collarbone)' },
            { id: 'hand-on-face',          label: 'Hand on Face (Touch Frame)' },
            { id: 'wrist-cross',           label: 'Crossed Wrists (Stacked)' },
            { id: 'mirror-angle',          label: 'Mirror Reflection Angle' },
            { id: 'upward-gaze',           label: 'Upward Gaze (Looking Up)' },
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

    // ── v3.1: Build angle chip HTML with top-5 highlights + archetype boost ──────
    _buildAngleChips() {
        const category = this.state.category || 'ring';
        const sorted = this._getAnglesForCategory(category);

        // Archetype-angle affinity: selected archetypes boost certain angles to top
        const archetypeAngleBoost = {
            'body-intimate':       ['macro', 'extreme-macro'],
            'object-pairing':      ['flat-lay', 'overhead'],
            'editorial-model':     ['eye-level', '45-degree', 'chin-up'],
            'surreal-animal':      ['eye-level', 'macro'],
            'gradient-product':    ['45-degree', 'flat-lay'],
            'bw-dramatic':         ['side-profile', 'dutch'],
            'shadow-play':         ['flat-lay', 'overhead'],
            'bold-typography':     ['eye-level', 'flat-lay'],
            'collection-showcase': ['eye-level', 'from-behind'],
            'macro-detail':        ['macro', 'extreme-macro'],
            'wet-element':         ['eye-level', 'macro'],
            'architectural-context':['eye-level', '45-degree'],
            'flat-lay-composition':['flat-lay', 'overhead'],
            'motion-blur':         ['eye-level', 'wind-blown'],
            'cinematic-portrait':  ['eye-level', '45-degree'],
            'mirror-reflection':   ['eye-level', 'flat-lay'],
            'texture-contrast':    ['45-degree', 'macro'],
            'celestial-mythic':    ['low-angle', 'worms-eye'],
            'seasonal-holiday':    ['flat-lay', 'eye-level'],
            'lifestyle-moment':    ['eye-level', 'candid'],
            'nature-botanical':    ['macro', 'flat-lay'],
            'heritage-moroccan':   ['eye-level', '45-degree'],
            'minimalist-space':    ['flat-lay', 'eye-level'],
            'surface-lean':        ['knuckle-level', '45-degree'],
            'hair-drama':          ['from-behind', 'side-profile'],
            'masculine-editorial': ['eye-level', '45-degree'],
            'royal-opulence':      ['eye-level', 'low-angle'],
            'raw-field-editorial': ['eye-level', 'wind-blown'],
            'veiled-mystery':      ['extreme-close-crop', 'fabric-reveal'],
            'avant-garde-couture': ['eye-level', '45-degree', 'chin-up'],
            'cinematic-color-story':['eye-level', 'low-angle'],
            'surreal-scale':       ['worms-eye', 'low-angle'],
            'ghost-double-exposure':['eye-level', 'side-profile'],
            'outdoor-masculine':   ['eye-level', 'candid'],
            'harsh-sun-beauty':    ['extreme-close-crop', 'eye-level'],
            'desert-mirage':      ['eye-level', 'low-angle', 'wind-blown'],
            'neon-cyberpunk':     ['eye-level', 'dutch', 'low-angle'],
            'vintage-nostalgia':  ['candid', 'eye-level'],
            'zero-gravity':       ['overhead', 'eye-level'],
            'product-page-clean': ['eye-level', 'flat-lay', '45-degree'],
            'textured-prop': ['45-degree', 'flat-lay', 'macro'],
            'mouth-lips-editorial': ['mouth-bite', 'extreme-close-crop', 'macro'],
            'dark-moody-editorial': ['side-profile', 'eye-level', '45-degree'],
        };

        // Collect boosted angle IDs from currently selected archetypes
        const boosted = new Set();
        (this.state.selectedArchetypes || []).forEach(id => {
            (archetypeAngleBoost[id] || []).forEach(a => boosted.add(a));
        });

        // Re-sort: boosted angles come first, preserving their relative order
        let finalOrder = [];
        if (boosted.size > 0) {
            const boostedAngles  = sorted.filter(a => boosted.has(a.id));
            const remainingAngles = sorted.filter(a => !boosted.has(a.id));
            finalOrder = [...boostedAngles, ...remainingAngles];
        } else {
            finalOrder = sorted;
        }

        const contextLabel = boosted.size > 0
            ? `— boosted for selected archetype`
            : `— best for ${category}`;
        // Update the context label if element exists
        const ctxEl = this.container ? this.container.querySelector('#ps-angle-context') : null;
        if (ctxEl) ctxEl.textContent = contextLabel;

        return finalOrder.map((a, i) => {
            const isTop  = i === 0;
            const isRec  = i < 5;
            const isBoosted = boosted.has(a.id);
            const style = isTop
                ? 'border-color:var(--accent);box-shadow:0 0 0 1px var(--accent-glow);'
                : isRec
                ? 'border-color:var(--accent);opacity:0.85;'
                : '';
            const prefix = isTop ? '⭐ ' : (isBoosted && i < 5 ? '✦ ' : '');
            const title  = isRec
                ? (isBoosted ? `Boosted by selected archetype` : `Top recommended for ${category}`)
                : a.label;
            return `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}" title="${title}" style="${style}">${prefix}${a.label}</button>`;
        }).join('');
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
            { id: 'ai-choice', label: 'AI Chooses ✦' },
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
            { id: 'ai-choice', label: 'AI Chooses ✦' },
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
        lightingMood: 'editorial',   // v3.1: merged mood+lighting
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
        modelGender: 'female',     // 'female' | 'male' | 'none'
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
        realismLevel: 'standard', // 'standard' | 'high' | 'ultra'
        // v3.0
        cameraProfile: 'auto',    // 'auto' | see cameraProfiles array
        hijabi: false,            // when true: model wears hijab/headscarf
        hijabStyle: 'classic',    // 'classic' | 'draped' | 'turban' | 'niqab' | 'modern'
        modelEthnicity: 'diverse', // 'diverse' | 'fair' | 'olive' | 'warm' | 'caramel' | 'deep'
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
        // All archetypes that require a human subject
        const HUMAN = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama', 'wet-element',
            'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture',
            'cinematic-color-story', 'ghost-double-exposure', 'outdoor-masculine',
            'harsh-sun-beauty', 'desert-mirage', 'vintage-nostalgia',
            'mouth-lips-editorial', 'dark-moody-editorial',
        ]);
        const cat     = state.category || 'ring';
        const isHuman = HUMAN.has(archetype.id);

        // Base score from category compatibility table
        let score = (archetype.compat && archetype.compat[cat]) || 50;

        // No Model mode: strongly re-rank to product/surreal archetypes
        if (state.modelGender === 'none') {
            if (isHuman)  score -= 28;
            else          score += 18;
        }

        // Consistency mode adjustments
        if (state.consistencyOn && state.modelGender !== 'none') {
            if (isHuman)  score += 18;
            else          score -= 8;
        }

        // No reference images: product archetypes are equally valid
        if (!state.consistencyOn && state.jewelryCount === 0 && !isHuman) {
            score += 5;
        }

        // Gender-specific archetype adjustments
        if (state.modelGender === 'male') {
            if (archetype.id === 'masculine-editorial') score += 15;
            if (archetype.id === 'outdoor-masculine')   score += 12;
            if (archetype.id === 'hair-drama')          score -= 10;
            if (archetype.id === 'body-intimate')       score -=  5;
            if (archetype.id === 'veiled-mystery')      score -= 20;
        } else if (state.modelGender === 'female') {
            if (archetype.id === 'masculine-editorial') score -= 10;
            if (archetype.id === 'outdoor-masculine')   score -= 10;
            if (archetype.id === 'hair-drama')          score +=  5;
        }

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

        // v3.0 archetype IDs — shown with a NEW badge
        const V3_ARCHETYPES = new Set([
            'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture', 'cinematic-color-story',
            'surreal-scale', 'ghost-double-exposure', 'outdoor-masculine', 'harsh-sun-beauty', 'product-page-clean', 'textured-prop', 'mouth-lips-editorial', 'dark-moody-editorial',
        ]);

        grid.innerHTML = sorted.map(a => {
            // Use the SAME score for display as used for sorting
            const score = this._computeScore(a, this.state);
            const isSelected = this.state.selectedArchetypes.includes(a.id);
            const scoreColor = score >= 85 ? '#4ade80' : score >= 70 ? '#fbbf24' : score >= 50 ? '#f97316' : '#f87171';
            const isV3 = V3_ARCHETYPES.has(a.id);
            
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
                <div class="ps-arch-card ${isSelected ? 'active' : ''} ${isV3 ? 'ps-arch-v3' : ''}" data-arch="${a.id}" style="position:relative">
                    ${isV3 ? `<span class="ps-v3-badge">v3.0</span>` : ''}
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

    // ── v3.1: Smart Guide — all 39 archetypes ──────────────────────────────────
    _buildSmartGuide() {
        const selected = this.state.selectedArchetypes || [];
        if (selected.length === 0) {
            return `
            <div style="margin-top:12px;border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:16px;background:var(--surface);opacity:0.6">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <span style="font-size:16px">🧭</span>
                    <span style="font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:var(--text-muted)">Smart Guide</span>
                </div>
                <p style="font-size:12px;color:var(--text-muted);line-height:1.5;margin:0">Select one or more archetypes above to get personalised recommendations for the best camera angles, lighting &amp; mood, and lens profiles.</p>
            </div>`;
        }

        const guideDB = {
            'body-intimate': { angle:['macro','extreme-macro','eye-level'], lighting:['soft-box','natural','ring-light'], camera:['macro-100','macro-180','hasselblad-85'], tips:['Use Macro or Extreme Macro angles for the most impactful jewelry close-ups.','Pair with 100mm f/2.8 Macro or 180mm Macro lens for extraordinary gem detail.','Keep styling minimal — skin is the canvas here.'] },
            'object-pairing': { angle:['flat-lay','overhead','45-degree'], lighting:['natural','soft-box','studio'], camera:['leica-50','sony-35-gm','hasselblad-85'], tips:['Flat Lay (Top-Down) is the signature angle — keeps the composition graphic.','Leica 50mm Summilux gives a natural unforced perspective that feels documentary.','Pair objects with complementary textures — botanical, stone, fabric.'] },
            'editorial-model': { angle:['eye-level','45-degree','chin-up','low-angle'], lighting:['studio','dramatic','soft-box'], camera:['hasselblad-85','canon-135-l','leica-50'], tips:['The 45° angle or Chin Up give the strongest editorial energy.','Hasselblad 85mm creates that medium-format luxury look that fashion magazines use.','Dramatic or Studio lighting gives the sharpest editorial contrast.'] },
            'surreal-animal': { angle:['eye-level','macro','45-degree'], lighting:['natural','dramatic','studio'], camera:['macro-100','hasselblad-85','phase-one-iq4'], tips:['Eye Level meets the animal at its own perspective — the most intimate angle.','100mm f/2.8 Macro reveals extraordinary texture in feathers, scales, or fur.','Enable "No Model" gender mode — this archetype works without a human subject.'] },
            'gradient-product': { angle:['45-degree','flat-lay','low-angle'], lighting:['studio','soft-box','dramatic'], camera:['hasselblad-85','phase-one-iq4','canon-135-l'], tips:['45° Three-Quarter shows the dimensional depth of gradient surfaces best.','Phase One IQ4 gives extraordinary tonal range — perfect for subtle gradients.','Choose Color Palette to match or complement the gradient hue.'] },
            'bw-dramatic': { angle:['side-profile','dutch','low-angle'], lighting:['dramatic','chiaroscuro','harsh'], camera:['canon-135-l','leica-50','hasselblad-85'], tips:['Side Profile with harsh chiaroscuro lighting = strongest B&W result.','Dutch angle adds tension and cinema energy.','Canon 135mm f/2L compresses background beautifully in monochrome.'] },
            'shadow-play': { angle:['flat-lay','overhead','knuckle-level'], lighting:['dramatic','directional','natural'], camera:['sony-35-gm','leica-50','hasselblad-85'], tips:['Flat Lay gives the purest shadow projection on horizontal surfaces.','Sony 35mm f/1.4 GM captures the widest shadow spread without distortion.','Enable "No Model" mode — shadows and objects only.'] },
            'bold-typography': { angle:['eye-level','flat-lay','45-degree'], lighting:['studio','natural','soft-box'], camera:['phase-one-iq4','hasselblad-85','leica-50'], tips:['Eye Level keeps typography legible and forward-facing.','Phase One IQ4 provides the sharpness needed for editorial type clarity.','High contrast Color Palette (Monochrome, Noir) makes typography pop.'] },
            'collection-showcase': { angle:['eye-level','from-behind','over-shoulder'], lighting:['studio','natural','soft-box'], camera:['hasselblad-85','canon-135-l','leica-50'], tips:['From Behind (Nape) angle shows necklaces and ear jewelry simultaneously.','Over the Shoulder creates an intimate reveal of the collection.','Hasselblad 85mm gives depth and separation to each piece.'] },
            'macro-detail': { angle:['macro','extreme-macro'], lighting:['ring-light','soft-box','studio'], camera:['macro-100','macro-180','phase-one-iq4'], tips:['180mm f/3.5 Macro gives absolute maximum gem detail — individual facets visible.','Ring light creates perfect symmetrical catchlights on stones.','Enable "No Model" mode — pure jewelry close-up.'] },
            'wet-element': { angle:['eye-level','macro','knuckle-level'], lighting:['natural','rim-light','soft-box'], camera:['macro-100','hasselblad-85','leica-50'], tips:['Macro angle reveals droplet texture in extraordinary detail.','Rim light makes water droplets glow and adds dimensionality.','Knuckle Level gives a jewelry-height perspective with water context.'] },
            'architectural-context': { angle:['eye-level','45-degree','side-profile'], lighting:['natural','dramatic','studio'], camera:['hasselblad-85','leica-50','sony-35-gm'], tips:['Eye Level aligns the model with the architectural geometry.','Sony 35mm f/1.4 GM includes more of the architectural setting in frame.','Use Stone Wall or Concrete surface to reinforce architectural context.'] },
            'flat-lay-composition': { angle:['flat-lay','overhead'], lighting:['natural','soft-box','studio'], camera:['leica-50','sony-35-gm','phase-one-iq4'], tips:['Pure Flat Lay (Top-Down) is the only angle — commit to it.','Natural daylight from a window creates the softest editorial flat-lay shadow.','Enable "No Model" mode and keep composition clean.'] },
            'motion-blur': { angle:['eye-level','wind-blown','side-profile'], lighting:['natural','golden-hour-light','overcast'], camera:['canon-135-l','hasselblad-85','leica-50'], tips:['Wind-Blown angle is the signature — set it for fabric and hair motion.','Canon 135mm f/2L captures motion blur beautifully while keeping jewelry sharp.','Natural or Golden Hour lighting gives the most authentic motion editorial.'] },
            'cinematic-portrait': { angle:['eye-level','45-degree','side-profile'], lighting:['dramatic','chiaroscuro','rim-light'], camera:['anamorphic-40','canon-135-l','hasselblad-85'], tips:['Anamorphic 40mm is the ideal lens — it creates real cinematic lens flares.','45° angle with dramatic chiaroscuro lighting = peak cinematic portrait.','Use a Thoughtful or Intense expression for best cinematic depth.'] },
            'mirror-reflection': { angle:['eye-level','flat-lay','knuckle-level'], lighting:['natural','studio','rim-light'], camera:['canon-135-l','hasselblad-85','leica-50'], tips:['Eye Level captures both the subject and its reflection equally well.','Mirrored Glass surface setting reinforces the reflection theme.','Studio or Rim light makes reflections crisp and infinite.'] },
            'texture-contrast': { angle:['45-degree','macro','eye-level'], lighting:['natural','rim-light','dramatic'], camera:['macro-100','hasselblad-85','phase-one-iq4'], tips:['45° Three-Quarter shows both jewelry surface and contrasting texture.','100mm Macro reveals micro-texture in both the jewelry and background.','Enable "No Model" mode and pair with Marble, Concrete, or Wood surface.'] },
            'celestial-mythic': { angle:['low-angle','worms-eye','45-degree'], lighting:['dramatic','rim-light','ethereal'], camera:['anamorphic-40','canon-135-l','phase-one-iq4'], tips:['Low Angle makes the model appear divine and monumental — perfect for mythic energy.','Anamorphic flares reinforce the other-worldly atmosphere.','Pair with Pendant or Necklace for the best compatibility score.'] },
            'seasonal-holiday': { angle:['flat-lay','eye-level','candid'], lighting:['natural','soft-box','warm'], camera:['leica-50','sony-35-gm','hasselblad-85'], tips:['Flat Lay gives the most editorial gift and holiday layout.','Natural or Warm lighting creates the festive atmosphere.','Candid angle adds spontaneous lifestyle energy to seasonal shoots.'] },
            'lifestyle-moment': { angle:['eye-level','candid','knuckle-level'], lighting:['natural','golden-hour-light','soft-box'], camera:['leica-50','sony-35-gm','hasselblad-85'], tips:['Candid angle is the backbone of lifestyle — unstaged, real moment energy.','Leica 50mm Summilux gives timeless documentary rendering.','Knuckle Level is perfect for lifestyle coffee, hand, or table scenes.'] },
            'nature-botanical': { angle:['macro','flat-lay','45-degree'], lighting:['natural','dappled','soft-box'], camera:['macro-100','leica-50','hasselblad-85'], tips:['Macro Close-Up reveals the texture relationship between botanical elements and jewelry.','Dappled Sunlight creates the most authentic organic atmosphere.','Enable "No Model" mode — botanical objects only.'] },
            'heritage-moroccan': { angle:['eye-level','45-degree','side-profile'], lighting:['natural','warm','golden-hour-light'], camera:['hasselblad-85','leica-50','sony-35-gm'], tips:['Eye Level gives the most dignified and authentic cultural portrait.','Hasselblad 85mm captures the warmth of Moroccan light with exceptional depth.','Choose Terracotta / Zellige surface for maximum heritage context.'] },
            'minimalist-space': { angle:['flat-lay','eye-level','macro'], lighting:['natural','soft-box','studio'], camera:['macro-100','phase-one-iq4','leica-50'], tips:['Flat Lay with generous negative space creates the most striking minimalist composition.','Phase One IQ4 gives the color depth needed for clean product shots.','Enable "No Model" and keep Color Palette to Neutral Beige or Monochrome.'] },
            'surface-lean': { angle:['knuckle-level','45-degree','eye-level'], lighting:['natural','studio','soft-box'], camera:['hasselblad-85','canon-135-l','leica-50'], tips:['Knuckle Level gives the most intimate surface-height perspective.','45° Three-Quarter shows both face and surface texture simultaneously.','Hasselblad 85mm renders the depth between model and surface beautifully.'] },
            'hair-drama': { angle:['from-behind','side-profile','foreground-blur'], lighting:['rim-light','natural','golden-hour-light'], camera:['hasselblad-85','canon-135-l','leica-50'], tips:['From Behind or Side Profile angles showcase hair movement and earring placement best.','Rim light or Golden Hour makes hair textures glow and creates a halo effect.','NOTE: Hijabi toggle will override hair drama — keep it off for this archetype.'] },
            'masculine-editorial': { angle:['eye-level','45-degree','low-angle'], lighting:['studio','dramatic','natural'], camera:['hasselblad-85','canon-135-l','leica-50'], tips:['Set Model Gender to Male — this archetype is designed for masculine editorial.','Low Angle adds authority and power to the masculine editorial look.','Hasselblad 85mm renders masculine skin tones with exceptional depth.'] },
            'royal-opulence': { angle:['eye-level','low-angle','45-degree'], lighting:['dramatic','rim-light','studio'], camera:['canon-135-l','phase-one-iq4','hasselblad-85'], tips:['Eye Level with Low Angle combined gives a regal, authoritative presence.','Phase One IQ4 captures the richness of opulent materials with extraordinary fidelity.','Jewel Tones or Deep Ocean Color Palette reinforces the opulence atmosphere.'] },
            // v3.0 archetypes
            'raw-field-editorial': { angle:['eye-level','wind-blown','candid'], lighting:['natural','harsh-sun','golden-hour-light'], camera:['hasselblad-85','leica-50','sony-35-gm'], tips:['Wind-Blown angle drives wind and motion in the prompt — set it for full raw field energy.','Sony 35mm f/1.4 GM gives the wider field inclusion that this archetype needs.','Pair with Harsh Sun or Natural lighting — NO studio light.','Caftan or minimal styling works best; avoid formal outfits.'] },
            'veiled-mystery': { angle:['extreme-close-crop','fabric-reveal','eye-level'], lighting:['natural','soft-box','window'], camera:['hasselblad-85','macro-100','canon-135-l'], tips:['Extreme Close Crop is the signature angle — eyes fill the frame.','Fabric Reveal creates the dramatic pull-aside composition.','Enable Hijabi with "Niqab" or "Sheer Veil" for maximum synergy.','Keep lighting Natural or soft — harsh studio light kills the mystery.'] },
            'avant-garde-couture': { angle:['eye-level','45-degree','low-angle','chin-up'], lighting:['studio','dramatic','soft-box'], camera:['phase-one-iq4','hasselblad-85','canon-135-l'], tips:['Phase One IQ4 or Hasselblad 85mm gives the medium-format luxury depth this archetype deserves.','AI-Choice styling lets the engine pick couture-appropriate outfits automatically.','Low Angle adds grandeur to sculptural headwear.'] },
            'cinematic-color-story': { angle:['eye-level','low-angle','45-degree'], lighting:['dramatic','studio','natural'], camera:['anamorphic-40','canon-135-l','hasselblad-85'], tips:['Anamorphic 40mm creates cinematic lens flares that reinforce the color story perfectly.','Set Color Palette to match your chosen color story (e.g. warm amber, deep red).','Low Angle + Dramatic lighting amplifies the single-color immersion.'] },
            'surreal-scale': { angle:['worms-eye','low-angle','overhead'], lighting:['dramatic','natural','studio'], camera:['anamorphic-40','sony-35-gm','canon-135-l'], tips:["Worm's Eye maximises scale contrast — makes the environment look enormous.",'Anamorphic lens adds a movie-quality widescreen feel.','Keep lighting dramatic or natural — no ring lights or beauty dishes.'] },
            'ghost-double-exposure': { angle:['eye-level','side-profile','45-degree'], lighting:['dramatic','natural','rim-light'], camera:['canon-135-l','anamorphic-40','leica-50'], tips:['Side Profile creates the clearest ghost separation — two distinct silhouettes.','Warm Amber palette reinforces the long-exposure aesthetic.','Keep expression to "Serene" or "Thoughtful" — matches the dreamy double-exposure mood.'] },
            'outdoor-masculine': { angle:['eye-level','candid','45-degree','from-behind'], lighting:['natural','golden-hour-light','overcast'], camera:['hasselblad-85','leica-50','sony-35-gm'], tips:['Set Model Gender to Male — this archetype is designed for masculine editorial.','Candid angle delivers the most natural unposed outdoor feel.','Leica 50mm Summilux gives honest documentary rendering that suits this archetype.'] },
            'harsh-sun-beauty': { angle:['extreme-close-crop','eye-level','chin-up'], lighting:['natural','harsh-sun','direct'], camera:['hasselblad-85','macro-100','leica-50'], tips:['Extreme Close Crop + Harsh Sun lighting = the signature look of this archetype.','Enable visible Skin Pores in Scene Realism for maximum raw beauty authenticity.','Hasselblad 85mm captures harsh shadow detail with the best tonal range.','Avoid smooth or polished skin realism — raw texture IS the point.'] },
            'desert-mirage': { angle:['eye-level','low-angle','wind-blown'], lighting:['harsh-sun','golden-hour-light','natural'], camera:['hasselblad-85','leica-50','sony-35-gm'], tips:['Low Angle under intense desert sun creates the strongest heat-haze silhouette.','Harsh Sun or Golden Hour lighting is non-negotiable -- studio light kills the desert energy.','Wind-Blown angle adds fabric motion for the flowing editorial look.','Pair with Necklace or Bangles -- they read best under direct sunlight.'] },
            'neon-cyberpunk': { angle:['eye-level','dutch','low-angle'], lighting:['dramatic','studio','rim-light'], camera:['anamorphic-40','sony-35-gm','canon-135-l'], tips:['Dutch angle amplifies the edgy, disorienting cyberpunk energy.','Anamorphic 40mm turns neon lights into cinematic horizontal lens flares.','Sony 35mm f/1.4 GM gives a wider field to include neon signage context.','Enable No Model for pure product shots -- wet asphalt reflections need no human.'] },
            'vintage-nostalgia': { angle:['candid','eye-level','45-degree'], lighting:['harsh','direct','natural'], camera:['leica-50','canon-135-l','hasselblad-85'], tips:['Candid angle is the heartbeat of this archetype -- unstaged, flash-lit, real.','Direct harsh flash lighting creates the blown-out highlights that define vintage photography.','Leica 50mm Summilux gives the most authentic documentary rendering of this era.','Keep expressions to Laughing or Candid -- stiff poses break the vintage illusion.'] },
            'zero-gravity': { angle:['overhead','eye-level','dutch'], lighting:['studio','dramatic','ring-light'], camera:['phase-one-iq4','macro-100','canon-135-l'], tips:['Overhead (Top-Down) captures floating objects with the clearest gravity-defying illusion.','Enable No Model -- pure product suspension needs no human element.','Phase One IQ4 gives the tonal depth for dark-background frozen-motion shots.','Ring light creates perfect symmetrical catchlights on suspended jewelry.'] },
            'textured-prop': { angle:['45-degree','flat-lay','macro','overhead'], lighting:['natural','warm','window-light','golden-hour'], camera:['hasselblad-85','phase-one-iq4','macro-100'], tips:['Use No Model -- this is a pure product-on-prop archetype.','Natural or Window Light preserves the texture of organic materials.','45-degree or Flat Lay angles work best for showing the jewelry+prop relationship.','Choose props with complementary textures: rope, marble, citrus, dried flowers.'] },
            'mouth-lips-editorial': { angle:['mouth-bite','extreme-close-crop','macro','neck-close-up'], lighting:['dramatic','chiaroscuro','natural','soft'], camera:['canon-135-l','hasselblad-85','macro-100'], tips:['Canon 135mm L creates beautiful compression for face close-ups.','Dramatic or Chiaroscuro lighting adds editorial depth.','Use Extreme Close Crop or the new Mouth Bite angle for maximum impact.','Ultra Realism recommended -- skin pores, lip texture, and freckles sell the shot.'] },
            'dark-moody-editorial': { angle:['side-profile','eye-level','45-degree','silhouette'], lighting:['dramatic','chiaroscuro','mystical','split-light'], camera:['canon-135-l','leica-50','hasselblad-85'], tips:['Chiaroscuro or Split Lighting is essential for the dark moody aesthetic.','Side Profile or Silhouette angles maximise the shadow drama.','Keep the jewelry as the brightest element -- it should emerge from darkness.','Dark backgrounds (near black) prevent the shadow mood from being diluted.'] },
            'product-page-clean': { angle:['eye-level','flat-lay','45-degree'], lighting:['studio','soft-box','natural'], camera:['phase-one-iq4','hasselblad-85','macro-100'], tips:['Enable No Model -- this archetype is pure product isolation, no human.','Phase One IQ4 gives maximum detail for e-commerce hero shots.','Use solid white or light gray background -- NO props, NO context objects.','Soft Box or even Studio lighting from multiple angles eliminates harsh shadows.'] },
        };

        const guides = selected.map(id => guideDB[id]).filter(Boolean);

        if (guides.length === 0) {
            return `
            <div style="margin-top:12px;border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:16px;background:rgba(124,58,237,0.05)">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="font-size:16px">🧭</span>
                    <span style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#a855f7">Smart Guide</span>
                </div>
                <p style="font-size:12px;color:var(--text-muted);line-height:1.5;margin:0">✨ Great selection! Hit Generate Prompts to create your editorial prompts.</p>
            </div>`;
        }

        const rank = (arr) => {
            const freq = {};
            arr.forEach(id => freq[id] = (freq[id] || 0) + 1);
            return Object.entries(freq).sort((a,b) => b[1]-a[1]).map(e => e[0]);
        };
        const bestAngles   = rank(guides.flatMap(g => g.angle   || [])).slice(0, 3);
        const bestLighting = rank(guides.flatMap(g => g.lighting || [])).slice(0, 3);
        const bestCameras  = rank(guides.flatMap(g => g.camera  || [])).slice(0, 2);
        const allTips      = [...new Set(guides.flatMap(g => g.tips || []))].slice(0, 4);

        const anglesAll   = this.angles;
        const angleLabel  = id => (anglesAll.find(a => a.id === id) || {}).label || id;
        const cameraLabel = id => (this.cameraProfiles.find(c => c.id === id) || {}).label || id;
        const lightingLabels = { 'soft-box':'Soft Box','natural':'Natural Light','ring-light':'Ring Light','dramatic':'Dramatic','studio':'Studio','chiaroscuro':'Chiaroscuro','rim-light':'Rim Light','golden-hour-light':'Golden Hour','harsh-sun':'Harsh Sun','gradient':'Gradient','window':'Window Light','overcast':'Overcast','ethereal':'Ethereal','direct':'Direct Sun','harsh':'Harsh','warm':'Warm Light','dappled':'Dappled Sunlight','directional':'Directional','raking':'Raking Light' };
        const lightLabel  = id => lightingLabels[id] || id;

        return `
        <div style="margin-top:12px;border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:16px;background:rgba(124,58,237,0.06)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:16px">🧭</span>
                    <span style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#a855f7">Smart Guide</span>
                </div>
                <span style="font-size:10px;color:var(--text-muted);opacity:0.7">Based on your archetype selection</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
                <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px">
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#60a5fa;margin-bottom:6px">📐 Best Angles</div>
                    ${bestAngles.map((id, i) => `<div style="font-size:11px;color:var(--text);margin-bottom:3px;display:flex;align-items:center;gap:4px">${i === 0 ? '<span style="color:#fbbf24">⭐</span>' : '<span style="opacity:0.4">·</span>'} ${angleLabel(id)}</div>`).join('')}
                </div>
                <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px">
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#34d399;margin-bottom:6px">💡 Best Lighting</div>
                    ${bestLighting.map((id, i) => `<div style="font-size:11px;color:var(--text);margin-bottom:3px;display:flex;align-items:center;gap:4px">${i === 0 ? '<span style="color:#fbbf24">⭐</span>' : '<span style="opacity:0.4">·</span>'} ${lightLabel(id)}</div>`).join('')}
                </div>
                <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px">
                    <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#f472b6;margin-bottom:6px">📷 Best Camera</div>
                    ${bestCameras.map((id, i) => `<div style="font-size:11px;color:var(--text);margin-bottom:3px;display:flex;align-items:center;gap:4px">${i === 0 ? '<span style="color:#fbbf24">⭐</span>' : '<span style="opacity:0.4">·</span>'} ${cameraLabel(id)}</div>`).join('')}
                </div>
            </div>
            ${allTips.length > 0 ? `
            <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:10px">
                <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#fb923c;margin-bottom:8px">📌 Pro Tips</div>
                ${allTips.map(tip => `<div style="font-size:11px;color:var(--text-muted);margin-bottom:5px;line-height:1.5;display:flex;gap:6px"><span style="color:#fb923c;flex-shrink:0;margin-top:1px">→</span><span>${tip}</span></div>`).join('')}
            </div>` : ''}
        </div>`;
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
                                ${this.state.brandTouch === 'logomark' ? '⭐ Four-pointed star pin brooch on lapel — Elaris signature.' : this.state.brandTouch === 'wordmark' ? '"ELARIS" embroidered on visible garment area — brand always present.' : 'No brand marking added to scene.'}
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
                                <button class="ps-chip ${this.state.modelGender === 'none' ? 'active' : ''}" data-val="none" title="Product / surreal shots — no human model in scene">⊖ No Model</button>
                            </div>
                            ${this.state.modelGender === 'none' ? `<p class="text-sm text-muted" style="margin-top:6px;margin-bottom:0;line-height:1.4">Product-only or surreal mode — all human elements are suppressed from prompts.</p>` : ''}
                        </div>

                        <!-- Skin Tone selector (hidden for no-model) -->
                        <div class="form-group" style="padding-top:10px;border-top:1px dashed var(--border);${this.state.modelGender === 'none' ? 'display:none' : ''}">
                            <label class="form-label" style="margin-bottom:2px">🎨 Skin Tone</label>
                            <p class="text-sm text-muted" style="line-height:1.4;max-width:220px;margin:0;margin-bottom:6px">Choose the model's skin tone or let it vary automatically.</p>
                            <div class="ps-chip-group" id="ps-ethnicity" style="flex-wrap:wrap">
                                <button class="ps-chip ${this.state.modelEthnicity === 'diverse' ? 'active' : ''}" data-val="diverse" title="Random diverse skin tones each generation">🎲 Diverse</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'fair' ? 'active' : ''}" data-val="fair" title="Fair ivory skin with cool undertones">🌾 Light / Fair</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'olive' ? 'active' : ''}" data-val="olive" title="Olive Mediterranean complexion">☀️ Olive</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'warm' ? 'active' : ''}" data-val="warm" title="Warm golden sun-kissed skin">🌅 Warm / Tan</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'caramel' ? 'active' : ''}" data-val="caramel" title="Caramel medium complexion">🍯 Caramel</button>
                                <button class="ps-chip ${this.state.modelEthnicity === 'deep' ? 'active' : ''}" data-val="deep" title="Deep rich brown skin">🌰 Deep / Rich</button>
                            </div>
                        </div>

                        <!-- Hijabi Toggle (hidden for male / no-model) -->
                        <div class="form-group" style="padding-top:10px;border-top:1px dashed var(--border);${this.state.modelGender === 'female' ? '' : 'display:none'}">
                            <div style="display:flex;align-items:center;justify-content:space-between">
                                <div>
                                    <label class="form-label" style="margin-bottom:2px">🧕 Hijabi Model</label>
                                    <p class="text-sm text-muted" style="line-height:1.4;max-width:220px;margin:0">Model wears a hijab, headscarf, or veil — for cultural, artistic, or identity representation.</p>
                                </div>
                                <label class="wm-toggle-label">
                                    <input type="checkbox" id="ps-hijabi-toggle" ${this.state.hijabi ? 'checked' : ''}>
                                    <span class="wm-toggle-switch"></span>
                                </label>
                            </div>
                            ${this.state.hijabi ? `
                            <div style="margin-top:10px">
                                <label class="form-label" style="font-size:11px;opacity:0.8">Hijab Style</label>
                                <div class="ps-chip-group" id="ps-hijab-style" style="flex-wrap:wrap">
                                    <button class="ps-chip ${this.state.hijabStyle === 'classic' ? 'active' : ''}" data-val="classic" title="Traditional draped hijab covering hair and neck">Classic</button>
                                    <button class="ps-chip ${this.state.hijabStyle === 'draped' ? 'active' : ''}" data-val="draped" title="Loose elegant fabric draped around head and shoulders">Draped Silk</button>
                                    <button class="ps-chip ${this.state.hijabStyle === 'turban' ? 'active' : ''}" data-val="turban" title="Fashion-forward wrapped turban style">Turban</button>
                                    <button class="ps-chip ${this.state.hijabStyle === 'niqab' ? 'active' : ''}" data-val="niqab" title="Face veil with eyes exposed — editorial and artistic">Niqab ✦</button>
                                    <button class="ps-chip ${this.state.hijabStyle === 'modern' ? 'active' : ''}" data-val="modern" title="Contemporary minimal hijab with face and neck framing">Modern</button>
                                    <button class="ps-chip ${this.state.hijabStyle === 'sheer-veil' ? 'active' : ''}" data-val="sheer-veil" title="Sheer translucent fabric — artistic/editorial styling">Sheer Veil</button>
                                </div>
                            </div>` : ''}
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_jewelry_shots">Jewelry Shots</label>
                            <div class="ps-chip-group" id="ps-jewelry-count">
                                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="ps-chip ${this.state.jewelryCount === n ? 'active' : ''}" data-val="${n}">${n === 0 ? (window.I18n ? window.I18n.t('ps_none') : 'None') : n}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group" style="padding-top:12px;border-top:1px solid var(--border);${this.state.modelGender === 'none' ? 'display:none' : ''}">
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
                        <div class="card-header"><span class="card-title">Modifiers</span></div>
                        <div class="form-group">
                            <label class="form-label">📐 Camera Angle</label>
                            <div class="ps-chip-group" id="ps-angle" style="flex-wrap:wrap">
                                ${this._getAnglesForCategory(this.state.category).map((a, i) => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}" title="${i < 3 ? 'Recommended for ' + (this.state.category || 'ring') : a.label}" style="${i === 0 ? 'border-color:var(--accent);' : i < 3 ? 'border-color:var(--accent);opacity:0.85;' : ''}">${i === 0 ? '⭐ ' : ''}${a.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">💡 Lighting &amp; Mood</label>
                            <div class="ps-chip-group" id="ps-lighting-mood" style="flex-wrap:wrap">
                                ${this._getLightingForArchetypes(this.state.selectedArchetypes).map((m, i) => `<button class="ps-chip ${m.id === this.state.lightingMood ? 'active' : ''}" data-val="${m.id}" style="${i < 3 && this.state.selectedArchetypes.length > 0 ? 'border-color:rgba(168,85,247,0.5);' : ''}">${i < 3 && this.state.selectedArchetypes.length > 0 ? '⭐ ' : ''}${m.label}</button>`).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">📷 Lens / Camera Preset <span class="text-sm text-muted">(overrides angle lens)</span></label>
                            <div class="ps-chip-group" id="ps-camera-profile" style="flex-wrap:wrap">
                                ${this.cameraProfiles.map(c => `<button class="ps-chip ${c.id === this.state.cameraProfile ? 'active' : ''}" data-val="${c.id}" title="${c.desc || 'Let the selected angle determine the camera'}">${c.label}</button>`).join('')}
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.4;margin-top:6px;margin-bottom:0">
                                ${(this.cameraProfiles.find(c => c.id === this.state.cameraProfile) || {}).desc || 'Camera choice driven by the selected angle above.'}
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_format">🖼️ Format</label>
                            <div class="ps-chip-group" id="ps-format">
                                ${this.formats.map(f => `<button class="ps-chip ${f.id === this.state.format ? 'active' : ''}" data-val="${f.id}" data-i18n="ps_fmt_${f.id.replace(/-/g, '_')}">${f.label}</button>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="ps_adv_controls">Advanced Controls</span></div>
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
                        <div class="form-group" style="${this.state.modelGender === 'none' ? 'display:none' : ''}">
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
                            <label class="form-label">📷 Photo Realism Level</label>
                            <p class="text-sm text-muted" style="line-height:1.3;margin-bottom:6px">Inject photographic realism cues into AI-generated images. Higher = more authentic grain, imperfections, and camera artifacts.</p>
                            <div class="ps-chip-group" id="ps-realism-level">
                                <button class="ps-chip ${this.state.realismLevel === 'standard' ? 'active' : ''}" data-val="standard">Standard</button>
                                <button class="ps-chip ${this.state.realismLevel === 'high' ? 'active' : ''}" data-val="high">High</button>
                                <button class="ps-chip ${this.state.realismLevel === 'ultra' ? 'active' : ''}" data-val="ultra">⚡ Ultra</button>
                            </div>
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
                        <div class="form-group" style="${this.state.modelGender === 'none' ? 'display:none' : ''}">
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
                        <div class="form-group" style="${this.state.modelGender === 'none' ? 'display:none' : ''}">
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


                </div><!-- /ps-left -->


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

                    <!-- ── v3.0: Smart Guide Panel ───────────────────────────── -->
                    <div id="ps-smart-guide-slot">${this._buildSmartGuide()}</div>

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
            // Also refresh angle chips - category affects best-angle recommendations
            const _ag = q('#ps-angle');
            if (_ag) _ag.innerHTML = this._buildAngleChips();
            const _ctx = q('#ps-angle-context');
            if (_ctx) _ctx.textContent = '-- best for ' + this.state.category;
        });
        q('#ps-material').addEventListener('change', e => { this.state.material = e.target.value; });
        q('#ps-stone').addEventListener('change', e => { this.state.stone = e.target.value; });

        // Auto-describe
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

        // Chip groups — v3.1: unified lightingMood replaces separate mood+lighting
        this._bindChipGroup('ps-lighting-mood', 'lightingMood');
        this._bindChipGroup('ps-format', 'format');
        this._bindChipGroup('ps-angle', 'angle');
        this._bindChipGroup('ps-surface', 'surface');
        this._bindChipGroup('ps-palette', 'palette');
        this._bindChipGroup('ps-styling', 'styling');
        this._bindChipGroup('ps-realism-level', 'realismLevel');
        this._bindChipGroup('ps-ethnicity', 'modelEthnicity');
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

        // Hallmark toggle
        q('#ps-hallmark-toggle')?.addEventListener('change', e => {
            this.state.hallmarkEnabled = e.target.checked;
        });

        // v3.0: Hijabi toggle
        q('#ps-hijabi-toggle')?.addEventListener('change', e => {
            this.state.hijabi = e.target.checked;
            this._render();
            this._renderArchetypeGrid();
            this._bind();
        });
        // Hijab style chips (visible only when hijabi is on)
        const hijabStyleGroup = q('#ps-hijab-style');
        if (hijabStyleGroup) {
            hijabStyleGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                hijabStyleGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.hijabStyle = chip.dataset.val;
            });
        }

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
            // v3.0: Refresh Smart Guide live
            const guideEl = q('#ps-smart-guide-slot');
            if (guideEl) guideEl.outerHTML = `<div id="ps-smart-guide-slot">${this._buildSmartGuide()}</div>`;
            // v3.1: Refresh angle chips live to reflect archetype-aware ranking
            const angleGroup = q('#ps-angle');
            if (angleGroup) angleGroup.innerHTML = this._buildAngleChips();
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

        // v3.0: Camera System profile selector
        this._bindChipGroup('ps-camera-profile', 'cameraProfile');

        // Ensure angle chips render with 5 stars on fresh page load
        this._refreshAngles();
    },

    // Refresh angle chips and context label without full re-render
    _refreshAngles() {
        const q = id => this.container.querySelector(id);
        const ag = q('#ps-angle');
        if (ag) ag.innerHTML = this._buildAngleChips();
        const ctx = q('#ps-angle-context');
        if (ctx) {
            const hasSel = (this.state.selectedArchetypes || []).length > 0;
            ctx.textContent = hasSel
                ? '-- boosted for selected archetype'
                : '-- best for ' + (this.state.category || 'ring');
        }
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
        this.state.pieceDesc = desc;
        // (textarea removed — desc stored in state only)
    },

    // ── Generate Prompts ──────────────────────
    _generate() {
        const selected = this.state.selectedArchetypes;
        if (selected.length === 0) {
            Elaris.toast('Select at least one archetype', 'error');
            return;
        }
        const prompts = [];
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
        }

        // Render output
        const outputArea = this.container.querySelector('#ps-output-area');
        outputArea.style.display = '';
        const list = this.container.querySelector('#ps-prompts-list');

        list.innerHTML = prompts.map((p, i) => `
            <div class="ps-prompt-block ${p.similar ? 'ps-prompt-similar' : ''}" data-idx="${i}" data-arch-id="${p.archId}">
                <div class="ps-prompt-header">
                    <span>${p.icon} ${p.archetype}${p.similar ? ' <span class="ps-similar-badge" title="This prompt has significant overlap with another prompt in this batch — consider regenerating">⚠️ Similar</span>' : ''}</span>
                    <div class="ps-prompt-actions">
                        <button class="btn btn-sm btn-outline ps-regen-one" data-idx="${i}" data-arch-id="${p.archId}" title="Regenerate this prompt with a different scene">↺ New</button>
                        <button class="btn btn-sm btn-accent ps-refine-one" data-idx="${i}" data-arch-id="${p.archId}" title="Keep this prompt but apply your current modifier changes (ratio, model, hijab, etc.)">✨ Refine</button>
                        <button class="btn btn-sm btn-secondary ps-copy-one" data-idx="${i}">📋 Copy</button>
                    </div>
                </div>
                <div class="ps-prompt-text" id="ps-prompt-${i}">${p.text}</div>
                <div class="ps-caption-block" id="ps-caption-${i}" style="display:none"></div>
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

        // ↺ Regenerate a single prompt with a fresh scene + outfit
        list.querySelectorAll('.ps-regen-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const archId = btn.dataset.archId;
                const idx    = parseInt(btn.dataset.idx, 10);
                const arch   = this.archetypes.find(a => a.id === archId);
                if (!arch) return;
                const newText = this._buildPrompt(arch);
                const block   = list.querySelector(`[data-idx="${idx}"]`);
                if (block) {
                    block.querySelector('.ps-prompt-text').textContent = newText;
                    block.classList.remove('ps-prompt-similar');
                    const badge = block.querySelector('.ps-similar-badge');
                    if (badge) badge.remove();
                    // Reset caption if previously generated
                    const capDiv = block.querySelector('.ps-caption-block');
                    if (capDiv) { capDiv.innerHTML = ''; capDiv.style.display = 'none'; delete capDiv.dataset.generated; }
                }
                prompts[idx].text = newText;
                Elaris.toast('New prompt generated ✨', 'info');
            });
        });

        // ✨ Refine: surgically apply modifier changes to an existing prompt
        list.querySelectorAll('.ps-refine-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const archId = btn.dataset.archId;
                const idx    = parseInt(btn.dataset.idx, 10);
                const arch   = this.archetypes.find(a => a.id === archId);
                if (!arch) return;
                const existingText = prompts[idx].text;
                const refined = this._refinePrompt(existingText, arch);
                const block = list.querySelector(`[data-idx="${idx}"]`);
                if (block) {
                    block.querySelector('.ps-prompt-text').textContent = refined;
                    const capDiv = block.querySelector('.ps-caption-block');
                    if (capDiv) { capDiv.innerHTML = ''; capDiv.style.display = 'none'; delete capDiv.dataset.generated; }
                }
                prompts[idx].text = refined;
                Elaris.toast('Prompt refined with current settings ✨', 'success');
            });
        });

        // Caption: click header area to toggle caption block (lazy generation)
        list.querySelectorAll('.ps-prompt-header').forEach(header => {
            header.addEventListener('click', e => {
                if (e.target.closest('button')) return;  // ignore button clicks inside header
                const block  = header.closest('.ps-prompt-block');
                const idx    = parseInt(block.dataset.idx, 10);
                const archId = block.dataset.archId;
                const capDiv = block.querySelector('.ps-caption-block');
                if (!capDiv) return;
                if (capDiv.style.display !== 'block') {
                    if (!capDiv.dataset.generated) {
                        const cap = this._generateCaption(archId, this._lastPiece || '', this._lastMaterial || '');
                        capDiv.innerHTML = `<div class="ps-caption-inner"><div class="ps-caption-label">📝 Caption — click header again to hide</div><pre class="ps-caption-text">${cap}</pre><button class="btn btn-sm btn-secondary ps-copy-caption" data-idx="${idx}">📋 Copy Caption</button></div>`;
                        capDiv.dataset.generated = '1';
                        // Wire copy-caption btn
                        capDiv.querySelector('.ps-copy-caption').addEventListener('click', () => {
                            const text = capDiv.querySelector('.ps-caption-text')?.textContent || '';
                            navigator.clipboard.writeText(text).then(() => Elaris.toast('Caption copied! ✨', 'success'));
                        });
                    }
                    capDiv.style.display = 'block';
                } else {
                    capDiv.style.display = 'none';
                }
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

        // Scale: filter human-body-referencing terms for product-only shots (no model)
        const scale = isHuman
            ? 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to correct real-world scale, miniaturized accessories'
            : 'oversized jewelry, jewelry not to correct real-world scale, miniaturized accessories, jewelry disproportionate to scene';

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
        // ── PIECE LABEL: Always enforce correct category type word ──────────────
        // Users sometimes type the wrong category word (e.g. 'bracelet' when ring is
        // selected, or carry over an old description from a previous category session).
        // We sanitize the raw description by stripping ALL jewelry-type words and any
        // material descriptors, then always prepend: material + correct category type.
        const material = this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver';
        const catLabels = {
            'ring': 'ring', 'necklace': 'necklace', 'earring': 'earrings',
            'bracelet': 'bracelet', 'bangle': 'bangle', 'anklet': 'anklet',
            'pendant': 'pendant', 'brooch': 'brooch',
        };
        const catWord = catLabels[this.state.category] || this.state.category;
        // Strip jewelry type words so wrong category can't bleed in
        const _typeWords = 'ring|rings|necklace|necklaces|earring|earrings|bracelet|bracelets|bangle|bangles|anklet|anklets|pendant|pendants|brooch|brooches|brooche';
        // Strip material text the user may have typed manually
        const _matWords = '925\\s*sterling\\s*silver|sterling\\s*silver|18k\\s*gold|14k\\s*gold|rose\\s*gold|yellow\\s*gold|white\\s*gold|platinum|\\b925\\b';
        let _rawDesc = this.state.pieceDesc || '';
        _rawDesc = _rawDesc.replace(new RegExp('\\b(' + _typeWords + ')\\b', 'gi'), '');
        _rawDesc = _rawDesc.replace(new RegExp('(' + _matWords + ')', 'gi'), '');
        _rawDesc = _rawDesc.replace(/\s+/g, ' ').trim();
        // piece = "925 Sterling Silver ring with diamonds accents" (always correct type)
        const piece = _rawDesc ? `${material} ${catWord} ${_rawDesc}` : `${material} ${catWord}`;
        this._lastPiece = piece;
        this._lastMaterial = material;
        // v3.1: unified lighting+mood single state key
        const _lm = this.lightingMoods.find(m => m.id === this.state.lightingMood)
            || this.lightingMoods.find(m => m.id === this.state.mood)   // legacy fallback
            || this.lightingMoods[0];
        const mood    = _lm.label.toLowerCase();
        const lighting = _lm.label.toLowerCase();
        const fmt = this.formats.find(f => f.id === this.state.format);
        const ratio = fmt ? fmt.ratio : '1:1';
        const angleName = this.angles.find(a => a.id === this.state.angle)?.label.toLowerCase() || '';
        const palette = this.palettes.find(p => p.id === this.state.palette)?.label.toLowerCase() || '';

        // ── FIX #2: Build subject + inject random scene environment variant ──────────────────────
        // The material descriptor is injected separately to avoid redundancy.
        // Scene variant adds randomized setting/environment to prevent same-scene repetition.
        const subject = this._getUniqueSubject(archetype).replace(/\{piece\}/g, piece);
        const sceneVariant = this._getSceneVariant(archetype.id);
        // Coherent lighting: if scene has time-of-day language, align lighting desc
        // Since humanEnvs is now pure-location, lighting override only happens when
        // the selected lighting option itself contains time-of-day keywords.
        const lightingCoherent = this._getLightingForScene(sceneVariant, lighting);
        // Only inject sceneVariant as a bodyPart if it's a location (not a time-of-day variant)
        // This prevents two lighting descriptions in the same prompt.
        const _sceneIsLight = /morning|dusk|twilight|blue hour|candlelit|overcast|midday|golden light|lantern light/i.test(sceneVariant);
        const sceneVariantPart = _sceneIsLight ? '' : sceneVariant;

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
            // ── v3.0: New angles ─────────────────────────────────────────────
            'wind-blown':           'model at field level, wide 35mm f/2 lens, wind machine creating hair and fabric motion, natural outdoor available light, Altai/steppe editorial energy',
            'extreme-close-crop':   'face fills entire frame edge to edge, 100mm f/2.5 lens, eyes and nose dominate, no chin or forehead in frame, extreme intimacy and raw beauty detail',
            'fabric-reveal':        'fabric being pulled aside to reveal face or jewelry, 85mm f/1.4, the fabric edge cuts diagonally across frame creating dramatic geometry',
            'three-quarter-above':  'elevated 45-degree diagonal angle looking down at subject, 85mm f/1.8, dimensional depth with slight overhead authority, editorial and elegant',
            // v3.3: New angles with full camera descriptions
            'mouth-bite':           'extreme close-up on 100mm f/2.8 macro lens, model gently biting down on the jewelry piece physically held between her front teeth, lips parted naturally around the metal, real physical contact between teeth and jewelry, visible jaw tension and slight lip pressure from biting, the jewelry is gripped by the teeth NOT floating or hovering near the mouth, intimate sensual editorial, lip texture and skin pores visible',
            'neck-close-up':        'tight close-up on 100mm f/2.8 lens focused on the neck and collarbone area, necklace or pendant as central subject, skin texture and chain detail visible, elegant vertical composition',
            'hand-on-face':         'model with hand placed against face or cheek on 85mm f/1.4 lens, ring or bracelet framed by face contact, intimate touch-frame composition, natural finger placement',
            'wrist-cross':          'both wrists crossed or stacked in frame on 85mm f/1.8 lens, bracelets and rings on full display, editorial hand composition, geometric arm arrangement',
            'mirror-angle':         'shot through or against a mirror on 85mm f/1.4 lens, dual perspective showing jewelry from two angles simultaneously, reflection composition, infinite depth effect',
            'upward-gaze':          'camera positioned below chin level on 85mm f/1.8 lens, model gazing upward, elongated neck line showcasing necklace or earrings, dramatic editorial perspective, jaw and neck as sculptural lines',
        };
        // v3.0: Camera profile override — when not 'auto', the selected lens description replaces the angle-derived one
        const profileOverride = this.state.cameraProfile && this.state.cameraProfile !== 'auto'
            ? (this.cameraProfiles.find(c => c.id === this.state.cameraProfile) || {}).desc || ''
            : '';
        const cameraDesc = profileOverride || cameraMap[this.state.angle] || 'shot on 85mm f/1.4 lens, shallow depth of field';

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
        const humanArchetypes = [
            'body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase', 'motion-blur',
            'cinematic-portrait', 'celestial-mythic', 'masculine-editorial', 'surface-lean', 'hair-drama',
            'lifestyle-moment', 'heritage-moroccan', 'architectural-context', 'wet-element',
            // v3.0
            'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture', 'cinematic-color-story',
            'surreal-scale', 'ghost-double-exposure', 'outdoor-masculine', 'harsh-sun-beauty',
            'mouth-lips-editorial', 'dark-moody-editorial',
        ];
        const isHuman = humanArchetypes.includes(archetype.id);
        // v3.1: "No Model" gender mode — treat as product-only regardless of archetype
        const noModel = this.state.modelGender === 'none';
        const isHumanActive = isHuman && !noModel;  // true only if archetype is human AND gender != none

        // Model styling (only for human archetypes) — gender-aware phrasing
        const modelGenderForStyling = this.state.modelGender === 'none' ? 'female' : (this.state.modelGender || 'female');
        let stylingDesc = '';
        if (isHumanActive) {
            const styleMap = {
                'auto': this._getRandomOutfit(modelGenderForStyling, this.state.material),   // auto: palette-matched random outfit
                'ai-choice': `outfit creatively chosen by the art director — high-fashion luxury jewelry campaign, neckline naturally open to display the ${this.state.category || 'piece'} piece, elevated editorial styling, garment silhouette and color chosen by the photographer to best complement the jewelry`,
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

            // ── v3.0: Hijabi injection ──────────────────────
            if (this.state.hijabi) {
                const hijabStyleMap = {
                    'classic':    'model wearing a beautifully draped classic hijab covering hair and neck, elegant and dignified styling, fabric falling naturally around the face',
                    'draped':     'model wearing a luxuriously draped silk hijab loosely arranged around head and shoulders, fabric pooling softly, high-fashion editorial styling',
                    'turban':     'model wearing a fashion-forward wrapped turban headpiece, contemporary urban styling, bold and confident aesthetic',
                    'niqab':      'model wearing a flowing niqab — face veil with only the eyes exposed, intensely artistic and editorial, eyes the sole focal point above the veil edge, deeply atmospheric and dramatic',
                    'modern':     'model wearing a contemporary minimal hijab with clean precise folds framing the face, modern modest fashion aesthetic, sophisticated and editorial',
                    'sheer-veil': 'model with a sheer translucent chiffon veil draped loosely over the head and partially across the face, ethereal and artistic, fabric creating softness and visual poetry',
                };
                const hijabDesc = hijabStyleMap[this.state.hijabStyle || 'classic'];
                stylingDesc = stylingDesc ? `${stylingDesc}, ${hijabDesc}` : hijabDesc;
            }
        }

        // Pose detail — ONLY injected for archetypes whose subject templates
        // describe a general scene (not a specific body position). For archetypes
        // like surface-lean, hair-drama, body-intimate, masculine-editorial, their
        // subject templates already fully describe the model's position — injecting
        // poseDesc on top would create two conflicting body descriptions.
        const POSE_ARCHETYPES = new Set(['editorial-model', 'bw-dramatic', 'cinematic-portrait', 'lifestyle-moment']);
        let poseDesc = '';
        if (isHumanActive && POSE_ARCHETYPES.has(archetype.id)) {
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
        if (isHumanActive) {
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
        if (isHumanActive || (archetype.id === 'shadow-play' && !noModel)) {
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
        if (isHumanActive && this.state.brandTouch === 'logomark') {
            // Enamel-filled pin: dark enamel body + polished gold outline = always visible on any garment
            brandTouchDesc = 'model wearing a small "Elaris" four-pointed star pin at the lapel — a discreet luxury pin worn as a brand signature, enamel-and-metal two-tone finish naturally contrasting the garment, pin size proportional to real luxury brand pins (small and refined), positioned naturally on the clothing as an authentic styling detail';
        } else if (isHuman && this.state.brandTouch === 'wordmark') {
            // Luxury tri-layer embroidery technique used by haute couture houses:
            // (1) raised dimensional satin stitch creates micro-shadows for depth even on color-matched fabric
            // (2) hairline contrast outline stitch around each letter guarantees edge separation
            // (3) adaptive color rule: cool-toned thread on warm/yellow/gold fabrics, warm on cool, bright on dark, dark on bright
            const _wPlacement = this._getBrandPlacement(this.state.category);
            brandTouchDesc = `a small "ELARIS" embroidered wordmark on the garment in capitalized tight-kerned serif lettering with minimal letter spacing, letters nearly touching like a real luxury clothing label — fine single-thread stitching ${_wPlacement}, no larger than 2 cm in real scale, NOT on the sleeve or wrist area, thread color naturally contrasting the fabric for quiet legibility, styled as an authentic luxury clothing label integrated into the garment, reads as a genuine brand signature not a graphic overlay, NOT widely spaced, NOT spread apart letters`;
        }

        // hasNamedProfile: computed early to avoid TDZ — used in bodyParts below
        // When a named profile (Amir, Lina...) is active, don't inject random skin tone on top.
        const hasNamedProfile = this.state.consistencyOn && !!this.state.profiles.find(
            prof => prof.id === this.state.activeProfileId
        );

        const bodyParts = [
            // SUBJECT — jewelry piece at the center, material injected cleanly on next line
            subject + '.', sceneVariantPart ? sceneVariantPart + '.' : '',
            // PLACEMENT RULE — only for human archetypes (product shots have no finger)
            (isHumanActive && placementRule) ? `${placementRule}.` : '',
            // MATERIAL — stated once, cleanly, with metal descriptor
            `${material}, ${silverDesc}.`,
            // SCENE — archetype visual story (lighting, composition, mood)
            archetype.scene + '.',
            // CAMERA — lens, aperture, depth of field (no angle conflict)
            `${cameraDesc}.`,
            // MOOD & LIGHTING (v3.1: single unified value)
            `${mood} mood, ${lightingCoherent}.`,
            // POSE (human only, no embedded skin notes)
            poseDesc ? `Pose: ${poseDesc}.` : '',
            // EXPRESSION (human only)
            expressionDesc ? `Expression: ${expressionDesc}.` : '',
            // SKIN TONE — randomized per generation for model diversity (human archetypes only)
            (isHumanActive && !hasNamedProfile) ? this._getRandomSkinTone() + '.' : '',
            // REALISM (skin texture, wrinkles, body hair, skin detail — user controlled)
            realismDesc ? realismDesc + '.' : '',
            // STYLING (outfit) — placed before realism; clearly defines garment
            stylingDesc ? stylingDesc + '.' : '',
            // SURFACE / PALETTE — product/environment descriptors
            surfaceDesc ? surfaceDesc + '.' : '',
            paletteDesc ? paletteDesc + '.' : '',
            // JEWELRY STYLE DIRECTION
            jewelryStyleDesc ? `Style direction: ${jewelryStyleDesc}.` : '',
            // BRAND HALLMARK (optional — jewelry engraving)
            hallmarkDesc ? `Brand hallmark details: ${hallmarkDesc}.` : '',
            // BRAND TOUCH — Elaris identity on model clothing (logomark / wordmark)
            brandTouchDesc ? brandTouchDesc + '.' : '',
        ];

        // Compute ratio string — flat-lay/overhead angles get a framing note in 9:16
        const _flatAngles = ['flat-lay', 'overhead', 'top-down-hand'];
        const ratioStr = (_flatAngles.includes(this.state.angle) && ratio === '9:16')
            ? `Aspect ratio ${ratio}. Note: this overhead/flat angle composition is optimised for 1:1 or 4:5 framing.`
            : `Aspect ratio ${ratio}.`;

                const tailParts = [
            (() => {
                const rl = this.state.realismLevel || 'standard';
                const base = 'Sharp critical focus on jewelry, perfect geometric proportions, 8K resolution, style photographic, professional commercial photography, RAW quality.';
                if (rl === 'high') return base + ' Shot on DSLR sensor, natural micro-imperfections in lighting, subtle film grain texture, shallow depth of field falloff at edges, natural lens vignetting, subsurface scattering on skin.';
                if (rl === 'ultra') return base + ' Shot on full-frame DSLR sensor, visible sensor noise at ISO 400, natural chromatic aberration at frame edges, organic film grain texture, micro-detail on fabric weave and thread texture, individual skin pores and micro-hairs visible, subsurface light scattering through earlobes and thin skin, natural lens imperfections including slight barrel distortion, captured in RAW format with DNG color profile, real photography not CGI not 3D render.';
                return base;
            })(),
            anatomyConstraint,
            // Aspect ratio: aerial/flat-lay angles read better in square/4:5
            ratioStr,
            negativePrompt,
        ];

        // v3.3: Inject realism prefix at the START of the prompt for higher token priority
        const realismPrefix = (() => {
            const rl = this.state.realismLevel || 'standard';
            if (rl === 'high') return 'Hyper-realistic editorial photograph. Real photography, not AI-generated. Natural imperfections: slight lens vignetting, organic film grain, authentic skin texture with visible pores, natural color cast from real lighting.';
            if (rl === 'ultra') return 'Indistinguishable from a real photograph taken by a professional photographer on a real camera sensor. Visible: natural sensor noise, chromatic aberration at frame edges, organic film grain, fabric thread texture, individual skin pores and micro-hairs, subsurface light scattering through thin skin and earlobes, natural lens barrel distortion, captured in RAW format with real DNG color profile. NOT CGI, NOT 3D render, NOT illustration, NOT digital art.';
            return '';
        })();
        const standardPrompt = [realismPrefix, ...bodyParts, ...tailParts].filter(Boolean).join(' ');

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
            _getBrandPlacement(category) {
        // v3.3: Returns a scene-aware placement description for the Elaris wordmark.
        // AVOID: cuff/sleeve near wrist (AI defaults there; also near ring/bracelet jewelry focus).
        // Placement is category-aware: don't put mark where jewelry draws the eye.
        const lapelPlacements = [
            'discreetly embroidered on the lapel, left side',
            'on the lapel edge, small and precise',
            'at the lapel near the collarbone',
        ];
        const collarPlacements = [
            'on the inner collar fold, just visible at the neckline',
            'at the collar stand, barely visible, like a luxury label',
            'on the shirt collar underside, as a refined interior brand detail',
        ];
        const pocketPlacements = [
            'on the breast pocket edge',
            'at the chest pocket, positioned precisely',
            'on the pocket facing, understated and refined',
        ];
        const backCollarPlacements = [
            'on the back of the collar as an interior label detail',
            'at the nape-facing collar fold, subtle brand signature',
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

        // For necklace/pendant: avoid chest area — use lapel or back collar
        if (category === 'necklace' || category === 'pendant') {
            const pool = [...lapelPlacements, ...backCollarPlacements];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        // For ring/bracelet: avoid wrist area — use lapel, collar, pocket
        if (category === 'ring' || category === 'bracelet' || category === 'bangle' || category === 'anklet') {
            const pool = [...lapelPlacements, ...collarPlacements, ...pocketPlacements];
            return pool[Math.floor(Math.random() * pool.length)];
        }
        // For earring/brooch: any placement is fine
        const pool = [...lapelPlacements, ...collarPlacements, ...pocketPlacements];
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _getRandomSkinTone() {
        // v3.3: Ethnicity-aware skin tone — Moroccan-audience-aware representation
        const diversePool = [
            'model has warm deep brown skin, rich luminous tone with natural warmth',
            'model has medium olive complexion, Mediterranean warm undertones, healthy glow',
            'model has light warm golden skin, sun-kissed undertones, smooth texture',
            'model has deep espresso skin, high contrast, beautifully luminous',
            'model has warm tawny complexion, North African skin tones, rich depth',
            'model has fair ivory skin with cool rose undertones, delicate and luminous',
            'model has caramel medium complexion, even tone, warm and approachable',
            'model has rich amber skin, deep warm undertones, photogenic contrast',
            'model has bronze sun-warmed complexion, Mediterranean golden tones',
            'model has warm chestnut complexion, luminous North African colouring',
        ];
        const fixedTones = {
            'fair':    'model has fair ivory skin with cool rose undertones, delicate and luminous complexion',
            'olive':   'model has medium olive complexion, Mediterranean warm undertones, healthy sun-kissed glow',
            'warm':    'model has light warm golden skin, sun-kissed undertones, smooth radiant texture',
            'caramel': 'model has caramel medium complexion, even warm tone, approachable and photogenic',
            'deep':    'model has warm deep brown skin, rich luminous tone with natural warmth and depth',
        };
        const eth = this.state.modelEthnicity || 'diverse';
        if (eth !== 'diverse' && fixedTones[eth]) return fixedTones[eth];
        return diversePool[Math.floor(Math.random() * diversePool.length)];
    },

    // v3.3: Returns lighting moods sorted by archetype recommendation
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
        return {
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
        };
    },

    _getLightingForScene(sceneVariant, selectedLighting) {
        // Override lighting when sceneVariant has strong time-of-day language
        // that would contradict the studio lighting picker choice.
        // If user explicitly picked a non-generic lighting, we still respect it
        // (only override the default 'studio lighting' fallback).
        if (!sceneVariant) return selectedLighting;
        const sv = sceneVariant.toLowerCase();
        if (sv.includes('morning') || (sv.includes('golden') && sv.includes('light'))) {
            return 'warm morning golden light, soft natural fill from a low sun angle';
        }
        if (sv.includes('dusk') || sv.includes('twilight')) {
            return 'dusk ambient light, warm-to-cool gradient atmosphere';
        }
        if (sv.includes('blue hour')) {
            return 'blue hour soft twilight, cool diffused ambient exposure';
        }
        if (sv.includes('candlelit') || sv.includes('lantern')) {
            return 'warm candlelit ambient, golden flickering tones, intimate low-key atmosphere';
        }
        if (sv.includes('overcast')) {
            return 'overcast sky, evenly diffused natural light, no harsh shadows, studio-quality daylight';
        }
        if (sv.includes('midday') || sv.includes('mediterranean')) {
            return 'bright high-key midday Mediterranean light, strong directional sun';
        }
        return selectedLighting;  // no time-of-day conflict — keep user selection
    },

    
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
        return `${hook}\n\n${material} — ${piece}.\n\n✦ Elaris Jewelry\n\n${tags} #ElarisJewelry #Elaris`;
    },

    _getSceneVariant(archetypeId) {
        // Returns a random environment/setting phrase to inject variety into any archetype
        // Organized by archetype group — human archetypes get lifestyle settings,
        // product archetypes get surface/environment settings
        // ── ENVIRONMENT-ONLY pool (pure locations — NO time-of-day language) ──────
        // Time-of-day is handled exclusively by _getLightingForScene() to prevent
        // duplicate lighting descriptions in the generated prompt.
        const humanEnvs = [
            // ── Elegant interiors ────────────────────────────────────────────
            'inside a warmly lit café, wooden tables and ceramic cups on the counter',
            'a sleek modern hotel lobby with marble floors and architectural lighting',
            'a quiet home library surrounded by stacked books and warm lamplight',
            'a rooftop terrace with city skyline as backdrop',
            'a bright Scandinavian-style loft with white walls and oak floors',
            'a Moroccan riad courtyard with intricate zellige tile patterns',
            'a sun-drenched south-of-France terrace with potted lavender nearby',
            'an elegant dressing room with a floor-length mirror and vanity lighting',
            'a luxurious boutique hotel suite with European interior design',
            'a Parisian apartment living room with tall windows and parquet floors',
            // ── Moroccan / North African settings ────────────────────────────
            'a traditional riad garden with a central fountain and lush green plants',
            'a Moroccan medina alleyway framed by carved archways and plaster walls',
            'a rooftop in Marrakech with the medina panorama visible in the background',
            'a Moroccan wedding venue with embroidered textiles and ornate lanterns',
            'a Moroccan hammam anteroom with zellige floors and arched doorways',
            // ── Aspirational exteriors ───────────────────────────────────────
            'a cobblestone street in a Mediterranean old town',
            'a Mediterranean harbour with terracotta buildings and blue water',
            'a lush private garden with dappled shade and stone pathways',
            'a modern rooftop pool area with clean geometric lines',
            'a sunlit outdoor terrace at a luxury resort',
            // ── Lifestyle settings ───────────────────────────────────────────
            'inside a luxury car interior, leather seat and clean dashboard visible',
            'at a polished marble kitchen counter with minimalist design',
            'at a quiet outdoor café table in a sunlit courtyard',
            'in a design bookshop between floor-to-ceiling shelves',
            'at a rooftop bar with panoramic views',
        ];
        const productEnvs = [
            'polished white Carrara marble surface',
            'aged raw concrete with subtle texture',
            'dark oxidized steel surface catching studio light',
            'warm honey-toned oak wood grain',
            'deep black velvet surface, zero reflection',
            'hand-woven natural linen fabric base',
            'pale pink sand surface with fine grain texture',
            'brushed brass tray with clean studio light',
            'glass shelf, frosted light diffused from below',
            'aged terracotta surface, matte warm tones',
            'scattered dried botanicals on cream paper',
            'ice crystals forming on a mirror surface',
        ];
        const humanIds = ['body-intimate','editorial-model','bw-dramatic','collection-showcase',
            'motion-blur','cinematic-portrait','lifestyle-moment','heritage-moroccan',
            'celestial-mythic','architectural-context','masculine-editorial',
            'surface-lean','hair-drama','wet-element'];
        const pool = humanIds.includes(archetypeId) ? humanEnvs : productEnvs;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    _getRandomOutfit(gender, materialId) {
        // Returns a random outfit — palette-tagged and filtered by metal affinity
        // Rose/yellow gold → warm palette, Silver/platinum → cool, mixed → neutral
        const warmMats = ['rose-gold', 'gold', 'yellow-gold'];
        const coolMats = ['sterling-silver', 'platinum', 'white-gold'];
        const matFamily = warmMats.includes(materialId) ? 'warm'
                        : coolMats.includes(materialId) ? 'cool' : 'neutral';

        // ── JEWELRY-CAMPAIGN OUTFITS ──────────────────────────────────────────
        // Inspired by Cartier, Tiffany, Van Cleef & Arpels, Bulgari campaign styling.
        // Key principle: shows neck/décolletage (necklaces), ears (earrings), wrists (bracelets).
        // Never oversized, chunky knitwear, or garments that obscure jewelry.
        const femaleOutfits = [
            // Deep necklines — best for necklace/pendant visibility
            { t: 'in a deep V-neck black silk dress, décolletage open, neckline clean and unobstructed', p: 'neutral' },
            { t: 'wearing an off-shoulder ivory satin top, collarbone and shoulders fully exposed', p: 'neutral' },
            { t: 'in a draped one-shoulder champagne silk dress, asymmetric editorial elegance', p: 'warm' },
            { t: 'wearing a strapless deep bordeaux velvet bodice, shoulders and chest open', p: 'warm' },
            { t: 'in a plunging-V cream satin blouse, softly draped, wide neckline for jewelry display', p: 'neutral' },
            // Open collar — versatile for most jewelry types
            { t: 'in an open-collar white silk button-down, first three buttons undone, crisp editorial', p: 'cool' },
            { t: 'wearing a stone-colored linen blazer open over a nude silk camisole', p: 'neutral' },
            { t: 'in a tailored deep navy blazer with nothing underneath, collar wide open', p: 'cool' },
            { t: 'wearing an open-collar copper-toned silk shirt, the neckline relaxed and visible', p: 'warm' },
            { t: 'in a terracotta linen open-collar shirt, effortlessly luxurious, neckline exposed', p: 'warm' },
            // Fine knits that reveal rather than hide
            { t: 'wearing a fitted deep-V camel cashmere sweater, fine-gauge, showing the collarbone', p: 'warm' },
            { t: 'in a fitted black fine-knit V-neck top, minimal and jewelry-focused', p: 'neutral' },
            { t: 'wearing a burgundy fine-knit scoop-neck sweater, clean and editorial', p: 'warm' },
            // Camisoles and silk tops
            { t: 'in a fine ivory silk camisole with delicate straps, minimal and luxurious', p: 'neutral' },
            { t: 'wearing a dusty-rose silk camisole, softly draped, shoulder and neck exposed', p: 'warm' },
            { t: 'in a midnight blue silk slip top, thin straps, décolletage prominently visible', p: 'cool' },
            // Sophisticated blazers
            { t: 'wearing a fitted white power blazer, single button, bare underneath, editorial chic', p: 'neutral' },
            { t: 'in a structured forest-green blazer, lapels wide open, minimal underneath', p: 'cool' },
            // Moroccan-influenced elegant options
            { t: 'in an embroidered ivory kaftan, open at the front neckline, elegant occasion wear', p: 'neutral' },
            { t: 'wearing a fitted champagne-gold Moroccan-inspired dress with subtle brocade, décolletage visible', p: 'warm' },
        ];
        const maleOutfits = [
            // Open collar / dress shirts — shows chain/necklace at chest
            { t: 'in a crisp white dress shirt with collar fully open, two buttons undone, sleeves 3/4 rolled', p: 'neutral' },
            { t: 'wearing a pale blue cotton dress shirt, collar open, slim cut, Mediterranean elegance', p: 'cool' },
            { t: 'in a black dress shirt with collar unbuttoned, showing a chain at the chest, editorial', p: 'neutral' },
            { t: 'wearing an ecru linen shirt open at the collar, fine fabric, relaxed luxury', p: 'warm' },
            // V-necks that show necklace
            { t: 'in a fine black merino V-neck, slim silhouette, neckline showing jewelry', p: 'neutral' },
            { t: 'wearing a camel V-neck cashmere pullover, fine gauge, collarbone visible', p: 'warm' },
            // Suits / blazers for formal jewelry shoots
            { t: 'in a classic black suit, white dress shirt with collar open, no tie, distinguished', p: 'neutral' },
            { t: 'wearing a tailored charcoal grey suit, shirt open at collar revealing a chain', p: 'cool' },
            { t: 'in a cream linen suit, shirt open two buttons, warm Mediterranean editorial', p: 'warm' },
            { t: 'wearing a navy wool blazer with an open-collar white shirt, sophisticated and clean', p: 'cool' },
            // Simple but jewelry-focused
            { t: 'in a fitted white V-neck tee, clean and minimal, jewelry as the centerpiece', p: 'neutral' },
            { t: 'wearing a deep bordeaux open-collar shirt, slim cut, 3/4 sleeves showing wrist', p: 'warm' },
        ];

        const pool = (gender === 'male') ? maleOutfits : femaleOutfits;
        // Prefer palette-matched outfits; fall back to neutral, then any
        const preferred = pool.filter(o => o.p === matFamily);
        const neutral   = pool.filter(o => o.p === 'neutral');
        const chosen    = preferred.length > 0 ? preferred : neutral.length > 0 ? neutral : pool;
        return chosen[Math.floor(Math.random() * chosen.length)].t;
    },

    // ── Refine: surgically update an existing prompt with current modifier state ──
    // Keeps the core scene/subject/archetype DNA but swaps modifiers the user changed
    _refinePrompt(existingText, archetype) {
        let text = existingText;

        // ── RATIO: swap "Aspect ratio X:Y" with current ratio ──────────
        const fmt = this.formats.find(f => f.id === this.state.format);
        const newRatio = fmt ? fmt.ratio : '1:1';
        text = text.replace(/Aspect ratio \d+:\d+/g, 'Aspect ratio ' + newRatio);

        // ── HIJAB: inject or remove hijab language ──────────────────────
        const hijabPatterns = /,?\s*(wearing a (?:classic draped|modern wrapped|loose flowing|turban-style)(?: hijab| headscarf| veil)[^,.]*)\.?/gi;
        text = text.replace(hijabPatterns, '');
        if (this.state.hijabi) {
            const hijabStyles = {
                'classic':   'wearing a classic draped hijab in a complementary neutral tone',
                'modern':    'wearing a modern wrapped headscarf styled for editorial fashion',
                'loose':     'wearing a loose flowing veil draped over the head and shoulders',
                'turban':    'wearing a turban-style hijab wrapped elegantly',
            };
            const hijabDesc = hijabStyles[this.state.hijabStyle] || hijabStyles['classic'];
            // Insert after the first period (after the subject sentence)
            const firstDot = text.indexOf('.');
            if (firstDot > 0) {
                text = text.substring(0, firstDot) + ', ' + hijabDesc + text.substring(firstDot);
            }
        }

        // ── MODEL GENDER: swap gender pronouns and descriptors ─────────
        const gender = this.state.modelGender || 'female';
        if (gender === 'male') {
            text = text.replace(/\bwoman\b/gi, 'man').replace(/\bher\b/g, 'his').replace(/\bshe\b/gi, 'he');
        } else if (gender === 'female') {
            text = text.replace(/\bman\b/gi, 'woman').replace(/\bhis\b/g, 'her').replace(/\bhe\b/gi, 'she');
        }

        // ── LIGHTING/MOOD: swap mood description ───────────────────────
        const _lm = this.lightingMoods.find(m => m.id === this.state.lightingMood)
            || this.lightingMoods[0];
        const newMood = _lm.label.toLowerCase();
        text = text.replace(/[\w-]+ mood,\s*[\w\s,-]+ lighting[\w\s]*/i, newMood + ' mood, ' + newMood + ' lighting');

        // ── CAMERA: swap lens description if user changed it ───────────
        const camProfile = this.cameraProfiles.find(c => c.id === this.state.cameraProfile);
        if (camProfile && camProfile.desc) {
            // Replace the old camera sentence (starts with "Shot on" or lens name pattern)
            text = text.replace(/(?:Shot on |Captured with |Photographed using )?(?:Hasselblad|Leica|Sony|Canon|Phase One|Fujifilm|Anamorphic|Nikon)[^.]+\./i, camProfile.desc + '.');
        }

        // ── ANGLE: swap angle name ─────────────────────────────────────
        const newAngle = this.angles.find(a => a.id === this.state.angle);
        if (newAngle) {
            // Replace "shot from X angle" or "X perspective" patterns
            text = text.replace(/shot from [\w-]+ angle/i, 'shot from ' + newAngle.label.toLowerCase() + ' angle');
        }

        // ── MODEL CONSISTENCY: swap model reference count ──────────────
        if (this.state.jewelryCount > 0) {
            text = text.replace(/Images? \d+ (?:to \d+ )?show(?:s)? the exact jewelry/i,
                this.state.jewelryCount === 1
                    ? 'Image 1 shows the exact jewelry'
                    : 'Images 1 to ' + this.state.jewelryCount + ' show the exact jewelry');
        }

        // Clean up double spaces/periods
        text = text.replace(/\s{2,}/g, ' ').replace(/\.{2,}/g, '.').trim();
        return text;
    },

        _computePromptSimilarity(text1, text2) {
        // Simple keyword-overlap similarity (Jaccard-like) between two prompt texts
        // Returns a 0–1 score; >0.55 = suspiciously similar
        const tokenise = t => new Set(
            t.toLowerCase()
             .replace(/[^a-z0-9 ]/g, ' ')
             .split(/\s+/)
             .filter(w => w.length > 4)   // only meaningful words
        );
        const s1 = tokenise(text1);
        const s2 = tokenise(text2);
        const intersection = [...s1].filter(w => s2.has(w)).length;
        const union = new Set([...s1, ...s2]).size;
        return union === 0 ? 0 : intersection / union;
    },

    _getUsedSubjectKey(archetypeId) {
        return 'elaris_used_' + archetypeId;
    },

    _getUniqueSubject(archetype) {
        // ── Cross-session deduplication via localStorage ───────────────────
        // We track which subject indices have been used in previous sessions.
        // Prefer unused-across-sessions subjects, cycling through them before repeating.
        const storageKey = this._getUsedSubjectKey(archetype.id);
        let usedAcrossSessions = [];
        try {
            usedAcrossSessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch(e) { usedAcrossSessions = []; }

        const allIndices = archetype.subjects.map((_, i) => i);
        const unusedAcross = allIndices.filter(i => !usedAcrossSessions.includes(i));

        // If pool doesn't exist or is empty, rebuild from unused-across-sessions first
        if (!this._subjectPools[archetype.id] || this._subjectPools[archetype.id].length === 0) {
            // Prefer subjects never seen across sessions; if all seen, reset cross-session memory
            let candidateIndices = unusedAcross.length > 0 ? unusedAcross : (() => {
                try { localStorage.removeItem(storageKey); } catch(e) {}
                return allIndices;
            })();

            // Fisher-Yates shuffle on candidates
            for (let i = candidateIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidateIndices[i], candidateIndices[j]] = [candidateIndices[j], candidateIndices[i]];
            }
            this._subjectPools[archetype.id] = [...candidateIndices];
        }

        // Pop the next unique index from in-session pool
        const idx = this._subjectPools[archetype.id].pop();

        // Mark as used across sessions
        try {
            const updated = [...new Set([...usedAcrossSessions, idx])];
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch(e) {}

        return archetype.subjects[idx];
    },
};

window.PromptStudio = PromptStudio;

window.render_promptstudio = function(container) { PromptStudio.init(container); };
