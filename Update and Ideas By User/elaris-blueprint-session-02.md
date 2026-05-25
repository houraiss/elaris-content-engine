# Elaris Content Engine — Session 02 Blueprint
## Follow-up to Session 01 · For AntiGravity

**Project:** @elaris.925 Instagram Content Studio  
**Session:** 02 — App Analysis, iOS PWA, Expanded Prompt Studio  
**Files Produced:** `elaris-ios-install-prompt.jsx` · `elaris-prompt-studio-expanded.jsx`  
**Continues From:** `elaris-model-consistency-blueprint.md` (Session 01)

---

## Preface — What AntiGravity Needs to Know

This document is a direct continuation of the Session 01 blueprint. If you haven't read that document, read it first — it covers the Model Consistency feature, the three-mode prompt system, and the full rationale for the Gemini multi-image workflow.

This session covers two things:

1. A **full audit of the live app** after the user pushed new updates, with a list of issues found and their prioritized solutions
2. Two new components built in this session: the **iOS Install Prompt** and the **Expanded Prompt Studio**

Both components are ready to integrate into the existing codebase at `https://github.com/houraiss/elaris-content-engine`.

---

## Part 1 — App Audit (Post-Update Analysis)

### 1.1 What Was Analyzed

The live app at `https://houraiss.github.io/elaris-content-engine/` and its GitHub repository were reviewed after the user pushed updates. The following was examined: `index.html`, `manifest.json`, the JS module structure, the CSS file, the repo root, and the folder layout.

### 1.2 Tech Stack Confirmed

The app is a **vanilla JavaScript SPA** with no framework — 13 separate JS modules, one CSS file, fully client-side, hosted on GitHub Pages. Language breakdown: 81.6% JS · 12.2% CSS · 4% HTML · 2.2% Python. There is no build step — all deployments are direct file pushes to the `main` branch.

### 1.3 Issues Found & Solutions Chosen

The following issues were identified during the audit. Each entry includes the problem, the impact, and the exact solution that was decided upon.

---

#### Issue 1 — iOS Install Prompt Missing
**Severity:** High  
**Location:** `index.html` / PWA layer

**Problem:**
The app already has a working PWA install popup for Android and PC/desktop — it catches the browser's native `beforeinstallprompt` event and shows a banner. However, Apple's iOS Safari deliberately does not fire this event. It never has. As a result, iPhone and iPad users receive no install guidance at all, even though the app is fully PWA-capable on iOS.

All the required Apple meta tags were already present in `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Elaris">
```
But without an instructional popup, users have no way of knowing they can install the app.

**Additional complication discovered:**
On iOS, the "Add to Home Screen" option only exists in **Safari**. Chrome for iOS, Firefox for iOS, and other browsers on iPhone do not expose this option. Users on those browsers need to be redirected to Safari before they can install.

**Solution chosen:**
Build a custom iOS install instruction popup that:
- Detects iOS via `navigator.userAgent`
- Detects whether the app is already running in standalone mode (already installed)
- Detects whether the user is in Safari or another browser
- If iOS + not installed + not previously dismissed: shows a bottom-sheet popup after a 1.4s delay
- If iOS + not Safari: shows an alternate panel instructing the user to switch to Safari first, with the URL ready to copy
- "Maybe later" dismisses for the session only; "Don't show again" writes to `localStorage` and never shows again

**File produced:** `elaris-ios-install-prompt.jsx`

---

#### Issue 2 — `apple-touch-icon` Wrong Size
**Severity:** Low  
**Location:** `index.html`

**Problem:**
The current declaration is:
```html
<link rel="apple-touch-icon" href="icons/icon-192.png">
```
Apple's home screen icon specification expects exactly **180×180px**. Using a 192px icon works but gets resampled by iOS, which can produce slightly soft edges on the home screen icon.

**Solution chosen:**
Generate a dedicated `icon-180.png` using the existing `generate-icons.py` utility already in the repo, then update the link tag to:
```html
<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180.png">
```
This is a 10-minute fix once the component is integrated.

---

#### Issue 3 — Font Stack Conflict
**Severity:** Medium  
**Location:** `css/styles.css` / `index.html` font imports

**Problem:**
Four font families are loaded: Cormorant Garamond, Inter, Montserrat, and Playfair Display. This creates two problems:

- **Performance:** Four separate Google Fonts requests on every page load — unnecessary latency
- **Brand conflict:** Inter and Montserrat are generic, clean sans-serifs that work against the luxury tone Cormorant Garamond establishes. The brand aesthetic is undermined when utility text renders in Inter rather than a font that complements the display face

**Solution chosen:**
Consolidate to two font families:
- **Cormorant Garamond** — display, titles, model names, decorative text
- **Jost** — UI labels, buttons, body, navigation
- **DM Mono** — generated prompt output (monospaced, technical)

This is the font stack used in both components built in Sessions 01 and 02. When integrating the new components, the existing CSS should be updated to match. This reduces font requests from 4 to 2 (DM Mono is only loaded where the prompt output renders, not globally).

---

#### Issue 4 — PWA Install Logic Is Inline in `index.html`
**Severity:** Low  
**Location:** `index.html`

**Problem:**
The Android/PC install banner logic — event listeners, `beforeinstallprompt` handler, DOM manipulation — is written directly as a `<script>` block inside `index.html`. Every other feature in the app is modularized into its own file under `js/`. This is inconsistent and makes the install logic harder to maintain alongside the new iOS component.

**Solution chosen:**
Move the existing install logic into a new file `js/pwa.js`. The iOS install component can be initialized from the same file. Both install paths (Android/PC native prompt + iOS custom popup) live in one dedicated module.

---

#### Issue 5 — Dev/Utility Files in Repo Root
**Severity:** Low  
**Location:** Repository root

**Problem:**
`server.py`, `generate-icons.py`, and `update_i18n.js` are developer utility scripts committed to the production branch root. They don't cause runtime issues, but they create visual noise in the repo and could confuse contributors.

**Solution chosen:**
Move all three to a `/tools` folder. Update any references in documentation or scripts accordingly. Optionally add them to `.gitignore` if they are environment-specific.

---

#### Issue 6 — `Prompt enhancer.txt` Not Wired Up
**Severity:** Medium  
**Location:** Repository root

**Problem:**
A file named `Prompt enhancer.txt` exists in the root of the repo. It appears to contain prompt enhancement patterns or instructions intended for use in the Prompt Studio. It is not referenced or parsed anywhere in the application code — it is effectively dead content sitting in the repo.

**Solution chosen:**
Two options were identified. The right choice depends on what the file contains:
- If it contains enhancement rules/patterns → parse it in `js/prompt-studio.js` and surface it as an "Enhance" pass button in the Prompt Studio output section
- If it is outdated → delete it to keep the repo clean

The user should review the file content and decide which path to take before integration.

---

#### Issue 7 — Model Consistency Not Yet Integrated
**Severity:** High (from Session 01)  
**Location:** `js/prompt-studio.js`

**Status:** Built in Session 01 (`elaris-model-consistency.jsx`), not yet integrated.  
This is a carry-forward from the previous session. See the Session 01 blueprint for full specification.

---

### 1.4 Repo Signals — Observations

These observations from the repo structure are relevant context for AntiGravity:

- **`output/rings` folder** — The user is already saving generated output to the repo, but there is no gallery UI in the app to surface these images. A `#gallery` section would be a natural next addition.
- **`references` folder** — This is the correct location to store model reference images for the Model Consistency feature. It already exists, meaning the user anticipated this need.
- **`Update and Ideas By User` folder** — The user maintains a feedback/ideas log inside the repo. Both Session 01 and Session 02 blueprints should be added here so all contributors have full context.
- **2 contributors on the repo** — Another person is involved. The blueprints exist specifically to ensure both contributors have the same understanding of design decisions.

---

## Part 2 — iOS Install Prompt

### 2.1 Component Overview

**File:** `elaris-ios-install-prompt.jsx`  
**Purpose:** Guide iOS users through the manual "Add to Home Screen" process since Apple does not support the native `beforeinstallprompt` API  
**Integration point:** `index.html` or new `js/pwa.js`, rendered globally alongside the existing Android/PC install banner

### 2.2 Detection Logic

The component runs four checks on mount:

```
Check 1: Is this an iOS device?
  → /iphone|ipad|ipod/i.test(navigator.userAgent)

Check 2: Is the app already installed (running standalone)?
  → window.matchMedia('(display-mode: standalone)').matches
    OR window.navigator.standalone === true

Check 3: Is the user in Safari (not Chrome/Firefox on iOS)?
  → /safari/i.test(ua) AND NOT /crios|fxios|opiios|edgios/i.test(ua)

Check 4: Has the user dismissed this before?
  → localStorage.getItem('elaris_ios_prompt_dismissed')
```

The popup shows **only if:** iOS confirmed + not already standalone + not previously permanently dismissed.

### 2.3 Two States

**State A — Safari detected (standard flow):**
Shows a 3-step install guide with:
- Step 1: Tap the Share button (⬆) at the bottom of Safari — with a visual icon replica
- Step 2: Scroll down and tap "Add to Home Screen" — with an icon visual
- Step 3: Tap "Add" to confirm — with a success badge

**State B — Non-Safari browser detected (redirect flow):**
Shows an alternate panel explaining that Chrome/Firefox on iOS do not support installation, with the site URL displayed for easy copying into Safari.

### 2.4 Dismissal Behavior

| Action | Behavior |
|---|---|
| Tap overlay / close X | Dismisses for session only. Reappears on next visit. |
| "Maybe later" button | Same as above — session dismiss only |
| "Don't show again" | Writes `elaris_ios_prompt_dismissed = 1` to `localStorage`. Never shows again. |
| Already installed (standalone) | Popup never renders at all |

### 2.5 Timing

The popup appears after a **1.4-second delay** on page load. This was chosen intentionally — if the popup fires immediately on load, it competes with the page rendering and feels aggressive. 1.4s allows the user to see the app first, then receive the install prompt.

### 2.6 Integration Instructions

The component ships with a demo mode active (for previewing in any browser). To switch to production mode, find these three lines near the bottom and follow the inline comments:

```js
// DEMO MODE (remove for production):
const isOpen = demoVisible;   // → change to: visible
const isIn   = demoAnimating; // → change to: animating
const close  = hideDemo;      // → change to: handleDismiss
```

Once those three variables are swapped, the component runs on real iOS detection only.

---

## Part 3 — Expanded Prompt Studio

### 3.1 Why the Expansion Was Done

The original Prompt Studio had a small set of fixed options: 5 jewelry types, 6 scenes, no camera angle control, no color palette, no aspect ratio, no archetype system. As a creative tool for a jewelry brand generating multiple posts per week across different moods and product categories, this was too limited. The user needed a broader vocabulary of creative options that would produce genuinely different prompts for different content intents.

The expansion was also motivated by a specific gap: without an archetype system, all generated prompts defaulted to the same editorial tone regardless of what the user was actually trying to create. A Ramadan occasion post, a raw craftsmanship close-up, and a rooftop lifestyle shot should each produce fundamentally different prompts — not just swap a scene word.

**File:** `elaris-prompt-studio-expanded.jsx`

---

### 3.2 Section 01 — Archetypes (New)

Nine archetypes were defined. The archetype is the **primary creative anchor** — it rewires the entire prompt's language, tone, and intent. It is the first selector in the UI for this reason.

| Archetype | Core Intent | Key Prompt Language |
|---|---|---|
| Editorial | High-fashion magazine, dramatic staging | "magazine-quality staging, dramatic and aspirational, strong visual narrative" |
| Campaign | Brand hero shot, identity statement | "brand campaign photography, hero shot, powerful brand statement" |
| Lifestyle | Authentic everyday luxury, natural moment | "authentic everyday luxury, candid natural moment, genuine emotion" |
| Detail | Artisan close-up, craftsmanship focus | "extreme close-up, artisan precision, macro texture, jeweler's eye" |
| Cultural | Moroccan heritage, ornate architecture | "Moroccan and North African aesthetics, ornate architecture, geometric patterns" |
| Occasion | Eid, wedding, celebration | "festive and joyful energy, special event context, Eid or bridal context" |
| Street | Urban candid, fashion-forward | "urban street photography, candid city energy, architectural backdrop" |
| Boudoir | Intimate, soft morning light | "soft morning light, quiet and personal luxury, private moment of beauty" |
| Botanical | Florals, organic garden, ethereal | "organic natural setting, ethereal soft light, florals and greenery" |

**Why 9?** This number covers the full realistic range of content @elaris.925 would produce across a year: campaigns, launches, seasonal occasions (Eid, wedding season), editorial content, and everyday lifestyle. The Cultural and Occasion archetypes are specifically chosen for the brand's North African audience.

---

### 3.3 Section 02 — Jewelry Types (Expanded from 5 to 12)

Previously the app had 5 generic jewelry categories. These were expanded to 12 specific types, grouped by wear location. The significance of this expansion is that each type carries a **camera focus instruction** that gets injected directly into the prompt — meaning the AI knows where to aim the shot.

| Group | Types | Camera Focus Injected |
|---|---|---|
| Earrings | Studs, Hoops, Drop/Dangle | Ear lobes / jaw line / neck length |
| Necklace | Pendant, Choker, Layered Chain | Décolletage / throat / full neckline |
| Wrist | Bracelet, Bangle/Cuff | Wrist and hand / wrist bone and forearm |
| Ring | Solitaire, Stacked Rings | Finger elegance / multiple fingers |
| Ankle | Anklet | Ankle and bare foot |
| Set | Full Set | Full upper body |

This granularity matters because "earrings" is too broad — a stud earring requires a tight macro close-up on the ear lobe, while a drop earring wants length and movement captured along the neck. These are fundamentally different shots.

---

### 3.4 Section 03 — Jewelry Shots (Unchanged Logic, Carried Forward)

The shot count selector (None / 1 / 2 / 3 / 4+) from Session 01 is preserved with the same three-mode logic:
- **0 shots → Test Mode** — pure text prompt, no image references
- **1–4+ shots, no model → Product Mode** — jewelry labeling only
- **1–4+ shots + model on → Full Mode** — jewelry + model reference labeling

See Session 01 blueprint, Section 6 for full mode specification.

---

### 3.5 Section 04 — Camera Angles (New, 8 Options)

Camera angle was entirely absent from the original Prompt Studio. It was added because the camera angle fundamentally changes the character of a shot — not just its composition, but the emotion it conveys and the jewelry detail it emphasizes.

| Angle | Description | Best For |
|---|---|---|
| Frontal | Direct, straight-on | Symmetric pieces, face-forward statements |
| 3/4 Turn | Classic three-quarter profile | Universal flattering, most editorial shots |
| Side Profile | Pure architectural profile line | Earrings, geometric pieces, structural shots |
| Overhead | Looking down from above | Rings, flat-lay energy, overhead lifestyle |
| Glance Down | Model eyes downward | Intimate mood, pendant focus, boudoir content |
| Macro | Extreme close-up | Detail archetype, craftsmanship shots |
| From Behind | Nape of neck, back of piece | Necklace clasps, ear backs, mystery and intrigue |
| Mirror | Reflection in mirror or surface | Boudoir, boutique, self-discovery narrative |

---

### 3.6 Section 05 — Scenes (Expanded from 6 to 18)

Scenes were reorganized into 4 groups and expanded from 6 to 18. The expansion was driven by two specific needs: the Moroccan cultural context of the brand (Riad, Hammam, Souk, Atlas Mountains were all added), and the need to distinguish indoor studio setups from each other (plain white vs. dark vs. marble surface produce very different visual languages).

| Group | Scenes Added |
|---|---|
| Studio | White, Dark, Marble Surface |
| Outdoor | Golden Hour, Rooftop, Beach/Coast, Garden, Desert/Dunes, Atlas Mountains |
| Interior | Café, Boutique, Riad Courtyard, Hammam, Boudoir, Art Gallery |
| Event | Evening Gala, Souk/Market, Wedding |

**Why Moroccan-specific scenes?** The brand is based in Agadir, Morocco and targets a North African/Middle Eastern audience. Riad, Hammam, Souk, and Atlas Mountains are culturally resonant settings that competitors using generic Western AI tools cannot easily replicate. This is a differentiation advantage specific to @elaris.925.

---

### 3.7 Section 06 — Lighting Moods (New, 5 Options)

Lighting was not previously controllable. Five moods were defined that cover the realistic range of @elaris.925 content:

| Mood | Prompt Language Injected |
|---|---|
| Golden Hour | Warm diffused sunlight, magical soft side-lighting, long shadow warmth |
| Studio Soft | Clean even exposure, no harsh shadows, controlled professional light |
| Hard Drama | Strong directional light, deep shadows, bold contrast, sculptural form |
| Natural Window | Soft diffused daylight, airy and bright, clean natural exposure |
| Night/Candle | Warm intimate glow, soft darkness, atmospheric night warmth |

---

### 3.8 Section 07 — Color Palettes (New, 8 Options)

Color palette was not previously addressable in prompts. Eight palettes were defined, each producing a specific set of color direction words injected into the prompt.

| Palette | Swatches | Best Archetype Pairings |
|---|---|---|
| Warm Gold | Cream → Amber → Honey | Editorial, Campaign, Occasion |
| Cool Silver | Ice White → Pale Gray → Silver | Editorial, Studio shots |
| Moody Dark | Plum → Burgundy → Deep Forest | Boudoir, Night/Gala |
| Earthy Neutral | Terracotta → Sand → Warm Beige | Cultural, Lifestyle, Outdoor |
| Blush Romantic | Dusty Rose → Mauve → Soft Pink | Occasion, Wedding, Botanical |
| Noir Contrast | Black → White → Gold accent only | Campaign, Editorial, Urban |
| Mediterranean | Azure → Cobalt → Sandy White | Beach, Outdoor, Lifestyle |
| Emerald Luxe | Forest Green → Moss → Gold | Editorial, Boutique |

---

### 3.9 Section 08 — Aspect Ratios (New, 6 Options)

Aspect ratio control was entirely absent from the original tool. This was a significant gap — generating a prompt without specifying a ratio means the AI produces a default square or landscape image that may not be usable for the intended placement.

Six ratios were added with visual proportion previews and platform context:

| Ratio | Dimensions | Platform Use |
|---|---|---|
| 1:1 | 1080 × 1080 | Feed classic |
| 4:5 | 1080 × 1350 | Feed optimised (most Instagram reach) |
| 9:16 | 1080 × 1920 | Stories and Reels |
| 2:3 | 1000 × 1500 | Pinterest |
| 3:4 | 1080 × 1440 | General portrait |
| 16:9 | 1920 × 1080 | Cover image / header |

The selected ratio is injected at the end of every generated prompt as: `Format: [dims] ([ratio] — [sub], optimised for [use]).`

---

### 3.10 The Prompt Output Structure

The Expanded Prompt Studio produces a structured output in four labeled blocks:

```
IMAGE REFERENCES:       ← Only when shots > 0; full image labeling from Session 01
[image role assignments]

ARCHETYPE: [NAME]       ← Archetype prompt language
[archetype description]

SUBJECT:                ← Model + jewelry + camera angle + focus area
[subject block]

SCENE & ENVIRONMENT:    ← Scene description
[scene block]

MOOD & LIGHT:           ← Lighting mood prompt
[lighting block]

COLOR DIRECTION:        ← Palette prompt
[color block]

BRAND DIRECTION:        ← @elaris.925 identity line + aspect ratio
[brand + format block]

CREATIVE NOTES:         ← Only when custom notes are filled
[user notes]
```

This structure ensures Gemini / Nano Banana processes context in a logical order — image roles first, then creative direction, then technical specifications.

---

## Part 4 — Integration Checklist for AntiGravity

This is the ordered list of everything that needs to happen to bring both sessions' work fully into the live app.

### Immediate (Built, Ready to Drop In)

- [ ] **Integrate `elaris-ios-install-prompt.jsx`** into `index.html` or new `js/pwa.js` — swap the 3 demo variables to production mode
- [ ] **Integrate `elaris-model-consistency.jsx`** (Session 01) into `js/prompt-studio.js`
- [ ] **Integrate `elaris-prompt-studio-expanded.jsx`** into `js/prompt-studio.js` — this replaces or extends the current Prompt Studio UI
- [ ] **Generate `icon-180.png`** using `generate-icons.py` and update the `apple-touch-icon` link tag

### Short-Term Cleanup

- [ ] **Consolidate fonts** — remove Inter and Montserrat, standardize on Cormorant Garamond + Jost + DM Mono
- [ ] **Move `js/pwa.js`** — extract inline PWA install logic from `index.html`
- [ ] **Move dev tools** — relocate `server.py`, `generate-icons.py`, `update_i18n.js` to `/tools`
- [ ] **Review `Prompt enhancer.txt`** — decide: wire up as an enhance pass, or delete
- [ ] **Copy both blueprints** to `Update and Ideas By User` folder in the repo

### Multilingual (Deferred)

- [ ] **Pass all new UI strings through the i18n system** — all new labels in the expanded Prompt Studio need EN/FR/AR translations added to the translation files

### Persistence (Deferred)

- [ ] **Persist Model Profiles** — currently session-only React state; add `localStorage` persistence so saved profiles survive page refreshes

---

## Part 5 — Feature Roadmap (Carried Forward)

These features were identified during the audit as high-value additions not yet built. Ordered by priority:

**Priority 1 — High Impact, Low Effort**

| Feature | Location | Rationale |
|---|---|---|
| Prompt History | Prompt Studio | Save last 20 prompts to localStorage. One-tap restore. Highest daily workflow impact. |
| Quick Open in Gemini | Prompt Studio output | Button that launches `gemini.google.com` after copying prompt. Saves time every session. |
| Output Gallery | New `#gallery` section | `output/rings` folder already exists. Surface saved images in a browsable grid. |

**Priority 2 — Medium Effort, Strategic**

| Feature | Location | Rationale |
|---|---|---|
| Hashtag Generator | Alongside `#captions` | Auto-generates 10–30 hashtags per jewelry type and season. Currently a gap. |
| Model Library Tab | Inside Model Consistency | Visual grid of saved reference images — pick your model visually, not by name |
| Prompt Variants | Prompt Studio | Generate 3 tonal variations of the same prompt (Safe / Bold / Editorial) for A/B testing |

**Priority 3 — Larger Features**

| Feature | Rationale |
|---|---|
| Content Calendar | Plan and visualize upcoming post slots. Prevents feed imbalance (too many ring posts, etc.) |
| Feed Preview Grid | Mock the Instagram 3×N grid with generated images before posting |
| Batch Prompt Mode | Tie into existing `batch.js` — generate 10 prompts for 10 pieces in one session |

---

## Summary — What Was Done in Session 02

| Item | Status |
|---|---|
| Full app audit post-update | ✅ Complete |
| 7 issues identified and prioritized | ✅ Complete |
| iOS Install Prompt built | ✅ `elaris-ios-install-prompt.jsx` |
| Expanded Prompt Studio built | ✅ `elaris-prompt-studio-expanded.jsx` |
| 9 archetypes defined | ✅ |
| 12 jewelry types (grouped) | ✅ |
| 8 camera angles | ✅ |
| 18 scenes across 4 groups | ✅ |
| 5 lighting moods | ✅ |
| 8 color palettes with swatches | ✅ |
| 6 aspect ratios with previews | ✅ |
| Integration checklist written | ✅ |
| Feature roadmap updated | ✅ |

---

*Session 02 Blueprint — Elaris Content Engine · @elaris.925*  
*Continues from: `elaris-model-consistency-blueprint.md` (Session 01)*  
*Files produced: `elaris-ios-install-prompt.jsx` · `elaris-prompt-studio-expanded.jsx`*
