/**
 * captions.js — Caption & hashtag engine for @elaris.925.
 *
 * Generates on-brand captions using template formulas (no API needed).
 * Includes hashtag strategy with rotation to avoid shadow-banning.
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

    // ── Generate Caption ─────────────────────────────────────────
    generate(opts = {}) {
        const voice = opts.voice || 'luxury';
        const category = opts.category || 'general';
        const productName = opts.productName || '';

        const hook = this._random(this.hooks[voice] || this.hooks.luxury);
        const desc = this._random(this.descriptions[category] || this.descriptions.general);
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
    generateHashtags(opts = {}) {
        const category = opts.category || 'general';
        const maxCount = opts.maxCount || 25;

        let tags = [];

        // Core (always)
        tags.push(...this.hashtags.core);

        // Brand (pick 3)
        tags.push(...this._sample(this.hashtags.brand, 3));

        // Category (pick 4)
        const catTags = this.hashtags.category[category] || this.hashtags.category.general;
        tags.push(...this._sample(catTags, 4));

        // Reach (fill remaining)
        const remaining = maxCount - tags.length;
        if (remaining > 0) {
            const pool = this.hashtags.reach.filter(t => !tags.includes(t));
            tags.push(...this._sample(pool, Math.min(remaining, pool.length)));
        }

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
        const subtexts = [
            '925 Sterling Silver', 'Handcrafted in Morocco', 'Made in Agadir',
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
