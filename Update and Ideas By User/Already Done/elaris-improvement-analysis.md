# Elaris Content Engine — Code Improvement Analysis

> **Files reviewed:** `index.html`, `app.js`, `enhance.js`, `enhance-prompt.js`, `prompt-studio.js`, `styles.css`, `sw.js`
> **Scope:** Architecture, performance, bugs, security, CSS, PWA, i18n

---

## 1. Architecture & Code Organisation

### 1.1 `app.js` is doing too much
`app.js` is the router, but it also renders three full pages — `render_templates`, `render_captions`, and `render_trends`. These should each live in their own module files (e.g. `templates.js`, `captions.js`, `trends.js`) consistent with how `enhance.js`, `prompt-studio.js`, and `watermark.js` already work. The current arrangement means touching routing logic risks accidentally breaking unrelated page renders.

```js
// Bad: render functions for other pages living in app.js
window.render_templates = function(container) { /* 60 lines */ };
window.render_captions  = function(container) { /* 80 lines */ };
window.render_trends    = function(container) { /* 50 lines */ };
```

### 1.2 `pageScripts` property is defined but never used
`Elaris.pageScripts` is declared in the singleton but never read anywhere. Either remove it or implement the lazy-script-loading system it seems to hint at.

```js
// Dead weight — remove or implement
const Elaris = {
    pageScripts: { composer: true, templates: true, captions: true, batch: true },
    ...
};
```

### 1.3 Dead `<div id="generate">` in `index.html`
```html
<!-- This div serves no purpose — the router uses #page-container, not this -->
<div id="generate" class="page" style="display:none;"></div>
```
Remove it to avoid confusion.

### 1.4 Global `window.*` namespace pollution
Every module attaches itself to `window` (`window.Enhance`, `window.PromptEnhancer`, `window.PromptStudio`, `window.Elaris`, `window.Composer`, etc.). At 15+ scripts, cross-module coupling is fragile and hard to trace. Consider a lightweight module registry:

```js
// A simple registry instead of window globals
const Elaris = {
    modules: {},
    register(name, module) { this.modules[name] = module; },
    get(name) { return this.modules[name]; },
};
```

---

## 2. Performance Issues

### 2.1 All 15 scripts block HTML parsing
Not a single `<script>` tag in `index.html` uses `defer` or `async`. The browser stops rendering until every script downloads and executes.

```html
<!-- Before -->
<script src="js/enhance.js?v=3"></script>

<!-- After — add defer to all non-critical scripts -->
<script src="js/enhance.js?v=3" defer></script>
```
Since everything initialises inside `DOMContentLoaded`, `defer` is safe for all 15 tags.

### 2.2 Sequential image loading in `enhance.js` (`_loadEnhancedPhotos`)
Images from the manifest are fetched one-by-one with `await` inside a `for` loop. With 10 photos this could be 10× slower than necessary.

```js
// Current — sequential
for (const entry of manifest.files || []) {
    const loaded = await new Promise(r => { ... img.src = `.../${entry.file}`; });
    if (loaded) this.enhancedPhotos.push(...);
}

// Improved — parallel
const results = await Promise.all(
    (manifest.files || []).map(entry => new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve({ img, entry });
        img.onerror = () => resolve(null);
        img.src = `assets/enhanced/${entry.file}`;
    }))
);
this.enhancedPhotos = results.filter(Boolean).map(({ img, entry }) => ({
    img, src: img.src, name: entry.name || entry.file,
    file: entry.file, direction: entry.direction, ...
}));
```

### 2.3 Canvas pixel processing runs on the main UI thread
`Enhance._process()` iterates over every pixel synchronously on `input` events. For a 1500×1500 image this is ~6.75 million iterations per slider drag — enough to visibly freeze the UI.

Two improvements:
1. **Debounce the slider input handler** (16ms is plenty — one animation frame):
```js
s.addEventListener('input', debounce(() => {
    this.settings[s.dataset.prop] = parseInt(s.value);
    this._process();
}, 16));
```
2. **Move pixel work off the main thread** using an `OffscreenCanvas` transferred to a Web Worker.

### 2.4 `PromptStudio` does a full DOM rebuild on every profile interaction
`_render()` + `_bind()` is called every time the consistency toggle is switched, a profile is selected, or a profile image is uploaded. This re-creates and re-binds every element on the entire page for what is a tiny state change.

```js
// This pattern appears 4 times in prompt-studio.js
this._render();           // Rebuilds all ~400 lines of HTML
this._renderArchetypeGrid();
this._bind();             // Re-attaches all event listeners
```

The fix is to update only the sub-component that changed (the profile list panel), not the whole page. Extract `_renderProfilePanel()` and `_renderConsistencySection()` that update only their own DOM node.

### 2.5 i18n getters call `window.I18n.t()` on every array item on every re-render
The `angles`, `surfaces`, `palettes`, and `stylings` getters are defined as `get` properties that rebuild their arrays on every access, calling `window.I18n.t()` for every option. This runs on every `_render()` and `_renderArchetypeGrid()` call.

```js
// Runs on every access — rebuilds arrays and calls I18n for every item
get angles() {
    return [
        { id: 'eye-level', label: window.I18n ? window.I18n.t('ps_ang_eye') : 'Eye Level' },
        // 9 more items...
    ];
}
```

Cache the translated arrays and invalidate only when the language changes.

---

## 3. Bugs & Logic Errors

### 3.1 Download toast fires before the blob is ready
In `enhance.js`, the success toast is shown before `canvas.toBlob()`'s async callback runs. A user could see "downloaded ✓" even if the blob fails.

```js
// Bug: toast shown immediately, before blob callback
_download() {
    this.canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `elaris_enhanced_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
    Elaris.toast('Enhanced photo downloaded ✓', 'success'); // fires immediately!
},

// Fix: move toast inside the callback
_download() {
    this.canvas.toBlob(blob => {
        if (!blob) { Elaris.toast('Export failed', 'error'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `elaris_enhanced_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        Elaris.toast('Enhanced photo downloaded ✓', 'success'); // ← here
    });
},
```

### 3.2 Cross-module communication via a global variable
`enhance.js` passes photos to the Composer through `window._enhancedPhoto`. This is fragile — if navigation is slow or Composer initialises late, the reference is lost.

```js
// Bad: relies on a shared mutable global
window._enhancedPhoto = { img, src: dataUrl, name: 'enhanced_photo.png' };
Elaris.navigate('composer');
setTimeout(() => {
    if (window.Composer) { Composer.photos.push(window._enhancedPhoto); ... }
}, 200); // race condition — 200ms delay is arbitrary
```

Better approach: pass the photo via the navigation event or through a dedicated event:
```js
window.dispatchEvent(new CustomEvent('elaris:load_photo', { detail: { img, src: dataUrl } }));
Elaris.navigate('composer');
// Composer listens for 'elaris:load_photo' during its own init
```

### 3.3 Keyboard shortcut range is off-by-one
The shortcut handler covers keys `1`–`7` but the `pages` array has 8 entries. Page 8 (`watermark`) is unreachable by keyboard.

```js
// Bug: checks key <= '7' but pages has 8 entries
const pages = ['promptstudio', 'enhance', 'composer', 'templates', 'captions', 'trends', 'batch', 'watermark'];
if (e.key >= '1' && e.key <= '7') {
    Elaris.navigate(pages[parseInt(e.key) - 1]);
}

// Fix
if (e.key >= '1' && e.key <= '8') { ... }
```

### 3.4 Archetype i18n coverage is incomplete
The translation prefix lookup in `_renderArchetypeGrid` only maps 8 of the 22+ archetypes. All newer archetypes (seasonal, desert mirage, neon cyberpunk, vintage nostalgia, zero gravity, royal opulence, etc.) fall through to their raw English names with no translation path.

```js
// Only covers 8 archetypes — 14+ fall through
const tPrefix = a.id === 'body-intimate'     ? 'body'  :
                a.id === 'object-pairing'    ? 'obj'   :
                a.id === 'macro-detail'      ? 'macro' :
                // ... 5 more
                null; // all new archetypes land here
```

Replace the ternary chain with a lookup map, and add i18n keys for all 22 archetypes:
```js
const prefixMap = {
    'body-intimate': 'body', 'object-pairing': 'obj', 'macro-detail': 'macro',
    'editorial-model': 'edit_model', 'seasonal-holiday': 'season',
    'neon-cyberpunk': 'neon', /* ... all 22 */ 
};
const tPrefix = prefixMap[a.id] || null;
```

### 3.5 `_bindChipGroup` does not guard against missing groups
If a chip group doesn't exist in the DOM (during a partial render or mid-refactor), `_bindChipGroup` will throw a silent `null` reference error and leave the entire event binding broken.

```js
// Missing null guard
_bindChipGroup(groupId, stateKey) {
    const group = this.container.querySelector(`#${groupId}`);
    group.addEventListener('click', e => { ... }); // crashes if group is null
},

// Fix
_bindChipGroup(groupId, stateKey) {
    const group = this.container.querySelector(`#${groupId}`);
    if (!group) return;
    group.addEventListener('click', e => { ... });
},
```

---

## 4. Security

### 4.1 User-controlled strings injected into `innerHTML`
Several page renderers inject strings that originate from user input or external JSON directly into `innerHTML` without sanitisation. The highest-risk examples:

- `render_trends` in `app.js` injects `data.contentCalendarTip` and all trend `title`/`description`/`suggestion` fields from `assets/trends.json` as raw HTML.
- `prompt-studio.js` injects `p.name` (profile name typed by the user) into card HTML strings.

```js
// Risk: if trends.json is tampered with, arbitrary HTML executes
content.innerHTML = `... ${data.contentCalendarTip} ...`;

// Risk: user-typed profile name injected directly
`<div style="font-size:13px;...">${p.name}</div>`
```

At minimum, escape user-provided strings before insertion:
```js
function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// Then use esc(p.name), esc(data.contentCalendarTip), etc.
```

A proper approach would be to use `textContent` assignments or `document.createElement` for dynamic content rather than template-literal HTML.

### 4.2 No Content Security Policy
There is no CSP `<meta>` tag in `index.html`. For an app that fetches external JSON and injects its content into the DOM, a CSP would meaningfully reduce XSS blast radius.

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; font-src https://fonts.gstatic.com; style-src 'self' https://fonts.googleapis.com">
```

---

## 5. CSS Issues

### 5.1 Three font variables all point to the same value
`--font-ui`, `--font-label`, and `--font-body` are all aliased to `'Jost'`, making the distinction meaningless and creating confusion about which to use.

```css
/* Three variables, zero differentiation */
--font-ui:    'Jost', system-ui, sans-serif;
--font-label: 'Jost', system-ui, sans-serif;
--font-body:  'Jost', system-ui, sans-serif;
```

Consolidate into one: `--font-sans: 'Jost', system-ui, sans-serif;` and update all usages.

### 5.2 Light-mode overrides are scattered throughout the file
`[data-theme="light"]` rules appear in at least 26 places spread across the 2163-line file instead of being grouped in a single section. This makes theme changes risky — it's easy to miss a rule.

Consider a build step or at minimum grouping all light-mode overrides at the end of the file in a dedicated `/* Light Theme */` section.

### 5.3 `overflow: hidden` on `html, body` breaks mobile virtual keyboard
```css
html, body { overflow: hidden; }
```
On mobile, when the virtual keyboard opens and a focused `<textarea>` or `<input>` needs to scroll into view, `overflow: hidden` on both root elements prevents the viewport from scrolling. This is a common cause of inputs being obscured by the keyboard. Use `overflow: hidden` only on the layout container, not the root elements.

### 5.4 65KB single-file CSS
At 2163 lines and 65KB, the stylesheet covers every module in one file. There is no CSS splitting, no `@layer` architecture, and no clear separation between design tokens, base styles, layout, and component styles. Even without a full build pipeline, splitting into `base.css`, `layout.css`, and per-module files (`enhance.css`, `prompt-studio.css`) would make it dramatically easier to maintain.

---

## 6. `enhance-prompt.js` Specific Issues

### 6.1 RegExp patterns recompiled on every call
In `_cleanNegativePrompt`, every call re-compiles 13+ `RegExp` objects inside the loop. These should be compiled once as module-level constants.

```js
// Bad: compiled on every _cleanNegativePrompt() call
for (const term of anatomicalTerms) {
    const pattern = new RegExp(`\\(?${term.replace(...)}\\)?,?\\s*`, 'gi');
    ...
}

// Better: define compiled patterns once at module level
const ANATOMICAL_PATTERNS = anatomicalTerms.map(term => ({
    term,
    re: new RegExp(`\\(?${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)?,?\\s*`, 'gi')
}));
```

### 6.2 `_escapeHTML` creates a DOM node on every call
```js
_escapeHTML(str) {
    const div = document.createElement('div'); // new element every time
    div.textContent = str;
    return div.innerHTML;
},
```
This is called in `generateDiffHTML` which can process long strings. Use a simple string-replace function instead:
```js
_escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
},
```

### 6.3 `generateDiffHTML` isn't actually a diff
The function is named `generateDiffHTML` and its JSDoc says it uses `<del>` / `<ins>` for removals and additions. In practice it renders a simple before/after side-by-side view with no word-level diffing. The LCS diff mentioned in a comment is never implemented. Rename it to `generateComparisonHTML` or implement the actual LCS diff to match the documented contract.

---

## 7. State Management & Persistence

### 7.1 Prompt history is not persisted
`PromptStudio.state.history` resets to `[]` on every page navigation. Only model profiles are saved to `localStorage`. History should persist across sessions just like profiles do:

```js
// During generate
this.state.history.unshift({ ...p, timestamp: ... });
localStorage.setItem('elaris_prompt_history', JSON.stringify(this.state.history.slice(0, 50)));

// During init
const saved = localStorage.getItem('elaris_prompt_history');
if (saved) this.state.history = JSON.parse(saved);
```

### 7.2 Language preference is not persisted
The theme (`elaris-theme`) is saved to `localStorage`, but the language selection (EN/FR/AR) is not. After every page reload the language resets to the default regardless of what the user selected.

```js
// setLang should also persist
function setLang(lang, btn) {
    // ... existing code ...
    localStorage.setItem('elaris-lang', lang);
}

// And restore on load
const savedLang = localStorage.getItem('elaris-lang');
if (savedLang) setLang(savedLang);
```

---

## 8. PWA / Service Worker Issues

### 8.1 Cache version is a manually-bumped hardcoded number
`CACHE_NAME = 'elaris-v32'` has apparently been bumped 31 times by hand. The correct pattern is to inject the version at build time. Without a build step, at minimum tie it to a timestamp or a constant defined in `app.js`:

```js
// sw.js: import a shared version string
const CACHE_NAME = `elaris-${APP_VERSION}`; // injected by build tool

// Or with a simple hash approach
const CACHE_NAME = 'elaris-2024-06-03'; // date-based is easy to audit
```

### 8.2 App shell doesn't cache itself (`sw.js`)
The service worker pre-caches `index.html`, all JS, CSS and icons — but not `sw.js` itself. If the file hosting goes offline, `sw.js` cannot be fetched on first install. Adding `'./js/sw.js'` to `APP_SHELL` fixes this.

### 8.3 No update notification to the user
When a new service worker activates (`self.skipWaiting()` runs), there is no message sent to open tabs to inform the user. The app silently updates mid-session which can cause state mismatches. Add a `postMessage` on activate and handle it in `pwa.js` to show a "New version available — reload" toast.

---

## 9. Script Loading & HTML

### 9.1 Manual cache-busting `?v=3` across 15 script tags
Version strings are inconsistent (`?v=1`, `?v=3`, `?v=4`) and must be updated by hand. This is fragile — it's easy to forget to bump a version after a change, resulting in users loading stale cached files. Use a build tool (Vite, Parcel, or even a simple hash script) to inject content hashes automatically.

### 9.2 Inline `<style>` at the bottom of `index.html`
```html
<style>
    @keyframes slideUp { ... }
</style>
```
This `@keyframes` should be moved into `styles.css` with the rest of the animations.

---

## 10. Summary Priority Matrix

| Priority | Issue | File(s) | Effort |
|---|---|---|---|
| 🔴 High | Sequential image loading (10× slowdown) | `enhance.js` | Low |
| 🔴 High | Download toast fires before blob is ready | `enhance.js` | Low |
| 🔴 High | XSS via unsanitised `innerHTML` injection | `app.js`, `prompt-studio.js` | Medium |
| 🔴 High | All scripts block HTML parse (no `defer`) | `index.html` | Low |
| 🟠 Medium | Full DOM rebuild on every profile interaction | `prompt-studio.js` | Medium |
| 🟠 Medium | Canvas pixel processing on main thread | `enhance.js` | High |
| 🟠 Medium | Language preference not persisted | `app.js`, `i18n.js` | Low |
| 🟠 Medium | Prompt history not persisted | `prompt-studio.js` | Low |
| 🟠 Medium | Archetype i18n coverage at 8/22 | `prompt-studio.js` | Medium |
| 🟡 Low | `pageScripts` dead code | `app.js` | Trivial |
| 🟡 Low | Keyboard shortcut off-by-one | `app.js` | Trivial |
| 🟡 Low | 3 font vars pointing to same value | `styles.css` | Trivial |
| 🟡 Low | Service worker manual version bump | `sw.js` | Low |
| 🟡 Low | `_escapeHTML` DOM allocation | `enhance-prompt.js` | Low |
| 🟡 Low | `generateDiffHTML` naming vs behaviour mismatch | `enhance-prompt.js` | Low |

---

*Analysis based on: `index.html`, `app.js` (20KB), `enhance.js` (18KB), `enhance-prompt.js` (13KB), `prompt-studio.js` (97KB), `styles.css` (66KB), `sw.js` (5KB).*
