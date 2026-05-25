import { useState, useRef, useEffect } from "react";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Mono:wght@300;400&family=Jost:wght@300;400;500&display=swap";

// ─── Default Model Profiles ──────────────────────────────────────────────────
const DEFAULT_PROFILES = [
  {
    id: "lina",
    name: "Lina",
    descriptor:
      "Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture",
    referenceImage: null,
    color: "#c9a96e",
  },
  {
    id: "sara",
    name: "Sara",
    descriptor:
      "Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression",
    referenceImage: null,
    color: "#a67c52",
  },
];

// ─── Scene Presets ────────────────────────────────────────────────────────────
const SCENE_PRESETS = [
  { id: "studio", label: "Studio", icon: "◈", desc: "Clean studio, neutral backdrop, controlled light" },
  { id: "editorial", label: "Editorial", icon: "◆", desc: "High-fashion editorial, dramatic lighting" },
  { id: "outdoor", label: "Outdoor", icon: "◉", desc: "Natural outdoor, golden hour, soft environment" },
  { id: "cafe", label: "Café", icon: "◌", desc: "Cozy café interior, warm ambient light" },
  { id: "closeup", label: "Close-up", icon: "⬡", desc: "Macro close-up on jewelry detail, shallow depth" },
  { id: "lifestyle", label: "Lifestyle", icon: "◎", desc: "Casual lifestyle, natural everyday moment" },
];

// ─── Jewelry Type Presets ─────────────────────────────────────────────────────
const JEWELRY_TYPES = [
  { id: "earrings", label: "Earrings", focus: "ears and side of neck" },
  { id: "necklace", label: "Necklace", focus: "neck and décolletage" },
  { id: "bracelet", label: "Bracelet", focus: "wrist and hand" },
  { id: "ring", label: "Ring", focus: "fingers and hand" },
  { id: "set", label: "Full Set", focus: "full upper body" },
];

// ─── Prompt Generator ────────────────────────────────────────────────────────
function buildPrompt({ mode, jewelryCount, activeProfile, scene, jewelry, customNotes, consistencyOn }) {
  const sceneData = SCENE_PRESETS.find((s) => s.id === scene);
  const jewelryData = JEWELRY_TYPES.find((j) => j.id === jewelry);
  const sceneDesc = sceneData ? sceneData.desc : "soft studio environment";
  const focus = jewelryData ? jewelryData.focus : "the jewelry";
  const jewelryLabel = jewelryData ? jewelryData.label.toLowerCase() : "jewelry piece";

  if (mode === "test") {
    return `Generate a high-quality Instagram editorial photo of a model wearing elegant ${jewelryLabel}.
Scene: ${sceneDesc}.
Camera focused on ${focus}, soft bokeh background.
Warm gold tones, luxury jewelry brand aesthetic, Instagram-ready composition.
Style: @elaris.925 — refined, modern, aspirational.${customNotes ? `\n\nAdditional notes: ${customNotes}` : ""}`;
  }

  const imgLabels =
    jewelryCount === 1
      ? "Image 1 shows"
      : `Images 1 through ${jewelryCount} show`;

  const modelLine =
    consistencyOn && activeProfile
      ? `\nImage ${jewelryCount + 1} is the model reference — keep her face, skin tone, features, and overall appearance IDENTICAL to this reference. Do not alter her appearance in any way.`
      : "";

  const modelDescLine =
    consistencyOn && activeProfile
      ? `\nModel description for additional reference: ${activeProfile.descriptor}.`
      : "";

  const reconstructionLine =
    jewelryCount > 1
      ? `Use ALL ${jewelryCount} jewelry images together to fully reconstruct the piece from every angle — do not hallucinate or invent any detail not visible in the provided shots.`
      : `Use the provided jewelry image as exact reference — do not hallucinate or invent any detail.`;

  return `IMAGE REFERENCES:
${imgLabels} the ${jewelryLabel} piece from different angles — these are your product reference.${modelLine}

JEWELRY RECONSTRUCTION:
${reconstructionLine}

SCENE DIRECTION:
Generate a photo of${consistencyOn && activeProfile ? ` the exact same woman from Image ${jewelryCount + 1}` : " a model"} wearing the ${jewelryLabel} shown in the reference image${jewelryCount > 1 ? "s" : ""}.
Scene: ${sceneDesc}.
Camera focus: ${focus}. Warm gold tones, luxury brand aesthetic.
Style: @elaris.925 — refined, modern, aspirational.${modelDescLine}${customNotes ? `\n\nAdditional creative notes: ${customNotes}` : ""}`;
}

// ─── Copy Toast ───────────────────────────────────────────────────────────────
function CopyToast({ show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
        opacity: show ? 1 : 0,
        transition: "all 0.3s cubic-bezier(.16,1,.3,1)",
        background: "#a67c52",
        color: "#fff8f0",
        padding: "10px 24px",
        borderRadius: 40,
        fontSize: 13,
        fontFamily: "'Jost', sans-serif",
        letterSpacing: "0.08em",
        fontWeight: 500,
        pointerEvents: "none",
        zIndex: 9999,
        boxShadow: "0 8px 32px rgba(166,124,82,0.4)",
      }}
    >
      ✓ Prompt copied to clipboard
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ElarisModelConsistency() {
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState("lina");
  const [consistencyOn, setConsistencyOn] = useState(false);
  const [jewelryCount, setJewelryCount] = useState(0); // 0 = none
  const [scene, setScene] = useState("studio");
  const [jewelry, setJewelry] = useState("earrings");
  const [customNotes, setCustomNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDesc, setNewProfileDesc] = useState("");
  const fileInputRef = useRef(null);
  const promptRef = useRef(null);

  // inject fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  const mode =
    jewelryCount === 0 ? "test" : consistencyOn ? "full" : "product";

  const prompt = buildPrompt({
    mode,
    jewelryCount,
    activeProfile,
    scene,
    jewelry,
    customNotes,
    consistencyOn,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleProfileImageUpload = (e, profileId) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId ? { ...p, referenceImage: ev.target.result } : p
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    const id = newProfileName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setProfiles((prev) => [
      ...prev,
      {
        id,
        name: newProfileName.trim(),
        descriptor: newProfileDesc.trim(),
        referenceImage: null,
        color: "#c9a96e",
      },
    ]);
    setActiveProfileId(id);
    setNewProfileName("");
    setNewProfileDesc("");
    setShowProfilePanel(false);
  };

  const modeLabels = {
    test: { label: "Test Mode", color: "#7a9e87", desc: "No images — pure prompt, concept testing" },
    product: { label: "Product Mode", color: "#a67c52", desc: "Jewelry shots only — no model reference" },
    full: { label: "Full Mode", color: "#c9a96e", desc: "Jewelry + consistent model reference" },
  };
  const currentMode = modeLabels[mode];

  const s = styles;

  return (
    <div style={s.root}>
      <style>{`
        @import url('${FONT_URL}');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #3a2e24; border-radius: 2px; }
        textarea { resize: none; }
        input::placeholder, textarea::placeholder { color: #4a3d30; }
        .profile-card:hover { border-color: #a67c52 !important; }
        .scene-btn:hover { background: rgba(166,124,82,0.12) !important; border-color: #a67c52 !important; }
        .count-btn:hover { border-color: #c9a96e !important; color: #c9a96e !important; }
        .jewelry-btn:hover { background: rgba(166,124,82,0.1) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerEyebrow}>PROMPT STUDIO</span>
          <h1 style={s.headerTitle}>Model Consistency</h1>
          <p style={s.headerSub}>
            Define your virtual model once. Generate forever.
          </p>
        </div>
        <div style={s.modeBadge(currentMode.color)}>
          <span style={s.modeDot(currentMode.color)} />
          <span style={s.modeLabel}>{currentMode.label}</span>
        </div>
      </div>

      <div style={s.modeDesc}>{currentMode.desc}</div>

      <div style={s.grid}>
        {/* ── LEFT COLUMN ── */}
        <div style={s.col}>

          {/* Jewelry Shots */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Jewelry Shots</span>
              <span style={s.cardHint}>How many photos are you attaching?</span>
            </div>
            <div style={s.countRow}>
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className="count-btn"
                  onClick={() => setJewelryCount(n)}
                  style={s.countBtn(jewelryCount === n)}
                >
                  {n === 0 ? "None" : n === 4 ? "4+" : n}
                </button>
              ))}
            </div>
            {jewelryCount > 0 && (
              <div style={s.attachHint}>
                <span style={s.attachIcon}>📎</span>
                Attach {jewelryCount === 4 ? "4 or more" : jewelryCount} jewelry shot{jewelryCount !== 1 ? "s" : ""} in Gemini
                {consistencyOn ? ` + 1 model reference = ${jewelryCount === 4 ? "5+" : jewelryCount + 1} images total` : ""}
              </div>
            )}
          </div>

          {/* Jewelry Type */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Jewelry Type</span>
            </div>
            <div style={s.jewelryRow}>
              {JEWELRY_TYPES.map((j) => (
                <button
                  key={j.id}
                  className="jewelry-btn"
                  onClick={() => setJewelry(j.id)}
                  style={s.jewelryBtn(jewelry === j.id)}
                >
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scene */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Scene</span>
            </div>
            <div style={s.sceneGrid}>
              {SCENE_PRESETS.map((sc) => (
                <button
                  key={sc.id}
                  className="scene-btn"
                  onClick={() => setScene(sc.id)}
                  style={s.sceneBtn(scene === sc.id)}
                >
                  <span style={s.sceneIcon(scene === sc.id)}>{sc.icon}</span>
                  <span style={s.sceneLabel}>{sc.label}</span>
                  <span style={s.sceneDesc}>{sc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Custom Notes</span>
              <span style={s.cardHint}>Optional creative direction</span>
            </div>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. add subtle movement, soft smile, avoid direct eye contact..."
              rows={3}
              style={s.textarea}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={s.col}>

          {/* Model Consistency Toggle */}
          <div style={s.card}>
            <div style={s.toggleRow}>
              <div>
                <div style={s.cardTitle}>Model Consistency</div>
                <div style={s.cardHint}>Lock a virtual model across all your shots</div>
              </div>
              <button
                onClick={() => setConsistencyOn(!consistencyOn)}
                style={s.toggle(consistencyOn)}
              >
                <span style={s.toggleKnob(consistencyOn)} />
              </button>
            </div>
          </div>

          {/* Model Profiles */}
          {consistencyOn && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Model Profile</span>
                <button
                  onClick={() => setShowProfilePanel(!showProfilePanel)}
                  style={s.addBtn}
                >
                  + New
                </button>
              </div>

              {/* New Profile Form */}
              {showProfilePanel && (
                <div style={s.newProfileForm}>
                  <input
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Model name (e.g. Yasmine)"
                    style={s.input}
                  />
                  <textarea
                    value={newProfileDesc}
                    onChange={(e) => setNewProfileDesc(e.target.value)}
                    placeholder="Physical descriptor: skin tone, eyes, hair, face features..."
                    rows={3}
                    style={s.textarea}
                  />
                  <button onClick={handleAddProfile} style={s.saveBtn}>
                    Save Profile
                  </button>
                </div>
              )}

              {/* Profile Cards */}
              <div style={s.profileList}>
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="profile-card"
                    onClick={() => setActiveProfileId(p.id)}
                    style={s.profileCard(activeProfileId === p.id, p.color)}
                  >
                    <div style={s.profileTop}>
                      {/* Avatar / Reference Image */}
                      <div style={s.profileAvatar(p.color)}>
                        {p.referenceImage ? (
                          <img
                            src={p.referenceImage}
                            alt={p.name}
                            style={s.profileAvatarImg}
                          />
                        ) : (
                          <span style={s.profileAvatarInitial}>{p.name[0]}</span>
                        )}
                        <label
                          style={s.profileAvatarUpload}
                          title="Upload reference image"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => handleProfileImageUpload(e, p.id)}
                          />
                          📷
                        </label>
                      </div>
                      <div style={s.profileInfo}>
                        <span style={s.profileName}>{p.name}</span>
                        {p.referenceImage && (
                          <span style={s.profileRefTag}>✓ Reference image</span>
                        )}
                      </div>
                      {activeProfileId === p.id && (
                        <span style={s.profileActive}>Active</span>
                      )}
                    </div>
                    <p style={s.profileDesc}>{p.descriptor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Output */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Generated Prompt</span>
              <div style={s.promptTags}>
                {jewelryCount > 0 && (
                  <span style={s.tag("#a67c52")}>
                    {jewelryCount === 4 ? "4+" : jewelryCount} jewelry img{jewelryCount !== 1 ? "s" : ""}
                  </span>
                )}
                {consistencyOn && (
                  <span style={s.tag("#7a9e87")}>+ model ref</span>
                )}
              </div>
            </div>
            <div ref={promptRef} style={s.promptBox}>
              {prompt}
            </div>
            <button onClick={handleCopy} style={s.copyBtn}>
              Copy Prompt
            </button>
          </div>

          {/* Workflow Guide */}
          <div style={s.workflowCard}>
            <div style={s.cardTitle}>Your Workflow</div>
            <div style={s.workflowSteps}>
              {[
                {
                  n: "1",
                  text:
                    jewelryCount === 0
                      ? "Open Gemini / Nano Banana"
                      : `Attach ${jewelryCount === 4 ? "4+" : jewelryCount} jewelry shot${jewelryCount !== 1 ? "s" : ""} in Gemini`,
                },
                ...(consistencyOn
                  ? [{ n: "2", text: `Attach ${activeProfile?.name || "model"}'s reference image` }]
                  : []),
                {
                  n: consistencyOn ? "3" : "2",
                  text: "Paste the generated prompt above",
                },
                { n: consistencyOn ? "4" : "3", text: "Generate → consistent result ✓" },
              ].map((step) => (
                <div key={step.n} style={s.workflowStep}>
                  <span style={s.workflowNum}>{step.n}</span>
                  <span style={s.workflowText}>{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CopyToast show={copied} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    background: "#0c0a08",
    minHeight: "100vh",
    padding: "32px 24px 80px",
    fontFamily: "'Jost', sans-serif",
    color: "#f0e6d8",
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLeft: {},
  headerEyebrow: {
    fontSize: 10,
    letterSpacing: "0.25em",
    color: "#a67c52",
    fontWeight: 500,
    fontFamily: "'Jost', sans-serif",
    display: "block",
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 38,
    fontWeight: 300,
    color: "#f5e6d3",
    letterSpacing: "-0.01em",
    lineHeight: 1,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 13,
    color: "#6b5a4a",
    fontWeight: 300,
    letterSpacing: "0.02em",
  },
  modeBadge: (color) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: `${color}14`,
    border: `1px solid ${color}40`,
    borderRadius: 40,
    padding: "6px 16px",
    marginTop: 6,
  }),
  modeDot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 6px ${color}`,
    flexShrink: 0,
  }),
  modeLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.12em",
    color: "#c9a96e",
  },
  modeDesc: {
    fontSize: 12,
    color: "#4a3d30",
    letterSpacing: "0.03em",
    marginBottom: 28,
    marginTop: 4,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    background: "#131009",
    border: "1px solid #2a2018",
    borderRadius: 12,
    padding: "18px 20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.18em",
    color: "#a67c52",
    textTransform: "uppercase",
  },
  cardHint: {
    fontSize: 11,
    color: "#4a3d30",
    letterSpacing: "0.02em",
  },
  countRow: {
    display: "flex",
    gap: 8,
  },
  countBtn: (active) => ({
    flex: 1,
    padding: "10px 4px",
    background: active ? "rgba(166,124,82,0.18)" : "transparent",
    border: `1px solid ${active ? "#a67c52" : "#2a2018"}`,
    borderRadius: 8,
    color: active ? "#c9a96e" : "#5a4a38",
    fontSize: 13,
    fontFamily: "'Jost', sans-serif",
    cursor: "pointer",
    fontWeight: active ? 500 : 300,
    letterSpacing: "0.04em",
    transition: "all 0.18s",
  }),
  attachHint: {
    marginTop: 12,
    background: "rgba(166,124,82,0.06)",
    border: "1px solid rgba(166,124,82,0.15)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#8a7060",
    display: "flex",
    alignItems: "center",
    gap: 8,
    letterSpacing: "0.02em",
  },
  attachIcon: { fontSize: 14 },
  jewelryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  jewelryBtn: (active) => ({
    padding: "7px 14px",
    background: active ? "rgba(166,124,82,0.2)" : "transparent",
    border: `1px solid ${active ? "#a67c52" : "#2a2018"}`,
    borderRadius: 20,
    color: active ? "#c9a96e" : "#5a4a38",
    fontSize: 12,
    fontFamily: "'Jost', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.06em",
    transition: "all 0.18s",
    fontWeight: active ? 500 : 300,
  }),
  sceneGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  sceneBtn: (active) => ({
    padding: "10px 12px",
    background: active ? "rgba(166,124,82,0.12)" : "transparent",
    border: `1px solid ${active ? "#a67c52" : "#2a2018"}`,
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    transition: "all 0.18s",
  }),
  sceneIcon: (active) => ({
    fontSize: 14,
    color: active ? "#c9a96e" : "#4a3a2a",
    marginBottom: 2,
  }),
  sceneLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.08em",
    color: "#c9a96e",
    fontFamily: "'Jost', sans-serif",
    textTransform: "uppercase",
  },
  sceneDesc: {
    fontSize: 10,
    color: "#4a3a2a",
    fontFamily: "'Jost', sans-serif",
    letterSpacing: "0.01em",
    lineHeight: 1.4,
  },
  textarea: {
    width: "100%",
    background: "#0d0b09",
    border: "1px solid #2a2018",
    borderRadius: 8,
    color: "#c9a96e",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    padding: "10px 12px",
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    outline: "none",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: (on) => ({
    width: 48,
    height: 26,
    background: on ? "rgba(166,124,82,0.3)" : "#1a1510",
    border: `1px solid ${on ? "#a67c52" : "#2a2018"}`,
    borderRadius: 13,
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    transition: "all 0.25s",
  }),
  toggleKnob: (on) => ({
    position: "absolute",
    top: 3,
    left: on ? 23 : 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: on ? "#c9a96e" : "#3a2e24",
    transition: "all 0.25s cubic-bezier(.16,1,.3,1)",
    boxShadow: on ? "0 0 8px rgba(201,169,110,0.5)" : "none",
  }),
  addBtn: {
    background: "transparent",
    border: "1px solid #2a2018",
    borderRadius: 6,
    color: "#6b5a4a",
    fontSize: 11,
    fontFamily: "'Jost', sans-serif",
    padding: "4px 12px",
    cursor: "pointer",
    letterSpacing: "0.08em",
    transition: "all 0.18s",
  },
  newProfileForm: {
    background: "#0d0b09",
    border: "1px solid #2a2018",
    borderRadius: 8,
    padding: "14px",
    marginBottom: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #2a2018",
    color: "#c9a96e",
    fontSize: 13,
    fontFamily: "'Jost', sans-serif",
    padding: "6px 0",
    outline: "none",
    width: "100%",
    letterSpacing: "0.04em",
  },
  saveBtn: {
    background: "rgba(166,124,82,0.2)",
    border: "1px solid #a67c52",
    borderRadius: 6,
    color: "#c9a96e",
    fontSize: 11,
    fontFamily: "'Jost', sans-serif",
    padding: "8px 16px",
    cursor: "pointer",
    letterSpacing: "0.1em",
    alignSelf: "flex-end",
  },
  profileList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  profileCard: (active, color) => ({
    border: `1px solid ${active ? color : "#2a2018"}`,
    borderRadius: 10,
    padding: "12px 14px",
    cursor: "pointer",
    background: active ? `${color}0a` : "transparent",
    transition: "all 0.2s",
  }),
  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  profileAvatar: (color) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `1px solid ${color}50`,
    background: `${color}15`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
    overflow: "hidden",
  }),
  profileAvatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
  },
  profileAvatarInitial: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16,
    color: "#c9a96e",
    fontWeight: 300,
  },
  profileAvatarUpload: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.6)",
    opacity: 0,
    cursor: "pointer",
    fontSize: 12,
    borderRadius: "50%",
    transition: "opacity 0.2s",
  },
  profileInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  profileName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 400,
    color: "#f0e6d8",
    letterSpacing: "0.02em",
  },
  profileRefTag: {
    fontSize: 10,
    color: "#7a9e87",
    letterSpacing: "0.06em",
  },
  profileActive: {
    fontSize: 9,
    letterSpacing: "0.15em",
    color: "#a67c52",
    border: "1px solid #a67c5240",
    borderRadius: 3,
    padding: "2px 7px",
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  profileDesc: {
    fontSize: 11,
    color: "#4a3a2a",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    fontFamily: "'Jost', sans-serif",
  },
  promptBox: {
    background: "#080705",
    border: "1px solid #2a2018",
    borderRadius: 8,
    padding: "14px 16px",
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    color: "#c9a96e",
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
    letterSpacing: "0.02em",
    marginBottom: 12,
    minHeight: 120,
  },
  promptTags: {
    display: "flex",
    gap: 6,
  },
  tag: (color) => ({
    fontSize: 10,
    letterSpacing: "0.08em",
    color: color,
    border: `1px solid ${color}40`,
    borderRadius: 3,
    padding: "2px 8px",
  }),
  copyBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #a67c52, #c9a96e)",
    border: "none",
    borderRadius: 8,
    color: "#0c0a08",
    fontSize: 12,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.16em",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "opacity 0.2s",
  },
  workflowCard: {
    background: "#0d0b09",
    border: "1px solid #1e1810",
    borderRadius: 12,
    padding: "18px 20px",
  },
  workflowSteps: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 14,
  },
  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  workflowNum: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(166,124,82,0.15)",
    border: "1px solid #a67c5240",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "#a67c52",
    fontWeight: 500,
    flexShrink: 0,
  },
  workflowText: {
    fontSize: 12,
    color: "#6b5a4a",
    letterSpacing: "0.02em",
    lineHeight: 1.4,
  },
};
