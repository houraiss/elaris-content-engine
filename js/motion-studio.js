/**
 * motion-studio.js — Motion Studio for Elaris Content Engine.
 *
 * Generates battle-tested VIDEO prompts by combining:
 *   1. Piece description (material, stones, style)
 *   2. Archetype templates (image archetypes + video-native)
 *   3. Video modifiers (camera movement, duration, speed, transitions)
 *   4. Audio/mood direction
 *   5. Quality boosters (4K, cinematic, etc.)
 *
 * Output: clipboard-ready prompts for Runway, Kling, Pika, Sora, or any video AI tool.
 */

const MotionStudio = {

    // ── Jewelry Categories (same as PromptStudio) ──────────────────────
    categories: ['ring','necklace','earrings','bracelet','bangles','anklet','brooch','pendant','body-jewelry'],

    materials: [
        { id: 'sterling-silver', label: '925 Sterling Silver' },
        { id: '800-silver', label: '800 Moroccan Silver' },
        { id: 'oxidized-silver', label: 'Oxidized / Antiqued Silver' },
        { id: 'brushed-matte', label: 'Brushed Matte Silver' },
        { id: 'high-polish', label: 'High-Polish / Rhodium-Plated' },
        { id: 'silver-vermeil', label: 'Silver Vermeil' },
    ],

    stones: [
        { id: 'none', label: 'No Stones' },
        { id: 'diamond', label: 'Diamonds' },
        { id: 'emerald', label: 'Emeralds' },
        { id: 'sapphire', label: 'Sapphires' },
        { id: 'ruby', label: 'Rubies' },
        { id: 'pearl', label: 'Pearls' },
        { id: 'turquoise', label: 'Turquoise' },
        { id: 'amber', label: 'Amber' },
        { id: 'coral', label: 'Coral' },
        { id: 'cubic-zirconia', label: 'Cubic Zirconia' },
        { id: 'mixed', label: 'Mixed Gemstones' },
    ],

    // ── Video-Native Archetypes ──────────────────────
    videoArchetypes: [
        {
            id: 'slow-reveal',
            name: 'Slow Reveal',
            icon: '🎬',
            tagline: 'From Mystery to Masterpiece',
            bestFor: 'Best for: All pieces — product launches, teasers',
            desc: 'Camera pulls back from extreme close-up to reveal the full piece — the ultimate product tease',
            color: '#1a2530',
            motionType: 'dolly-out',
            subjects: [
                'extreme macro on {piece} surface detail, camera slowly pulls back to reveal the full piece floating on gradient backdrop',
                'black screen fades to extreme close-up of {piece} gemstone facets, camera gradually widens to show the complete design',
                'tight focus on {piece} clasp mechanism, camera dollies back smoothly to reveal the entire piece resting on velvet',
                'blurred abstract shapes resolve into sharp {piece} as camera pulls focus and distance simultaneously',
                'camera starts inside the reflection on {piece} surface, pulls back to reveal piece on marble pedestal',
            ],
            scene: 'smooth continuous dolly-out, extreme macro to full product reveal, gradient or solid backdrop, dramatic lighting shift as scale changes',
            compat: { ring: 95, necklace: 90, earrings: 85, bracelet: 90, bangles: 85, anklet: 70, brooch: 90, pendant: 95, 'body-jewelry': 60, watch: 90 },
        },
        {
            id: 'jewelry-orbit',
            name: 'Jewelry Orbit',
            icon: '💫',
            tagline: '360° Product Glory',
            bestFor: 'Best for: Rings, Pendants, Brooches — e-commerce, hero content',
            desc: 'Product rotates or camera orbits around a hero piece — showing every angle',
            color: '#2a2010',
            motionType: 'orbit',
            subjects: [
                '{piece} floating and rotating slowly on warm amber gradient, camera orbiting at 45° angle, every facet catching light',
                '{piece} on turntable surface, smooth 360° rotation revealing all sides, dramatic studio lighting',
                'camera orbiting around suspended {piece} on invisible thread, bokeh particles floating around it',
                '{piece} spinning slowly against pure black background, single rim light creating moving highlights',
                'multi-angle orbit around {piece} on mirrored surface, reflection creating perfect symmetry as it turns',
            ],
            scene: '360° orbit or product rotation, floating or turntable, gradient backdrop, dramatic rim lighting, every angle visible',
            compat: { ring: 98, necklace: 80, earrings: 85, bracelet: 85, bangles: 80, anklet: 70, brooch: 95, pendant: 95, 'body-jewelry': 50, watch: 80 },
        },
        {
            id: 'walk-and-shine',
            name: 'Walk & Shine',
            icon: '👠',
            tagline: 'Jewelry in Motion',
            bestFor: 'Best for: Necklaces, Earrings, Bangles — fashion films',
            desc: 'Model walks toward or past camera, jewelry catches changing light with each step',
            color: '#1a1a2a',
            motionType: 'tracking',
            subjects: [
                'model walks confidently toward camera, {piece} swinging gently with each step, catching changing studio light',
                'tracking shot following model through golden hour street, {piece} sparkling as light shifts between buildings',
                'model strides past camera in slow motion, {piece} catching single light source, fabric and jewelry moving',
                'front-facing walk of model toward lens, {piece} growing larger in frame with each step, shallow depth of field',
                'side tracking shot of model walking along wall, {piece} catching light through architectural shadows',
            ],
            scene: 'tracking or dolly movement, model in motion, jewelry catching dynamic changing light, fashion film aesthetic',
            compat: { ring: 60, necklace: 95, earrings: 90, bracelet: 70, bangles: 85, anklet: 55, brooch: 50, pendant: 85, 'body-jewelry': 65, watch: 80 },
        },
        {
            id: 'unboxing-moment',
            name: 'Unboxing Moment',
            icon: '📦',
            tagline: 'The Gift Experience',
            bestFor: 'Best for: All pieces — gift campaigns',
            desc: 'Hands opening a jewelry box, slow reveal of piece inside — the ritual of receiving',
            color: '#2a1f1a',
            motionType: 'static-zoom',
            subjects: [
                'elegant hands slowly opening a velvet jewelry box, camera zooms in as {piece} is revealed inside, warm intimate lighting',
                'overhead shot of gift box being unwrapped, ribbon pulled away, lid lifted to reveal {piece} nestled in satin',
                'close-up of hands lifting {piece} from box, holding it up to the light, gentle turning to show all angles',
                'luxury box opening in slow motion, {piece} catching first light as lid lifts, soft gaseous particles in warm light',
                'hands carefully removing {piece} from branded Elaris box, placing it on wrist/neck, the wearing ritual',
            ],
            scene: 'intimate overhead or eye-level, hands as subject, luxury packaging, warm soft lighting, slow deliberate movements, ASMR quality',
            compat: { ring: 90, necklace: 85, earrings: 80, bracelet: 90, bangles: 85, anklet: 70, brooch: 75, pendant: 90, 'body-jewelry': 50, watch: 80 },
        },
        {
            id: 'golden-hour-pass',
            name: 'Golden Hour Pass',
            icon: '🌅',
            tagline: 'Light Transforms Everything',
            bestFor: 'Best for: Necklaces, Earrings, Bracelets — aspirational lifestyle',
            desc: 'Model moving through golden hour light, jewelry sparkling with warm directional sun',
            color: '#3d2b1f',
            motionType: 'tracking',
            subjects: [
                'model walking along Mediterranean coastline at golden hour, {piece} catching warm sun with every movement',
                'tracking shot of model turning face toward setting sun, {piece} erupting in golden light, warm lens flare',
                'model running fingers through hair at golden hour, {piece} on hand creating light streaks against sunset',
                'slow pan across model basking in golden light, {piece} at neckline glowing warm, wind in hair',
                'model on rooftop at sunset, slowly turning to camera, {piece} transitioning from shadow to golden light',
            ],
            scene: 'golden hour directional sunlight, warm amber tones, lens flares optional, outdoor environment, jewelry as light catcher',
            compat: { ring: 75, necklace: 95, earrings: 90, bracelet: 80, bangles: 75, anklet: 60, brooch: 50, pendant: 85, 'body-jewelry': 55, watch: 80 },
        },
        {
            id: 'hand-showcase',
            name: 'Hand Showcase',
            icon: '✋',
            tagline: 'Every Angle, Every Finger',
            bestFor: 'Best for: Rings, Bracelets, Bangles — product close-ups',
            desc: 'Close-up of hand moving, rotating, showing ring or bracelet from every angle',
            color: '#252520',
            motionType: 'macro-orbit',
            subjects: [
                'close-up of hand slowly turning to show {piece} from every angle, soft studio light, clean dark background',
                'fingers delicately moving and spreading to display {piece}, macro lens tracking the motion, bokeh particles',
                'hand rising slowly from water, {piece} covered in droplets catching light, slow motion',
                'hands interlocking and separating to show {piece} on multiple fingers, choreographed hand ballet',
                'single hand slowly clenching and opening fist, {piece} catching different light angles with each position',
            ],
            scene: 'macro lens, hand choreography, smooth slow movements, studio or natural light, jewelry as the star',
            compat: { ring: 98, necklace: 40, earrings: 30, bracelet: 95, bangles: 90, anklet: 30, brooch: 40, pendant: 35, 'body-jewelry': 25, watch: 80 },
        },
        {
            id: 'mirror-vanity',
            name: 'Mirror Vanity',
            icon: '🪞',
            tagline: 'The Getting-Ready Ritual',
            bestFor: 'Best for: Earrings, Necklaces, Bracelets — aspirational lifestyle',
            desc: 'Model putting on jewelry at a vanity mirror — the ritual of getting ready',
            color: '#222530',
            motionType: 'static-dolly',
            subjects: [
                'model at vanity mirror putting on {piece} earring, reflection visible, warm intimate dressing room light',
                'over-shoulder shot of model clasping {piece} necklace, mirror reflection showing the completed look, smile appearing',
                'close-up of fingers fastening {piece} bracelet clasp, camera slowly pulling back to reveal full vanity scene',
                'model admiring {piece} in ornate mirror, turning head side to side, soft golden vanity bulbs glowing',
                'hands reaching for {piece} from jewelry tray on vanity, lifting it into frame, putting it on in mirror',
            ],
            scene: 'vanity mirror setting, warm intimate lighting, reflections as dual perspectives, getting-ready narrative, elegant ritual',
            compat: { ring: 70, necklace: 90, earrings: 95, bracelet: 85, bangles: 80, anklet: 35, brooch: 55, pendant: 80, 'body-jewelry': 45, watch: 80 },
        },
        {
            id: 'water-interaction',
            name: 'Water Interaction',
            icon: '💧',
            tagline: 'Silver Meets Water',
            bestFor: 'Best for: Rings, Bracelets, Pendants — high-impact viral content',
            desc: 'Jewelry interacting with water — splash, submerge, droplets in slow motion',
            color: '#1a2530',
            motionType: 'slow-mo',
            subjects: [
                '{piece} dropped into crystal clear water in ultra slow motion, ripples expanding outward, light refracting through water',
                'hand wearing {piece} plunging into still water surface, slow motion splash frozen mid-frame',
                'water droplets falling onto {piece} on reflective surface, each drop creating a crown splash in slow motion',
                '{piece} emerging from underwater, water cascading off in slow motion, studio light hitting wet silver surface',
                'rain falling on {piece} resting on stone surface, each raindrop impact captured in hyper slow motion',
            ],
            scene: 'ultra slow motion water interaction, high-speed photography quality, dramatic lighting on water, reflective surfaces, visceral impact',
            compat: { ring: 90, necklace: 55, earrings: 50, bracelet: 85, bangles: 80, anklet: 60, brooch: 45, pendant: 75, 'body-jewelry': 35, watch: 80 },
        },
        {
            id: 'fabric-flow',
            name: 'Fabric Flow',
            icon: '🧣',
            tagline: 'Silk in Motion',
            bestFor: 'Best for: Necklaces, Earrings, Body Jewelry — editorial fashion films',
            desc: 'Flowing fabric and silk in motion, jewelry stays sharp against the blur of movement',
            color: '#20202a',
            motionType: 'tracking',
            subjects: [
                'silk fabric billowing in slow motion around model wearing {piece}, jewelry frozen sharp against flowing textile',
                'model spinning in flowing dress, {piece} catching light while fabric creates dynamic shapes around her',
                'close-up of {piece} on skin with silk scarf blowing past in slow motion, textural contrast',
                'model walking through curtains of sheer fabric, {piece} visible through translucent layers, dream-like movement',
                'fabric dropped from above in slow motion, {piece} revealed beneath as silk falls away elegantly',
            ],
            scene: 'flowing fabric as primary motion element, silk or chiffon, jewelry stays pin-sharp, slow motion, editorial beauty',
            compat: { ring: 55, necklace: 90, earrings: 85, bracelet: 60, bangles: 65, anklet: 40, brooch: 45, pendant: 80, 'body-jewelry': 75, watch: 80 },
        },
        {
            id: 'street-strut',
            name: 'Street Strut',
            icon: '🏙️',
            tagline: 'Urban Confidence',
            bestFor: 'Best for: Necklaces, Rings, Bracelets — trend-driven social content',
            desc: 'Model walking through urban streets, jewelry catching city lights and neon',
            color: '#1a1a2a',
            motionType: 'tracking',
            subjects: [
                'tracking shot following model through neon-lit city street, {piece} catching colorful reflections, confident stride',
                'model crossing urban street at night, {piece} sparkling under streetlights, cinematic tracking shot',
                'low-angle tracking shot of model walking on wet city pavement, {piece} reflecting puddle lights',
                'side-tracking of model strutting past storefronts, {piece} catching each window display light in sequence',
                'model emerging from subway stairs onto city street, {piece} catching first daylight, urban lifestyle',
            ],
            scene: 'urban street environment, tracking camera movement, city lights and neon, confident walk, editorial fashion film',
            compat: { ring: 80, necklace: 90, earrings: 85, bracelet: 85, bangles: 70, anklet: 40, brooch: 50, pendant: 80, 'body-jewelry': 55, watch: 80 },
        },
        {
            id: 'detail-macro-pan',
            name: 'Detail Macro Pan',
            icon: '🔬',
            tagline: 'Craftsmanship Revealed',
            bestFor: 'Best for: All pieces — product content',
            desc: 'Extreme macro slowly panning across gemstone facets and metal grain',
            color: '#2a2520',
            motionType: 'slow-pan',
            subjects: [
                'extreme macro slowly panning across {piece} surface, revealing individual stone settings and metal grain texture',
                'camera glides along the edge of {piece}, following the curve of the design, each engraving detail visible',
                'macro pan across {piece} chain links, each connection point visible, light moving across polished surface',
                'slow lateral pan across {piece} gemstone, camera at surface level, facets creating prismatic light show',
                'camera creeps across {piece} hallmark stamp, zooming into the artisanal detail, pulling back to full piece',
            ],
            scene: 'extreme macro lens, slow deliberate camera pan, studio lighting revealing surface detail, individual grain visible',
            compat: { ring: 95, necklace: 65, earrings: 70, bracelet: 70, bangles: 60, anklet: 55, brooch: 85, pendant: 80, 'body-jewelry': 40, watch: 80 },
        },
        {
            id: 'day-to-night',
            name: 'Day to Night',
            icon: '🌓',
            tagline: 'Light Transforms the Piece',
            bestFor: 'Best for: All pieces — versatility campaigns',
            desc: 'Same piece transitioning from daylight to nighttime — lighting transforms the mood',
            color: '#15152a',
            motionType: 'morph-transition',
            subjects: [
                '{piece} on model in natural daylight, smooth transition to same pose under city nightlights, jewelry reflecting both moods',
                'split-screen morphing: {piece} in morning sunlight crossfades to same piece under golden candlelight at dinner',
                '{piece} catching office window light, match-cut transition to same piece catching cocktail bar neon, day to night',
                'time-lapse of {piece} on a surface as natural light shifts from morning to golden hour to blue hour to moonlight',
                'model wearing {piece} walks from sunlit park into moody evening street, continuous tracking shot through time change',
            ],
            scene: 'day-to-night transition, same piece in contrasting light conditions, smooth morph or match-cut, versatility narrative',
            compat: { ring: 85, necklace: 90, earrings: 85, bracelet: 85, bangles: 80, anklet: 60, brooch: 70, pendant: 85, 'body-jewelry': 55, watch: 80 },
        },
        {
            id: 'multi-piece-stack',
            name: 'Multi-Piece Stack',
            icon: '💎',
            tagline: 'Layer by Layer',
            bestFor: 'Best for: Rings, Bracelets, Bangles — stacking collections',
            desc: 'Pieces stacked and layered one by one — building the look',
            color: '#1a1510',
            motionType: 'stop-motion',
            subjects: [
                'pieces of {piece} collection added one by one to wrist, each catching light as placed, building the stack',
                'overhead of hand on dark surface, {piece} rings added finger by finger in sequence, growing luxury',
                'stop-motion style: {piece} bangles appearing one after another on wrist, clicking together, satisfying ASMR',
                'slow motion hands layering multiple {piece} necklaces from choker to pendant length, cascading chains',
                'time-lapse of bare hand transforming to fully adorned with {piece} collection, fast then slow on final piece',
            ],
            scene: 'sequential piece addition, building luxury, satisfying stacking rhythm, close-up focus, ASMR-quality sound design',
            compat: { ring: 98, necklace: 70, earrings: 65, bracelet: 98, bangles: 98, anklet: 55, brooch: 40, pendant: 55, 'body-jewelry': 40, watch: 80 },
        },
        {
            id: 'spinning-hero',
            name: 'Spinning Hero',
            icon: '🌀',
            tagline: 'Product in Rotation',
            bestFor: 'Best for: All pieces — product pages, ads',
            desc: 'Classic product spin on turntable or floating — clean and premium',
            color: '#2a2010',
            motionType: 'rotation',
            subjects: [
                '{piece} on invisible pedestal rotating smoothly against warm gradient backdrop, studio light creating moving highlights',
                '{piece} levitating and spinning slowly against pure black, single light source creating dramatic moving shadow',
                '{piece} on mirrored turntable, reflection spinning in sync, clean product photography in motion',
                '{piece} rotating at 45 degree angle, warm amber to dark gradient, particles of light floating around it',
                '{piece} spinning with subtle bounce motion, gradient background shifting colors subtly during rotation',
            ],
            scene: 'product rotation/spin, floating or turntable, clean gradient backdrop, studio product lighting, hero shot in motion',
            compat: { ring: 95, necklace: 85, earrings: 80, bracelet: 90, bangles: 85, anklet: 75, brooch: 85, pendant: 95, 'body-jewelry': 50, watch: 80 },
        },
        {
            id: 'lifestyle-vignette',
            name: 'Lifestyle Vignette',
            icon: '☕',
            tagline: 'A Day with Jewelry',
            bestFor: 'Best for: Rings, Bracelets, Necklaces — aspirational social',
            desc: 'Quick montage of lifestyle moments — coffee, car, reading — all featuring the jewelry',
            color: '#252018',
            motionType: 'multi-shot',
            subjects: [
                'montage: hand with {piece} holding coffee cup, cut to same hand turning car key, cut to typing on keyboard, cut to cocktail toast',
                'vignette sequence: {piece} catching morning light at breakfast, midday at desk, golden hour walk, candlelit dinner',
                'day-in-the-life: {piece} visible as model gets ready, commutes, works, meets friends, arrives home',
                'quick cuts: {piece} on hand turning book pages, gripping phone, touching face, resting on table — everyday moments',
                'lifestyle montage: {piece} at gym mirror, coffee shop, flower market, restaurant — urban luxury life',
            ],
            scene: 'multi-shot lifestyle montage, quick cuts between moments, consistent jewelry visibility, aspirational everyday luxury',
            compat: { ring: 95, necklace: 85, earrings: 80, bracelet: 95, bangles: 85, anklet: 50, brooch: 40, pendant: 75, 'body-jewelry': 35, watch: 95 },
        },
        {
            id: 'souk-walkthrough',
            name: 'Souk Walkthrough',
            icon: '🏪',
            tagline: 'Through the Market',
            bestFor: 'Best for: All pieces — brand story, cultural identity',
            desc: 'Walking through Moroccan souk, jewelry visible as subject navigates colorful alleyways',
            color: '#2a2510',
            motionType: 'steadicam',
            subjects: [
                'steadicam following model through narrow souk alleyway, {piece} catching light from hanging lanterns, spice colors all around',
                'tracking shot of model hand with {piece} running along market fabric display, textiles flowing past, vibrant colors',
                'model walking through Moroccan souk, camera leading her, {piece} at neckline catching dappled market light',
                'POV steadicam walking through spice market, hand with {piece} reaching to touch saffron, cumin pyramids in periphery',
                'following shot of model from behind walking through brass market stalls, {piece} visible as she turns to browse',
            ],
            scene: 'Moroccan souk/market, steadicam follow, vibrant colors (spices, textiles, brass), dappled light through canopies, cultural immersion',
            compat: { ring: 85, necklace: 90, earrings: 80, bracelet: 85, bangles: 90, anklet: 75, brooch: 70, pendant: 85, 'body-jewelry': 60, watch: 80 },
        },
        {
            id: 'crafting-process',
            name: 'Crafting Process',
            icon: '🔨',
            tagline: 'From Silver to Art',
            bestFor: 'Best for: All pieces — brand story, behind-the-scenes',
            desc: 'Raw silver to finished piece — artisan hands working, time-lapse and macro',
            color: '#2a1f15',
            motionType: 'time-lapse',
            subjects: [
                'time-lapse: raw silver sheet being cut, hammered, shaped into {piece}, sparks and metal filings, workshop light',
                'macro of artisan hands polishing {piece} with cloth, camera slowly orbiting the workbench, warm tungsten light',
                'craftsman pouring molten silver into mold, camera pulls back to reveal finished {piece} — origin to product',
                'hands using jeweler tools on {piece}, extreme close-up of stone setting process, pliers gripping metal precisely',
                'split-screen: artisan working on {piece} in left half, finished piece rotating on gradient in right half',
            ],
            scene: 'artisan workshop, macro and time-lapse, warm tungsten lighting, raw materials to finished product, craft storytelling',
            compat: { ring: 90, necklace: 85, earrings: 80, bracelet: 90, bangles: 95, anklet: 70, brooch: 85, pendant: 85, 'body-jewelry': 55, watch: 80 },
        },
        {
            id: 'reel-hook',
            name: 'Reel Hook',
            icon: '🎣',
            tagline: 'Stop the Scroll',
            bestFor: 'Best for: All pieces — first 3 seconds',
            desc: 'Fast 3-second hook with dramatic visual, then slow reveal — optimized for stopping the scroll',
            color: '#2a0a0a',
            motionType: 'quick-cut',
            subjects: [
                'HOOK: extreme close-up flash of {piece} catching blinding light — 1 second. THEN: slow dolly back revealing full editorial setup',
                'HOOK: {piece} dropped into frame in slow motion — catches light mid-fall. THEN: smooth landing on velvet, camera orbits slowly',
                'HOOK: whip-pan to model face, {piece} earring fills frame — 1 second. THEN: camera pulls back to full editorial portrait',
                'HOOK: black screen, single spotlight hits {piece} — dramatic reveal. THEN: camera slowly orbits revealing craftsmanship detail',
                'HOOK: hand slams down on table with {piece} ring — impact cut. THEN: smooth close-up of piece, gentle turn to show all angles',
            ],
            scene: 'attention-grabbing first second, dramatic light or movement hook, then slow deliberate reveal, designed for social scroll-stopping',
            compat: { ring: 90, necklace: 90, earrings: 85, bracelet: 90, bangles: 85, anklet: 70, brooch: 80, pendant: 90, 'body-jewelry': 60, watch: 80 },
        },
        {
            id: 'parallax-layers',
            name: 'Parallax Layers',
            icon: '🎭',
            tagline: 'Depth in Motion',
            bestFor: 'Best for: Necklaces, Earrings, Pendants — cinematic ads',
            desc: 'Foreground jewelry, mid-ground model, background environment — layered depth',
            color: '#1a1520',
            motionType: 'parallax',
            subjects: [
                '{piece} in sharp foreground, model in soft middle ground, architecture blurring in background — all three layers moving at different speeds',
                'parallax slide: flowers in soft foreground, {piece} on model in sharp middle, city skyline drifting in background',
                'camera dollies laterally: {piece} on stand in foreground shifts fast, model behind shifts slowly, backdrop barely moves',
                'vertical parallax: {piece} drops through frame in foreground, model static in middle, clouds drifting above',
                'depth layers: sheer fabric in blurred foreground, {piece} on skin in perfect focus, window light in soft background',
            ],
            scene: 'parallax depth layers, foreground-midground-background separation, lateral or vertical camera movement, cinematic depth',
            compat: { ring: 65, necklace: 90, earrings: 85, bracelet: 60, bangles: 55, anklet: 35, brooch: 50, pendant: 85, 'body-jewelry': 55, watch: 80 },
        },
        {
            id: 'catch-the-light',
            name: 'Catch the Light',
            icon: '✨',
            tagline: 'The Sparkle Moment',
            bestFor: 'Best for: Rings, Earrings, Pendants — viral sparkle content',
            desc: 'Model tilts hand or head to catch light on jewelry, creating a slow-motion sparkle explosion',
            color: '#2a2520',
            motionType: 'slow-mo-track',
            subjects: [
                'model slowly tilting hand, {piece} ring catches single light source, creating a starburst sparkle in slow motion',
                'model turning head, {piece} earring catches light beam, explosive sparkle radiating outward in ultra slow motion',
                '{piece} pendant swinging gently, each swing catching light at the apex, creating rhythmic sparkle bursts',
                'hand rotating slowly under spotlight, {piece} creating moving light reflections across surrounding surfaces',
                'model moving through shaft of light, {piece} erupting in prismatic sparkle as it enters the beam',
            ],
            scene: 'slow motion sparkle capture, single directional light source, explosive light reflection moment, viral-worthy visual',
            compat: { ring: 95, necklace: 75, earrings: 90, bracelet: 80, bangles: 75, anklet: 50, brooch: 70, pendant: 90, 'body-jewelry': 40, watch: 80 },
        },
    ],

    // ── Image Archetypes (adapted for video) ──────────────────────
    _getImageArchetypes() {
        if (!window.PromptStudio || !window.PromptStudio.archetypes) return [];
        return window.PromptStudio.archetypes.map(arch => ({
            ...arch,
            _fromImage: true,
            motionType: this._getMotionHintForArchetype(arch.id),
        }));
    },

    _getMotionHintForArchetype(archId) {
        const hints = {
            'body-intimate': 'slow-dolly', 'object-pairing': 'slow-pan', 'editorial-model': 'tracking',
            'surreal-animal': 'static-zoom', 'gradient-product': 'orbit', 'bw-dramatic': 'slow-dolly',
            'shadow-play': 'time-lapse', 'bold-typography': 'pan', 'collection-showcase': 'tracking',
            'macro-detail': 'slow-pan', 'wet-element': 'slow-mo', 'architectural-context': 'steadicam',
            'flat-lay': 'overhead-pan', 'motion-blur': 'tracking', 'cinematic-portrait': 'dolly',
            'mirror-reflection': 'orbit', 'texture-contrast': 'slow-pan', 'celestial-mythic': 'crane',
            'seasonal-holiday': 'dolly', 'lifestyle-moment': 'tracking', 'nature-botanical': 'slow-pan',
            'heritage-moroccan': 'steadicam', 'minimalist-space': 'static-zoom', 'desert-mirage': 'crane',
            'neon-cyberpunk': 'tracking', 'vintage-nostalgia': 'handheld', 'zero-gravity': 'orbit',
            'surface-lean': 'slow-dolly', 'hair-drama': 'slow-mo', 'masculine-editorial': 'tracking',
            'royal-opulence': 'crane', 'raw-field-editorial': 'handheld', 'veiled-mystery': 'slow-dolly',
            'avant-garde-couture': 'dolly', 'cinematic-color-story': 'tracking', 'surreal-scale': 'crane',
            'ghost-double-exposure': 'static', 'outdoor-masculine': 'tracking', 'harsh-sun-beauty': 'handheld',
            'product-page-clean': 'orbit', 'textured-prop': 'slow-pan', 'mouth-lips-editorial': 'slow-dolly',
            'dark-moody-editorial': 'slow-dolly',
        };
        return hints[archId] || 'tracking';
    },

    // ── Video-Specific Modifiers ──────────────────────
    cameraMovements: [
        { id: 'auto',        label: '🎲 Auto' },
        { id: 'orbit',       label: '🔄 Orbit' },
        { id: 'dolly-in',    label: '⬆️ Dolly In' },
        { id: 'dolly-out',   label: '⬇️ Dolly Out' },
        { id: 'pan-left',    label: '⬅️ Pan Left' },
        { id: 'pan-right',   label: '➡️ Pan Right' },
        { id: 'zoom-in',     label: '🔎 Zoom In' },
        { id: 'tracking',    label: '🎯 Tracking' },
        { id: 'crane-up',    label: '🏗️ Crane Up' },
        { id: 'crane-down',  label: '🏗️ Crane Down' },
        { id: 'steadicam',   label: '📹 Steadicam' },
        { id: 'static',      label: '🔒 Static' },
        { id: 'handheld',    label: '✊ Handheld' },
        { id: 'whip-pan',    label: '💨 Whip Pan' },
        { id: 'tilt-up',     label: '⏫ Tilt Up' },
        { id: 'tilt-down',   label: '⏬ Tilt Down' },
    ],

    durations: [
        { id: '5s',  label: '5s Micro' },
        { id: '10s', label: '10s Short' },
        { id: '15s', label: '15s Reel' },
        { id: '30s', label: '30s Reel' },
        { id: '60s', label: '60s Long' },
    ],

    speeds: [
        { id: 'slow-mo-025',  label: '🐌 0.25x' },
        { id: 'slow-mo-05',   label: '🐢 0.5x' },
        { id: 'real-time',    label: '▶️ 1x' },
        { id: 'slight-fast',  label: '⏩ 1.5x' },
        { id: 'time-lapse',   label: '⏭️ Time-Lapse' },
        { id: 'speed-ramp',   label: '🎢 Speed Ramp' },
    ],

    transitions: [
        { id: 'none',        label: 'None' },
        { id: 'fade',        label: 'Fade' },
        { id: 'hard-cut',    label: 'Hard Cut' },
        { id: 'morph',       label: 'Morph' },
        { id: 'match-cut',   label: 'Match Cut' },
        { id: 'whip',        label: 'Whip' },
        { id: 'zoom',        label: 'Zoom' },
        { id: 'light-leak',  label: 'Light Leak' },
    ],

    audioMoods: [
        { id: 'auto',             label: '🎲 Auto' },
        { id: 'ambient-silence',  label: '🤫 Silence' },
        { id: 'soft-piano',       label: '🎹 Piano' },
        { id: 'electronic',       label: '🎧 Electronic' },
        { id: 'cinematic',        label: '🎻 Cinematic' },
        { id: 'lofi',             label: '☕ Lo-Fi' },
        { id: 'percussive',       label: '🥁 Percussive' },
        { id: 'asmr',             label: '🎤 ASMR' },
        { id: 'trending',         label: '📈 Trending' },
        { id: 'moroccan',         label: '🇲🇦 Moroccan' },
    ],

    lightingMoods: [
        { id: 'editorial',      label: 'Editorial & Sharp' },
        { id: 'dramatic',       label: 'Dramatic Shadows' },
        { id: 'golden-hour',    label: 'Golden Hour' },
        { id: 'studio',         label: 'Studio Lighting' },
        { id: 'natural',        label: 'Natural Daylight' },
        { id: 'soft',           label: 'Soft & Romantic' },
        { id: 'warm',           label: 'Warm & Inviting' },
        { id: 'cool',           label: 'Cool & Modern' },
        { id: 'backlit',        label: 'Backlit / Rim Light' },
        { id: 'neon-glow',      label: 'Neon Glow' },
        { id: 'candlelight',    label: 'Candlelight Warm' },
        { id: 'blue-hour',      label: 'Blue Hour' },
    ],

    formats: [
        { id: 'reel',      label: '9:16 Reel', ratio: '9:16' },
        { id: 'landscape', label: '16:9 Wide', ratio: '16:9' },
        { id: 'square',    label: '1:1 Post', ratio: '1:1' },
        { id: 'portrait',  label: '4:5 Portrait', ratio: '4:5' },
    ],

    palettes: [
        { id: 'auto',         label: '🎲 AI Chooses' },
        { id: 'neutral',      label: 'Neutral / Beige' },
        { id: 'warm-earth',   label: 'Warm Earth' },
        { id: 'cool-steel',   label: 'Cool Steel' },
        { id: 'monochrome',   label: 'Monochrome' },
        { id: 'jewel-tones',  label: 'Jewel Tones' },
        { id: 'deep-ocean',   label: 'Deep Ocean' },
        { id: 'blush-rose',   label: 'Blush Rose' },
        { id: 'noir',         label: 'Noir' },
    ],

    // ── Reel Templates ──────────────────────
    reelTemplates: [
        {
            id: 'product-launch-3',
            name: '3-Shot Product Launch',
            icon: '🚀',
            shots: [
                { archetype: 'reel-hook', camera: 'auto', duration: '5s', speed: 'slow-mo-025' },
                { archetype: 'jewelry-orbit', camera: 'orbit', duration: '5s', speed: 'real-time' },
                { archetype: 'slow-reveal', camera: 'dolly-out', duration: '5s', speed: 'real-time' },
            ]
        },
        {
            id: 'fashion-film-5',
            name: '5-Shot Fashion Film',
            icon: '🎬',
            shots: [
                { archetype: 'reel-hook', camera: 'whip-pan', duration: '3s', speed: 'speed-ramp' },
                { archetype: 'walk-and-shine', camera: 'tracking', duration: '5s', speed: 'real-time' },
                { archetype: 'catch-the-light', camera: 'auto', duration: '5s', speed: 'slow-mo-05' },
                { archetype: 'detail-macro-pan', camera: 'auto', duration: '5s', speed: 'real-time' },
                { archetype: 'mirror-vanity', camera: 'dolly-out', duration: '5s', speed: 'real-time' },
            ]
        },
        {
            id: 'hook-detail-cta',
            name: 'Hook > Detail > CTA',
            icon: '🎣',
            shots: [
                { archetype: 'reel-hook', camera: 'auto', duration: '3s', speed: 'speed-ramp' },
                { archetype: 'detail-macro-pan', camera: 'auto', duration: '7s', speed: 'slow-mo-05' },
                { archetype: 'spinning-hero', camera: 'orbit', duration: '5s', speed: 'real-time' },
            ]
        },
        {
            id: 'lifestyle-day',
            name: 'Day in the Life',
            icon: '☕',
            shots: [
                { archetype: 'unboxing-moment', camera: 'static', duration: '5s', speed: 'real-time' },
                { archetype: 'mirror-vanity', camera: 'dolly-out', duration: '5s', speed: 'real-time' },
                { archetype: 'street-strut', camera: 'tracking', duration: '5s', speed: 'real-time' },
                { archetype: 'catch-the-light', camera: 'auto', duration: '5s', speed: 'slow-mo-05' },
            ]
        },
    ],

    // ── State ──────────────────────
    state: {
        product: 'silver',     // 'silver' | 'watch'
        pieceDesc: '',
        category: 'ring',
        material: 'sterling-silver',
        stone: 'diamond',
        selectedArchetypes: [],
        cameraMovement: 'auto',
        duration: '15s',
        speed: 'real-time',
        selectedTransitions: ['none'],
        audioMood: 'auto',
        lightingMood: 'editorial',
        format: 'reel',
        palette: 'auto',
        modelGender: 'female',
        history: [],
        sequenceMode: false,
        sequenceShots: [],
    },

    _subjectPools: {},

    // ── Init ──────────────────────
    init(container) {
        this.container = container;
        this._sortMode = 'recommended';
        this._archetypeView = 'video';
        this._render();
        this._renderArchetypeGrid();
        this._bind();
    },

    // ── Get all archetypes based on view ──────────────────────
    _getActiveArchetypes() {
        const video = this.videoArchetypes;
        const image = this._getImageArchetypes();
        switch (this._archetypeView) {
            case 'video': return video;
            case 'image': return image;
            case 'all':   return [...video, ...image];
            default:      return video;
        }
    },

    // ── Compute score ──────────────────────
    _computeScore(archetype, state) {
        const cat = state.category || 'ring';
        let score = (archetype.compat && archetype.compat[cat]) || 50;

        const HUMAN_VIDEO = new Set([
            'walk-and-shine', 'golden-hour-pass', 'mirror-vanity', 'fabric-flow',
            'street-strut', 'souk-walkthrough', 'lifestyle-vignette', 'parallax-layers',
        ]);
        const HUMAN_IMAGE = new Set([
            'body-intimate', 'editorial-model', 'collection-showcase', 'bw-dramatic',
            'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
            'celestial-mythic', 'architectural-context', 'masculine-editorial',
            'surface-lean', 'hair-drama', 'wet-element',
            'raw-field-editorial', 'veiled-mystery', 'avant-garde-couture',
            'cinematic-color-story', 'ghost-double-exposure', 'outdoor-masculine',
            'harsh-sun-beauty', 'mouth-lips-editorial', 'dark-moody-editorial',
        ]);
        const isHuman = HUMAN_VIDEO.has(archetype.id) || HUMAN_IMAGE.has(archetype.id);

        if (state.modelGender === 'none') {
            if (isHuman) score -= 28;
            else score += 18;
        }

        return Math.max(0, Math.min(100, score));
    },

    // ── Render Archetype Grid ──────────────────────
    _renderArchetypeGrid() {
        const grid = this.container.querySelector('#ms-archetypes');
        if (!grid) return;

        const archetypes = this._getActiveArchetypes();
        let sorted = [...archetypes];

        if (this._sortMode === 'recommended') {
            sorted.sort((a, b) => this._computeScore(b, this.state) - this._computeScore(a, this.state));
        } else {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        }

        grid.innerHTML = sorted.map((arch, i) => {
            const score = this._computeScore(arch, this.state);
            const isSelected = this.state.selectedArchetypes.includes(arch.id);
            const badge = this._sortMode === 'recommended'
                ? (i === 0 ? '<span class="ms-rank-badge ms-rank-1">🥇</span>' : i === 1 ? '<span class="ms-rank-badge ms-rank-2">🥈</span>' : i === 2 ? '<span class="ms-rank-badge ms-rank-3">🥉</span>' : '')
                : '';
            const typeBadge = arch._fromImage
                ? '<span class="ms-type-badge ms-type-image" title="Adapted from Image Archetype">IMG</span>'
                : '<span class="ms-type-badge ms-type-video" title="Video-Native Archetype">VID</span>';

            return `
                <div class="ms-archetype-card ${isSelected ? 'selected' : ''}" data-id="${arch.id}">
                    ${badge}
                    <div class="ms-arch-icon-box">
                        <span class="ms-arch-icon">${arch.icon}</span>
                        ${typeBadge}
                    </div>
                    <div class="ms-arch-info">
                        <div class="ms-arch-name">${arch.name}</div>
                        <div class="ms-arch-tagline">${arch.tagline}</div>
                        <div class="ms-arch-best">${arch.bestFor}</div>
                    </div>
                    <div class="ms-arch-score-col">
                        <span class="ms-score-num">${score}</span>
                    </div>
                </div>
            `;
        }).join('');

        const countEl = this.container.querySelector('#ms-arch-count');
        if (countEl) countEl.textContent = `${this.state.selectedArchetypes.length} selected`;
    },

    // ── Main Render ──────────────────────
    _render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Motion Studio</h1>
                <p class="page-subtitle">Generate AI video prompts — paste into Runway, Kling, Pika, Sora, or any video AI tool</p>
            </div>

            <div class="ms-layout">
                <!-- LEFT: Piece Description + Video Modifiers -->
                <div class="ms-left">
                    <div class="card">
                        <div class="card-header"><span class="card-title">Describe Your Piece</span></div>
                        <div class="form-group">
                            <label class="form-label">Product</label>
                            <select class="form-select" id="ms-product">
                                <option value="silver" ${this.state.product === 'silver' ? 'selected' : ''}>Silver</option>
                                <option value="watch" ${this.state.product === 'watch' ? 'selected' : ''}>Watch</option>
                            </select>
                        </div>
                        <div class="form-group" id="ms-category-group" style="${this.state.product === 'watch' ? 'display:none' : ''}">
                            <label class="form-label">Category</label>
                            <select class="form-select" id="ms-category">
                                ${this.categories.map(c => `<option value="${c}" ${c === this.state.category ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" id="ms-material-group" style="${this.state.product === 'watch' ? 'display:none' : ''}">
                            <label class="form-label">Material</label>
                            <select class="form-select" id="ms-material">
                                ${this.materials.map(m => `<option value="${m.id}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Stones</label>
                            <select class="form-select" id="ms-stone">
                                ${this.stones.map(s => `<option value="${s.id}" ${s.id === this.state.stone ? 'selected' : ''}>${s.label}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Piece Description <span class="text-sm text-muted">(optional)</span></label>
                            <input type="text" class="form-input" id="ms-piece-desc" value="${this.state.pieceDesc}" placeholder="e.g. Amazigh geometric pattern with emerald accent">
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Model</span></div>
                        <div class="form-group">
                            <label class="form-label">Model Gender</label>
                            <div id="ms-gender-select" class="ms-chip-group" style="margin-bottom:0">
                                <button class="ms-chip ${this.state.modelGender === 'female' ? 'active' : ''}" data-val="female">&#9792; Female</button>
                                <button class="ms-chip ${this.state.modelGender === 'male' ? 'active' : ''}" data-val="male">&#9794; Male</button>
                                <button class="ms-chip ${this.state.modelGender === 'none' ? 'active' : ''}" data-val="none" title="Product / surreal shots">&#8854; No Model</button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">&#127909; Video Modifiers</span></div>

                        <div class="form-group">
                            <label class="form-label">&#128249; Camera Movement</label>
                            <div class="ms-chip-group" id="ms-camera-movement" style="flex-wrap:wrap">
                                ${this.cameraMovements.map(c => `<button class="ms-chip ${c.id === this.state.cameraMovement ? 'active' : ''}" data-val="${c.id}">${c.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#9201; Duration</label>
                            <div class="ms-chip-group" id="ms-duration">
                                ${this.durations.map(d => `<button class="ms-chip ${d.id === this.state.duration ? 'active' : ''}" data-val="${d.id}">${d.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#127950; Speed</label>
                            <div class="ms-chip-group" id="ms-speed" style="flex-wrap:wrap">
                                ${this.speeds.map(s => `<button class="ms-chip ${s.id === this.state.speed ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#128256; Transitions</label>
                            <div class="ms-chip-group" id="ms-transitions" style="flex-wrap:wrap">
                                ${this.transitions.map(t => `<button class="ms-chip ${this.state.selectedTransitions.includes(t.id) ? 'active' : ''}" data-val="${t.id}">${t.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#127925; Audio / Mood</label>
                            <div class="ms-chip-group" id="ms-audio-mood" style="flex-wrap:wrap">
                                ${this.audioMoods.map(a => `<button class="ms-chip ${a.id === this.state.audioMood ? 'active' : ''}" data-val="${a.id}">${a.label}</button>`).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Scene Settings</span></div>

                        <div class="form-group">
                            <label class="form-label">&#128161; Lighting & Mood</label>
                            <div class="ms-chip-group" id="ms-lighting-mood" style="flex-wrap:wrap">
                                ${this.lightingMoods.map(l => `<button class="ms-chip ${l.id === this.state.lightingMood ? 'active' : ''}" data-val="${l.id}">${l.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#128444; Format</label>
                            <div class="ms-chip-group" id="ms-format">
                                ${this.formats.map(f => `<button class="ms-chip ${f.id === this.state.format ? 'active' : ''}" data-val="${f.id}">${f.label}</button>`).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">&#127912; Color Palette</label>
                            <div class="ms-chip-group" id="ms-palette" style="flex-wrap:wrap">
                                ${this.palettes.map(p => `<button class="ms-chip ${p.id === this.state.palette ? 'active' : ''}" data-val="${p.id}">${p.label}</button>`).join('')}
                            </div>
                        </div>
                    </div>

                </div><!-- /ms-left -->


                <!-- CENTER: Archetype Selector + Sequence Builder + Output -->
                <div class="ms-center">

                    <div class="card">
                        <div class="card-header" style="flex-wrap:wrap;gap:8px">
                            <span class="card-title">Select Archetypes</span>
                            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                                <div class="ms-chip-group ms-view-group" id="ms-archetype-view" style="gap:4px">
                                    <button class="ms-chip ${this._archetypeView === 'video' ? 'active' : ''}" data-val="video" style="font-size:11px;padding:4px 10px">&#127909; Video</button>
                                    <button class="ms-chip ${this._archetypeView === 'image' ? 'active' : ''}" data-val="image" style="font-size:11px;padding:4px 10px">&#128248; Image</button>
                                    <button class="ms-chip ${this._archetypeView === 'all' ? 'active' : ''}" data-val="all" style="font-size:11px;padding:4px 10px">All</button>
                                </div>
                                <div class="ms-chip-group ms-sort-group" id="ms-sort-mode" style="gap:4px">
                                    <button class="ms-chip active" data-val="recommended" style="font-size:11px;padding:4px 10px">&#11088; Recommended</button>
                                    <button class="ms-chip" data-val="alpha" style="font-size:11px;padding:4px 10px">A-Z</button>
                                </div>
                                <span class="text-sm text-muted" id="ms-arch-count">0 selected</span>
                            </div>
                        </div>
                        <div class="ms-archetype-grid" id="ms-archetypes"></div>
                    </div>

                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="btn btn-primary btn-lg" id="ms-generate" style="flex:1">
                            &#127909; Generate Video Prompts
                        </button>
                    </div>

                    <!-- Sequence Builder -->
                    <div class="card" style="margin-top:16px">
                        <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
                            <span class="card-title">&#127902; Shot Sequence Builder</span>
                            <label class="wm-toggle-label">
                                <input type="checkbox" id="ms-sequence-toggle" ${this.state.sequenceMode ? 'checked' : ''}>
                                <span class="wm-toggle-switch"></span>
                            </label>
                        </div>
                        <div id="ms-sequence-body" style="${this.state.sequenceMode ? '' : 'display:none'}">
                            <p class="text-sm text-muted" style="line-height:1.4;margin-bottom:12px">Build a multi-shot storyboard. Each shot gets its own archetype and camera settings.</p>

                            <div class="ms-template-bar" style="margin-bottom:12px">
                                <label class="form-label" style="font-size:11px;margin-bottom:6px">Quick Templates</label>
                                <div class="ms-chip-group" id="ms-templates" style="flex-wrap:wrap;gap:6px">
                                    ${this.reelTemplates.map(t => `<button class="ms-chip ms-template-chip" data-id="${t.id}" style="font-size:11px">${t.icon} ${t.name}</button>`).join('')}
                                </div>
                            </div>

                            <div id="ms-shot-list" class="ms-shot-list">
                                ${this._renderShotList()}
                            </div>

                            <button class="btn btn-sm btn-secondary" id="ms-add-shot" style="width:100%;margin-top:8px">+ Add Shot</button>

                            <div style="margin-top:12px">
                                <button class="btn btn-primary btn-lg" id="ms-generate-sequence" style="width:100%">
                                    &#127902; Generate Sequence Prompt
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Output Area -->
                    <div id="ms-output-area" style="display:none">
                        <div class="card" style="margin-top:16px">
                            <div class="card-header">
                                <span class="card-title">Generated Video Prompts</span>
                                <button class="btn btn-sm btn-secondary" id="ms-copy-all">&#128203; Copy All</button>
                            </div>
                            <div id="ms-prompts-list"></div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT: History + Tips -->
                <div class="ms-right">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Prompt History</span>
                            <button class="btn btn-sm btn-secondary" id="ms-clear-history">Clear</button>
                        </div>
                        <div id="ms-history" class="ms-history-list">
                            <p class="text-sm text-muted" style="text-align:center;padding:20px">No video prompts generated yet</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Quick Tips</span></div>
                        <div class="ms-tips">
                            <div class="ms-tip">&#127909; Video-native archetypes are built for motion — start there</div>
                            <div class="ms-tip">&#128248; Image archetypes work too — they get motion hints automatically</div>
                            <div class="ms-tip">&#127902; Use the Sequence Builder for multi-shot reels</div>
                            <div class="ms-tip">&#128203; Copy prompts into Runway, Kling, Pika, or Sora</div>
                            <div class="ms-tip">&#127907; Start with Reel Hook for scroll-stopping openers</div>
                            <div class="ms-tip">&#128260; Re-generate for fresh variations of the same concept</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _renderShotList() {
        if (this.state.sequenceShots.length === 0) {
            return '<p class="text-sm text-muted" style="text-align:center;padding:12px">No shots added yet. Use a template or add shots manually.</p>';
        }

        return this.state.sequenceShots.map((shot, i) => {
            const allArchetypes = [...this.videoArchetypes, ...this._getImageArchetypes()];
            const arch = allArchetypes.find(a => a.id === shot.archetype);
            return `
                <div class="ms-shot-card" data-idx="${i}">
                    <div class="ms-shot-header">
                        <span class="ms-shot-num">${i + 1}</span>
                        <span class="ms-shot-name">${arch ? `${arch.icon} ${arch.name}` : shot.archetype}</span>
                        <div class="ms-shot-actions">
                            <button class="btn btn-sm btn-outline ms-shot-remove" data-idx="${i}" title="Remove shot">&#10005;</button>
                        </div>
                    </div>
                    <div class="ms-shot-details">
                        <select class="form-select ms-shot-arch" data-idx="${i}" style="font-size:11px;padding:4px 8px">
                            <optgroup label="Video Archetypes">
                                ${this.videoArchetypes.map(a => `<option value="${a.id}" ${shot.archetype === a.id ? 'selected' : ''}>${a.icon} ${a.name}</option>`).join('')}
                            </optgroup>
                            <optgroup label="Image Archetypes">
                                ${this._getImageArchetypes().map(a => `<option value="${a.id}" ${shot.archetype === a.id ? 'selected' : ''}>${a.icon} ${a.name}</option>`).join('')}
                            </optgroup>
                        </select>
                        <div class="ms-shot-row">
                            <select class="form-select ms-shot-camera" data-idx="${i}" style="font-size:11px;padding:4px 8px">
                                ${this.cameraMovements.map(c => `<option value="${c.id}" ${shot.camera === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
                            </select>
                            <select class="form-select ms-shot-duration" data-idx="${i}" style="font-size:11px;padding:4px 8px">
                                ${this.durations.map(d => `<option value="${d.id}" ${shot.duration === d.id ? 'selected' : ''}>${d.label}</option>`).join('')}
                            </select>
                            <select class="form-select ms-shot-speed" data-idx="${i}" style="font-size:11px;padding:4px 8px">
                                ${this.speeds.map(s => `<option value="${s.id}" ${shot.speed === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ── Bind Events ──────────────────────
    _bind() {
        const q = sel => this.container.querySelector(sel);
        const qa = sel => this.container.querySelectorAll(sel);

        const bindChipGroup = (selector, stateKey, callback) => {
            const group = q(selector);
            if (!group) return;
            group.addEventListener('click', e => {
                const chip = e.target.closest('.ms-chip');
                if (!chip) return;
                group.querySelectorAll('.ms-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state[stateKey] = chip.dataset.val;
                if (callback) callback(chip.dataset.val);
            });
        };

        // Gender
        bindChipGroup('#ms-gender-select', 'modelGender', () => {
            this._render();
            this._renderArchetypeGrid();
            this._bind();
        });

        // Product selector — toggle Category + Material visibility
        q('#ms-product')?.addEventListener('change', e => {
            this.state.product = e.target.value;
            const isWatch = e.target.value === 'watch';
            const catGroup = q('#ms-category-group');
            const matGroup = q('#ms-material-group');
            if (catGroup) catGroup.style.display = isWatch ? 'none' : '';
            if (matGroup) matGroup.style.display = isWatch ? 'none' : '';
            this._renderArchetypeGrid();
        });
        // Dropdowns
        q('#ms-category')?.addEventListener('change', e => {
            this.state.category = e.target.value;
            this._renderArchetypeGrid();
        });
        q('#ms-material')?.addEventListener('change', e => { this.state.material = e.target.value; });
        q('#ms-stone')?.addEventListener('change', e => { this.state.stone = e.target.value; });
        q('#ms-piece-desc')?.addEventListener('input', e => { this.state.pieceDesc = e.target.value; });

        // Video modifiers
        bindChipGroup('#ms-camera-movement', 'cameraMovement');
        bindChipGroup('#ms-duration', 'duration');
        bindChipGroup('#ms-speed', 'speed');
        bindChipGroup('#ms-audio-mood', 'audioMood');
        bindChipGroup('#ms-lighting-mood', 'lightingMood');
        bindChipGroup('#ms-format', 'format');
        bindChipGroup('#ms-palette', 'palette');

        // Transitions (multi-select)
        const transGroup = q('#ms-transitions');
        if (transGroup) {
            transGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ms-chip');
                if (!chip) return;
                const val = chip.dataset.val;
                if (val === 'none') {
                    this.state.selectedTransitions = ['none'];
                    transGroup.querySelectorAll('.ms-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                } else {
                    this.state.selectedTransitions = this.state.selectedTransitions.filter(t => t !== 'none');
                    if (this.state.selectedTransitions.includes(val)) {
                        this.state.selectedTransitions = this.state.selectedTransitions.filter(t => t !== val);
                        chip.classList.remove('active');
                    } else {
                        this.state.selectedTransitions.push(val);
                        chip.classList.add('active');
                    }
                    transGroup.querySelector('[data-val="none"]')?.classList.remove('active');
                    if (this.state.selectedTransitions.length === 0) {
                        this.state.selectedTransitions = ['none'];
                        transGroup.querySelector('[data-val="none"]')?.classList.add('active');
                    }
                }
            });
        }

        // Sort mode
        const sortGroup = q('#ms-sort-mode');
        if (sortGroup) {
            sortGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ms-chip');
                if (!chip) return;
                sortGroup.querySelectorAll('.ms-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this._sortMode = chip.dataset.val;
                this._renderArchetypeGrid();
            });
        }

        // Archetype view toggle
        const viewGroup = q('#ms-archetype-view');
        if (viewGroup) {
            viewGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ms-chip');
                if (!chip) return;
                viewGroup.querySelectorAll('.ms-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this._archetypeView = chip.dataset.val;
                this._renderArchetypeGrid();
            });
        }

        // Archetype selection
        const grid = q('#ms-archetypes');
        if (grid) {
            grid.addEventListener('click', e => {
                const card = e.target.closest('.ms-archetype-card');
                if (!card) return;
                const id = card.dataset.id;
                if (this.state.selectedArchetypes.includes(id)) {
                    this.state.selectedArchetypes = this.state.selectedArchetypes.filter(a => a !== id);
                    card.classList.remove('selected');
                } else {
                    this.state.selectedArchetypes.push(id);
                    card.classList.add('selected');
                }
                const countEl = q('#ms-arch-count');
                if (countEl) countEl.textContent = `${this.state.selectedArchetypes.length} selected`;
            });
        }

        // Generate button
        q('#ms-generate')?.addEventListener('click', () => this._generate());

        // Copy All
        q('#ms-copy-all')?.addEventListener('click', () => {
            const prompts = qa('.ms-prompt-text');
            const all = Array.from(prompts).map(p => p.textContent).join('\n\n---\n\n');
            navigator.clipboard.writeText(all).then(() => Elaris.toast('All prompts copied!', 'success'));
        });

        // Clear history
        q('#ms-clear-history')?.addEventListener('click', () => {
            this.state.history = [];
            q('#ms-history').innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:20px">No video prompts generated yet</p>';
        });

        // Sequence toggle
        q('#ms-sequence-toggle')?.addEventListener('change', e => {
            this.state.sequenceMode = e.target.checked;
            const body = q('#ms-sequence-body');
            if (body) body.style.display = e.target.checked ? '' : 'none';
        });

        // Add shot
        q('#ms-add-shot')?.addEventListener('click', () => {
            this.state.sequenceShots.push({
                archetype: 'slow-reveal',
                camera: 'auto',
                duration: '5s',
                speed: 'real-time',
            });
            this._refreshShotList();
        });

        // Template buttons
        qa('.ms-template-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const template = this.reelTemplates.find(t => t.id === btn.dataset.id);
                if (!template) return;
                this.state.sequenceShots = template.shots.map(s => ({ ...s }));
                this._refreshShotList();
                Elaris.toast(`Template loaded: ${template.name}`, 'info');
            });
        });

        // Generate sequence
        q('#ms-generate-sequence')?.addEventListener('click', () => this._generateSequence());

        // Shot list interactions
        this._bindShotList();
    },

    _refreshShotList() {
        const list = this.container.querySelector('#ms-shot-list');
        if (list) {
            list.innerHTML = this._renderShotList();
            this._bindShotList();
        }
    },

    _bindShotList() {
        const qa = sel => this.container.querySelectorAll(sel);

        qa('.ms-shot-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.sequenceShots.splice(parseInt(btn.dataset.idx), 1);
                this._refreshShotList();
            });
        });

        qa('.ms-shot-arch').forEach(sel => {
            sel.addEventListener('change', () => {
                this.state.sequenceShots[parseInt(sel.dataset.idx)].archetype = sel.value;
            });
        });

        qa('.ms-shot-camera').forEach(sel => {
            sel.addEventListener('change', () => {
                this.state.sequenceShots[parseInt(sel.dataset.idx)].camera = sel.value;
            });
        });

        qa('.ms-shot-duration').forEach(sel => {
            sel.addEventListener('change', () => {
                this.state.sequenceShots[parseInt(sel.dataset.idx)].duration = sel.value;
            });
        });

        qa('.ms-shot-speed').forEach(sel => {
            sel.addEventListener('change', () => {
                this.state.sequenceShots[parseInt(sel.dataset.idx)].speed = sel.value;
            });
        });
    },

    // ── Build Video Prompt ──────────────────────
    _buildVideoPrompt(archetype) {
        const isWatchProduct = this.state.product === 'watch';
        const material = isWatchProduct ? '' : (this.materials.find(m => m.id === this.state.material)?.label || '925 sterling silver');
        const catWord = isWatchProduct ? 'watch' : (this.state.category || 'ring');
        let rawDesc = this.state.pieceDesc || '';
        const piece = isWatchProduct
            ? (rawDesc ? `luxury watch ${rawDesc}` : 'luxury watch')
            : (rawDesc ? `${material} ${catWord} ${rawDesc}` : `${material} ${catWord}`);

        const subject = this._getUniqueSubject(archetype).replace(/\{piece\}/g, piece);

        // Camera movement
        const camId = this.state.cameraMovement === 'auto' ? (archetype.motionType || 'tracking') : this.state.cameraMovement;
        const cameraMap = {
            'orbit': 'smooth 360 degree orbit around the subject',
            'dolly-in': 'camera dollies in toward the subject',
            'dolly-out': 'camera dollies out from the subject, revealing the full scene',
            'pan-left': 'smooth lateral pan from right to left',
            'pan-right': 'smooth lateral pan from left to right',
            'zoom-in': 'camera zooms in on the jewelry detail',
            'tracking': 'camera tracks alongside the subject in motion',
            'crane-up': 'crane shot rising upward, revealing the scene from above',
            'crane-down': 'crane shot descending from above to eye level',
            'steadicam': 'smooth steadicam following the subject',
            'static': 'camera locked on tripod, no movement',
            'handheld': 'subtle handheld camera movement, organic and authentic',
            'whip-pan': 'fast whip pan transition',
            'tilt-up': 'camera tilts upward from ground to subject',
            'tilt-down': 'camera tilts downward from subject to ground',
            'slow-dolly': 'very slow creeping dolly toward subject',
            'slow-pan': 'slow deliberate lateral pan across the scene',
            'macro-orbit': 'macro lens slowly orbiting the subject at close range',
            'static-zoom': 'static camera with slow zoom',
            'static-dolly': 'gentle static-to-dolly, very subtle movement',
            'morph-transition': 'seamless morph transition between scenes',
            'stop-motion': 'stop-motion style with discrete steps',
            'rotation': 'product rotation on turntable or floating',
            'multi-shot': 'multi-shot montage with quick cuts',
            'overhead-pan': 'overhead camera panning across a flat surface',
            'slow-mo': 'camera with slow motion capture',
            'slow-mo-track': 'tracking shot with slow motion',
            'quick-cut': 'rapid quick-cut editing between angles',
            'parallax': 'parallax movement with depth layer separation',
            'time-lapse': 'time-lapse accelerated movement',
            'dolly': 'smooth dolly movement toward or away from subject',
            'crane': 'crane shot with vertical sweep',
            'pan': 'smooth pan across the scene',
        };
        const cameraDesc = cameraMap[camId] || cameraMap['tracking'];

        // Duration
        const durationMap = { '5s': '5-second', '10s': '10-second', '15s': '15-second', '30s': '30-second', '60s': '60-second' };
        const duration = durationMap[this.state.duration] || '15-second';

        // Speed
        const speedMap = {
            'slow-mo-025': 'ultra slow motion at 0.25x speed, 120fps or higher',
            'slow-mo-05': 'slow motion at 0.5x speed, 60fps',
            'real-time': 'real-time speed',
            'slight-fast': 'slightly accelerated 1.5x speed',
            'time-lapse': 'time-lapse accelerated movement, hours compressed',
            'speed-ramp': 'speed ramp — starts slow, accelerates, then slow again at the peak moment',
        };
        const speed = speedMap[this.state.speed] || 'real-time speed';

        // Transitions
        const transMap = {
            'none': '', 'fade': 'smooth fade transition', 'hard-cut': 'sharp hard cut',
            'morph': 'seamless morph dissolve', 'match-cut': 'match cut linking similar shapes',
            'whip': 'whip transition', 'zoom': 'zoom transition through the center',
            'light-leak': 'light leak transition with warm flare',
        };
        const transDescs = this.state.selectedTransitions
            .filter(t => t !== 'none').map(t => transMap[t]).filter(Boolean);
        const transText = transDescs.length > 0 ? transDescs.join(', ') + '.' : '';

        // Audio
        const audioMap = {
            'auto': '', 'ambient-silence': 'Sound design: ambient silence with subtle room tone.',
            'soft-piano': 'Sound design: soft piano melody, intimate and emotional.',
            'electronic': 'Sound design: minimal electronic beat, modern and clean.',
            'cinematic': 'Sound design: cinematic orchestral swell, epic and emotional.',
            'lofi': 'Sound design: lo-fi chill beat, warm and relaxed.',
            'percussive': 'Sound design: rhythmic percussion, driving and energetic.',
            'asmr': 'Sound design: ASMR foley — metal clicking, fabric rustling, satisfying tactile sounds.',
            'trending': 'Sound design: trending viral audio format.',
            'moroccan': 'Sound design: Moroccan instrumental — oud, bendir drums, andalusian melody.',
        };
        const audioText = audioMap[this.state.audioMood] || '';

        // Lighting
        const lightMap = {
            'editorial': 'editorial studio lighting, sharp and directional',
            'dramatic': 'dramatic shadows, high-contrast chiaroscuro',
            'golden-hour': 'golden hour warm directional sunlight',
            'studio': 'professional studio three-point lighting',
            'natural': 'natural daylight, soft and authentic',
            'soft': 'soft romantic diffused light',
            'warm': 'warm inviting amber tones',
            'cool': 'cool modern steel blue lighting',
            'backlit': 'backlit rim light creating halo effect',
            'neon-glow': 'neon glow with vivid color reflections',
            'candlelight': 'warm candlelight, intimate flickering',
            'blue-hour': 'blue hour twilight, cool ethereal atmosphere',
        };
        const lightDesc = lightMap[this.state.lightingMood] || 'editorial studio lighting';

        // Palette
        const paletteMap = {
            'auto': '', 'neutral': 'neutral beige and cream color palette.',
            'warm-earth': 'warm earthy tones — amber, terracotta, sand.',
            'cool-steel': 'cool steel and slate blue tones.',
            'monochrome': 'strict monochrome palette — black, white, silver.',
            'jewel-tones': 'rich jewel tones — emerald, sapphire, ruby.',
            'deep-ocean': 'deep ocean blues and teals.',
            'blush-rose': 'soft blush pink and dusty rose palette.',
            'noir': 'film noir palette — deep blacks, smoky greys.',
        };
        const paletteDesc = paletteMap[this.state.palette] || '';

        // Format
        const fmt = this.formats.find(f => f.id === this.state.format);
        const ratio = fmt ? fmt.ratio : '9:16';

        // Stone
        const stone = this.stones.find(s => s.id === this.state.stone);
        const stoneDesc = stone && stone.id !== 'none' ? `, set with ${stone.label.toLowerCase()}` : '';

        // Silver descriptor
        const silverDesc = isWatchProduct
            ? 'precision timepiece, polished case and crystal, refined dial detail'
            : (this.state.material === '800-silver'
                ? 'warm oxidized patina, traditional Moroccan silverwork'
                : 'mirror-polished surface, brilliant metallic luster');

        // Assemble
        const parts = [
            `Cinematic ${duration} video clip in ${ratio} format.`,
            `Camera: ${cameraDesc}.`,
            subject + '.',
            archetype.scene || '',
            isWatchProduct ? `${lightDesc}, ${silverDesc}.` : `${lightDesc}, ${silverDesc}${stoneDesc}.`,
            speed !== 'real-time speed' ? `Speed: ${speed}.` : '',
            transText,
            paletteDesc,
            audioText,
            `4K cinematic video, smooth motion, professional color grading, high frame rate, luxury jewelry campaign quality.`,
        ];

        return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    },

    // ── Get unique subject ──────────────────────
    _getUniqueSubject(archetype) {
        if (!archetype.subjects || archetype.subjects.length === 0) return '{piece}';

        if (!this._subjectPools[archetype.id] || this._subjectPools[archetype.id].length === 0) {
            const allIndices = archetype.subjects.map((_, i) => i);
            for (let i = allIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
            }
            this._subjectPools[archetype.id] = [...allIndices];
        }

        const idx = this._subjectPools[archetype.id].pop();
        return archetype.subjects[idx];
    },

    // ── Generate Prompts ──────────────────────
    _generate() {
        const selected = this.state.selectedArchetypes;
        if (selected.length === 0) {
            Elaris.toast('Select at least one archetype', 'error');
            return;
        }

        const allArchetypes = [...this.videoArchetypes, ...this._getImageArchetypes()];
        const prompts = [];

        for (const archId of selected) {
            const arch = allArchetypes.find(a => a.id === archId);
            if (!arch) continue;
            const prompt = this._buildVideoPrompt(arch);
            prompts.push({
                archetype: arch.name, icon: arch.icon, text: prompt,
                archId: arch.id, id: Date.now() + Math.random(),
            });
        }

        const outputArea = this.container.querySelector('#ms-output-area');
        outputArea.style.display = '';
        const list = this.container.querySelector('#ms-prompts-list');

        list.innerHTML = prompts.map((p, i) => `
            <div class="ms-prompt-block" data-idx="${i}" data-arch-id="${p.archId}">
                <div class="ms-prompt-header">
                    <span>${p.icon} ${p.archetype}</span>
                    <div class="ms-prompt-actions">
                        <button class="btn btn-sm btn-outline ms-regen-one" data-idx="${i}" data-arch-id="${p.archId}" title="Regenerate">&#8634; New</button>
                        <button class="btn btn-sm btn-secondary ms-copy-one" data-idx="${i}">&#128203; Copy</button>
                    </div>
                </div>
                <div class="ms-prompt-text" id="ms-prompt-${i}">${p.text}</div>
            </div>
        `).join('');

        list.querySelectorAll('.ms-copy-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                navigator.clipboard.writeText(prompts[idx].text).then(() => Elaris.toast('Prompt copied!', 'success'));
            });
        });

        list.querySelectorAll('.ms-regen-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const archId = btn.dataset.archId;
                const idx = parseInt(btn.dataset.idx, 10);
                const arch = allArchetypes.find(a => a.id === archId);
                if (!arch) return;
                const newText = this._buildVideoPrompt(arch);
                const block = list.querySelector(`[data-idx="${idx}"]`);
                if (block) block.querySelector('.ms-prompt-text').textContent = newText;
                prompts[idx].text = newText;
                Elaris.toast('New video prompt generated!', 'info');
            });
        });

        prompts.forEach(p => {
            this.state.history.unshift({ text: p.text, archetype: p.archetype, icon: p.icon, time: new Date().toLocaleTimeString() });
        });
        if (this.state.history.length > 30) this.state.history = this.state.history.slice(0, 30);
        this._renderHistory();

        Elaris.toast(`${prompts.length} video prompt(s) generated!`, 'success');
    },

    // ── Generate Sequence ──────────────────────
    _generateSequence() {
        if (this.state.sequenceShots.length === 0) {
            Elaris.toast('Add at least one shot to the sequence', 'error');
            return;
        }

        const allArchetypes = [...this.videoArchetypes, ...this._getImageArchetypes()];
        const shotPrompts = [];

        this.state.sequenceShots.forEach((shot, i) => {
            const arch = allArchetypes.find(a => a.id === shot.archetype);
            if (!arch) return;

            const origCamera = this.state.cameraMovement;
            const origDuration = this.state.duration;
            const origSpeed = this.state.speed;
            this.state.cameraMovement = shot.camera;
            this.state.duration = shot.duration;
            this.state.speed = shot.speed;

            const prompt = this._buildVideoPrompt(arch);
            shotPrompts.push({ shotNum: i + 1, archetype: arch.name, icon: arch.icon, text: prompt });

            this.state.cameraMovement = origCamera;
            this.state.duration = origDuration;
            this.state.speed = origSpeed;
        });

        const sequencePrompt = shotPrompts.map(s => `[SHOT ${s.shotNum} - ${s.icon} ${s.archetype}]\n${s.text}`).join('\n\n');

        const outputArea = this.container.querySelector('#ms-output-area');
        outputArea.style.display = '';
        const list = this.container.querySelector('#ms-prompts-list');

        list.innerHTML = `
            <div class="ms-prompt-block">
                <div class="ms-prompt-header">
                    <span>&#127902; Full Sequence (${shotPrompts.length} shots)</span>
                    <div class="ms-prompt-actions">
                        <button class="btn btn-sm btn-secondary" id="ms-copy-sequence">&#128203; Copy Sequence</button>
                    </div>
                </div>
                <div class="ms-prompt-text" style="white-space:pre-wrap">${sequencePrompt}</div>
            </div>
            <div style="margin-top:12px">
                <div class="card-header"><span class="card-title">Individual Shot Prompts</span></div>
                ${shotPrompts.map(s => `
                    <div class="ms-prompt-block" style="margin-top:8px">
                        <div class="ms-prompt-header">
                            <span>Shot ${s.shotNum}: ${s.icon} ${s.archetype}</span>
                            <button class="btn btn-sm btn-secondary ms-copy-shot" data-text="${encodeURIComponent(s.text)}">&#128203; Copy</button>
                        </div>
                        <div class="ms-prompt-text">${s.text}</div>
                    </div>
                `).join('')}
            </div>
        `;

        this.container.querySelector('#ms-copy-sequence')?.addEventListener('click', () => {
            navigator.clipboard.writeText(sequencePrompt).then(() => Elaris.toast('Sequence copied!', 'success'));
        });
        this.container.querySelectorAll('.ms-copy-shot').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(decodeURIComponent(btn.dataset.text)).then(() => Elaris.toast('Shot copied!', 'success'));
            });
        });

        this.state.history.unshift({ text: sequencePrompt, archetype: 'Sequence', icon: '&#127902;', time: new Date().toLocaleTimeString() });
        this._renderHistory();

        Elaris.toast(`Sequence with ${shotPrompts.length} shots generated!`, 'success');
    },

    // ── Render History ──────────────────────
    _renderHistory() {
        const histEl = this.container.querySelector('#ms-history');
        if (!histEl) return;

        if (this.state.history.length === 0) {
            histEl.innerHTML = '<p class="text-sm text-muted" style="text-align:center;padding:20px">No video prompts generated yet</p>';
            return;
        }

        histEl.innerHTML = this.state.history.map((h, i) => `
            <div class="ms-history-item" data-idx="${i}">
                <div class="ms-history-header">
                    <span>${h.icon} ${h.archetype}</span>
                    <span class="text-sm text-muted">${h.time}</span>
                </div>
                <div class="ms-history-text">${h.text.substring(0, 120)}...</div>
                <button class="btn btn-sm btn-outline ms-history-copy" data-idx="${i}">&#128203;</button>
            </div>
        `).join('');

        histEl.querySelectorAll('.ms-history-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                navigator.clipboard.writeText(this.state.history[idx].text).then(() => Elaris.toast('Copied from history!', 'success'));
            });
        });
    },
};

window.MotionStudio = MotionStudio;

window.render_motionstudio = function(container) { MotionStudio.init(container); };
