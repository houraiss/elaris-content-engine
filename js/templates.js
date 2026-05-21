/**
 * templates.js — Template definitions for Elaris Content Engine.
 *
 * Each template defines: background, photo area, frame, text positions, logo position.
 * Templates are rendered by the CanvasEngine.
 */

const ELARIS_TEMPLATES = {

    // ═══════════════════════════════════════════════════════════
    // POST TEMPLATES (1080×1080)
    // ═══════════════════════════════════════════════════════════

    'dark-hero': {
        id: 'dark-hero',
        name: 'Dark Hero',
        category: 'rhodie',
        format: 'post',
        description: 'Centered jewelry on dramatic black',
        background: { type: 'solid', color: '#171717' },
        photoArea: { x: 0.1, y: 0.05, w: 0.8, h: 0.75 },
        photoMask: 'rounded',
        photoRadius: 12,
        frame: { type: 'corners', color: '#A67C52', pad: 35, cornerLength: 50, lineWidth: 1.5 },
        vignette: 0.25,
        defaultText: [
            { id: 'title', text: '', x: 0.5, y: 0.88, size: 28, fontFamily: "'Playfair Display', serif", weight: '700', color: '#F0ECE6' },
            { id: 'subtitle', text: '', x: 0.5, y: 0.94, size: 12, fontFamily: "'Montserrat', sans-serif", weight: '400', color: '#A67C52', letterSpacing: 3 },
        ],
        logo: { position: 'bottom-right', scale: 0.08, opacity: 0.6 },
        showHandle: true,
        previewColor: '#171717',
    },

    'clean-light': {
        id: 'clean-light',
        name: 'Clean Light',
        category: 'fes',
        format: 'post',
        description: 'Bright, clean product showcase',
        background: { type: 'solid', color: '#EEEEEE' },
        photoArea: { x: 0.12, y: 0.08, w: 0.76, h: 0.7 },
        photoMask: 'rounded',
        photoRadius: 8,
        frame: { type: 'double', color: '#C0C0C0', outerPad: 28, innerPad: 38 },
        vignette: 0,
        defaultText: [
            { id: 'title', text: '', x: 0.5, y: 0.87, size: 26, fontFamily: "'Playfair Display', serif", weight: '700', color: '#171717', shadow: false },
            { id: 'subtitle', text: '', x: 0.5, y: 0.93, size: 11, fontFamily: "'Montserrat', sans-serif", weight: '600', color: '#59704A', letterSpacing: 2, shadow: false },
        ],
        logo: { position: 'bottom-right', scale: 0.07, opacity: 0.5 },
        showHandle: true,
        previewColor: '#EEEEEE',
        darkLogo: true,
    },

    'heritage-warm': {
        id: 'heritage-warm',
        name: 'Heritage Warm',
        category: 'heritage',
        format: 'post',
        description: 'Warm golden tone, ceremonial feel',
        background: { type: 'gradient', stops: [['#2a1f14', 0], ['#1a1209', 1]] },
        photoArea: { x: 0.15, y: 0.1, w: 0.7, h: 0.65 },
        photoMask: 'circle',
        frame: null,
        vignette: 0.35,
        defaultText: [
            { id: 'title', text: '', x: 0.5, y: 0.85, size: 30, fontFamily: "'Playfair Display', serif", weight: '700', color: '#EEE6D3' },
            { id: 'subtitle', text: '', x: 0.5, y: 0.92, size: 11, fontFamily: "'Cormorant Garamond', serif", weight: '400', color: '#A67C52', letterSpacing: 2 },
        ],
        logo: { position: 'bottom-right', scale: 0.09, opacity: 0.5 },
        showHandle: true,
        previewColor: '#2a1f14',
    },

    'split-editorial': {
        id: 'split-editorial',
        name: 'Split Editorial',
        category: 'fes',
        format: 'post',
        description: 'Left photo, right branded panel',
        background: { type: 'solid', color: '#EEE6D3' },
        photoArea: { x: 0, y: 0, w: 0.55, h: 1 },
        frame: null,
        vignette: 0,
        defaultText: [
            { id: 'title', text: '', x: 0.775, y: 0.4, size: 32, fontFamily: "'Playfair Display', serif", weight: '700', color: '#171717', maxWidth: 0.35, shadow: false },
            { id: 'subtitle', text: '925 Sterling Silver', x: 0.775, y: 0.55, size: 10, fontFamily: "'Montserrat', sans-serif", weight: '600', color: '#A67C52', letterSpacing: 3, shadow: false },
            { id: 'cta', text: 'Shop Now →', x: 0.775, y: 0.65, size: 13, fontFamily: "'Inter', sans-serif", weight: '600', color: '#36442D', shadow: false },
        ],
        logo: { position: 'bottom-right', scale: 0.08, opacity: 0.4 },
        showHandle: false,
        previewColor: '#EEE6D3',
        darkLogo: true,
    },

    'minimal-frame': {
        id: 'minimal-frame',
        name: 'Minimal Frame',
        category: 'rhodie',
        format: 'post',
        description: 'Full bleed with thin luxury border',
        background: { type: 'solid', color: '#0e0e0e' },
        photoArea: { x: 0.06, y: 0.06, w: 0.88, h: 0.88 },
        frame: { type: 'border', color: '#A67C52', width: 3 },
        vignette: 0.15,
        defaultText: [],
        logo: { position: 'bottom-right', scale: 0.07, opacity: 0.4 },
        showHandle: true,
        previewColor: '#0e0e0e',
    },

    'cedar-botanical': {
        id: 'cedar-botanical',
        name: 'Cedar Botanical',
        category: 'beldi',
        format: 'post',
        description: 'Atlas Cedar green with natural feel',
        background: { type: 'gradient', stops: [['#36442D', 0], ['#2a3522', 1]] },
        photoArea: { x: 0.15, y: 0.08, w: 0.7, h: 0.68 },
        photoMask: 'rounded',
        photoRadius: 16,
        frame: { type: 'corners', color: '#EEE6D3', pad: 30, cornerLength: 45, lineWidth: 1 },
        vignette: 0.2,
        defaultText: [
            { id: 'title', text: '', x: 0.5, y: 0.86, size: 26, fontFamily: "'Playfair Display', serif", weight: '700', color: '#EEE6D3' },
            { id: 'subtitle', text: '', x: 0.5, y: 0.93, size: 11, fontFamily: "'Montserrat', sans-serif", weight: '400', color: '#C0C0C0', letterSpacing: 2 },
        ],
        logo: { position: 'bottom-right', scale: 0.08, opacity: 0.5 },
        showHandle: true,
        previewColor: '#36442D',
    },

    // ═══════════════════════════════════════════════════════════
    // STORY TEMPLATES (1080×1920)
    // ═══════════════════════════════════════════════════════════

    'story-announce': {
        id: 'story-announce',
        name: 'New Arrival',
        category: 'rhodie',
        format: 'story',
        description: 'Announce a new piece with impact',
        background: { type: 'solid', color: '#171717' },
        photoArea: { x: 0.08, y: 0.15, w: 0.84, h: 0.5 },
        photoMask: 'rounded',
        photoRadius: 16,
        frame: null,
        vignette: 0.2,
        defaultText: [
            { id: 'badge', text: 'NEW', x: 0.5, y: 0.08, size: 14, fontFamily: "'Montserrat', sans-serif", weight: '700', color: '#A67C52', letterSpacing: 6 },
            { id: 'title', text: '', x: 0.5, y: 0.74, size: 34, fontFamily: "'Playfair Display', serif", weight: '700', color: '#F0ECE6', maxWidth: 0.8 },
            { id: 'subtitle', text: '925 Sterling Silver', x: 0.5, y: 0.81, size: 12, fontFamily: "'Montserrat', sans-serif", weight: '400', color: '#A67C52', letterSpacing: 3 },
            { id: 'cta', text: 'Tap to discover ✦', x: 0.5, y: 0.92, size: 14, fontFamily: "'Inter', sans-serif", weight: '500', color: 'rgba(255,255,255,0.5)' },
        ],
        logo: { position: 'top-right', scale: 0.1, opacity: 0.4 },
        showHandle: true,
        previewColor: '#171717',
    },

    'story-minimal': {
        id: 'story-minimal',
        name: 'Minimal Story',
        category: 'fes',
        format: 'story',
        description: 'Full-bleed photo with subtle branding',
        background: { type: 'solid', color: '#000' },
        photoArea: { x: 0, y: 0, w: 1, h: 1 },
        frame: null,
        vignette: 0.3,
        defaultText: [],
        logo: { position: 'top-right', scale: 0.1, opacity: 0.5 },
        showHandle: true,
        previewColor: '#333',
    },

    'story-promo': {
        id: 'story-promo',
        name: 'Promo Story',
        category: 'heritage',
        format: 'story',
        description: 'Sale or special offer',
        background: { type: 'gradient', stops: [['#171717', 0], ['#2a1f14', 0.6], ['#171717', 1]] },
        photoArea: { x: 0.12, y: 0.2, w: 0.76, h: 0.4 },
        photoMask: 'rounded',
        photoRadius: 12,
        frame: null,
        vignette: 0,
        defaultText: [
            { id: 'promo', text: 'SPECIAL OFFER', x: 0.5, y: 0.1, size: 13, fontFamily: "'Montserrat', sans-serif", weight: '700', color: '#A67C52', letterSpacing: 5 },
            { id: 'discount', text: '', x: 0.5, y: 0.7, size: 48, fontFamily: "'Playfair Display', serif", weight: '700', color: '#F0ECE6' },
            { id: 'details', text: '', x: 0.5, y: 0.78, size: 14, fontFamily: "'Inter', sans-serif", weight: '400', color: '#A8A29E', maxWidth: 0.7 },
            { id: 'cta', text: 'DM to Order', x: 0.5, y: 0.9, size: 16, fontFamily: "'Montserrat', sans-serif", weight: '700', color: '#A67C52' },
        ],
        logo: { position: 'top-right', scale: 0.1, opacity: 0.5 },
        showHandle: true,
        previewColor: '#2a1f14',
    },

    'story-sand': {
        id: 'story-sand',
        name: 'Warm Sand',
        category: 'beldi',
        format: 'story',
        description: 'Warm, earthy organic feel',
        background: { type: 'solid', color: '#EEE6D3' },
        photoArea: { x: 0.1, y: 0.18, w: 0.8, h: 0.45 },
        photoMask: 'rounded',
        photoRadius: 20,
        frame: { type: 'corners', color: '#36442D', pad: 25, cornerLength: 40, lineWidth: 1.5 },
        vignette: 0,
        defaultText: [
            { id: 'title', text: '', x: 0.5, y: 0.73, size: 30, fontFamily: "'Playfair Display', serif", weight: '700', color: '#171717', shadow: false, maxWidth: 0.7 },
            { id: 'subtitle', text: '', x: 0.5, y: 0.8, size: 11, fontFamily: "'Montserrat', sans-serif", weight: '600', color: '#59704A', letterSpacing: 2, shadow: false },
            { id: 'cta', text: 'Link in Bio', x: 0.5, y: 0.92, size: 14, fontFamily: "'Inter', sans-serif", weight: '600', color: '#36442D', shadow: false },
        ],
        logo: { position: 'top-right', scale: 0.1, opacity: 0.4 },
        showHandle: true,
        previewColor: '#EEE6D3',
        darkLogo: true,
    },
};

/**
 * Get all templates, optionally filtered.
 */
function getTemplates(filter = {}) {
    let templates = Object.values(ELARIS_TEMPLATES);
    if (filter.format) templates = templates.filter(t => t.format === filter.format);
    if (filter.category) templates = templates.filter(t => t.category === filter.category);
    return templates;
}

/**
 * Get a specific template by ID.
 */
function getTemplate(id) {
    return ELARIS_TEMPLATES[id] || null;
}

/**
 * Render a mini preview of a template into a canvas element.
 */
function renderTemplatePreview(template, canvas, size = 120) {
    canvas.width = size;
    canvas.height = template.format === 'story' ? size * (1920 / 1080) : size;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background
    const bg = template.background;
    if (bg.type === 'solid') {
        ctx.fillStyle = bg.color;
        ctx.fillRect(0, 0, w, h);
    } else if (bg.type === 'gradient') {
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        (bg.stops || []).forEach(([c, p]) => grd.addColorStop(p, c));
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
    }

    // Photo area placeholder
    const area = template.photoArea || { x: 0, y: 0, w: 1, h: 1 };
    ctx.fillStyle = 'rgba(166, 124, 82, 0.15)';
    ctx.strokeStyle = 'rgba(166, 124, 82, 0.3)';
    ctx.lineWidth = 1;

    const ax = area.x * w, ay = area.y * h, aw = area.w * w, ah = area.h * h;

    if (template.photoMask === 'circle') {
        ctx.beginPath();
        ctx.arc(ax + aw / 2, ay + ah / 2, Math.min(aw, ah) / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    } else {
        const r = template.photoRadius ? template.photoRadius * (size / 1080) : 0;
        if (r > 0) {
            ctx.beginPath();
            ctx.moveTo(ax + r, ay);
            ctx.lineTo(ax + aw - r, ay);
            ctx.quadraticCurveTo(ax + aw, ay, ax + aw, ay + r);
            ctx.lineTo(ax + aw, ay + ah - r);
            ctx.quadraticCurveTo(ax + aw, ay + ah, ax + aw - r, ay + ah);
            ctx.lineTo(ax + r, ay + ah);
            ctx.quadraticCurveTo(ax, ay + ah, ax, ay + ah - r);
            ctx.lineTo(ax, ay + r);
            ctx.quadraticCurveTo(ax, ay, ax + r, ay);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(ax, ay, aw, ah);
            ctx.strokeRect(ax, ay, aw, ah);
        }
    }

    // Photo icon
    ctx.fillStyle = 'rgba(166, 124, 82, 0.4)';
    ctx.font = `${Math.max(12, size * 0.15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📷', ax + aw / 2, ay + ah / 2);

    // Text placeholders
    (template.defaultText || []).forEach(t => {
        const fontSize = Math.max(6, (t.size || 20) * (size / 1080));
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        const lineW = Math.min(aw * 0.6, 60);
        ctx.fillRect(t.x * w - lineW / 2, t.y * h - 2, lineW, 4);
    });
}

window.ELARIS_TEMPLATES = ELARIS_TEMPLATES;
window.getTemplates = getTemplates;
window.getTemplate = getTemplate;
window.renderTemplatePreview = renderTemplatePreview;
