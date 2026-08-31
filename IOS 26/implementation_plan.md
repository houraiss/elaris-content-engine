# Studio Beta — Major Issues Fix Plan

## Issues Being Fixed

### 1. Carousel Section Layout (Desktop — "section inside a section")
**Root cause:** The archetype carousel cards use `scroll-into-view()` during `_render()` on archetype select, which scrolls the *entire page* to the top of the carousel panel. On desktop this makes it look like the panel jumped to top-left.  
**Fix:** Replace `scrollIntoView` calls with a smooth horizontal scroll within the carousel track only. The carousel panel itself stays fixed. Also ensure `.psb-center-col` has no nested panel layout issues causing the "section inside section" look.

---

### 2. Expert Dock Button Forces Page to Top
**Root cause:** `drawer.scrollIntoView({ behavior:'smooth', block:'start' })` triggers a full-page scroll that repositions the main layout, and since the drawer is inside a panel, this causes unwanted layout shift.  
**Fix:** Use `window.scrollBy` relative to current position or `element.scrollIntoView({ block:'nearest' })` so it only scrolls minimally. On mobile, use `scrollTop` within the scrollable container instead.

---

### 3. Smart Guide Live Not Updating  
**Root cause:** `_getGuideData(archId)` only has 7 hardcoded fallback archetypes. When any other archetype is selected (e.g. from the 70+ library via `window.PromptStudio.guideDB`), it falls through to the generic default and always shows the same generic tips.  
**Fix:** 
- When `window.PromptStudio.guideDB` exists, use it directly (it has entries for all 70+ archetypes).  
- Add a richer fallback that inspects `arch.category` and `arch.id` to generate contextually accurate angle/lighting/camera/tips from the archetype's own data rather than showing the same 3 generic lines every time.

---

### 4. Full Library Modal — Filter Not Working  
**Root cause:** The category tabs use `a.category` for filtering, but the `window.PromptStudio.archetypes` array uses different category values (e.g. `'human'`, `'product'`, `'organic'` etc.) that match what the filter uses. The bug is that `_renderModalGrid()` re-renders the grid but modal category tab clicks call `this._render(); this._bindEvents()` — which destroys and re-creates the entire modal from scratch, losing the debounced search and re-triggering a full re-render loop. The real filter issue: the tab data values (`human`, `product`, `organic`, `mood`, `sets`, `watches`) don't always match `arch.category` values in the actual archetype data (e.g. some archetypes use `'set'` not `'sets'`, `'watch'` not `'watches'`).

**Fix:**
- Normalize category matching: map tab `'sets'` → match `'set'|'sets'`, `'watches'` → match `'watch'|'watches'`.
- Move category tab clicks to use `_renderModalGrid()` partial re-render instead of full `_render()`.
- Add **V3 badge filter** chip (show only archetypes where `arch.tag === 'V3.0'`).
- Add **A-Z sort** toggle button.
- Re-bind modal card clicks inside `_renderModalGrid()`.

---

### 5. Modal Archetype Selection Causes Scroll Jump  
**Root cause:** After selecting from modal, code calls `this._render(); this._bindEvents();` then `active.scrollIntoView(...)` on the carousel card — but `scrollIntoView` makes the page scroll to that element's position, moving the entire layout.  
**Fix:** After closing the modal and re-rendering, scroll the **carousel track** to center the active card using `scrollLeft` instead of `scrollIntoView`. Prevent page-level scroll from happening.

---

### 6. Missing Modifiers — Lighting / Camera / Angle Parity  
**Current state:** Camera tab has the right lenses (8 options), 14 shot angles, and ~17 lighting moods. Prompt Studio has 35+ lighting moods, 30+ shot angles.  
**Fix:** Expand all three selects to full parity with Prompt Studio:

**Lighting Mood** — add missing groups:
- *Atmospheric*: Blue Hour Twilight, Fog & Mist Diffusion, Rain-Wet Reflections, Starlight Moonlight, Firelight Ember
- *Fashion Studio*: Strobe High-Speed Flash, Butterfly/Clamshell Beauty, Rembrandt Portrait
- *Special*: UV Blacklight Neon, Laser Projection Art, Prism Rainbow Refraction

**Camera Shot Angle** — add missing:
- Wrist Level, Tabletop Below-Glass, Dutch Tilt Diagonal, Behind-Glass Refraction, Tilt-Shift Miniature, Walking Motion Blur, Reverse Macro (1:1 scale), Bird's Eye Overhead (orthographic)

**Add Smart Filter** to Camera tab: chips for `Natural`, `Studio`, `Cinematic`, `Atmospheric`, `Special` that filter the lighting select's optgroups.

---

## Files Modified

### `js/prompt-studio-beta.js` → v4
- Fix scroll position bugs (carousel, expert dock, modal select)
- Fix `_getGuideData()` to properly use `window.PromptStudio.guideDB` + smart fallback by arch category
- Fix modal category filter normalization (`sets`/`watches`)
- Move modal cat tab to `_renderModalGrid()` partial update
- Add V3 filter chip + A-Z sort toggle to modal
- Expand lighting (35+ options), angle (22+ options), camera (8 → 9 options)
- Add lighting category filter chips to Camera tab

### `css/beta.css` → v4  
- Fix modal filter chips style (V3 badge chip, sort button)
- Ensure modal sorting bar looks polished

### `index.html`
- Bump `prompt-studio-beta.js?v=4`

## Verification
- Open Studio Beta, select different archetypes → Smart Guide must change each time
- Open Full Library, click category tabs → must filter correctly
- Click V3 filter → shows only V3 tagged archetypes
- Click A-Z → alphabetical order
- Select an archetype from modal → page must NOT scroll to top-left corner
- On mobile, click Expert dock button → drawer opens without page layout jump
- Camera tab: all new lighting moods and angles visible
- Lighting filter chips filter the dropdown options correctly
