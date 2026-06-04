# Elaris Content Engine — UI Merge Strategy
## Merging the Current App Shell with the New Components

**Document Type:** Integration Blueprint  
**Scope:** Visual design system merge — current app shell + Session 01/02 components  
**Prerequisite Reading:** `elaris-model-consistency-blueprint.md` · `elaris-blueprint-session-02.md`

---

## 1. The Merge Philosophy

This is not a redesign. It is a **targeted upgrade**.

The current app has the right structural foundation — sidebar layout, glow ambience, PWA infrastructure, brand logo, navigation system. None of that changes. What changes is the **inner content quality**: the typography system, the Prompt Studio panel, and two missing features that are already built and waiting.

The rule throughout this merge is:

> **Keep the shell. Upgrade the content. Touch nothing that works.**

Every decision in this document follows that rule.

---

## 2. What Gets Kept Exactly As-Is

These elements are correct and must not be modified:

| Element | Location | Why It Stays |
|---|---|---|
| Sidebar layout | `index.html` + `css/styles.css` | Right structure for a 9-section tool |
| Background glow ambience | `.bg-ambience`, `.glow-1`, `.glow-2` | Adds atmospheric depth to the dark background |
| Brand SVG logo | Inline in `index.html` sidebar | Pixel-perfect at all sizes, zero load overhead |
| Sidebar navigation | `index.html` nav section | Clean, functional, correct hierarchy |
| Language switcher (EN/FR/AR) | Sidebar bottom | i18n system is production-grade, keep untouched |
| Theme toggle (dark/light) | Sidebar bottom | Works correctly |
| PWA service worker | `sw.js` + registration script | Solid offline support |
| Android/PC install banner | Inline `<script>` in `index.html` | Works correctly — only needs iOS added |
| All JS module files | `js/*.js` | Logic is kept, only UI panels inside them change |
| `manifest.json` | Root | Correct, only minor icon fix needed |

---

## 3. What Changes and Why

### 3.1 Font Stack — The Highest-Impact Change

**Current:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400
  &family=Inter:wght@300;400;500;600;700
  &family=Montserrat:wght@300;400;600;700
  &family=Playfair+Display:wght@400;700
  &display=swap" rel="stylesheet">
```

**Replace with:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400
  &family=Jost:wght@200;300;400;500
  &family=DM+Mono:wght@300;400
  &display=swap" rel="stylesheet">
```

**Why this matters:**
Inter is a neutral utility font that signals "SaaS tool." Jost is slightly editorial and complements Cormorant Garamond without competing with it. This single swap elevates the entire app's brand feel — it stops reading as a generic dashboard and starts reading as a jewelry brand's creative tool. DM Mono is only used inside the prompt output box, not globally.

**Impact:** 4 font requests → 2 font requests. Faster load, more coherent brand voice.

---

### 3.2 CSS Variable Updates

In `css/styles.css`, update the font variables to match the new stack. Find the existing `:root` block and update the font family variables:

```css
:root {
  /* ── Typography — UPDATED ── */
  --font-display:    'Cormorant Garamond', Georgia, serif;
  --font-ui:         'Jost', system-ui, sans-serif;
  --font-mono:       'DM Mono', 'Courier New', monospace;
  --font-label:      'Jost', system-ui, sans-serif;

  /* ── All other existing variables stay exactly as-is ── */
}
```

Then do a find-and-replace across `css/styles.css`:
- Replace `font-family: 'Inter'` → `font-family: var(--font-ui)`
- Replace `font-family: 'Montserrat'` → `font-family: var(--font-ui)`
- Replace `font-family: 'Playfair Display'` → `font-family: var(--font-display)`

This preserves all existing sizing, weight, and spacing rules — only the typeface changes.

---

### 3.3 Cormorant Garamond — Expanded Usage

The current app loads Cormorant Garamond but uses it sparingly (mainly the logo area). Expand its use to:

| Element | Before | After |
|---|---|---|
| Page section titles (h2, h3) | Inter/Montserrat | Cormorant Garamond, weight 300 |
| Card/panel titles | Inter bold | Cormorant Garamond, weight 400 |
| Model profile names | — (not built yet) | Cormorant Garamond, weight 400 |
| Large numeric displays | Montserrat | Cormorant Garamond, weight 300 |
| Section eyebrow labels | Montserrat | Jost, weight 500, letter-spacing 0.2em |

The rule: **Cormorant Garamond for titles and display text. Jost for everything functional.** Never use Cormorant Garamond for body copy, buttons, or labels smaller than 14px.

---

## 4. Component Integration — File by File

### 4.1 `js/prompt-studio.js` — Primary Integration Target

This file contains the current Prompt Studio UI. The new `elaris-prompt-studio-expanded.jsx` replaces its UI rendering while keeping any existing event wiring and data handling logic.

**Integration approach:**

The expanded Prompt Studio is a React component (`elaris-prompt-studio-expanded.jsx`). Since the current app is vanilla JS, there are two integration paths:

**Path A — Vanilla JS Port (Recommended)**
Extract the data arrays and prompt builder logic from the JSX file into the existing vanilla JS module. Rebuild the UI rendering using the existing `innerHTML` / DOM patterns already in `prompt-studio.js`. This keeps the codebase consistent — no React dependency added.

What to extract and port:
```
ARCHETYPES array        → js/prompt-studio.js
JEWELRY array           → js/prompt-studio.js
ANGLES array            → js/prompt-studio.js
SCENES array            → js/prompt-studio.js
LIGHTING array          → js/prompt-studio.js
PALETTES array          → js/prompt-studio.js
RATIOS array            → js/prompt-studio.js
buildPrompt() function  → js/prompt-studio.js
```

The CSS for these new UI elements goes into a new section at the bottom of `css/styles.css`, namespaced under `.prompt-studio-expanded { }` to avoid conflicts with existing styles.

**Path B — React Island (If framework preferred)**
Add React via CDN, mount the JSX component into the `#promptstudio` page container. Simple but adds a runtime dependency. Only recommended if the team plans to migrate other sections to React.

---

### 4.2 `js/prompt-studio.js` — Model Consistency Panel

The Model Consistency feature (`elaris-model-consistency.jsx` from Session 01) is a sub-panel that lives **inside** the Prompt Studio section, not as a separate page.

Port the following into `js/prompt-studio.js`:
```
DEFAULT_PROFILES array      → model profile defaults
buildPrompt() mode logic    → already in expanded studio, merge
Profile card rendering      → DOM/innerHTML
Reference image upload      → FileReader logic
localStorage persistence    → save/load profiles on init
```

**localStorage schema for profiles:**
```javascript
// Key: 'elaris_model_profiles'
// Value: JSON array of profile objects
const defaultSchema = [
  {
    id: "lina",
    name: "Lina",
    descriptor: "Woman, 25, olive Mediterranean skin...",
    referenceImageBase64: null,  // base64 string or null
    color: "#c9a96e"
  }
]
```

On init, load from `localStorage.getItem('elaris_model_profiles')`. On save/update, write back. This makes profiles survive page refreshes without a backend.

---

### 4.3 `index.html` — iOS Install Prompt

Add the iOS detection and instruction popup. Since `elaris-ios-install-prompt.jsx` is a React component, port its logic to vanilla JS for consistency.

**Add this block** to the existing PWA `<script>` in `index.html`, directly after the existing `beforeinstallprompt` handler:

```javascript
// ── iOS Install Prompt ─────────────────────────────
(function() {
  const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                    || window.navigator.standalone === true;
  const isSafari     = /safari/i.test(navigator.userAgent)
                    && !/crios|fxios|opiios|edgios/i.test(navigator.userAgent);
  const dismissed    = localStorage.getItem('elaris_ios_prompt_dismissed');

  if (!isIOS || isStandalone || dismissed) return;

  setTimeout(() => {
    const sheet = document.createElement('div');
    sheet.id = 'ios-install-sheet';
    sheet.innerHTML = /* See full HTML template in elaris-ios-install-prompt.jsx */;
    document.body.appendChild(sheet);

    // Dismiss handlers
    document.getElementById('ios-later-btn').addEventListener('click', () => sheet.remove());
    document.getElementById('ios-never-btn').addEventListener('click', () => {
      localStorage.setItem('elaris_ios_prompt_dismissed', '1');
      sheet.remove();
    });
    document.getElementById('ios-overlay').addEventListener('click', () => sheet.remove());

    // Animate in
    requestAnimationFrame(() => sheet.classList.add('ios-sheet-open'));
  }, 1400);
})();
```

The full HTML for the sheet (with Safari vs. non-Safari branching) is in `elaris-ios-install-prompt.jsx` — copy the `sheet.innerHTML` from the component's render output.

Add the matching CSS (overlay, bottom-sheet, animation, step layout) to a new `/* iOS Install Prompt */` section in `css/styles.css`. Reference the gold color variables already in `:root` rather than hardcoding values.

---

### 4.4 `manifest.json` — Minor Fix

```json
{
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

And in `index.html`:
```html
<!-- Change this: -->
<link rel="apple-touch-icon" href="icons/icon-192.png">

<!-- To this: -->
<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180.png">
```

Generate `icon-180.png` using `generate-icons.py` before deploying.

---

### 4.5 PWA Script → `js/pwa.js` (Cleanup)

Extract the entire `<script>` PWA block from `index.html` into a new file `js/pwa.js`. Add a script reference in `index.html`:

```html
<!-- Replace the inline PWA script block with: -->
<script src="js/pwa.js?v=1"></script>
```

`js/pwa.js` then contains:
- Service worker registration
- `beforeinstallprompt` handler (Android/PC banner)
- iOS install prompt logic
- `appinstalled` handler
- `setLang()` function (currently also inline — move it here)

---

## 5. CSS Integration Guide

When adding new styles for the integrated components, follow these rules to avoid conflicts with the existing stylesheet:

**Namespace all new Prompt Studio styles:**
```css
/* ── PROMPT STUDIO EXPANDED ───────────────────────── */
.prompt-studio-expanded .ps-section-label { ... }
.prompt-studio-expanded .ps-archetype-card { ... }
.prompt-studio-expanded .ps-archetype-card.active { ... }
/* etc. */
```

**Namespace all Model Consistency styles:**
```css
/* ── MODEL CONSISTENCY PANEL ──────────────────────── */
.model-consistency-panel .mc-toggle { ... }
.model-consistency-panel .mc-profile-card { ... }
/* etc. */
```

**Namespace iOS prompt styles:**
```css
/* ── iOS INSTALL PROMPT ───────────────────────────── */
#ios-install-sheet { ... }
#ios-install-overlay { ... }
/* etc. */
```

**Use existing CSS variables everywhere.** Never hardcode brand colors in new CSS. Reference:
```css
/* Use these, already defined in :root */
var(--color-gold)           /* #a67c52 */
var(--color-gold-light)     /* #c9a96e */
var(--color-bg)             /* #0c0a08 */
var(--color-surface)        /* #131009 */
var(--color-border)         /* #2a2018 */
var(--color-text)           /* #f0e6d8 */
var(--color-muted)          /* #4a3d30 */
```

If these exact variable names don't exist yet in `styles.css`, add them to `:root` first and then replace any existing hardcoded hex values with the variables — this makes future theme changes trivial.

---

## 6. i18n — New Strings to Add

Every new UI string introduced by the integrated components needs to be added to the i18n system in `js/i18n.js`. The following keys need EN/FR/AR translations:

**Prompt Studio Expanded:**
```javascript
// Section labels
"ps_archetype":           { en: "Archetype",       fr: "Archétype",         ar: "النمط الإبداعي" },
"ps_jewelry_type":        { en: "Jewelry Type",     fr: "Type de bijou",     ar: "نوع المجوهرات" },
"ps_shots":               { en: "Jewelry Shots",    fr: "Photos du bijou",   ar: "صور المجوهرات" },
"ps_angle":               { en: "Camera Angle",     fr: "Angle de caméra",   ar: "زاوية الكاميرا" },
"ps_scene":               { en: "Scene",            fr: "Scène",             ar: "المشهد" },
"ps_lighting":            { en: "Lighting",         fr: "Éclairage",         ar: "الإضاءة" },
"ps_palette":             { en: "Color Palette",    fr: "Palette de couleurs", ar: "لوحة الألوان" },
"ps_ratio":               { en: "Aspect Ratio",     fr: "Format",            ar: "نسبة الصورة" },
"ps_notes":               { en: "Notes",            fr: "Notes",             ar: "ملاحظات" },
"ps_copy_prompt":         { en: "Copy Prompt →",    fr: "Copier le prompt →", ar: "نسخ البرومبت ←" },
"ps_copied":              { en: "✓ Prompt copied",  fr: "✓ Prompt copié",    ar: "✓ تم النسخ" },

// Mode labels
"ps_mode_test":           { en: "Test Mode",        fr: "Mode Test",         ar: "وضع الاختبار" },
"ps_mode_product":        { en: "Product Mode",     fr: "Mode Produit",      ar: "وضع المنتج" },
"ps_mode_full":           { en: "Full Mode",        fr: "Mode Complet",      ar: "الوضع الكامل" },
```

**Model Consistency:**
```javascript
"mc_title":               { en: "Model Consistency", fr: "Cohérence Modèle",  ar: "ثبات النموذج" },
"mc_hint":                { en: "Lock a virtual model across all shots", ... },
"mc_new_profile":         { en: "+ New Model",      fr: "+ Nouveau modèle",  ar: "+ نموذج جديد" },
"mc_save_profile":        { en: "Save Profile",     fr: "Enregistrer",       ar: "حفظ" },
"mc_active":              { en: "Active",           fr: "Actif",             ar: "نشط" },
"mc_ref_confirmed":       { en: "✓ Reference image", fr: "✓ Image référence", ar: "✓ صورة مرجعية" },
```

**iOS Install Prompt:**
```javascript
"ios_title":              { en: "Add to Home Screen", fr: "Ajouter à l'écran", ar: "أضف للشاشة الرئيسية" },
"ios_subtitle":           { en: "Install the Elaris Content Engine...", ... },
"ios_step1":              { en: "Tap the Share button at the bottom of Safari", ... },
"ios_step2":              { en: "Scroll down and tap \"Add to Home Screen\"", ... },
"ios_step3":              { en: "Tap \"Add\" to confirm", ... },
"ios_later":              { en: "Maybe later",      fr: "Plus tard",         ar: "لاحقاً" },
"ios_never":              { en: "Don't show again", fr: "Ne plus afficher",  ar: "لا تُظهر مجدداً" },
"ios_safari_warn_title":  { en: "Open in Safari first", ... },
```

The Arabic strings for the iOS prompt should be checked by a native speaker — auto-translation of UI instructions in AR can be awkward.

---

## 7. Integration Order — Step by Step

Do these in this exact order to avoid breaking the live app mid-merge:

```
Step 1 — Font swap in index.html (1 line change, lowest risk)
          ↓ Deploy and verify app still loads correctly

Step 2 — CSS variable update in styles.css
          ↓ Deploy and verify all existing sections still render correctly

Step 3 — Add icon-180.png, update apple-touch-icon in index.html
          ↓ Deploy

Step 4 — Extract PWA script to js/pwa.js
          ↓ Deploy and test: Android install banner still works?

Step 5 — Add iOS install prompt logic to js/pwa.js
          ↓ Deploy and test on a real iPhone in Safari

Step 6 — Port Prompt Studio Expanded UI into js/prompt-studio.js
          ↓ Deploy and test all 7 selectors + prompt generation

Step 7 — Port Model Consistency panel into js/prompt-studio.js
          ↓ Deploy and test: profile creation, image upload, prompt injection

Step 8 — Add all new i18n strings to js/i18n.js
          ↓ Deploy and verify EN/FR/AR all render correctly

Step 9 — Move server.py, generate-icons.py, update_i18n.js to /tools
          ↓ Deploy (repo cleanup, no functional impact)
```

Each step is independently deployable. If a step introduces a regression, it can be reverted without affecting the others.

---

## 8. Visual Design Merge — Before / After

### Typography

| Context | Before | After |
|---|---|---|
| Page section titles | `font-family: 'Montserrat'; font-weight: 600` | `font-family: 'Cormorant Garamond'; font-weight: 300; letter-spacing: -0.01em` |
| UI labels, nav items | `font-family: 'Inter'; font-weight: 500` | `font-family: 'Jost'; font-weight: 500; letter-spacing: 0.04em` |
| Body/description text | `font-family: 'Inter'; font-weight: 300` | `font-family: 'Jost'; font-weight: 300` |
| Prompt output box | (unknown/Inter) | `font-family: 'DM Mono'; font-size: 11px; line-height: 1.85` |
| Section eyebrow labels | (Montserrat uppercase) | `font-family: 'Jost'; font-size: 9px; letter-spacing: 0.22em; font-weight: 500` |

### Color Usage (No Changes)

The existing color palette is correct and stays as-is:
- Primary gold: `#a67c52`
- Light gold: `#c9a96e` (or `#c9a87c` as used in the banner)
- Dark background: `#0c0a08` / `#1a1510`
- Surface: `#131009` / `#1a1510`
- Borders: `rgba(166,124,82,0.4)` for active, `#2a2018` for inactive

The new components use the same values — no color changes needed.

### Existing Glow Ambience (Keep Exactly)

The `.glow-1` and `.glow-2` ambient background effects are a visual differentiator. My components don't have this — when integrated, they will inherit it from the app shell. No action needed.

---

## 9. What This Merge Produces

After all 9 steps are complete, the app will have:

**Structural (from current app — unchanged):**
- Sidebar navigation with all 9 sections
- Background glow ambience
- Brand SVG logo
- EN/FR/AR language switcher
- Dark/light theme toggle
- Service worker / offline support
- Android + PC install banner

**Upgraded (from new components):**
- Refined font system (Cormorant Garamond + Jost + DM Mono)
- Expanded Prompt Studio with 9 archetypes, 12 jewelry types, 8 angles, 18 scenes, 5 lighting moods, 8 palettes, 6 aspect ratios
- Model Consistency panel with named profiles, reference image upload, localStorage persistence
- iOS install prompt with Safari detection and step-by-step guide
- Correct apple-touch-icon (180×180)
- Modularized PWA logic in `js/pwa.js`
- All new strings in the i18n system

---

## 10. Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| Font swap | Low — visual only, no logic | Preview on staging before deploy |
| CSS variable update | Low — find-replace only | Check all existing sections after deploy |
| PWA script extraction | Medium — moves live code | Test Android install banner before and after |
| iOS prompt addition | Low — additive only | Test on real iPhone in Safari |
| Prompt Studio port | High — replaces live UI | Feature-flag behind URL param `?ps=v2` during testing |
| Model Consistency port | Medium — new feature, no regressions | Additive to existing prompt studio |
| i18n additions | Low — additive | Verify all 3 languages render new keys |

**Recommended:** Test the Prompt Studio port behind `?ps=v2` query parameter — show the old UI by default, new UI when the param is present — until fully validated, then flip the default.

---

*UI Merge Strategy — Elaris Content Engine · @elaris.925*  
*References: `elaris-model-consistency-blueprint.md` · `elaris-blueprint-session-02.md`*  
*Components: `elaris-prompt-studio-expanded.jsx` · `elaris-model-consistency.jsx` · `elaris-ios-install-prompt.jsx`*
