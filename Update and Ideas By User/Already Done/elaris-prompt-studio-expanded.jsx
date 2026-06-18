import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   ELARIS PROMPT STUDIO — EXPANDED
   Archetypes · Jewelry · Angles · Scenes · Palettes · Ratios
═══════════════════════════════════════════════════════════ */

const FONT = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400&family=Jost:wght@200;300;400;500&display=swap";

// ── 1. ARCHETYPES ─────────────────────────────────────────
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

// ── Section Header ─────────────────────────────────────────
function SectionLabel({ children, count, active }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
      <span style={{ fontSize:9, letterSpacing:"0.22em", color:"#a67c52", fontWeight:500, textTransform:"uppercase", fontFamily:"'Jost',sans-serif" }}>
        {children}
      </span>
      {active && (
        <span style={{ fontSize:9, color:"#4a3d30", letterSpacing:"0.1em", fontFamily:"'Jost',sans-serif" }}>
          — {active}
        </span>
      )}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ show }) {
  return (
    <div style={{ position:"fixed", bottom:32, left:"50%", transform:`translateX(-50%) translateY(${show?0:16}px)`, opacity:show?1:0, transition:"all 0.3s cubic-bezier(.16,1,.3,1)", background:"#a67c52", color:"#fff8f0", padding:"10px 24px", borderRadius:40, fontSize:12, fontFamily:"'Jost',sans-serif", letterSpacing:"0.1em", fontWeight:500, pointerEvents:"none", zIndex:9999, boxShadow:"0 8px 32px rgba(166,124,82,0.4)" }}>
      ✓ Prompt copied
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function ElarisPromptStudio() {
  useEffect(() => {
    const l = document.createElement("link"); l.rel="stylesheet"; l.href=FONT; document.head.appendChild(l);
  }, []);

  const [archetype,    setArchetype]    = useState("editorial");
  const [jewelry,      setJewelry]      = useState("hoops");
  const [shots,        setShots]        = useState(0);
  const [angle,        setAngle]        = useState("three_q");
  const [scene,        setScene]        = useState("studio_dark");
  const [palette,      setPalette]      = useState("warm_gold");
  const [lighting,     setLighting]     = useState("soft");
  const [ratio,        setRatio]        = useState("port_4_5");
  const [consistency,  setConsistency]  = useState(false);
  const [activeModel,  setActiveModel]  = useState("lina");
  const [profiles,     setProfiles]     = useState(DEFAULT_PROFILES);
  const [notes,        setNotes]        = useState("");
  const [copied,       setCopied]       = useState(false);
  const [newName,      setNewName]      = useState("");
  const [newDesc,      setNewDesc]      = useState("");
  const [addingModel,  setAddingModel]  = useState(false);

  const profile = profiles.find(p => p.id === activeModel);
  const A = ARCHETYPES.find(x => x.id === archetype);
  const mode = shots === 0 ? "Test" : consistency ? "Full" : "Product";
  const modeColor = { Test:"#7a9e87", Product:"#a67c52", Full:"#c9a96e" }[mode];

  const prompt = buildPrompt({ archetype, jewelry, shots, angle, scene, palette, lighting, ratio, consistency, profile, notes });

  const copy = () => { navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(()=>setCopied(false), 2200); };

  const addProfile = () => {
    if (!newName.trim()) return;
    const id = newName.toLowerCase().replace(/\s+/g,"-") + "-" + Date.now();
    setProfiles(p => [...p, { id, name:newName.trim(), descriptor:newDesc.trim(), color:"#c9a96e", ref:null }]);
    setActiveModel(id); setNewName(""); setNewDesc(""); setAddingModel(false);
  };

  const uploadRef = (profileId, e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setProfiles(p => p.map(x => x.id === profileId ? { ...x, ref:ev.target.result } : x));
    r.readAsDataURL(f);
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('${FONT}');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:#0a0805}
        ::-webkit-scrollbar-thumb{background:#2a2018;border-radius:2px}
        textarea,input{outline:none}
        button{cursor:pointer}
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={s.topBar}>
        <div>
          <div style={s.eyebrow}>PROMPT STUDIO  ·  @elaris.925</div>
          <h1 style={s.title}>Expanded Studio</h1>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={s.modePill(modeColor)}>
            <span style={s.modeDot(modeColor)} />
            {mode} Mode
          </div>
          <div style={s.imageCount}>
            {shots + (consistency && shots > 0 ? 1 : 0)} image{(shots + (consistency && shots > 0 ? 1 : 0)) !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ══ ARCHETYPE ══════════════════════════════════════ */}
      <div style={s.section}>
        <SectionLabel active={A?.label}> 01 — Archetype</SectionLabel>
        <div style={s.archetypeScroll}>
          {ARCHETYPES.map(a => (
            <button key={a.id} onClick={() => setArchetype(a.id)} style={s.archetypeCard(archetype === a.id, a.color)}>
              <span style={s.archetypeIcon(archetype === a.id, a.color)}>{a.icon}</span>
              <span style={s.archetypeLabel(archetype === a.id)}>{a.label}</span>
              <span style={s.archetypeMood}>{a.mood}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN GRID ══════════════════════════════════════ */}
      <div style={s.mainGrid}>

        {/* ── COL A: Subject ── */}
        <div style={s.col}>

          {/* Jewelry Type */}
          <div style={s.card}>
            <SectionLabel active={JEWELRY.find(j=>j.id===jewelry)?.label}>02 — Jewelry Type</SectionLabel>
            {JEWELRY_GROUPS.map(g => {
              const items = JEWELRY.filter(j => j.group === g);
              return (
                <div key={g} style={{ marginBottom:10 }}>
                  <div style={s.groupLabel}>{g}</div>
                  <div style={s.tagRow}>
                    {items.map(j => (
                      <button key={j.id} onClick={() => setJewelry(j.id)} style={s.tag(jewelry === j.id)}>
                        {j.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shots Count */}
          <div style={s.card}>
            <SectionLabel>03 — Jewelry Shots</SectionLabel>
            <div style={{ display:"flex", gap:6, marginBottom:shots>0?10:0 }}>
              {[0,1,2,3,4].map(n => (
                <button key={n} onClick={() => setShots(n)} style={s.countBtn(shots === n)}>
                  {n === 0 ? "None" : n === 4 ? "4+" : n}
                </button>
              ))}
            </div>
            {shots > 0 && (
              <div style={s.hintBox}>
                📎 Attach {shots === 4 ? "4+" : shots} jewelry shot{shots !== 1 ? "s" : ""}
                {consistency ? ` + 1 model ref = ${shots === 4 ? "5+" : shots + 1} total` : ""}
              </div>
            )}
          </div>

          {/* Camera Angle */}
          <div style={s.card}>
            <SectionLabel active={ANGLES.find(a=>a.id===angle)?.label}>04 — Camera Angle</SectionLabel>
            <div style={s.angleGrid}>
              {ANGLES.map(a => (
                <button key={a.id} onClick={() => setAngle(a.id)} style={s.angleBtn(angle === a.id)}>
                  <span style={s.angleIcon(angle === a.id)}>{a.icon}</span>
                  <span style={s.angleName}>{a.label}</span>
                  <span style={s.angleDesc}>{a.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── COL B: Scene & Mood ── */}
        <div style={s.col}>

          {/* Scene */}
          <div style={s.card}>
            <SectionLabel active={SCENES.find(x=>x.id===scene)?.label}>05 — Scene</SectionLabel>
            {SCENE_GROUPS.map(g => {
              const items = SCENES.filter(x => x.group === g);
              return (
                <div key={g} style={{ marginBottom:12 }}>
                  <div style={s.groupLabel}>{g}</div>
                  <div style={s.sceneGrid}>
                    {items.map(sc => (
                      <button key={sc.id} onClick={() => setScene(sc.id)} style={s.sceneBtn(scene === sc.id)}>
                        <span style={s.sceneIcon(scene === sc.id)}>{sc.icon}</span>
                        <span style={s.sceneName(scene === sc.id)}>{sc.label}</span>
                        <span style={s.sceneDesc}>{sc.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lighting */}
          <div style={s.card}>
            <SectionLabel active={LIGHTING.find(x=>x.id===lighting)?.label}>06 — Lighting</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {LIGHTING.map(l => (
                <button key={l.id} onClick={() => setLighting(l.id)} style={s.lightingBtn(lighting === l.id)}>
                  <span style={s.lightingIcon(lighting === l.id)}>{l.icon}</span>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <span style={s.lightingName(lighting === l.id)}>{l.label}</span>
                    <span style={s.lightingDescText}>{l.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── COL C: Visual Direction ── */}
        <div style={s.col}>

          {/* Color Palette */}
          <div style={s.card}>
            <SectionLabel active={PALETTES.find(x=>x.id===palette)?.label}>07 — Color Palette</SectionLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {PALETTES.map(p => (
                <button key={p.id} onClick={() => setPalette(p.id)} style={s.paletteBtn(palette === p.id)}>
                  <div style={{ display:"flex", gap:3, flexShrink:0 }}>
                    {p.swatches.map((c,i) => (
                      <span key={i} style={{ width:14, height:14, borderRadius:"50%", background:c, border:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }} />
                    ))}
                  </div>
                  <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                    <span style={s.paletteName(palette === p.id)}>{p.label}</span>
                    <span style={s.paletteDescText}>{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div style={s.card}>
            <SectionLabel active={RATIOS.find(x=>x.id===ratio)?.sub + " " + RATIOS.find(x=>x.id===ratio)?.label}>08 — Aspect Ratio</SectionLabel>
            <div style={s.ratioGrid}>
              {RATIOS.map(r => (
                <button key={r.id} onClick={() => setRatio(r.id)} style={s.ratioBtn(ratio === r.id)}>
                  <div style={s.ratioViz(ratio === r.id, r.css)} />
                  <span style={s.ratioLabel(ratio === r.id)}>{r.label}</span>
                  <span style={s.ratioSub}>{r.sub}</span>
                  <span style={s.ratioDims}>{r.dims}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div style={s.card}>
            <SectionLabel>09 — Notes</SectionLabel>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Extra creative direction, mood words, specific details..."
              rows={3}
              style={s.textarea}
            />
          </div>
        </div>
      </div>

      {/* ══ MODEL CONSISTENCY ══════════════════════════════ */}
      <div style={s.section}>
        <div style={s.consistencyBar}>
          <div>
            <SectionLabel>10 — Model Consistency</SectionLabel>
            <span style={s.consistencyHint}>Lock a virtual model across all shots</span>
          </div>
          <button onClick={() => setConsistency(!consistency)} style={s.toggle(consistency)}>
            <span style={s.toggleKnob(consistency)} />
          </button>
        </div>

        {consistency && (
          <div style={s.profileArea}>
            <div style={s.profileHeader}>
              <span style={{ fontSize:11, color:"#4a3d30", letterSpacing:"0.06em", fontFamily:"'Jost',sans-serif" }}>
                SELECT PROFILE
              </span>
              <button onClick={() => setAddingModel(!addingModel)} style={s.addModelBtn}>
                {addingModel ? "Cancel" : "+ New Model"}
              </button>
            </div>

            {addingModel && (
              <div style={s.newModelForm}>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Model name" style={s.formInput} />
                <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Physical description: skin tone, eyes, hair, face structure..." rows={2} style={s.textarea} />
                <button onClick={addProfile} style={s.saveModelBtn}>Save Profile</button>
              </div>
            )}

            <div style={s.profileGrid}>
              {profiles.map(p => (
                <div key={p.id} onClick={() => setActiveModel(p.id)} style={s.profileCard(activeModel === p.id, p.color)}>
                  <div style={s.profileAvatarWrap(p.color)}>
                    {p.ref
                      ? <img src={p.ref} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                      : <span style={s.profileInitial}>{p.name[0]}</span>
                    }
                    <label style={s.profileUploadOverlay} onClick={e=>e.stopPropagation()} title="Upload reference">
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>uploadRef(p.id, e)} />
                      📷
                    </label>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={s.profileName}>{p.name}</div>
                    {p.ref && <div style={s.profileRefBadge}>✓ Reference</div>}
                    <div style={s.profileDescText}>{p.descriptor.slice(0,80)}…</div>
                  </div>
                  {activeModel === p.id && <span style={s.activeBadge}>Active</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ PROMPT OUTPUT ══════════════════════════════════ */}
      <div style={s.section}>
        <div style={s.outputHeader}>
          <SectionLabel>Generated Prompt</SectionLabel>
          <div style={{ display:"flex", gap:6 }}>
            {shots > 0 && <span style={s.pill("#a67c52")}>{shots === 4 ? "4+" : shots} jewelry</span>}
            {consistency && shots > 0 && <span style={s.pill("#7a9e87")}>+ model ref</span>}
            <span style={s.pill("#4a3d30")}>{RATIOS.find(r=>r.id===ratio)?.label}</span>
            <span style={s.pill("#4a3d30")}>{A?.label}</span>
          </div>
        </div>
        <div style={s.promptBox}>{prompt}</div>
        <button onClick={copy} style={s.copyBtn}>
          Copy Prompt →
        </button>
      </div>

      <Toast show={copied} />
    </div>
  );
}

// ══ STYLES ══════════════════════════════════════════════════
const s = {
  root: { background:"#0c0a08", minHeight:"100vh", padding:"28px 24px 80px", fontFamily:"'Jost',sans-serif", color:"#f0e6d8", maxWidth:1200, margin:"0 auto" },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 },
  eyebrow: { fontSize:9, letterSpacing:"0.28em", color:"#a67c52", fontWeight:500, marginBottom:6, display:"block" },
  title: { fontFamily:"'Cormorant Garamond',serif", fontSize:40, fontWeight:300, color:"#f5e6d3", letterSpacing:"-0.01em", lineHeight:1 },
  modePill: c => ({ display:"flex", alignItems:"center", gap:6, background:`${c}14`, border:`1px solid ${c}40`, borderRadius:40, padding:"5px 14px", fontSize:11, color:"#c9a96e", letterSpacing:"0.1em", fontWeight:500 }),
  modeDot: c => ({ width:5, height:5, borderRadius:"50%", background:c, boxShadow:`0 0 5px ${c}`, flexShrink:0 }),
  imageCount: { fontSize:10, color:"#4a3d30", letterSpacing:"0.1em", border:"1px solid #1e1810", borderRadius:40, padding:"5px 12px" },
  section: { marginBottom:20 },
  mainGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:20 },
  col: { display:"flex", flexDirection:"column", gap:12 },
  card: { background:"#111009", border:"1px solid #1e1810", borderRadius:12, padding:"16px 18px" },

  // Archetype
  archetypeScroll: { display:"flex", gap:10, overflowX:"auto", paddingBottom:6, scrollbarWidth:"none" },
  archetypeCard: (a, c) => ({ flexShrink:0, width:130, padding:"14px 12px", background: a ? `${c}12` : "transparent", border:`1px solid ${a ? c : "#1e1810"}`, borderRadius:10, display:"flex", flexDirection:"column", gap:4, textAlign:"left", transition:"all 0.18s" }),
  archetypeIcon: (a, c) => ({ fontSize:18, color: a ? c : "#3a2e24", display:"block", marginBottom:4 }),
  archetypeLabel: a => ({ fontSize:12, fontWeight:500, color: a ? "#c9a96e" : "#5a4a38", letterSpacing:"0.06em", fontFamily:"'Jost',sans-serif", display:"block" }),
  archetypeMood: { fontSize:10, color:"#3a2e24", lineHeight:1.4, fontFamily:"'Jost',sans-serif", fontWeight:300, display:"block" },

  groupLabel: { fontSize:9, letterSpacing:"0.2em", color:"#3a2e24", fontWeight:500, textTransform:"uppercase", fontFamily:"'Jost',sans-serif", marginBottom:6 },
  tagRow: { display:"flex", flexWrap:"wrap", gap:5 },
  tag: a => ({ padding:"5px 11px", background: a ? "rgba(166,124,82,0.2)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:20, color: a ? "#c9a96e" : "#4a3a2a", fontSize:11, fontFamily:"'Jost',sans-serif", letterSpacing:"0.05em", transition:"all 0.15s", fontWeight: a ? 500 : 300 }),

  countBtn: a => ({ flex:1, padding:"9px 4px", background: a ? "rgba(166,124,82,0.18)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:7, color: a ? "#c9a96e" : "#4a3a2a", fontSize:12, fontFamily:"'Jost',sans-serif", letterSpacing:"0.04em", fontWeight: a ? 500 : 300, transition:"all 0.15s" }),
  hintBox: { background:"rgba(166,124,82,0.06)", border:"1px solid rgba(166,124,82,0.15)", borderRadius:7, padding:"8px 12px", fontSize:11, color:"#6b5a4a", letterSpacing:"0.02em" },

  angleGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 },
  angleBtn: a => ({ padding:"9px 10px", background: a ? "rgba(166,124,82,0.12)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:8, display:"flex", flexDirection:"column", gap:2, textAlign:"left", transition:"all 0.15s" }),
  angleIcon: a => ({ fontSize:14, color: a ? "#c9a96e" : "#3a2e24", display:"block", marginBottom:2 }),
  angleName: { fontSize:10, fontWeight:500, color:"#a67c52", letterSpacing:"0.1em", fontFamily:"'Jost',sans-serif", textTransform:"uppercase", display:"block" },
  angleDesc: { fontSize:10, color:"#3a2e24", fontFamily:"'Jost',sans-serif", lineHeight:1.35, display:"block" },

  sceneGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:5 },
  sceneBtn: a => ({ padding:"8px 8px 6px", background: a ? "rgba(166,124,82,0.12)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:7, display:"flex", flexDirection:"column", gap:1, textAlign:"left", transition:"all 0.15s" }),
  sceneIcon: a => ({ fontSize:12, color: a ? "#c9a96e" : "#3a2e24", display:"block" }),
  sceneName: a => ({ fontSize:10, fontWeight:500, color: a ? "#c9a96e" : "#5a4a38", letterSpacing:"0.06em", fontFamily:"'Jost',sans-serif", display:"block" }),
  sceneDesc: { fontSize:9, color:"#3a2e24", fontFamily:"'Jost',sans-serif", lineHeight:1.3, display:"block" },

  lightingBtn: a => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background: a ? "rgba(166,124,82,0.12)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:8, transition:"all 0.15s" }),
  lightingIcon: a => ({ fontSize:14, color: a ? "#c9a96e" : "#3a2e24", width:20, textAlign:"center", flexShrink:0 }),
  lightingName: a => ({ fontSize:11, fontWeight:500, color: a ? "#c9a96e" : "#5a4a38", letterSpacing:"0.08em", fontFamily:"'Jost',sans-serif", display:"block" }),
  lightingDescText: { fontSize:10, color:"#3a2e24", fontFamily:"'Jost',sans-serif", display:"block", marginTop:1 },

  paletteBtn: a => ({ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background: a ? "rgba(166,124,82,0.1)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:8, transition:"all 0.15s" }),
  paletteName: a => ({ fontSize:11, fontWeight:500, color: a ? "#c9a96e" : "#5a4a38", letterSpacing:"0.06em", fontFamily:"'Jost',sans-serif", display:"block" }),
  paletteDescText: { fontSize:10, color:"#3a2e24", fontFamily:"'Jost',sans-serif", display:"block", marginTop:1 },

  ratioGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 },
  ratioBtn: a => ({ padding:"10px 6px", background: a ? "rgba(166,124,82,0.12)" : "transparent", border:`1px solid ${a ? "#a67c52" : "#1e1810"}`, borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.15s" }),
  ratioViz: (a, css) => ({ width:css.width, height:css.height, border:`1.5px solid ${a ? "#a67c52" : "#2a2018"}`, borderRadius:2, background: a ? "rgba(166,124,82,0.12)" : "transparent", flexShrink:0 }),
  ratioLabel: a => ({ fontSize:12, fontWeight:500, color: a ? "#c9a96e" : "#5a4a38", fontFamily:"'Jost',sans-serif", letterSpacing:"0.06em" }),
  ratioSub: { fontSize:9, color:"#3a2e24", fontFamily:"'Jost',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase" },
  ratioDims: { fontSize:8, color:"#2a2018", fontFamily:"'DM Mono',monospace", letterSpacing:"0.04em" },

  textarea: { width:"100%", background:"#0a0805", border:"1px solid #1e1810", borderRadius:7, color:"#c9a96e", fontSize:11, fontFamily:"'DM Mono',monospace", padding:"9px 11px", lineHeight:1.65, letterSpacing:"0.01em" },

  // Consistency
  consistencyBar: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
  consistencyHint: { fontSize:11, color:"#3a2e24", letterSpacing:"0.02em", fontFamily:"'Jost',sans-serif" },
  toggle: on => ({ width:46, height:25, background: on ? "rgba(166,124,82,0.25)" : "#111009", border:`1px solid ${on ? "#a67c52" : "#1e1810"}`, borderRadius:13, position:"relative", transition:"all 0.22s", flexShrink:0 }),
  toggleKnob: on => ({ position:"absolute", top:3, left: on ? 22 : 3, width:17, height:17, borderRadius:"50%", background: on ? "#c9a96e" : "#2a2018", transition:"all 0.22s cubic-bezier(.16,1,.3,1)", boxShadow: on ? "0 0 8px rgba(201,169,110,0.5)" : "none" }),

  profileArea: { background:"#111009", border:"1px solid #1e1810", borderRadius:12, padding:"16px 18px" },
  profileHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 },
  addModelBtn: { background:"transparent", border:"1px solid #1e1810", borderRadius:6, color:"#4a3d30", fontSize:10, fontFamily:"'Jost',sans-serif", padding:"4px 12px", letterSpacing:"0.1em" },
  newModelForm: { background:"#0a0805", border:"1px solid #1e1810", borderRadius:8, padding:14, marginBottom:14, display:"flex", flexDirection:"column", gap:8 },
  formInput: { background:"transparent", border:"none", borderBottom:"1px solid #1e1810", color:"#c9a96e", fontSize:13, fontFamily:"'Jost',sans-serif", padding:"5px 0", width:"100%", letterSpacing:"0.04em" },
  saveModelBtn: { alignSelf:"flex-end", background:"rgba(166,124,82,0.2)", border:"1px solid #a67c52", borderRadius:6, color:"#c9a96e", fontSize:10, fontFamily:"'Jost',sans-serif", padding:"7px 16px", letterSpacing:"0.1em" },
  profileGrid: { display:"flex", flexDirection:"column", gap:8 },
  profileCard: (a, c) => ({ display:"flex", alignItems:"flex-start", gap:12, padding:"11px 14px", border:`1px solid ${a ? c : "#1e1810"}`, borderRadius:10, background: a ? `${c}0a` : "transparent", cursor:"pointer", transition:"all 0.18s", position:"relative" }),
  profileAvatarWrap: c => ({ width:38, height:38, borderRadius:"50%", border:`1px solid ${c}50`, background:`${c}15`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, overflow:"hidden" }),
  profileInitial: { fontFamily:"'Cormorant Garamond',serif", fontSize:17, color:"#c9a96e", fontWeight:300 },
  profileUploadOverlay: { position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.65)", opacity:0, cursor:"pointer", fontSize:12, borderRadius:"50%", transition:"opacity 0.18s" },
  profileName: { fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:400, color:"#f0e6d8", letterSpacing:"0.02em", lineHeight:1 },
  profileRefBadge: { fontSize:9, color:"#7a9e87", letterSpacing:"0.08em", marginTop:3, display:"block" },
  profileDescText: { fontSize:10, color:"#3a2e24", lineHeight:1.5, marginTop:4, fontFamily:"'Jost',sans-serif" },
  activeBadge: { position:"absolute", top:8, right:10, fontSize:8, letterSpacing:"0.15em", color:"#a67c52", border:"1px solid #a67c5240", borderRadius:3, padding:"2px 7px", textTransform:"uppercase" },

  // Output
  outputHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  pill: c => ({ fontSize:9, color:c, border:`1px solid ${c}40`, borderRadius:3, padding:"2px 8px", letterSpacing:"0.1em", fontFamily:"'Jost',sans-serif", fontWeight:500 }),
  promptBox: { background:"#080604", border:"1px solid #1e1810", borderRadius:10, padding:"16px 18px", fontSize:11, fontFamily:"'DM Mono',monospace", color:"#c9a96e", lineHeight:1.85, whiteSpace:"pre-wrap", letterSpacing:"0.02em", marginBottom:12 },
  copyBtn: { width:"100%", padding:"13px", background:"linear-gradient(135deg,#a67c52,#c9a96e)", border:"none", borderRadius:9, color:"#0c0a08", fontSize:11, fontFamily:"'Jost',sans-serif", fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase" },
};
