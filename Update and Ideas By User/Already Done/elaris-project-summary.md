# 🪙 Elaris Content Engine — Project Build Summary

> **Session Period:** May 2026 (ongoing)
> **Repository:** [github.com/houraiss/elaris-content-engine](https://github.com/houraiss/elaris-content-engine)
> **Stack:** Vanilla HTML / CSS / JavaScript — PWA (Service Worker) — i18n (EN / FR / AR)
> **Current Cache Version:** `elaris-v25`

---

## 📋 Project Overview

The **Elaris Content Engine** is a Progressive Web App (PWA) built as an internal creative tool for Elaris Jewelry — a high-end Moroccan silver jewelry brand. Its purpose is to help the brand generate AI-ready image prompts, Instagram captions, watermarked imagery, and batch content for use with tools like Midjourney, Leonardo, and Gemini.

The app runs entirely in the browser with no backend dependency and works fully offline after first load.

---

## ✅ Completed Work

### 1. Foundation & Architecture
- **Initial commit** with core HTML/CSS/JS structure and PWA manifest
- **Service Worker (`sw.js`)** with versioned caching for offline functionality (bumped through v25 over the session)
- **`.gitignore`** configured and GitHub remote connected
- Full **Vanilla JS** architecture enforced after early mistakes with React-like patterns were reverted

### 2. Branding & Logo System
- **Favicon / App Icon** locked to files in `elaris-content-engine/icons/` — never changed again
- **Dual logo system** implemented:
  - Dark Mode → `Elaris Lite (White).svg` (white version)
  - Light Mode → `Elaris Lite (Black).svg` (black version)
- Logo swap is controlled via CSS selectors `[data-theme="dark"] .dark-mode-logo` and `[data-theme="light"] .light-mode-logo`
- Fixed a bug where the logo was always showing the dark version due to a mismatched class selector (was `.light-mode` on `<body>`, corrected to `[data-theme="light"]` on `<html>`)

### 3. Internationalization (i18n)
- Full trilingual support: **English**, **French**, **Arabic**
- All UI labels, section headers, chip labels, archetype names, taglines, modifiers, and prompt builder strings fully translated in `js/i18n.js`
- Fixed corrupted Arabic UTF-8 encoding
- Fixed bug where newly added items displayed raw `ps_` key names instead of translated text — caused by missing keys in all three language dictionaries

### 4. Prompt Studio (Core Feature)
The Prompt Studio is the flagship feature. It is a **single unified mode** (Classic Prompt Studio) — an earlier mistake of splitting it into "Classic" and "Expanded" modes was fully reverted. Everything is in one place.

#### Archetype Engine — 28 Total Archetypes
All archetypes include: name, icon, tagline, bestFor note, description, an array of subjects (scene variations), a scene template string, and a compatibility score map per jewelry category.

| # | Archetype | Icon |
|---|-----------|------|
| 1 | Body Intimate | 👤 |
| 2 | Object Pairing | 🍋 |
| 3 | Editorial Model | 📸 |
| 4 | Surreal Animal | 🐍 |
| 5 | Gradient Product | 🎨 |
| 6 | B&W Dramatic | 🎹 |
| 7 | Shadow Play | 🏜️ |
| 8 | Bold Typography | 🔠 |
| 9 | Collection Showcase | 💎 |
| 10 | Macro Detail | 🔍 |
| 11 | Wet Element | 💧 |
| 12 | Architectural Context | 🏛️ |
| 13 | Flat Lay Composition | 🎍 |
| 14 | Motion & Flow | 💨 |
| 15 | Cinematic Portrait | 🎬 |
| 16 | Mirror & Reflection | 🪞 |
| 17 | Texture Contrast | 🪨 |
| 18 | Celestial & Mythic | 🌙 |
| 19 | Seasonal & Holiday | 🎁 |
| 20 | Lifestyle Moment | ☕ |
| 21 | Nature & Botanical | 🌿 |
| 22 | Heritage & Moroccan | 🕌 |
| 23 | Minimalist & Space | 🧊 |
| 24 | Desert Mirage *(new)* | 🐫 |
| 25 | Neon Cyberpunk *(new)* | 🌃 |
| 26 | Vintage Nostalgia *(new)* | 🎞️ |
| 27 | Zero Gravity *(new)* | 🌌 |
| 28 | Royal Opulence *(new)* | 👑 |

#### Modifiers / Advanced Controls — Current State
| Modifier | Options |
|----------|---------|
| **Moods** | Dramatic, Soft & Romantic, Warm & Inviting, Cool & Modern, Surreal & Dreamy, Editorial & Sharp, Mystical & Dark, Candid & Lifestyle, Avant-Garde & High Fashion |
| **Lighting Styles** | Golden Hour, Studio, Natural Daylight, Dramatic Shadows, Backlit / Rim Light, Soft Diffused, Hard Flash / Paparazzi, Dappled Sunlight |
| **Output Formats** | 1:1 Post, 4:5 Portrait, 9:16 Story, 16:9 Wide, 2:3 Pinterest, 3:4 Portrait |
| **Camera Angles** | Eye Level, Overhead, Low Angle (Hero), Dutch Angle, Macro Close-up, Over the Shoulder, 45° Three-Quarter, Side Profile, Glance Down, From Behind (Nape) |
| **Surfaces** | Default, Marble, Velvet, Sand, Concrete, Water, Silk, Skin/Body, Stone Wall, Raw Wood, Terracotta/Zellige, Mirrored Glass, Satin Fabric |
| **Color Palettes** | Neutral Beige, Warm Earth, Cool Steel |

### 5. Icon & Theme Compatibility Fix
- Several archetype icons were **invisible in light mode** because they were pure black/monochrome emojis rendered on dark backgrounds
- **Fix 1:** Replaced invisible emojis with universally visible colored alternatives (e.g. `🖤 → 👤`, `🌑 → 🎹`, `✦ → 🔠`, `◻️ → 🧊`)
- **Fix 2:** Replaced hardcoded `background:${a.color}` inline style with a CSS variable `--arch-color` on each icon `div`
- **Fix 3:** Added CSS rule `[data-theme="light"] .ps-arch-icon` to override icon backgrounds to clean white card with border in light mode — adapts automatically on theme switch
- Cleaned up a duplicate `.ps-arch-icon` CSS rule that was accidentally created during the fix

### 6. Other Modules
| Module | File | Status |
|--------|------|--------|
| Caption Studio | `captions.js` | ✅ Complete |
| Watermark Studio | `watermark.js` | ✅ Complete |
| Batch Mode | `batch.js` | ✅ Built (UI complete, "coming soon" note) |
| AI Generation | `generate.js` | ✅ Free AI generation tab |
| Image Enhance | `enhance.js` | ✅ Complete |
| Gallery | `gallery.js` | ✅ Complete |
| Model Consistency | (in prompt studio) | ✅ Model profiles (Lina, Sara) |
| PWA / Offline | `sw.js` + `pwa.js` | ✅ Fully offline capable |

---

## 🔑 Key Decisions Made

1. **Vanilla JS only** — No React, no Vue, no external framework. The app was reverted early on when React-like code caused incompatibility and slowed the app.
2. **Single Prompt Studio** — Only one mode (Classic). The split into Classic/Expanded was rejected and unified back.
3. **Logo policy** — Always use icons from `elaris-content-engine/icons/`. The `Elaris Jewelry Logo` folder holds the two display variants (white for dark mode, black for light mode).
4. **Theme system** — Themes are applied via `data-theme` attribute on the `<html>` element, NOT via class names on `<body>`.
5. **i18n-first approach** — All user-facing labels must have keys in all three language dictionaries (EN, FR, AR) to avoid displaying raw key names.
6. **Service Worker cache versioning** — Every deployment that changes JS/CSS must bump the `CACHE_NAME` version in `sw.js` to force clients to reload the new assets.

---

## ⚠️ Known Issues / Bugs Fixed This Session

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| Wrong logo in light mode | CSS used `.light-mode` class on `<body>` but app uses `data-theme` on `<html>` | Updated selectors to `[data-theme="light"]` and `[data-theme="dark"]` |
| Raw `ps_` keys shown in UI | New i18n keys were added to the JS arrays but not to the i18n dictionary | Added all new keys to EN, FR, AR dictionaries |
| Invisible archetype icons in light mode | Pure monochrome emojis (black/white) invisible against same-colored bg | Replaced emojis + adaptive CSS background per theme |
| Duplicate `.ps-arch-icon` CSS rule | Tool error during edit left two conflicting declarations | Merged into one clean declaration |
| Logo overlap bug in sidebar | Incorrect z-index / positioning logic | Fixed CSS positioning |

---

## 📌 Pending / Next Steps

### High Priority
- [ ] **Verify light mode icon fix** in production — user has not yet confirmed the `v24`/`v25` push rendered correctly in their browser after hard refresh
- [ ] **Verify all 5 new archetypes** (Desert Mirage, Neon Cyberpunk, Vintage Nostalgia, Zero Gravity, Royal Opulence) render with proper names and tags (not raw i18n keys)

### Potential Enhancements Discussed
- [ ] **More Backgrounds** — Specific gradient/solid backdrop options (black, cream, jewel tones) as a direct modifier
- [ ] **Jewelry Styles** — Add a "Style" modifier (Bohemian, Minimalist, Art Deco, Berber Traditional, etc.) to the prompt builder
- [ ] **Prompt History** — Persist generated prompts to localStorage so they survive page refresh
- [ ] **Batch Mode** — Currently marked "coming soon"; full implementation of generating multiple prompt variations at once
- [ ] **Color Grade presets** — Add cinematic color grading options (Teal-Orange, Film Noir, Golden, Cool Muted) as a modifier
- [ ] **Prompt Export** — Export all generated prompts to a `.txt` or `.csv` file in one click

### Long-Term Ideas (from conversation)
- [ ] Add a **"Prompt Enhancer"** tab using the `Prompt enhancer.txt` reference file already in the project root
- [ ] Explore adding **AI model selector** in Generate tab (Gemini, Midjourney syntax mode, Leonardo mode — each formats the final prompt differently)
- [ ] Look at the **`Update and Ideas By User`** folder in the project root for additional ideas documented by the brand owner

---

## 📂 Key File Reference

| File | Purpose |
|------|---------|
| `index.html` | App shell, nav, page containers |
| `css/styles.css` | All styling, CSS variables, dark/light themes, responsive |
| `js/app.js` | App init, navigation, theme toggle |
| `js/prompt-studio.js` | All archetype data, modifiers, prompt builder logic |
| `js/i18n.js` | All translation strings (EN/FR/AR) |
| `js/generate.js` | AI generation tab |
| `js/captions.js` | Caption/hashtag generator |
| `js/watermark.js` | Watermark studio |
| `js/batch.js` | Batch mode (UI built) |
| `js/gallery.js` | Generated assets gallery |
| `sw.js` | Service worker — cache versioning for PWA |
| `manifest.json` | PWA manifest (icons, name, theme) |
| `icons/` | App icons and favicon — **do not change** |
| `Elaris Jewelry Logo/` | `Elaris Lite (White).svg` + `Elaris Lite (Black).svg` |

---

*Last updated: May 31, 2026 — Cache at `elaris-v25` — 28 Archetypes live*
