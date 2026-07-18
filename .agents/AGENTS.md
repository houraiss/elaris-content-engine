# Elaris Content Engine — Project Rules

## 0. Project State (CRITICAL)
**ALWAYS START YOUR TASK BY READING `.agents/PROJECT_STATE.md`.**
This file contains the current global context, history, and state of the project. Do not rely on previous conversation histories. 
When you make significant progress or architectural changes in a task, you MUST update `.agents/PROJECT_STATE.md` with an entry in its Update Log so that future AI sessions have the full picture.

## 0.1 End of Task Git Workflow (CRITICAL)
**ALWAYS COMMIT AND PUSH YOUR CHANGES AT THE END OF EVERY TASK.**
Before wrapping up any conversation where you have modified, added, or deleted files, you MUST:
1. Run `git add .`
2. Run `git commit -m "Your descriptive commit message"`
3. Run `git push`
Do not ask the user for permission to commit unless the user explicitly requested you not to. This ensures no work is lost and future AIs can see the full history.


## New Archetype Integration — Standard Workflow

Apply this checklist every time a new archetype is added to the project. Complete the steps in order; do not mark an archetype "done" until all four are finished.

### 1. Apply the Version Badge
Tag every newly added archetype with the **"V3.0"** badge so it's clearly identifiable as part of this release batch.

### 2. Calibrate the Smart Guide
Configure a dedicated Smart Guide profile for each new archetype — do not reuse generic defaults. For every archetype, define:
- Optimal camera angle
- Best framing/composition
- Any other guide-specific parameters (e.g. zoom level, focal point)

Each archetype must reach the same visual quality and consistency standard already established for existing archetypes.

### 3. Normalize Stone & Material Labels
Replace raw internal IDs with clean, human-readable display names for all new stones and materials. Use this rule consistently:

- Strip technical prefixes (e.g. `ps_stone_`)
- Replace underscores with spaces
- Capitalize each word

**Example:** `ps_stone_amber` → `Stone Amber`

Apply this same normalization to *every* new label introduced, not just the example above — no raw/prefixed IDs should remain user-facing.

### 4. Connect Camera & Lighting to the Smart Guide
Link each new archetype's Smart Guide to the same dynamic camera-angle and lighting behavior used across the rest of the archetype library, so new archetypes feel fully consistent with the existing interactive/dynamic experience — not static or bolted-on.

---
*Order matters: badge → guide calibration → label cleanup → camera/lighting integration. Skipping ahead tends to cause mismatched guides or leftover raw labels.*
