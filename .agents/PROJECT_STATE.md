# Elaris Content Engine — Global Project State

This file serves as the definitive source of truth for the project's current state, architecture, and history. **All AI models must read this file at the start of a conversation** to carry on from where the last one left off.

## 1. Project Overview
- **Name**: Elaris Content Engine v3.0 (@elaris.925)
- **Purpose**: An Instagram content studio designed for Elaris Jewelry Store. It transforms raw photos into branded, high-quality social media posts.
- **Tech Stack**: Vanilla HTML, CSS, JavaScript. No complex build steps or frameworks. It features a custom lightweight JS router (`app.js`) and PWA support via `sw.js` and `manifest.json`.

## 2. Core Modules
The application is structured into several core views:
- **Prompt Studio (`js/prompt-studio.js`)**: For generating AI prompts. Includes logic for "Archetypes", "Smart Guides", "Stones", and "Materials".
- **Motion Studio (`js/motion-studio.js`)**: Module for video/motion graphics generation.
- **Captions (`js/captions.js`)**: Generates branded captions and hashtag sets based on product type and brand voice (Luxury, Conversational, Storytelling).
- **Trends (`js/trends.js` or via `assets/trends.json`)**: Tracks current jewelry & design trends. Warns users if data is older than 30 days.
- **Batch Mode (`js/batch.js`)**: Handles bulk operations.
- **Watermark (`js/watermark.js`)**: For applying branded watermarks to images.
- **Generate (`js/generate.js`)**: Logic for content generation pipelines.
- **Export (`js/export.js`)**: Utilities for copying to clipboard, downloading files, etc.
- **Internationalization (`js/i18n.js`)**: Supports multiple languages (EN, FR, AR).

## 3. Important Architectural Rules & Patterns
- **Archetype Integration**: When adding a new archetype, it requires a version badge (e.g., "V3.0"), a calibrated Smart Guide (camera angle, framing), normalized stone/material labels (human-readable), and connection to dynamic camera/lighting.
- **UI/UX**: Uses a dark/light mode toggle. Uses PWA features for mobile compatibility.
- **Git Workflow**: The AI is instructed to automatically run `git add`, `git commit`, and `git push` at the end of every task to ensure no updates are lost between sessions.

## 4. Update Log
*Add an entry here every time you make a significant change, implement a new feature, or refactor architecture. Always include the date/time and a concise summary.*

- **2026-07-18**: Created `PROJECT_STATE.md` to serve as the global context file for all future AI agents. Updated `.agents/AGENTS.md` to mandate reading this file at startup.
- **2026-07-18**: Added 5 new Watch archetypes with a dedicated `WATCH` badge. Expanded `prompt-studio.js` with new watch-specific camera angles and lighting moods. Updated `guideDB` and `archetypeAngleBoost` to fully integrate watch logic, and added `.ps-watch-badge` styling to `styles.css`.
- **2026-07-18**: Fixed watch archetypes pipeline to ensure dynamic parameters (Brand identity, Model details) are injected into the prompt, and linked lighting options to the dynamic recommendations.
- **2026-07-18**: Fixed Watch category fallbacks so that placement rules, negative prompts, and hallmark instructions correctly refer to watches instead of silver rings. Updated score/ranking logic so Watch archetypes properly rank at the top when the Watch category is selected. Also linked watch archetypes to the UI lighting chips recommender.
- **2026-08-22**: Added **Jewelry Set** as a new 10th category (`'jewelry-set'`). Full implementation includes:
  - 4 new SET archetypes: `set-editorial-display`, `set-worn-collection`, `set-gift-presentation`, `set-detail-showcase`, each with 6 unique subjects, a rich scene, and fully calibrated compat scores.
  - Amber/rose-gold `.ps-set-badge` ("SET") displayed on archetype cards; `ps-arch-set` class added.
  - Sub-piece chip selector (`_renderSetComposition`, `_toggleSetPiece`) that appears when Jewelry Set is selected, letting the user choose Ring/Necklace/Earrings/Bracelet/Bangle.
  - Dynamic `_autoDescribe` that reads `state.setComposition` to list all pieces in the generated description.
  - `_buildPlacementInstruction` and `_buildCategoryNegatives` entries for `jewelry-set`.
  - Smart Guide (`guideDB`) entries for all 4 new archetypes.
  - `_getAnglesForCategory` and `_getLightingForCategory` rankings for `jewelry-set`.
  - `archetypeAngleBoost` and `archetypeLightingBoost` entries for 4 new archetypes.
  - `hallmarkMap` entry (engraved on ring band, necklace clasp, earring posts).
  - `set-worn-collection` added to `humanArchetypes` (uses model anatomy safety rules).
  - Category label normalized to "Jewelry Set" in the dropdown.
  - `catLabels` updated with `'jewelry-set': 'matching jewelry set'`.
  - Service worker cache bumped to `elaris-v34`.
  - All 70 existing archetype `compat` objects updated with `'jewelry-set': N` scores.
- **2026-08-23**: Fixed "Coming Soon" error on Prompt Studio load caused by a missing comma in the `HUMAN` set in `prompt-studio.js`. Cleaned corrupted object structures in `archetypeAngleBoost` and correctly wired `guideDB` Smart Guide entries for all SET archetypes. Added `set` and `jewelry-set` support to Caption Studio (`captions.js` descriptions and hashtags, `app.js` product type dropdown), added i18n keys for EN, FR, and AR, added router alias handling so `#set` and `#jewelry-set` route directly to Prompt Studio with category pre-selected, cache-busted script versions in `index.html`, and bumped service worker cache to `elaris-v35`.
- **2026-08-24 (Update 2)**: Refined **Prompt Studio Beta** according to user feedback:
  - Removed top "⚡ 1-Tap Presets" bar and cleaned up interface.
  - Built an interactive **70+ Archetype Liquid Glass Modal** with real-time search filtering, category tabs (Model, Product, Nature, Mood, Sets, Watches), and click-to-select with automatic carousel synchronization.
  - Restored all missing Deep Modifiers organized into 4 categorized tabs:
    - **Model & Hijabi**: Female/Male/No Model, 6 Skin Complexions, 7 Facial Expressions, 🧕 Hijabi toggle + 5 Wrap Styles.
    - **Camera & Light**: 35+ Lighting Moods, 9 Lens Profiles (85mm, 100mm Macro, 135mm, 50mm, 35mm, Anamorphic 40mm, Phase One IQ4), 30+ Shot Angles.
    - **Styling & Scene**: 14 Wardrobe Presets, 9 Curated Color Palettes, 13 Backdrop Surfaces, Jewelry Style multi-select chips.
    - **Brand & Details**: 925 Hallmark toggle, Brand Identity Touch with 4 placement options, and Micro-Realism elements (Pores, Veins/Freckles, Arm Hair, Wrinkles).
  - Enhanced **Smart Guide Live**: Dynamically displays calibrated Angle, Lighting, Camera, Compatibility score, and 3 actionable Director Photography Tips.
  - Integrated 7 Aspect Ratios: `1:1`, `4:5`, `9:16`, `16:9`, `2:3`, `3:4`, `21:9`.
  - Overhauled mobile responsiveness: 1-column responsive layout, touch-friendly scrolling, and floating 5-button iOS 26 capsule bottom dock.
  - Added `promptstudiobeta` to router valid routes in `js/app.js` enabling direct URL navigation.
- **2026-08-28**: **Studio Beta v2 — Full Responsive, Feature Parity & Design Overhaul**:
  - **`css/beta.css` → v2**: Complete responsive rewrite — 3-col grid collapses cleanly to 1-col on mobile (≤768px); aspect ratio bar wraps on narrow screens; modifier tabs scroll horizontally; mobile dock has iOS safe-area padding. Full light/dark mode contrast overhaul: chips, section titles, modal cards, toggle descriptions, score badges, and active states all readable in both themes. Added CSS vars `--psb-chip-bg/border/color`. History copy button always visible (opacity 0.55 base).
  - **`js/prompt-studio-beta.js` → v2**: Fixed critical expert drawer bug (flex-column caused all tabs to stack — now uses CSS class `.active` on `.psb-mod-content`). Added Jewelry Style multi-select chips (12 options). Added Variation Count 1–5 with partial UI update. Added Prompt Quality Level chips (Standard/Detailed/Ultra). Debounced modal search for mobile keyboard focus. Added `_renderModalGrid()` partial update. Enhanced prompt builder includes jewelry styles, wardrobe, quality prefix, and micro-realism. All 5 mobile dock buttons wired correctly.
  - **`index.html`**: `beta.css?v=2`, `prompt-studio-beta.js?v=2`.
- **2026-08-31**: **Studio Beta v4 — Bugfix & Polish Patch**:
  - **`js/prompt-studio-beta.js` → v4**: Removed critical corrupted duplicate code block at line 1260 (paste artifact from previous session that produced a malformed `_renderModal` tail). Fixed Expert dock mobile button to scroll the toggle element with `block:'nearest'` instead of the drawer itself, preventing full-page scroll jump.
  - **`css/beta.css` → v4**: Added missing styles for `.psb-modal-sort-bar`, `.psb-modal-sort-btn` (with active state using purple accent), and `.psb-modal-count` — making the V3 filter chip, A-Z sort button, and archetype count label in the Full Library modal fully visible and styled.
  - **`index.html`**: Bumped `beta.css?v=4`, `prompt-studio-beta.js?v=4`.
- **2026-08-31**: **Studio Beta v5 — Major Functionality Fixes**:
  - **`js/prompt-studio-beta.js` → v5**: Added `_inferCategory()` to derive archetype categories from ID (archetypes in prompt-studio.js lack a `.category` field) using `_HUMAN_IDS`, `_ORGANIC_IDS`, `_MOOD_IDS` Sets and watch-/set- prefixes. Fixed `_filterArchetypes()` to use inferred categories — all 6 modal filter tabs now work. Closed missing `</div>` for Camera tab content that caused Styling & Brand tabs to be blank. Removed Design Details textarea (unused by user). Added dynamic score badge coloring: green `#34d399` for ≥85%, gold `#fbbf24` for 75–84%, silver `#94a3b8` for <75%. Added V3/WATCH/SET type badges on carousel and modal cards. Removed dead `desc` input binding.
  - **`css/beta.css` → v5**: Added `.psb-arch-type-badge`, `.psb-badge-v3`, `.psb-badge-watch`, `.psb-badge-set` styles with light/dark mode support. Badges float at top-right of carousel cards.
  - **`index.html`**: Bumped `beta.css?v=5`, `prompt-studio-beta.js?v=5`.
- **2026-08-31**: **Studio Beta v6 — Scoring Rewrite & Smart Guide Fix**:
  - **`js/prompt-studio-beta.js` → v6**: Rewrote `_calculateArchetypeScore()` to read `arch.compat[category]` directly (real data: 25–95 range) instead of keyword matching starting at 75. Clamp changed to 25–99 for real visual spread. Fixed `_getGuideData()` to: (1) call `window.PromptStudio._getGuideDB()` as primary source (returns full data once `renderSmartGuide` runs); (2) fixed category-based fallback to use `_inferCategory()` instead of `arch.category` (always empty) — all 64+ uncovered archetypes now get correct category-specific tips.
  - **`js/prompt-studio.js` → v63**: Added `this.guideDB = guideDB` inside `renderSmartGuide()` to cache the full guide data (angle+lighting+camera+tips for all 70+ archetypes). Updated `_getGuideDB()` to return `this.guideDB` when available (full data), falling back to partial lighting-only data.
  - **`index.html`**: Bumped `prompt-studio.js?v=63`, `prompt-studio-beta.js?v=6`.
- **2026-09-03**: **Studio Beta v7 — Full Modifier Import & Smart Guide Apply Button**:
  - **`js/prompt-studio-beta.js` → v7**: Added 10 modifier getters pulling all modifiers from master PromptStudio (53 angles in 8 groups, 38 lighting moods in 5 categories, 9 camera profiles, 13 surfaces, 10 palettes, 10 wardrobe styles, 6 hijab styles, 3 brand touches, 6 ethnicities, 7 facial expressions). Rewrote all 4 modifier tab renders dynamically. Added `_getLabelForAngle/Lighting/Camera()` resolvers. Wired `#psb-apply-guide-btn` click to auto-apply recommended angle, lighting, and camera to dropdowns and open expert drawer.
  - **`js/prompt-studio.js` → v64**: Pre-initialized `PromptStudio.guideDB` on script load for cross-studio data access.
  - **`css/beta.css` → v6**: Added `.psb-guide-apply-btn` styling with gold border.
  - **`index.html`**: Bumped `prompt-studio.js?v=64`, `prompt-studio-beta.js?v=7`, `beta.css?v=6`.
- **2026-09-03**: **Studio Beta v8 — CSS Overhaul & Brand Tab JS Fix**:
  - **`js/prompt-studio-beta.js` → v8**: Fixed critical corruption in Brand tab template literal — removed `sb-slider">` text leak (corrupt paste artifact) and removed the entire duplicate brand-touch conditional block. Brand tab now cleanly renders: Hallmark toggle → Brand Identity toggle → conditional Brand Touch select → Micro-Realism chips.
  - **`css/beta.css` → v7**: Comprehensive CSS fixes: (1) 3-column grid explicit `grid-column` assignments for `psb-left/center/right-col` for reliable layout; (2) breakpoints refined — right col hides at `940px` not `1024px` so it shows at more desktop widths; (3) Smart Guide stats use CSS grid `auto 1fr` layout so labels and values align neatly; (4) `⚡ Apply Recommended Setup` button significantly more prominent (stronger gold border, box-shadow, bolder font); (5) `.psb-expert-toggle.active` alias added alongside `.open`.
  - **`sw.js`**: Bumped cache to `elaris-v36` to force all browsers to fetch fresh JS/CSS.
  - **`index.html`**: Bumped `beta.css?v=7`, `prompt-studio-beta.js?v=8`.

- **2026-09-04**: **Studio Beta v9 — Bug Fixes + Smart Guide Expansion + Camera Expansion**:
  - **Bug Fix — Aspect Ratio not reaching prompt**: Added `_AR_TO_FORMAT` map object. When aspect ratio chips clicked, now syncs both `state.aspectRatio` AND `state.format`. Also fixed `_buildSinglePrompt` to always convert via `_AR_TO_FORMAT[aspectRatio]` before passing to master `_buildPrompt()` (which reads `state.format`, not `state.aspectRatio`).
  - **Bug Fix — Lighting Mood filter broken**: Removed master `window.PromptStudio.lightingMoods` fallback from `_getLightingMoods()`. Master data lacks `.category` field required by filter chips. Beta always uses local categorized list.
  - **Camera Profiles expanded**: Added 6 new lenses: Nikon Z9 85mm f/1.8S, Fujifilm GFX 100S 110mm, Zeiss Otus 55mm APO, Tilt-Shift 90mm TS-E, Sigma 85mm f/1.4 Art, Voigtländer 75mm f/1.5. Camera dropdown now removes master data fallback too (consistent labeling).
  - **Smart Guide Live expanded**: Added `_V3_IDS` set mirroring master studio. Smart Guide now shows: V3.0 badge on archetypes, "Best For" field, "Scene Intelligence" section (Compatibility, Category, Piece Synergy), "Optimal Setup" section (Angle #1 & #2, Lighting #1 & #2, ⭐ Lens, Alt Lens, Depth of Field, ISO Range). Added `_getGuideDOF()` and `_getGuideISO()` helpers.
  - **Camera Lens dropdown**: ⭐ marks recommended lens, ✦ marks alt lens for the active archetype's guide data.
  - **Archetype Modal cards**: Added `bestFor` (yellow tag) and `desc` (description excerpt) to both modal card render locations.
  - **CSS additions** (`beta.css`): `.psb-guide-section-label`, `.psb-guide-bestfor`, `.psb-guide-v3-badge`, `.psb-guide-apply-btn` (full-width block).
  - **`sw.js`**: Bumped cache to `elaris-v37`.

