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
