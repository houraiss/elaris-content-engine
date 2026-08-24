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
- **2026-08-24**: Major iOS 26 CSS overhaul. Fixed critical bug where ~40 lines of mobile-only CSS rules were placed **outside** any `@media` block, causing them to apply globally and collapsing all desktop 3-column layouts to single-column. Fixed with a single-line comment replacing those orphaned rules. Additional changes: (1) Richer background color `#070918` deep navy-indigo with subtle radial gradient overlays; (2) Three animated glow orbs (gold, indigo/purple, green) with higher opacity and brighter colors so `backdrop-filter: blur()` is visually effective; (3) Reduced `glass-bg-card` opacity from 0.65 → 0.58 so the blur actually shows through; (4) Increased `backdrop-filter` blur from 28px → 36px + added `-webkit-backdrop-filter` to sidebar; (5) Added 10+ missing CSS classes: `.dock-action-btn`, `.dock-action-icon`, `.dock-tab-icon`, `.ps-preset-del`, `.btn-outline`, `.sidebar-footer`, `.theme-toggle-btn`, `.theme-icon`, `.theme-label`, `.lang-selector`, `.lang-select`, `.version-tag`, `.nav-label`; (6) Comprehensive light mode contrast audit — darkened `--text-secondary` to `#334155`, `--text-muted` to `#64748b`, added glass/card overrides, form field bg fix, button contrast fixes; (7) Added `option { background: #0d1028; color: #f8fafc }` to fix invisible dropdown options; (8) Service worker bumped to `elaris-v38`, CSS cache-busted to `v101`.

