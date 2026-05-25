import { useState, useEffect } from "react";

const STORAGE_KEY = "elaris_ios_prompt_dismissed";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap";

// ─── Detection Helpers ────────────────────────────────────────────────────────
function detectIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function detectStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function detectSafari() {
  const ua = navigator.userAgent;
  // Safari on iOS: contains "Safari" but NOT "CriOS" (Chrome) or "FxiOS" (Firefox) or "OPiOS" (Opera)
  return (
    /safari/i.test(ua) &&
    !/crios/i.test(ua) &&
    !/fxios/i.test(ua) &&
    !/opiios/i.test(ua) &&
    !/edgios/i.test(ua)
  );
}

// ─── Share Icon (iOS native share icon, SVG) ──────────────────────────────────
function ShareIcon({ size = 20, color = "#c9a96e" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill={color} stroke="none" />
      {/* iOS-accurate share: box with up arrow */}
      <polyline points="16 3 12 3 12 15" />
      <polyline points="9 6 12 3 15 6" />
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

// The real iOS Share icon — arrow pointing up from a box
function IOSShareIcon({ size = 22 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + 8,
        height: size + 8,
        borderRadius: 7,
        background: "rgba(201,169,110,0.15)",
        border: "1px solid rgba(201,169,110,0.35)",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c9a96e"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="3" x2="12" y2="15" />
        <polyline points="8 7 12 3 16 7" />
        <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
      </svg>
    </span>
  );
}

function AddIcon({ size = 22 }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size + 8,
        height: size + 8,
        borderRadius: 7,
        background: "rgba(166,124,82,0.15)",
        border: "1px solid rgba(166,124,82,0.35)",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a67c52"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ElarisIOSInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // inject fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);

    const ios = detectIOS();
    const standalone = detectStandalone();
    const safari = detectSafari();
    const alreadyDismissed = localStorage.getItem(STORAGE_KEY);

    setIsIOS(ios);
    setIsSafari(safari);

    if (ios && !standalone && !alreadyDismissed) {
      // slight delay so page loads first
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => setAnimating(true), 30);
      }, 1400);
    }
  }, []);

  const handleDismiss = (permanent = false) => {
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 420);
    if (permanent) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  };

  // ── Demo mode: show in all browsers for preview purposes ──────────────────
  // Remove this block when integrating into the real app
  const [demoVisible, setDemoVisible] = useState(false);
  const [demoAnimating, setDemoAnimating] = useState(false);
  const showDemo = () => {
    setDemoVisible(true);
    setTimeout(() => setDemoAnimating(true), 30);
  };
  const hideDemo = (permanent) => {
    setDemoAnimating(false);
    setTimeout(() => setDemoVisible(false), 420);
    if (permanent) localStorage.setItem(STORAGE_KEY, "1");
  };

  const isOpen = demoVisible; // swap to `visible` in real integration
  const isIn = demoAnimating; // swap to `animating`
  const close = hideDemo;   // swap to `handleDismiss`
  const notSafari = !isSafari && isIOS;

  return (
    <div style={s.page}>
      <style>{`
        @import url('${FONT_URL}');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0a08; }
      `}</style>

      {/* ── Preview Page (remove in real app) ── */}
      <div style={s.previewPage}>
        <div style={s.previewInner}>
          <span style={s.eyebrow}>iOS INSTALL PROMPT</span>
          <h1 style={s.previewTitle}>Elaris</h1>
          <p style={s.previewSub}>Content Engine v2.0</p>
          <p style={s.previewHint}>
            On a real iOS device, this popup appears automatically after 1.4s.
          </p>
          <button onClick={showDemo} style={s.previewBtn}>
            Preview Install Prompt
          </button>
          <div style={s.previewDivider} />
          <div style={s.previewScenarios}>
            {[
              { label: "iOS + Safari", desc: "Full install guide shown" },
              { label: "iOS + Chrome/Firefox", desc: "Safari redirect notice shown" },
              { label: "Already installed", desc: "Popup never shown" },
              { label: "Dismissed before", desc: "Popup never shown again" },
            ].map((sc) => (
              <div key={sc.label} style={s.scenarioRow}>
                <span style={s.scenarioDot} />
                <div>
                  <span style={s.scenarioLabel}>{sc.label}</span>
                  <span style={s.scenarioDesc}> — {sc.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Overlay ── */}
      {isOpen && (
        <div
          onClick={() => close(false)}
          style={{
            ...s.overlay,
            opacity: isIn ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        />
      )}

      {/* ── Bottom Sheet ── */}
      {isOpen && (
        <div
          style={{
            ...s.sheet,
            transform: isIn ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Drag handle */}
          <div style={s.handle} />

          {/* Brand header */}
          <div style={s.sheetHeader}>
            <div style={s.brandMark}>
              <div style={s.brandIcon}>◈</div>
              <div>
                <div style={s.brandName}>Elaris</div>
                <div style={s.brandHandle}>@elaris.925</div>
              </div>
            </div>
            <button onClick={() => close(false)} style={s.closeBtn} aria-label="Close">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#4a3d30" strokeWidth={2} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div style={s.titleBlock}>
            <h2 style={s.title}>Add to Home Screen</h2>
            <p style={s.subtitle}>
              Install the Elaris Content Engine for instant access — no App Store needed.
            </p>
          </div>

          {/* ── NOT SAFARI WARNING ── */}
          {notSafari ? (
            <div style={s.safariWarn}>
              <div style={s.warnIcon}>⚠</div>
              <div>
                <div style={s.warnTitle}>Open in Safari first</div>
                <div style={s.warnText}>
                  iPhone only supports installation from Safari. Chrome and Firefox on iOS do not have this option.
                </div>
                <div style={s.warnStep}>
                  Copy this link and paste it in Safari:
                </div>
                <div style={s.warnUrl}>
                  houraiss.github.io/elaris-content-engine
                </div>
              </div>
            </div>
          ) : (
            /* ── INSTALL STEPS ── */
            <div style={s.steps}>
              {/* Step 1 */}
              <div style={s.step}>
                <div style={s.stepNumber}>1</div>
                <div style={s.stepContent}>
                  <div style={s.stepText}>
                    Tap the <strong style={s.em}>Share</strong> button at the bottom of Safari
                  </div>
                  <div style={s.stepVisual}>
                    <IOSShareIcon size={20} />
                    <span style={s.stepVisualLabel}>Share button</span>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div style={s.connector} />

              {/* Step 2 */}
              <div style={s.step}>
                <div style={s.stepNumber}>2</div>
                <div style={s.stepContent}>
                  <div style={s.stepText}>
                    Scroll down and tap{" "}
                    <strong style={s.em}>"Add to Home Screen"</strong>
                  </div>
                  <div style={s.stepVisual}>
                    <AddIcon size={20} />
                    <span style={s.stepVisualLabel}>Add to Home Screen</span>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div style={s.connector} />

              {/* Step 3 */}
              <div style={s.step}>
                <div style={s.stepNumber}>3</div>
                <div style={s.stepContent}>
                  <div style={s.stepText}>
                    Tap <strong style={s.em}>"Add"</strong> in the top-right corner to confirm
                  </div>
                  <div style={s.stepBadge}>
                    <span style={s.stepBadgeText}>✓ Installed on Home Screen</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={s.divider} />

          {/* Actions */}
          <div style={s.actions}>
            <button onClick={() => close(true)} style={s.dismissBtn}>
              Don't show again
            </button>
            <button onClick={() => close(false)} style={s.laterBtn}>
              Maybe later
            </button>
          </div>

          {/* Safe area spacer */}
          <div style={{ height: 16 }} />
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'Jost', sans-serif",
    background: "#0c0a08",
    minHeight: "100vh",
    position: "relative",
  },

  // ── Preview page ──
  previewPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 32,
  },
  previewInner: {
    maxWidth: 400,
    textAlign: "center",
  },
  eyebrow: {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.28em",
    color: "#a67c52",
    fontWeight: 500,
    marginBottom: 14,
  },
  previewTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 64,
    fontWeight: 300,
    color: "#f5e6d3",
    letterSpacing: "0.1em",
    lineHeight: 1,
    marginBottom: 8,
  },
  previewSub: {
    fontSize: 12,
    color: "#4a3d30",
    letterSpacing: "0.1em",
    marginBottom: 32,
  },
  previewHint: {
    fontSize: 12,
    color: "#3a2e24",
    lineHeight: 1.6,
    marginBottom: 24,
    padding: "12px 16px",
    background: "#131009",
    border: "1px solid #2a2018",
    borderRadius: 8,
  },
  previewBtn: {
    padding: "13px 32px",
    background: "linear-gradient(135deg, #a67c52, #c9a96e)",
    border: "none",
    borderRadius: 40,
    color: "#0c0a08",
    fontSize: 12,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    letterSpacing: "0.14em",
    cursor: "pointer",
    textTransform: "uppercase",
    marginBottom: 32,
  },
  previewDivider: {
    height: 1,
    background: "#1e1810",
    marginBottom: 24,
  },
  previewScenarios: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    textAlign: "left",
  },
  scenarioRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  scenarioDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#a67c52",
    marginTop: 6,
    flexShrink: 0,
  },
  scenarioLabel: {
    fontSize: 12,
    color: "#c9a96e",
    fontWeight: 500,
    letterSpacing: "0.04em",
  },
  scenarioDesc: {
    fontSize: 12,
    color: "#4a3d30",
  },

  // ── Overlay ──
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 100,
  },

  // ── Bottom sheet ──
  sheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 101,
    background: "#111009",
    borderTop: "1px solid #2a2018",
    borderRadius: "20px 20px 0 0",
    padding: "0 24px",
    boxShadow: "0 -20px 80px rgba(0,0,0,0.8), 0 -1px 0 rgba(201,169,110,0.08)",
    maxWidth: 520,
    margin: "0 auto",
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    background: "#2a2018",
    margin: "14px auto 0",
  },

  // Brand header
  sheetHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 0 0",
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "rgba(166,124,82,0.12)",
    border: "1px solid rgba(166,124,82,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "#c9a96e",
  },
  brandName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 18,
    fontWeight: 400,
    color: "#f0e6d8",
    letterSpacing: "0.06em",
    lineHeight: 1,
  },
  brandHandle: {
    fontSize: 11,
    color: "#4a3d30",
    letterSpacing: "0.06em",
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#1a1510",
    border: "1px solid #2a2018",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Title
  titleBlock: {
    padding: "20px 0 18px",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 30,
    fontWeight: 300,
    color: "#f5e6d3",
    letterSpacing: "0.01em",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#5a4a38",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    fontWeight: 300,
  },

  // Safari warning
  safariWarn: {
    display: "flex",
    gap: 14,
    background: "rgba(201,169,110,0.06)",
    border: "1px solid rgba(201,169,110,0.18)",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 20,
  },
  warnIcon: {
    fontSize: 18,
    color: "#c9a96e",
    flexShrink: 0,
    marginTop: 1,
  },
  warnTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#c9a96e",
    letterSpacing: "0.04em",
    marginBottom: 6,
  },
  warnText: {
    fontSize: 12,
    color: "#5a4a38",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  warnStep: {
    fontSize: 11,
    color: "#4a3d30",
    letterSpacing: "0.04em",
    marginBottom: 6,
  },
  warnUrl: {
    fontSize: 12,
    fontFamily: "'Jost', monospace",
    color: "#a67c52",
    background: "#0d0b09",
    border: "1px solid #2a2018",
    borderRadius: 6,
    padding: "8px 12px",
    letterSpacing: "0.02em",
  },

  // Steps
  steps: {
    padding: "4px 0 20px",
    display: "flex",
    flexDirection: "column",
  },
  step: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px solid rgba(166,124,82,0.4)",
    background: "rgba(166,124,82,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 500,
    color: "#a67c52",
    flexShrink: 0,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: "#c9b89a",
    lineHeight: 1.5,
    letterSpacing: "0.01em",
    fontWeight: 300,
    marginBottom: 10,
  },
  em: {
    fontWeight: 500,
    color: "#c9a96e",
    fontStyle: "normal",
  },
  stepVisual: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "#0d0b09",
    border: "1px solid #2a2018",
    borderRadius: 8,
    padding: "8px 12px",
  },
  stepVisualLabel: {
    fontSize: 12,
    color: "#6b5a4a",
    letterSpacing: "0.04em",
  },
  stepBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(122,158,135,0.1)",
    border: "1px solid rgba(122,158,135,0.25)",
    borderRadius: 6,
    padding: "7px 12px",
  },
  stepBadgeText: {
    fontSize: 12,
    color: "#7a9e87",
    letterSpacing: "0.05em",
  },
  connector: {
    width: 1,
    height: 16,
    background: "linear-gradient(to bottom, rgba(166,124,82,0.25), rgba(166,124,82,0.08))",
    marginLeft: 13,
    marginTop: 2,
    marginBottom: 2,
  },

  // Divider
  divider: {
    height: 1,
    background: "#1e1810",
    margin: "4px 0 18px",
  },

  // Actions
  actions: {
    display: "flex",
    gap: 10,
  },
  dismissBtn: {
    flex: 1,
    padding: "12px",
    background: "transparent",
    border: "1px solid #2a2018",
    borderRadius: 10,
    color: "#4a3d30",
    fontSize: 12,
    fontFamily: "'Jost', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.06em",
    transition: "all 0.18s",
  },
  laterBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #a67c52, #c9a96e)",
    border: "none",
    borderRadius: 10,
    color: "#0c0a08",
    fontSize: 12,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
};
