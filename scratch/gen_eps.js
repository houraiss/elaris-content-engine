
// ═══════════════════════════════════════════════════════════
// EXPANDED PROMPT STUDIO
// ═══════════════════════════════════════════════════════════

const ARCHETYPES = [
  { id: "editorial",  label: "Editorial",    icon: "◈", color: "#c9a96e",
    mood: "High-fashion magazine, dramatic staging, aspirational",
    prompt: "high-fashion editorial photography, magazine-quality staging, dramatic and aspirational, strong visual narrative, bold composition, luxury editorial lighting" },
  { id: "campaign",   label: "Campaign",     icon: "◆", color: "#a67c52",
    mood: "Brand hero shot, identity statement, powerful",
    prompt: "brand campaign photography, hero shot, powerful brand statement, aspirational identity, polished and intentional, flagship imagery" },
  { id: "lifestyle",  label: "Lifestyle",    icon: "◉", color: "#b8956e",
    mood: "Authentic everyday luxury, relatable, natural moment",
    prompt: "lifestyle photography, authentic everyday luxury, candid natural moment, real and relatable, warm and approachable, genuine emotion" },
  { id: "craft",      label: "Detail",       icon: "⬡", color: "#d4aa6e",
    mood: "Artisan close-up, craftsmanship hero, material focus",
    prompt: "detail and craftsmanship photography, extreme close-up focus on material quality, artisan precision, macro texture, jeweler's eye, celebrates the craft" },
  { id: "cultural",   label: "Cultural",     icon: "✦", color: "#c07a4e",
    mood: "Moroccan heritage, architecture, ornate patterns",
    prompt: "cultural heritage photography, Moroccan and North African aesthetics, ornate architecture, geometric patterns, rich cultural context, artisan tradition" },
  { id: "occasion",   label: "Occasion",     icon: "◌", color: "#e0b880",
    mood: "Eid, wedding, celebration, special event energy",
    prompt: "celebratory occasion photography, festive and joyful energy, special event context, elevated styling, celebratory mood, Eid or bridal context" },
  { id: "street",     label: "Street",       icon: "◎", color: "#9a7850",
    mood: "Urban candid, modern city, fashion-forward",
    prompt: "urban street photography, candid city energy, modern fashion-forward, architectural backdrop, natural movement, contemporary cool" },
  { id: "boudoir",    label: "Boudoir",      icon: "◑", color: "#c9a96e",
    mood: "Intimate, soft morning light, quiet luxury",
    prompt: "intimate boudoir photography, soft morning light, quiet and personal luxury, peaceful and sensual, delicate atmosphere, private moment of beauty" },
  { id: "botanical",  label: "Botanical",    icon: "❋", color: "#8a9e7e",
    mood: "Florals, organic garden, ethereal and soft",
    prompt: "botanical garden photography, organic natural setting, ethereal soft light, florals and greenery, dreamlike natural beauty, living texture as backdrop" },
];

// ── 2. JEWELRY TYPES ──────────────────────────────────────
const JEWELRY = [
  { id: "studs",       label: "Studs",         group: "Earrings", focus: "ear lobes, close and centered" },
  { id: "hoops",       label: "Hoops",         group: "Earrings", focus: "ears and jaw line, movement" },
  { id: "drops",       label: "Drop / Dangle", group: "Earrings", focus: "ears and neck length, elongating" },
  { id: "pendant",     label: "Pendant",       group: "Necklace", focus: "décolletage and neckline" },
  { id: "choker",      label: "Choker",        group: "Necklace", focus: "throat and upper neck" },
  { id: "layered",     label: "Layered Chain", group: "Necklace", focus: "full neckline, multiple depths" },
  { id: "bracelet",    label: "Bracelet",      group: "Wrist",    focus: "wrist and hand, movement" },
  { id: "bangle",      label: "Bangle / Cuff", group: "Wrist",    focus: "wrist bone and forearm" },
  { id: "solitaire",   label: "Solitaire",     group: "Ring",     focus: "finger, hand elegance" },
  { id: "stacked",     label: "Stacked Rings", group: "Ring",     focus: "multiple fingers, hand composition" },
  { id: "anklet",      label: "Anklet",        group: "Ankle",    focus: "ankle and bare foot" },
  { id: "set",         label: "Full Set",      group: "Set",      focus: "full upper body, complete look" },
];

const JEWELRY_GROUPS = ["Earrings", "Necklace", "Wrist", "Ring", "Ankle", "Set"];

// ── 3. CAMERA ANGLES ──────────────────────────────────────
const ANGLES = [
  { id: "frontal",    label: "Frontal",       icon: "⊙", desc: "Direct, straight-on face and jewelry" },
  { id: "three_q",   label: "3/4 Turn",      icon: "◑", desc: "Classic 3/4 profile, most flattering" },
  { id: "profile",   label: "Side Profile",  icon: "◐", desc: "Pure profile, strong architectural line" },
  { id: "overhead",  label: "Overhead",      icon: "⊕", desc: "Looking down from above, flat-lay energy" },
  { id: "lookdown",  label: "Glance Down",   icon: "◒", desc: "Model eyes down, intimate and soft" },
  { id: "macro",     label: "Macro",         icon: "⊛", desc: "Extreme close-up on the jewelry piece" },
  { id: "nape",      label: "From Behind",   icon: "◓", desc: "Nape of neck, back of earrings, mystery" },
  { id: "mirror",    label: "Mirror",        icon: "⊞", desc: "Reflection in vanity or mirror" },
];

// ── 4. SCENES ─────────────────────────────────────────────
const SCENES = [
  // Studio
  { id: "studio_white",   label: "Studio White",    group: "Studio",    icon: "□", desc: "Clean white, shadowless, catalog-grade" },
  { id: "studio_dark",    label: "Studio Dark",     group: "Studio",    icon: "■", desc: "Dark dramatic, high-contrast, moody" },
  { id: "studio_marble",  label: "Marble Surface",  group: "Studio",    icon: "◫", desc: "White marble, reflective, refined" },
  // Outdoor
  { id: "golden_hour",    label: "Golden Hour",     group: "Outdoor",   icon: "◯", desc: "Warm dusk light, soft and magical" },
  { id: "rooftop",        label: "Rooftop",         group: "Outdoor",   icon: "◲", desc: "City skyline, urban height, breeze" },
  { id: "beach",          label: "Beach / Coast",   group: "Outdoor",   icon: "◡", desc: "Mediterranean sea, warm sand, light" },
  { id: "garden",         label: "Garden",          group: "Outdoor",   icon: "❋", desc: "Florals, greenery, dappled light" },
  { id: "desert",         label: "Desert / Dunes",  group: "Outdoor",   icon: "◝", desc: "Golden sand, haze, ancient warmth" },
  { id: "atlas",          label: "Atlas Mountains", group: "Outdoor",   icon: "▲", desc: "Natural landscape, altitude, clean air" },
  // Interior
  { id: "cafe",           label: "Café",            group: "Interior",  icon: "◌", desc: "Cozy, warm ambient, rich textures" },
  { id: "boutique",       label: "Boutique",        group: "Interior",  icon: "◈", desc: "Luxury retail setting, brand world" },
  { id: "riad",           label: "Riad Courtyard",  group: "Interior",  icon: "✦", desc: "Moroccan architecture, fountain, tiles" },
  { id: "hammam",         label: "Hammam",          group: "Interior",  icon: "◎", desc: "Moroccan bath, steam, mosaic tiles" },
  { id: "boudoir_room",   label: "Boudoir",         group: "Interior",  icon: "◑", desc: "Soft bedroom, draped fabric, morning" },
  { id: "art_gallery",    label: "Art Gallery",     icon: "◇", group: "Interior",  desc: "White walls, contemporary, clean lines" },
  // Event
  { id: "gala",           label: "Evening Gala",    group: "Event",     icon: "◆", desc: "Night event, low-key glamour, dramatic" },
  { id: "souk",           label: "Souk / Market",   group: "Event",     icon: "◐", desc: "Moroccan market, color, texture, life" },
  { id: "wedding",        label: "Wedding",         group: "Event",     icon: "◉", desc: "Bridal context, soft florals, ceremony" },
];

const SCENE_GROUPS = ["Studio", "Outdoor", "Interior", "Event"];

// ── 5. COLOR PALETTES ─────────────────────────────────────
const PALETTES = [
  { id: "warm_gold",   label: "Warm Gold",       swatches: ["#f5e6c8","#e8c98a","#c9a96e","#a67c52"],
    desc: "Cream, ivory, amber, honey — the brand signature",
    prompt: "warm gold and cream color palette, ivory whites, amber tones, honey warmth, luxurious gold light" },
  { id: "cool_silver", label: "Cool Silver",     swatches: ["#f0f4f8","#dde6ed","#b0bec5","#78909c"],
    desc: "Whites, pale gray, silver — crisp and editorial",
    prompt: "cool silver and white color palette, crisp whites, pale grays, ice tones, polished silver light" },
  { id: "moody_dark",  label: "Moody Dark",      swatches: ["#2d1f2e","#4a2040","#7b3f6e","#c07878"],
    desc: "Deep burgundy, plum, forest — dramatic and rich",
    prompt: "moody dark color palette, deep burgundy and plum shadows, forest tones, rich and dramatic, low-key contrast" },
  { id: "earthy",      label: "Earthy Neutral",  swatches: ["#f2e0c8","#d4a87a","#c07a4e","#8b5e3c"],
    desc: "Terracotta, sand, warm beige — organic and warm",
    prompt: "earthy neutral color palette, terracotta and warm sand, natural beige, organic warm tones, sunbaked texture" },
  { id: "blush",       label: "Blush Romantic",  swatches: ["#fce4ec","#f8bbd0","#e8919d","#c06070"],
    desc: "Dusty rose, mauve, soft pink — feminine and soft",
    prompt: "blush romantic color palette, dusty rose and mauve, soft pinks, delicate feminine tones, gentle warmth" },
  { id: "noir",        label: "Noir Contrast",   swatches: ["#0a0a0a","#1a1a1a","#888","#c9a96e"],
    desc: "Black & white with gold accent — maximum impact",
    prompt: "noir high-contrast color palette, deep blacks, pure whites, graphic contrast with gold jewelry as sole accent" },
  { id: "mediter",     label: "Mediterranean",   swatches: ["#e8f4f8","#a8d8ea","#2980b9","#f0c060"],
    desc: "Azure blue, cobalt, warm sand — coastal luxury",
    prompt: "Mediterranean color palette, azure blues and cobalt, warm sandy whites, sea-light and coastal warmth" },
  { id: "emerald",     label: "Emerald Luxe",    swatches: ["#1a3a2a","#2d6a4f","#52b788","#c9a96e"],
    desc: "Deep green, moss, forest — jewel-toned richness",
    prompt: "emerald luxe color palette, deep forest greens, rich moss tones, jewel-like depth, gold against green" },
];

// ── 6. LIGHTING MOODS ─────────────────────────────────────
const LIGHTING = [
  { id: "golden",   label: "Golden Hour",  icon: "◉", desc: "Warm, diffused, magical side-light",
    prompt: "golden hour natural light, warm diffused sunlight, magical soft side-lighting, long shadow warmth" },
  { id: "soft",     label: "Studio Soft",  icon: "◯", desc: "Controlled, clean, even — no harsh shadows",
    prompt: "studio soft box lighting, clean even exposure, no harsh shadows, controlled professional light" },
  { id: "hard",     label: "Hard Drama",   icon: "◆", desc: "Strong shadows, bold contrast, sculptural",
    prompt: "hard dramatic lighting, strong directional light, deep shadows, bold contrast, sculptural form" },
  { id: "window",   label: "Natural Window", icon: "◫", desc: "Soft daylight, airy, bright and clean",
    prompt: "natural window light, soft diffused daylight, airy and bright, clean natural exposure" },
  { id: "candle",   label: "Night / Candle", icon: "◌", desc: "Warm glow, intimate, low-key dark",
    prompt: "candle and ambient low-key lighting, warm intimate glow, soft darkness, atmospheric night warmth" },
];

// ── 7. ASPECT RATIOS ──────────────────────────────────────
const RATIOS = [
  { id: "square",    label: "1:1",   sub: "Square",          dims: "1080 × 1080",  use: "Feed Classic",          css: { width: 32, height: 32 } },
  { id: "port_4_5",  label: "4:5",   sub: "Portrait",        dims: "1080 × 1350",  use: "Feed Optimised",        css: { width: 26, height: 32 } },
  { id: "story",     label: "9:16",  sub: "Stories",         dims: "1080 × 1920",  use: "Stories / Reels",       css: { width: 18, height: 32 } },
  { id: "port_2_3",  label: "2:3",   sub: "Pinterest",       dims: "1000 × 1500",  use: "Pinterest",             css: { width: 21, height: 32 } },
  { id: "port_3_4",  label: "3:4",   sub: "Portrait",        dims: "1080 × 1440",  use: "General Portrait",      css: { width: 24, height: 32 } },
  { id: "land",      label: "16:9",  sub: "Landscape",       dims: "1920 × 1080",  use: "Cover / Header",        css: { width: 56, height: 32 } },
];

// ── Default Model Profiles ─────────────────────────────────
const DEFAULT_PROFILES = [
  { id: "lina", name: "Lina", color: "#c9a96e",
    descriptor: "Woman, 25, olive Mediterranean skin, almond dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture", ref: null },
  { id: "sara", name: "Sara", color: "#a67c52",
    descriptor: "Woman, 28, warm golden-beige skin, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, relaxed confident expression", ref: null },
];

// ── Prompt Builder ─────────────────────────────────────────
function buildPrompt({ archetype, jewelry, shots, angle, scene, palette, lighting, ratio, consistency, profile, notes }) {
  const A = ARCHETYPES.find(x => x.id === archetype);
  const J = JEWELRY.find(x => x.id === jewelry);
  const AN = ANGLES.find(x => x.id === angle);
  const SC = SCENES.find(x => x.id === scene);
  const P = PALETTES.find(x => x.id === palette);
  const L = LIGHTING.find(x => x.id === lighting);
  const R = RATIOS.find(x => x.id === ratio);

  const noImages = shots === 0;
  const hasModel = consistency && profile;
  const totalImages = shots + (hasModel ? 1 : 0);

  let imageBlock = "";
  if (!noImages) {
    const jLabel = shots === 1 ? "Image 1 shows" : `Images 1 through ${shots === 4 ? "4+" : shots} show`;
    const modelLine = hasModel ? `\nImage ${shots === 4 ? "5+" : shots + 1} is the model reference — keep her face, skin tone, features, and appearance IDENTICAL. Do not alter her in any way.` : "";
    imageBlock = `IMAGE REFERENCES:\n${jLabel} the ${J?.label.toLowerCase() || "jewelry"} piece from multiple angles — faithful product reference.${modelLine}\n\nJEWELRY RECONSTRUCTION:\nUse ${shots > 1 ? `all ${shots === 4 ? "4+" : shots} jewelry images together` : "the jewelry image"} to fully reconstruct the piece. Do not hallucinate any detail not visible in the shots.\n\n`;
  }

  const modelDesc = hasModel
    ? `Model: ${profile.descriptor}.\n`
    : "Beautiful model, elegant presence.\n";

  const ratioNote = R ? `\nFormat: ${R.dims} (${R.label} — ${R.sub}, optimised for ${R.use}).` : "";

  return `${imageBlock}ARCHETYPE: ${A?.label.toUpperCase() || "EDITORIAL"}
${A?.prompt || ""}

SUBJECT:
${hasModel ? `The exact same woman from Image ${shots === 4 ? "5+" : shots + 1}` : "Model"} wearing ${J?.label.toLowerCase() || "jewelry"} from${noImages ? " the concept" : " the reference images"}.
${modelDesc}Camera: ${AN?.label || "3/4 Turn"} — ${AN?.desc || ""}
Focus on: ${J?.focus || "the jewelry"}

SCENE & ENVIRONMENT:
${SC?.label || "Studio"} — ${SC?.desc || ""}

MOOD & LIGHT:
${L?.prompt || "soft studio lighting"}

COLOR DIRECTION:
${P?.prompt || "warm gold tones"}

BRAND DIRECTION:
Style: @elaris.925 — refined, modern, aspirational luxury jewelry brand.
${ratioNote}${notes ? `\n\nCREATIVE NOTES:\n${notes}` : ""}`;
}



function buildPrompt({ archetype, jewelry, shots, angle, scene, palette, lighting, ratio, consistency, profile, notes }) {
  const A = ARCHETYPES.find(x => x.id === archetype);
  const J = JEWELRY.find(x => x.id === jewelry);
  const AN = ANGLES.find(x => x.id === angle);
  const SC = SCENES.find(x => x.id === scene);
  const P = PALETTES.find(x => x.id === palette);
  const L = LIGHTING.find(x => x.id === lighting);
  const R = RATIOS.find(x => x.id === ratio);

  const noImages = shots === 0;
  const hasModel = consistency && profile;
  const totalImages = shots + (hasModel ? 1 : 0);

  let imageBlock = "";
  if (!noImages) {
    const jLabel = shots === 1 ? "Image 1 shows" : `Images 1 through ${shots === 4 ? "4+" : shots} show`;
    const modelLine = hasModel ? `\nImage ${shots === 4 ? "5+" : shots + 1} is the model reference — keep her face, skin tone, features, and appearance IDENTICAL. Do not alter her in any way.` : "";
    imageBlock = `IMAGE REFERENCES:\n${jLabel} the ${J?.label.toLowerCase() || "jewelry"} piece from multiple angles — faithful product reference.${modelLine}\n\nJEWELRY RECONSTRUCTION:\nUse ${shots > 1 ? `all ${shots === 4 ? "4+" : shots} jewelry images together` : "the jewelry image"} to fully reconstruct the piece. Do not hallucinate any detail not visible in the shots.\n\n`;
  }

  const modelDesc = hasModel
    ? `Model: ${profile.descriptor}.\n`
    : "Beautiful model, elegant presence.\n";

  const ratioNote = R ? `\nFormat: ${R.dims} (${R.label} — ${R.sub}, optimised for ${R.use}).` : "";

  return `${imageBlock}ARCHETYPE: ${A?.label.toUpperCase() || "EDITORIAL"}
${A?.prompt || ""}

SUBJECT:
${hasModel ? `The exact same woman from Image ${shots === 4 ? "5+" : shots + 1}` : "Model"} wearing ${J?.label.toLowerCase() || "jewelry"} from${noImages ? " the concept" : " the reference images"}.
${modelDesc}Camera: ${AN?.label || "3/4 Turn"} — ${AN?.desc || ""}
Focus on: ${J?.focus || "the jewelry"}

SCENE & ENVIRONMENT:
${SC?.label || "Studio"} — ${SC?.desc || ""}

MOOD & LIGHT:
${L?.prompt || "soft studio lighting"}

COLOR DIRECTION:
${P?.prompt || "warm gold tones"}

BRAND DIRECTION:
Style: @elaris.925 — refined, modern, aspirational luxury jewelry brand.
${ratioNote}${notes ? `\n\nCREATIVE NOTES:\n${notes}` : ""}`;
}

const ExpandedPromptStudio = {
    state: {
        archetype: 'editorial',
        jewelry: 'hoops',
        shots: 0,
        angle: 'three_q',
        scene: 'studio_dark',
        palette: 'warm_gold',
        lighting: 'soft',
        ratio: 'port_4_5',
        consistency: false,
        activeModel: 'lina',
        profiles: DEFAULT_PROFILES,
        notes: ''
    },
    
    init(container) {
        this.container = container;
        this._loadProfiles();
        this._render();
        this._bind();
    },
    
    _loadProfiles() {
        try {
            const saved = localStorage.getItem('elaris_expanded_profiles');
            if (saved) this.state.profiles = JSON.parse(saved);
        } catch(e) {}
    },
    
    _saveProfiles() {
        localStorage.setItem('elaris_expanded_profiles', JSON.stringify(this.state.profiles));
    },
    
    _updatePrompt() {
        const prompt = buildPrompt({
            archetype: this.state.archetype,
            jewelry: this.state.jewelry,
            shots: this.state.shots,
            angle: this.state.angle,
            scene: this.state.scene,
            palette: this.state.palette,
            lighting: this.state.lighting,
            ratio: this.state.ratio,
            consistency: this.state.consistency,
            profile: this.state.profiles.find(p => p.id === this.state.activeModel),
            notes: this.state.notes
        });
        const box = this.container.querySelector('#eps-prompt-box');
        if (box) box.textContent = prompt;
        
        // Update tags
        const R = RATIOS.find(x => x.id === this.state.ratio);
        const A = ARCHETYPES.find(x => x.id === this.state.archetype);
        
        const tags = this.container.querySelector('#eps-prompt-tags');
        if (tags) {
            let html = '';
            if (this.state.shots > 0) html += `<span class="eps-pill" style="color:#a67c52;border-color:#a67c5240">${this.state.shots===4?'4+':this.state.shots} jewelry</span>`;
            if (this.state.consistency && this.state.shots > 0) html += `<span class="eps-pill" style="color:#7a9e87;border-color:#7a9e8740">+ model ref</span>`;
            if (R) html += `<span class="eps-pill" style="color:#4a3d30;border-color:#4a3d3040">${R.label}</span>`;
            if (A) html += `<span class="eps-pill" style="color:#4a3d30;border-color:#4a3d3040">${A.label}</span>`;
            tags.innerHTML = html;
        }
    },
    
    _render() {
        const A = ARCHETYPES.find(x => x.id === this.state.archetype);
        const J = JEWELRY.find(x => x.id === this.state.jewelry);
        const AN = ANGLES.find(x => x.id === this.state.angle);
        const SC = SCENES.find(x => x.id === this.state.scene);
        const P = PALETTES.find(x => x.id === this.state.palette);
        const L = LIGHTING.find(x => x.id === this.state.lighting);
        const R = RATIOS.find(x => x.id === this.state.ratio);
        
        const SectionLabel = (title, active) => `<div class="eps-sec-label"><span>${title}</span>${active ? `<span class="eps-sec-active">— ${active}</span>` : ''}</div>`;

        let html = `<div class="eps-root">`;
        
        html += `<div class="eps-section">${SectionLabel('01 — Archetype', A?.label)}<div class="eps-arch-scroll">`;
        ARCHETYPES.forEach(a => {
            const isSel = this.state.archetype === a.id;
            html += `
            <button class="eps-arch-card ${isSel?'active':''}" data-id="${a.id}" style="--c:${a.color}">
                <span class="eps-arch-icon">${a.icon}</span>
                <span class="eps-arch-label">${a.label}</span>
                <span class="eps-arch-mood">${a.mood}</span>
            </button>`;
        });
        html += `</div></div>`;
        
        html += `<div class="eps-main-grid">`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${SectionLabel('02 — Jewelry Type', J?.label)}`;
        JEWELRY_GROUPS.forEach(g => {
            html += `<div class="eps-group-label">${g}</div><div class="eps-tag-row">`;
            JEWELRY.filter(j => j.group === g).forEach(j => {
                const isSel = this.state.jewelry === j.id;
                html += `<button class="eps-tag ${isSel?'active':''}" data-id="${j.id}">${j.label}</button>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
        
        html += `<div class="eps-card">${SectionLabel('03 — Jewelry Shots')}`;
        html += `<div class="eps-count-row">`;
        [0,1,2,3,4].forEach(n => {
            html += `<button class="eps-count-btn ${this.state.shots===n?'active':''}" data-n="${n}">${n===0?'None':n===4?'4+':n}</button>`;
        });
        html += `</div>`;
        if (this.state.shots > 0) {
            html += `<div class="eps-hint-box">📎 Attach ${this.state.shots===4?'4+':this.state.shots} jewelry shot${this.state.shots!==1?'s':''} ${this.state.consistency ? '+ 1 model ref = '+(this.state.shots===4?'5+':this.state.shots+1)+' total' : ''}</div>`;
        }
        html += `</div>`;
        
        html += `<div class="eps-card">${SectionLabel('04 — Camera Angle', AN?.label)}<div class="eps-angle-grid">`;
        ANGLES.forEach(a => {
            html += `<button class="eps-angle-btn ${this.state.angle===a.id?'active':''}" data-id="${a.id}"><span class="eps-angle-icon">${a.icon}</span><span class="eps-angle-name">${a.label}</span><span class="eps-angle-desc">${a.desc}</span></button>`;
        });
        html += `</div></div></div>`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${SectionLabel('05 — Scene', SC?.label)}`;
        SCENE_GROUPS.forEach(g => {
            html += `<div class="eps-group-label">${g}</div><div class="eps-scene-grid">`;
            SCENES.filter(x => x.group === g).forEach(sc => {
                html += `<button class="eps-scene-btn ${this.state.scene===sc.id?'active':''}" data-id="${sc.id}"><span class="eps-scene-icon">${sc.icon}</span><span class="eps-scene-name">${sc.label}</span><span class="eps-scene-desc">${sc.desc}</span></button>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
        
        html += `<div class="eps-card">${SectionLabel('06 — Lighting', L?.label)}<div style="display:flex;flex-direction:column;gap:6px">`;
        LIGHTING.forEach(l => {
            html += `<button class="eps-lighting-btn ${this.state.lighting===l.id?'active':''}" data-id="${l.id}"><span class="eps-lighting-icon">${l.icon}</span><div style="text-align:left"><span class="eps-lighting-name">${l.label}</span><span class="eps-lighting-desc">${l.desc}</span></div></button>`;
        });
        html += `</div></div></div>`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${SectionLabel('07 — Color Palette', P?.label)}<div style="display:flex;flex-direction:column;gap:6px">`;
        PALETTES.forEach(p => {
            let swatches = p.swatches.map(c => `<span class="eps-swatch" style="background:${c}"></span>`).join('');
            html += `<button class="eps-palette-btn ${this.state.palette===p.id?'active':''}" data-id="${p.id}"><div class="eps-swatches">${swatches}</div><div style="text-align:left"><span class="eps-palette-name">${p.label}</span><span class="eps-palette-desc">${p.desc}</span></div></button>`;
        });
        html += `</div></div>`;
        
        html += `<div class="eps-card">${SectionLabel('08 — Aspect Ratio', R?.sub + ' ' + R?.label)}<div class="eps-ratio-grid">`;
        RATIOS.forEach(r => {
            html += `<button class="eps-ratio-btn ${this.state.ratio===r.id?'active':''}" data-id="${r.id}"><div class="eps-ratio-viz" style="width:${r.css.width}px;height:${r.css.height}px"></div><span class="eps-ratio-label">${r.label}</span><span class="eps-ratio-sub">${r.sub}</span><span class="eps-ratio-dims">${r.dims}</span></button>`;
        });
        html += `</div></div>`;
        
        html += `<div class="eps-card">${SectionLabel('09 — Notes')}<textarea class="eps-textarea" id="eps-notes" rows="3" placeholder="Extra creative direction, mood words...">${this.state.notes}</textarea></div>`;
        html += `</div></div>`;
        
        html += `<div class="eps-section">`;
        html += `<div class="eps-consistency-bar"><div>${SectionLabel('10 — Model Consistency')}<span class="eps-consistency-hint">Lock a virtual model across all shots</span></div>
        <button class="eps-toggle ${this.state.consistency?'active':''}" id="eps-consistency-toggle"><span class="eps-toggle-knob"></span></button></div>`;
        
        if (this.state.consistency) {
            html += `<div class="eps-profile-area">`;
            html += `<div class="eps-profile-header"><span>SELECT PROFILE</span><button id="eps-add-model-btn">+ New Model</button></div>`;
            
            html += `<div id="eps-new-model-form" style="display:none" class="eps-new-model-form">
                <input type="text" id="eps-new-name" placeholder="Model name" class="eps-input">
                <textarea id="eps-new-desc" rows="2" placeholder="Physical description..." class="eps-textarea"></textarea>
                <button id="eps-save-model-btn" class="eps-save-model-btn">Save Profile</button>
            </div>`;
            
            html += `<div class="eps-profile-grid">`;
            this.state.profiles.forEach(p => {
                const isSel = this.state.activeModel === p.id;
                html += `
                <div class="eps-profile-card ${isSel?'active':''}" data-id="${p.id}" style="--c:${p.color}">
                    <div class="eps-profile-avatar" style="background:${p.color}15;border-color:${p.color}50">
                        ${p.ref ? `<img src="${p.ref}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `<span style="color:${p.color}">${p.name[0]}</span>`}
                        <label class="eps-profile-upload" title="Upload reference">📷<input type="file" class="eps-ref-upload" data-id="${p.id}" style="display:none" accept="image/*"></label>
                    </div>
                    <div style="flex:1">
                        <div class="eps-profile-name">${p.name}</div>
                        ${p.ref ? `<div class="eps-profile-refbadge">✓ Reference</div>` : ''}
                        <div class="eps-profile-desctext">${p.descriptor.slice(0,80)}...</div>
                    </div>
                    ${isSel ? `<span class="eps-active-badge">Active</span>` : ''}
                </div>`;
            });
            html += `</div></div>`;
        }
        html += `</div>`;
        
        html += `<div class="eps-section">`;
        html += `<div class="eps-output-header">${SectionLabel('Generated Prompt')}<div id="eps-prompt-tags" style="display:flex;gap:6px"></div></div>`;
        html += `<div class="eps-prompt-box" id="eps-prompt-box"></div>`;
        html += `<button class="eps-copy-btn" id="eps-copy-btn">Copy Prompt →</button>`;
        html += `</div></div>`;
        
        this.container.innerHTML = html;
        this._updatePrompt();
    },
    
    _bind() {
        this.container.addEventListener('click', e => {
            const t = e.target.closest('button, .eps-profile-card');
            if (!t) return;
            
            if (t.classList.contains('eps-arch-card')) { this.state.archetype = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-tag')) { this.state.jewelry = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-count-btn')) { this.state.shots = parseInt(t.dataset.n); this._render(); this._bind(); return; }
            if (t.classList.contains('eps-angle-btn')) { this.state.angle = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-scene-btn')) { this.state.scene = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-lighting-btn')) { this.state.lighting = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-palette-btn')) { this.state.palette = t.dataset.id; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-ratio-btn')) { this.state.ratio = t.dataset.id; this._render(); this._bind(); return; }
            
            if (t.id === 'eps-consistency-toggle') { this.state.consistency = !this.state.consistency; this._render(); this._bind(); return; }
            if (t.classList.contains('eps-profile-card')) { this.state.activeModel = t.dataset.id; this._render(); this._bind(); return; }
            
            if (t.id === 'eps-add-model-btn') {
                const f = this.container.querySelector('#eps-new-model-form');
                f.style.display = f.style.display === 'none' ? 'flex' : 'none';
                t.textContent = f.style.display === 'none' ? '+ New Model' : 'Cancel';
            }
            if (t.id === 'eps-save-model-btn') {
                const n = this.container.querySelector('#eps-new-name').value.trim();
                const d = this.container.querySelector('#eps-new-desc').value.trim();
                if (n) {
                    const id = n.toLowerCase().replace(/\s+/g,'-') + '-' + Date.now();
                    this.state.profiles.push({ id, name:n, descriptor:d, color:'#c9a96e', ref:null });
                    this.state.activeModel = id;
                    this._saveProfiles();
                    this._render();
                    this._bind();
                }
            }
            if (t.id === 'eps-copy-btn') {
                navigator.clipboard.writeText(this.container.querySelector('#eps-prompt-box').textContent);
                Elaris.toast('✓ Prompt copied');
            }
        });
        
        this.container.addEventListener('change', e => {
            if (e.target.classList.contains('eps-ref-upload')) {
                const id = e.target.dataset.id;
                const f = e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = ev => {
                    const p = this.state.profiles.find(x => x.id === id);
                    if (p) p.ref = ev.target.result;
                    this._saveProfiles();
                    this._render();
                    this._bind();
                };
                r.readAsDataURL(f);
            }
        });
        
        const ta = this.container.querySelector('#eps-notes');
        if (ta) {
            ta.addEventListener('input', e => {
                this.state.notes = e.target.value;
                this._updatePrompt();
            });
        }
    }
};

// Hook into existing UI
window.render_promptstudio = function(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title" data-i18n="ps_title">Prompt Studio</h1>
            <p class="page-subtitle" data-i18n="ps_subtitle">Generate editorial prompts - paste into Gemini, Midjourney, or any AI tool</p>
        </div>
        <div class="ps-tabs" style="display:flex;gap:10px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:15px">
            <button class="btn btn-sm btn-secondary active" id="tab-expanded">Expanded Studio</button>
            <button class="btn btn-sm btn-secondary" id="tab-classic">Classic Generator</button>
        </div>
        <div id="ps-expanded-view"></div>
        <div id="ps-classic-view" style="display:none"></div>
    `;
    
    const expView = container.querySelector('#ps-expanded-view');
    const claView = container.querySelector('#ps-classic-view');
    
    ExpandedPromptStudio.init(expView);
    
    const oldContainer = document.createElement('div');
    PromptStudio.init(oldContainer);
    // Remove the page header from classic
    const ph = oldContainer.querySelector('.page-header');
    if (ph) ph.remove();
    claView.appendChild(oldContainer);
    
    container.querySelector('#tab-expanded').addEventListener('click', e => {
        e.target.classList.add('active');
        container.querySelector('#tab-classic').classList.remove('active');
        expView.style.display = 'block';
        claView.style.display = 'none';
    });
    container.querySelector('#tab-classic').addEventListener('click', e => {
        e.target.classList.add('active');
        container.querySelector('#tab-expanded').classList.remove('active');
        claView.style.display = 'block';
        expView.style.display = 'none';
    });
};
