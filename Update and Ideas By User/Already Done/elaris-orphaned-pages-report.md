# Elaris Content Engine — Orphaned Page Modules: Issue Report & Fix Plan

**Prepared for:** AI coding agent tasked with cleaning up the repo
**Project:** Elaris Content Engine (Instagram content studio SPA for @elaris.925)
**Repo:** `houraiss/elaris-content-engine` (GitHub, `main` branch)
**Live deployment:** https://houraiss.github.io/elaris-content-engine/

---

## 1. Context

Elaris Content Engine is a static single-page app (vanilla HTML/CSS/JS, no build step). `index.html` loads a fixed set of `<script>` tags, and a JS router (`js/app.js`) swaps page content into `#page-container` based on the sidebar nav / URL hash.

The site owner previously removed several in-progress pages from the **local** project (Enhance, Composer, Templates, and — pending a decision — Gallery), but those local deletions were **never committed and pushed to git**. As a result, the GitHub repo (and therefore the live GitHub Pages deployment) still contains the old files. They are not currently linked into the live site's navigation, but they exist as dead weight in the repo and create a few broken references.

**Confirmed target state** (per screenshot supplied by the owner): the sidebar should contain exactly these 6 pages, no more:

- **Create:** Prompt Studio, Generate, Captions
- **Manage:** Trends, Batch Mode, Watermark

---

## 2. Current Status vs. Target

Verified directly against the live repo (`raw.githubusercontent.com/houraiss/elaris-content-engine/main/...`) on 2026-07-02.

| File | Exists in repo? | Loaded by `index.html`? | Has nav link? | Status |
|---|---|---|---|---|
| `js/enhance.js` | ✅ Yes (382 lines) | ❌ No | ❌ No | **Orphaned — should be deleted** |
| `js/composer.js` | ✅ Yes (588 lines) | ❌ No | ❌ No | **Orphaned — should be deleted** |
| `js/templates.js` | ✅ Yes (318 lines) | ❌ No | ❌ No (helper module, not a page) | **Orphaned — should be deleted** |
| `js/gallery.js` | ✅ Yes (127 lines) | ✅ Yes, still loaded | ❌ No | **Half-wired — needs a decision (see §4)** |

`index.html` itself is otherwise correct and complete — it matches the deployed version byte-for-byte (aside from harmless CRLF line endings). The problem is isolated to leftover JS module files and a handful of dangling references to them.

---

## 3. Root Cause

Local repo state and remote (`origin/main`) have diverged: the file deletions made locally were never staged, committed, or pushed. This is a straightforward **git sync issue**, not an application bug — no rebuild or redesign is needed, just cleanup + a commit/push.

---

## 4. Detailed Findings

### 4.1 `js/enhance.js` — orphaned, safe to delete
- A fully-built AI photo-enhancement page (canvas-based before/after editing, mood presets like "Cartier Noir" / "Tiffany Ice").
- Defines `window.render_enhance`, but since the script is never loaded in `index.html`, that function doesn't exist at runtime.
- **Dangling reference:** `js/gallery.js` line 106 has an "Open in Enhance" button that calls `Elaris.navigate('enhance')`. Since `render_enhance` isn't defined, this currently fails silently (falls through to the router's generic "Coming Soon" state).

### 4.2 `js/composer.js` — orphaned, safe to delete
- A page for uploading photos, picking a template, and composing posts (588 lines). Defines `window.render_composer` and `window.Composer`.
- **Dangling references:**
  - `js/enhance.js`'s "Send to Composer" button calls `Elaris.navigate('composer')` and touches `window.Composer`.
  - `js/batch.js` (lines ~277–280) has a guarded check `if (window.Composer && window.Composer.logoWhiteImg)` used to reuse a previously uploaded logo. This is safely guarded (won't throw), so Batch Mode still works — it just never gets the logo-reuse shortcut.

### 4.3 `js/templates.js` — orphaned, safe to delete
- Not a page itself — a helper module exposing `ELARIS_TEMPLATES`, `getTemplates()`, `getTemplate()`, `renderTemplatePreview()`.
- Almost certainly a dependency of `composer.js`'s template picker. Not currently loaded or referenced by any active page.

### 4.4 `js/gallery.js` — needs a decision
- **This one is different: it IS currently loaded** via `<script src="js/gallery.js?v=3"></script>` in `index.html`, and `window.render_gallery` works correctly.
- However, it has **no sidebar nav item**, and it's missing from two arrays in `js/app.js`:
  - `valid` (line ~304) — the list of hash values the router accepts on initial page load
  - `pages` (line ~273) — the list used for the 1–6 keyboard shortcuts
- Net effect: Gallery is only reachable if a user manually types `#gallery` into the URL bar *after* the page has already booted (via the `hashchange` listener, which has no validation). On a fresh load with `#gallery` in the URL, the router ignores it and falls back to Prompt Studio.
- Since the screenshot's target nav has no Gallery item, **recommended action is to remove Gallery too**, for consistency with the other three removed pages — but this is a product decision, not a bug fix, so confirm with the owner if in doubt.

### 4.5 Leftover dead references (cosmetic, non-breaking)
These don't cause errors (unused code paths / unused object keys), but should be cleaned up for a tidy codebase:
- `js/app.js` — the `titles` object (line ~33) still has a `gallery:` entry.
- `js/i18n.js` — still defines unused translation keys across all three languages (EN/FR/AR): `nav_enhance`, `nav_composer`, `nav_templates`, `enh_*` (e.g. `enh_finetune`, `enh_load_photo`, `enh_no_photos`, `enh_title`, `enh_subtitle`, `enh_use_composer`), `comp_title`, `comp_subtitle`, `tpl_title`, `tpl_subtitle`, and (if Gallery is also removed) `gal_*` keys.

---

## 5. Fix Instructions

### Step 1 — Delete the orphaned page files
```bash
git rm js/enhance.js js/composer.js js/templates.js
```

If Gallery is also being removed (recommended — see §4.4):
```bash
git rm js/gallery.js
```

### Step 2 — Update `index.html`
If Gallery is being removed, delete this line:
```html
<script src="js/gallery.js?v=3"></script>
```
(If Gallery is being kept, instead add a proper nav `<a>` item for it in the sidebar — see §4.4 for what's currently missing from routing.)

### Step 3 — Clean up `js/app.js`
- Remove the `gallery:` key from the `titles` object.
- Confirm `valid` and `pages` arrays only contain: `promptstudio, generate, captions, trends, batch, watermark`.
- Remove the `window.render_trends`... no change needed here, trends is intact — just double-check no leftover gallery-related code remains after the above edits.

### Step 4 — Clean up `js/i18n.js`
Remove unused keys from all three language blocks (`en`, `fr`, `ar`): `nav_enhance`, `nav_composer`, `nav_templates`, all `enh_*`, all `comp_*`, all `tpl_*`, and (if Gallery removed) all `gal_*` keys.

### Step 5 — Clean up `js/batch.js` (optional but recommended)
Remove the now-permanently-dead `if (window.Composer && window.Composer.logoWhiteImg)` branch (~lines 277–280), since `window.Composer` will never exist once `composer.js` is deleted.

### Step 6 — Commit and push
```bash
git add -A
git status   # sanity-check: should show enhance.js, composer.js, templates.js (and gallery.js, if removed) as deleted
git commit -m "Remove unused Enhance/Composer/Templates (and Gallery) page modules"
git push origin main
```

---

## 6. Verification Checklist

After deploying, confirm on the live site (https://houraiss.github.io/elaris-content-engine/):

- [ ] Sidebar shows exactly 6 items: Prompt Studio, Generate, Captions, Trends, Batch Mode, Watermark
- [ ] No 404s in browser dev tools Network tab for `enhance.js`, `composer.js`, `templates.js` (or `gallery.js`, if removed)
- [ ] Keyboard shortcuts 1–6 map correctly to the 6 remaining pages
- [ ] Manually navigating to `#enhance`, `#composer`, `#templates`, `#gallery` in the URL either does nothing harmful or gracefully falls back (no console errors)
- [ ] Batch Mode still functions correctly (logo upload, generation) after the `window.Composer` guard is removed from `js/batch.js`
- [ ] No console errors on any of the 6 remaining pages
- [ ] Language switcher (EN/FR/AR) still works correctly with no missing-key errors after i18n cleanup

---

## 7. Summary for the Agent

**One-line problem statement:** The `main` branch on GitHub still contains four legacy page modules (`enhance.js`, `composer.js`, `templates.js`, `gallery.js`) that were removed from the local dev copy but never pushed; three are fully orphaned (unloaded, unlinked, but leave dangling references from other files), and the fourth (`gallery.js`) is still loaded but has no nav entry.

**What "done" looks like:** Repo and live site match the 6-page nav shown in the reference screenshot, with no orphaned files, no dangling `Elaris.navigate()` calls to nonexistent pages, and no unused code/i18n keys left behind.
