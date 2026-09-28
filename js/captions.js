/**
 * captions.js — Caption & hashtag engine for @elaris.925.
 *
 * Generates on-brand captions using template formulas (no API needed).
 * Hashtags rotate within Instagram's 5-per-post limit.
 */

const ElarisCaption = {

    HANDLE: '@elaris.925',
    BRAND: 'Elaris',

    // ── Caption Hooks (by voice) ─────────────────────────────────
    hooks: {
        luxury: [
            'Crafted in the heart of Agadir ✦',
            'Where heritage meets the hand of the artisan.',
            'Sterling silver, refined to perfection.',
            'A piece that speaks before you do.',
            'Timeless. Handcrafted. Unmistakably Elaris.',
            'Born from Moroccan silver traditions.',
            'The art of adornment, elevated.',
            'Every curve, intentional. Every detail, deliberate.',
            'From our atelier to your collection.',
            'L\'élégance dans chaque détail. ✦',
        ],
        conversational: [
            'This one\'s been getting all the attention 👀',
            'New drop alert! 🔔',
            'Okay but can we talk about this piece? 😍',
            'Fresh out of the workshop and ready to shine ✨',
            'Your new everyday essential just arrived.',
            'This is the one you\'ve been waiting for.',
            'Not your average silver jewelry.',
            'Swipe to see why everyone\'s asking about this one 👉',
            'POV: you just found your new favorite piece.',
            'Tell me this isn\'t the prettiest thing you\'ve seen today 💫',
        ],
        storytelling: [
            'Every piece begins as a whisper of silver...',
            'In the souks of Agadir, tradition lives in every hammer stroke.',
            'This piece carries the weight of generations.',
            'Some jewelry you wear. This jewelry wears you.',
            'Before it was a ring, it was a dream.',
            'The story of Moroccan silver is written in light.',
            'Handed down through craft, not just time.',
            'There\'s a reason they call it sterling.',
        ],
    },

    // ── Product Descriptions ─────────────────────────────────────
    descriptions: {
        ring: [
            'Meticulously crafted in 925 sterling silver, this ring captures the essence of Moroccan artistry.',
            'A statement piece in pure 925 silver — bold enough to turn heads, refined enough for everyday.',
            'Hand-finished 925 sterling silver with details that reveal themselves over time.',
        ],
        necklace: [
            'Delicately suspended in 925 sterling silver, designed to catch the light and hold the gaze.',
            'This necklace drapes like liquid silver — 925 purity, Moroccan soul.',
            'A chain of intention, forged in 925 sterling silver.',
        ],
        bracelet: [
            'Wrapping the wrist in 925 sterling silver luxury — from Agadir with love.',
            'This bracelet is a quiet declaration of taste. 925 sterling silver, naturally.',
            'Designed to move with you — 925 silver that lives on your skin.',
        ],
        earrings: [
            'Framing the face in 925 sterling silver elegance. Moroccan craft at its finest.',
            'Light catches silver, silver catches eyes. 925 sterling, handcrafted.',
            'Earrings that whisper luxury. 925 sterling silver from our Agadir atelier.',
        ],
        set: [
            'A harmoniously matched 925 sterling silver jewelry set — crafted for unified elegance from neck to fingertips.',
            'The complete collection in pure 925 silver: matching ring, necklace, and earrings handcrafted in Morocco.',
            'Coordinated perfection in 925 sterling silver — every piece in this set complements the next with timeless grace.',
        ],
        'jewelry-set': [
            'A harmoniously matched 925 sterling silver jewelry set — crafted for unified elegance from neck to fingertips.',
            'The complete collection in pure 925 silver: matching ring, necklace, and earrings handcrafted in Morocco.',
            'Coordinated perfection in 925 sterling silver — every piece in this set complements the next with timeless grace.',
        ],
        general: [
            'Handcrafted in 925 sterling silver — where Moroccan heritage meets modern design.',
            'Every detail tells a story of craft. 925 sterling silver, made in Morocco.',
            'Pure 925 silver, shaped by skilled hands in our Agadir workshop.',
        ],
    },

    // ── Call to Actions ──────────────────────────────────────────
    ctas: [
        '🔗 Link in bio to shop',
        '💬 DM us to order',
        '📩 Send us a message to reserve yours',
        '👆 Tap the link in our bio',
        '🛒 Available now — link in bio',
        '✦ Shop the collection → link in bio',
        '📍 Visit us in Agadir or shop online',
        '💌 DM for pricing and availability',
    ],

    // ── Hashtag Sets ─────────────────────────────────────────────
    hashtags: {
        core: [
            '#elaris925', '#elarisjewelry', '#sterlingsilverjewelry',
            '#925silver', '#925sterlingsilver',
        ],
        brand: [
            '#moroccandesign', '#moroccancraft', '#agadirmorocco',
            '#madeInMorocco', '#moroccansilver',
        ],
        category: {
            ring: ['#silverring', '#ringlovers', '#ringjewelry', '#stackingrings', '#statementring'],
            necklace: ['#silvernecklace', '#necklacelovers', '#pendantnecklace', '#layeringnecklace', '#chainnecklace'],
            bracelet: ['#silverbracelet', '#braceletlovers', '#cuffbracelet', '#chainbracelet', '#wristcandy'],
            earrings: ['#silverearrings', '#earringsoftheday', '#hoopearrings', '#studearrings', '#earringlovers'],
            set: ['#jewelryset', '#matchingset', '#silverjewelryset', '#jewelrycollection', '#bridaljewelryset', '#fullset'],
            'jewelry-set': ['#jewelryset', '#matchingset', '#silverjewelryset', '#jewelrycollection', '#bridaljewelryset', '#fullset'],
            general: ['#silverjewelry', '#jewelrydesign', '#handcraftedjewelry', '#artisanjewelry', '#luxuryjewelry'],
        },
        reach: [
            '#jewelryoftheday', '#jewelryinspo', '#accessoriesoftheday',
            '#instajewelry', '#jewelrygram', '#jewelryaddict',
            '#fashionjewelry', '#finejewelry', '#jewelrylovers',
            '#handmadejewelry', '#shopsmall', '#supportsmallbusiness',
            '#dailyjewelry', '#minimalistjewelry', '#modernsilver',
            '#jewelrycollection', '#silverlove', '#sterlingsilver',
            '#fashionaccessories', '#styleinspo',
        ],
    },

    // ── Metals ───────────────────────────────────────────────────
    // The copy above is written for 925 sterling silver; any other metal swaps the
    // metal wording, purity, extra hooks and hashtags (ids match PromptStudio.materials);
    // `adj` replaces "pure" where it would overstate the metal.
    METAL_WORDS: {
        '800-silver':      { phrase: '800 Moroccan silver', adj: 'traditional', purity: '800', word: 'silver', tagWord: 'silver',
                             tags: ['#moroccansilver', '#800silver', '#berbersilver'] },
        'silver-vermeil':  { phrase: 'gold vermeil over 925 sterling silver', adj: 'rich', purity: '925', word: 'gold', tagWord: 'gold',
                             tags: ['#goldvermeil', '#vermeiljewelry', '#925silver'] },
        '18k-yellow-gold': { phrase: '18K yellow gold', adj: 'solid', purity: '750', word: 'gold', tagWord: 'gold',
                             tags: ['#18kgold', '#goldjewelry', '#18kgoldjewelry'],
                             hooks: ['18K gold that only grows more beautiful with time.'] },
        '18k-rose-gold':   { phrase: '18K rose gold', adj: 'solid', purity: '750', word: 'rose gold', tagWord: 'rosegold',
                             tags: ['#rosegold', '#rosegoldjewelry', '#18kgold'],
                             hooks: ['The soft blush of 18K rose gold.'] },
        '18k-white-gold':  { phrase: '18K white gold', adj: 'solid', purity: '750', word: 'white gold', tagWord: 'whitegold',
                             tags: ['#whitegold', '#whitegoldjewelry', '#18kgold'],
                             hooks: ['The quiet brilliance of 18K white gold.'] },
        'red-gold-beldi':  { phrase: '18K beldi red gold', adj: 'solid', purity: '750', word: 'gold', tagWord: 'gold',
                             tags: ['#dhabbeldi', '#moroccangold', '#18kgold'],
                             hooks: ['Beldi gold, the way our grandmothers wore it.', 'The deep glow of traditional Moroccan beldi gold.'] },
    },

    // Swaps silver wording for the chosen metal in one pass (so a replacement is never
    // replaced again), keeping a capital at the start of a sentence.
    _metalize(text, mw) {
        if (!mw) return text;
        return String(text).replace(/pure 925 silver|925 sterling silver|sterling silver|925 silver|925 purity|925 sterling|liquid silver|moroccan silver|\bsilver\b/gi, (m, at, str) => {
            const k = m.toLowerCase();
            // ("pure" only fits silver: 18K gold is 75% gold, vermeil is plated)
            const out = k === 'pure 925 silver' ? (mw.adj || 'pure') + ' ' + mw.phrase
                : k === '925 purity' ? mw.purity + ' purity'
                : k === 'liquid silver' ? 'liquid ' + mw.word
                : k === 'moroccan silver' ? 'Moroccan ' + mw.word
                : k === 'silver' ? mw.word
                : mw.phrase;
            const startsSentence = at === 0 || /[.!?]\s*$/.test(str.slice(0, at));
            return startsSentence || /[A-Z]/.test(m[0]) ? out.charAt(0).toUpperCase() + out.slice(1) : out;
        });
    },

    // ── Generate Caption ─────────────────────────────────────────
    generate(opts = {}) {
        const voice = opts.voice || 'luxury';
        const category = opts.category || 'general';
        const productName = opts.productName || '';
        const mw = this.METAL_WORDS[opts.metal] || null;

        let hooks = this.hooks[voice] || this.hooks.luxury;
        if (mw) hooks = [...hooks.filter(h => !/call it sterling/i.test(h)), ...(voice !== 'conversational' && mw.hooks ? mw.hooks : [])];
        const hook = this._metalize(this._random(hooks), mw);
        const desc = this._metalize(this._random(this.descriptions[category] || this.descriptions.general), mw);
        const cta = this._random(this.ctas);

        let caption = hook + '\n\n';
        if (productName) {
            caption += `${productName}\n\n`;
        }
        caption += desc + '\n\n';
        caption += cta;

        return caption;
    },

    // ── Generate Hashtags ────────────────────────────────────────
    // Instagram allows at most 5 hashtags per post (since December 2025), and a few
    // specific tags outperform generic ones: brand + material + 2 product + 1 origin.
    // (The `reach` pool above is no longer used for posts.)
    MAX_HASHTAGS: 5,

    generateHashtags(opts = {}) {
        const category = opts.category || 'general';
        const maxCount = Math.min(opts.maxCount || this.MAX_HASHTAGS, this.MAX_HASHTAGS);
        const mw = this.METAL_WORDS[opts.metal] || null;
        const swap = t => (mw ? t.replace(/silver/g, mw.tagWord) : t);        // #silverring → #goldring
        const catTags = (this.hashtags.category[category] || this.hashtags.category.general).map(swap);

        const tags = [
            this.hashtags.core[0],                                            // #elaris925 (the brand)
            ...this._sample(mw ? mw.tags : this.hashtags.core.slice(2), 1),   // material
            ...this._sample(catTags, 2),                                      // product
            ...this._sample(this.hashtags.brand.map(swap), 1),                // Moroccan origin / craft
        ];

        // Deduplicate
        return [...new Set(tags)].slice(0, maxCount);
    },

    // ── Format Full Post (caption + hashtags) ────────────────────
    formatPost(caption, hashtags) {
        const spacer = '\n.\n.\n.\n';
        return caption + spacer + hashtags.join(' ');
    },

    // ── Story Text Suggestions ───────────────────────────────────
    storyText(opts = {}) {
        const headlines = [
            'NEW DROP', 'JUST ARRIVED', 'FRESH', 'AVAILABLE NOW',
            'HANDCRAFTED', 'LIMITED', 'EXCLUSIVE', 'COLLECTION',
        ];
        const mw = this.METAL_WORDS[opts.metal] || null;
        const subtexts = [
            mw ? mw.phrase.replace(/\b\w/g, c => c.toUpperCase()) : '925 Sterling Silver', 'Handcrafted in Morocco', 'Made in Agadir',
            'Shop the Collection', 'Link in Bio', 'DM to Order',
        ];
        return {
            headline: opts.headline || this._random(headlines),
            subtext: opts.subtext || this._random(subtexts),
            cta: opts.cta || 'Swipe Up ↑',
        };
    },

    // ── Utilities ────────────────────────────────────────────────
    _random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    _sample(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    },
};

window.ElarisCaption = ElarisCaption;
