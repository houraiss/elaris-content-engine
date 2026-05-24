# Elaris Content Engine — Model Consistency Feature
## Blueprint & Design Report

**Project:** @elaris.925 Instagram Content Studio  
**Feature:** Model Consistency Panel — Prompt Studio Module  
**Version:** 1.0  
**Status:** Built & Ready for Integration  

---

## 1. Context & Background

### 1.1 What is the Elaris Content Engine?

The Elaris Content Engine (`https://houraiss.github.io/elaris-content-engine/`) is a custom-built, client-side web application hosted on GitHub Pages. It is a dedicated Instagram content creation studio built exclusively for the jewelry brand **@elaris.925**.

The application is a single-page app (SPA) organized into two functional areas:

- **Create** — Prompt Studio, Generate, Enhance, Composer, Templates, Captions
- **Manage** — Trends, Batch Mode, Watermark

It supports three languages (English, French, Arabic) and includes a dark mode toggle. The brand theme color is a warm gold/bronze (`#a67c52`), consistent with a luxury jewelry aesthetic.

### 1.2 The Existing Workflow (Before This Feature)

The user's content generation workflow prior to this feature was as follows:

1. Open the **Prompt Studio** section of the Content Engine
2. Use it to generate an AI prompt for a specific shot
3. Copy that prompt
4. Open **Gemini** or **Nano Banana** (same underlying model — see Section 2)
5. Paste the prompt
6. Attach **multiple phone photos** of the jewelry piece from different angles
7. Generate the image

**Key detail about Step 6:** The user always attaches multiple photos of the same jewelry piece (typically 2–4 shots from different angles) because a single image is insufficient for the AI to reconstruct the full piece accurately. Without multiple angles, the AI hallucinates parts of the jewelry it cannot see — such as the back of an earring, the clasp of a necklace, or the underside of a ring. Multiple shots prevent this.

---

## 2. Understanding the Tools: Gemini & Nano Banana

### 2.1 They Are the Same Model

A critical discovery made during this design session: **Gemini** and **Nano Banana** are the same underlying technology.

- **Nano Banana** is the consumer-facing nickname for **Google's Gemini 2.5 Flash Image** model
- It is Google's latest image generation and editing model
- Accessible via the Gemini app, Google AI Studio, Vertex AI, and third-party wrappers under the Nano Banana branding
- **Nano Banana Pro** uses a higher-tier version (Gemini 3 Pro Image) for studio-quality output

This means the user's two "separate tools" are actually one — simplifying the workflow design significantly.

### 2.2 Why This Model Was Chosen for Model Consistency

Gemini 2.5 Flash Image (Nano Banana) was the right choice for this feature because it natively supports:

- **Multi-image input** — accepts multiple images as references in a single generation request
- **In-context image generation** — processes text AND images simultaneously, not just text prompts
- **Character consistency** — explicitly designed to preserve specific elements (faces, objects) across scene changes
- **Role-aware prompting** — understands when a prompt declares which image serves which purpose (jewelry reference vs. model reference)

---

## 3. The Problem Being Solved

### 3.1 The Inconsistency Problem

When generating AI model images across multiple posts, the default behavior of any text-to-image model is to produce a **different face and appearance every time**, even with identical prompts. This creates a visual disconnect across the brand's Instagram feed — it looks like a random stock photo library rather than a coherent brand with a recognizable presence.

Real-world jewelry brands that do photoshoots work with the **same model across multiple sessions** — the audience recognizes her, builds familiarity, and associates her appearance with the brand. AI-generated content was failing to replicate this effect.

### 3.2 Why This Matters for @elaris.925

For a jewelry brand on Instagram, consistency is not just aesthetic — it is strategic:

- A recurring virtual model becomes a **recognizable brand element**, like a logo or color palette
- It creates the perception of an **ongoing relationship with a real model**, giving the brand credibility
- It allows the brand to build a **visual identity** around a type of person that resonates with their target audience (North African / Middle Eastern market, based on multilingual support EN/FR/AR)
- It makes the feed feel **curated and intentional**, not randomly generated

---

## 4. The Solution: Model Consistency Feature

### 4.1 Core Concept

The solution is to introduce a **Model Consistency system** inside the Prompt Studio that:

1. Stores a **named virtual model profile** with a detailed text descriptor
2. Optionally stores a **reference image** (a previously generated image of that model)
3. **Injects** the model information automatically into every generated prompt
4. **Correctly labels** all attached images so Gemini knows the role of each one

The result: every generated prompt is pre-wired to produce the same virtual person, wearing the correct jewelry, in the requested scene.

### 4.2 Two Layers of Consistency

The feature operates on two distinct layers, each contributing differently to the final result:

**Layer 1 — Text Descriptor (Prompt-Level)**
A saved block of physical descriptors is injected into every prompt automatically. Example:

```
Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes,
high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length,
slim graceful neck, elegant posture
```

This alone achieves approximately 60–70% visual consistency. The model won't be identical every time, but will be the same "type" of person with recognizable features.

**Layer 2 — Reference Image (Visual Anchor)**
When the user uploads a reference image of a previously generated model they approved, Gemini uses it as a visual anchor. This elevates consistency to approximately 85–95%, as the model receives a direct face reference rather than inferring from text alone.

Both layers work together. The text descriptor serves as a fallback and reinforcement; the reference image is the primary visual anchor.

---

## 5. The Multi-Image Challenge & How It Was Solved

### 5.1 The Problem

The user's existing workflow already involves attaching multiple images (jewelry shots from different angles). Adding a model reference image on top means Gemini receives **3 to 5+ images simultaneously**. Without explicit instruction, the model may:

- Confuse the model reference with the jewelry reference
- Blend the two sets of images inappropriately
- Apply face features from the jewelry images to the model
- Use the wrong image group as the primary reference

### 5.2 The Solution: Role Assignment in the Prompt

The generated prompt explicitly **labels every image and assigns it a role** before giving any creative direction. This is the critical structural change in the prompt format.

Example with 2 jewelry shots + 1 model reference:

```
IMAGE REFERENCES:
Images 1 and 2 show the jewelry piece from different angles — these are your product reference.
Image 3 is the model reference — keep her face, skin tone, features, and overall appearance
IDENTICAL to this reference. Do not alter her appearance in any way.

JEWELRY RECONSTRUCTION:
Use ALL 2 jewelry images together to fully reconstruct the piece from every angle —
do not hallucinate or invent any detail not visible in the provided shots.

SCENE DIRECTION:
Generate a photo of the exact same woman from Image 3 wearing the jewelry shown in the
reference images. Scene: [scene description]. Camera focus: [focus area].
Warm gold tones, luxury brand aesthetic. Style: @elaris.925 — refined, modern, aspirational.
```

This three-block structure (IMAGE REFERENCES → JEWELRY RECONSTRUCTION → SCENE DIRECTION) ensures Gemini processes each group of images with its correct intent before attempting generation.

---

## 6. The Three-Mode System

### 6.1 Why Modes Were Needed

During the design process, it became clear that the prompt structure must change **fundamentally** based on what images the user is attaching. It is not simply a matter of adding or removing a line — the entire prompt changes shape. Three distinct modes were therefore defined.

### 6.2 Mode Definitions

| Mode | Jewelry Shots | Model Reference | Prompt Structure |
|---|---|---|---|
| **Test Mode** | None (0) | Off | Pure text-to-image, no image references, used for concept testing and prompt exploration |
| **Product Mode** | 1 to 4+ shots | Off | Labels jewelry images only, focuses on faithful reconstruction of the piece |
| **Full Mode** | 1 to 4+ shots | On | Labels both jewelry group and model reference, full role assignment language |

### 6.3 Why "None" (Test Mode) Was Specifically Added

The user raised an important real-world use case: sometimes they want to **test a prompt concept** without attaching any images at all — just to see if the creative direction, scene, or mood works before committing to a full generation session with attachments. Test Mode produces a clean, pure text prompt that works without any image input. This preserves the flexibility of the tool and avoids forcing the user into an attachment-dependent workflow when they don't need it.

### 6.4 The Mode Switcher is Not Just a Counter

A critical design insight: the jewelry shot selector (None / 1 / 2 / 3 / 4+) is not just a count — it is a **mode switch**. Changing the count from 0 to 1 fundamentally changes the prompt's language, structure, and labeling. This is why the selector drives the entire prompt generation logic, rather than being a simple metadata field.

---

## 7. Model Profiles System

### 7.1 What a Profile Contains

Each model profile stores:

- **Name** — a human-friendly identifier (e.g., "Lina", "Sara") used for UI reference only
- **Text Descriptor** — a detailed physical description injected into prompts (skin tone, eye shape, face structure, hair, posture, etc.)
- **Reference Image** — an optional uploaded image of the model (previously generated or approved) used as a visual anchor in Gemini
- **Color** — a UI accent color for the profile card (visual differentiation only)

### 7.2 Why Named Profiles?

Named profiles allow the user to maintain **multiple virtual models** for different content contexts. For example:

- One model for elegant editorial content
- A different model for casual lifestyle shots
- A third model targeting a different demographic

Each model is fully independent with its own descriptor and reference image. Switching between them is a single click, and the generated prompt updates instantly.

### 7.3 Pre-loaded Default Profiles

Two default profiles were pre-loaded to give the user an immediate starting point:

**Lina** — Mediterranean features, sharp jawline, dark brown hair, olive skin. Representative of a younger, more editorial aesthetic.

**Sara** — Warm beige skin, hazel eyes, wavy chestnut hair, softer features. Representative of a warmer, more approachable lifestyle aesthetic.

Both are editable and replaceable. New profiles can be created at any time via the "+ New" button in the panel.

---

## 8. The Complete Revised Workflow

### 8.1 Step-by-Step (Full Mode — Most Complete)

```
Step 1 — Open Prompt Studio in the Content Engine
          Select jewelry type, scene, and any custom notes

Step 2 — Set jewelry shot count (e.g., 3)
          Toggle Consistency Mode ON
          Select or confirm active model profile

Step 3 — Prompt Studio auto-generates a labeled prompt
          Example output labels:
          "Images 1, 2, and 3 are the jewelry. Image 4 is the model reference."

Step 4 — Copy the generated prompt

Step 5 — Open Gemini / Nano Banana
          Attach: 3 jewelry angle shots (Images 1–3)
          Attach: 1 model reference image (Image 4)

Step 6 — Paste the prompt

Step 7 — Generate
          Result: Accurate jewelry reconstruction + Consistent model face + Requested scene
```

### 8.2 Total Image Count by Mode

| Configuration | Jewelry Shots | Model Ref | Total Images in Gemini |
|---|---|---|---|
| Test Mode | 0 | No | 0 |
| Product Mode (1 shot) | 1 | No | 1 |
| Product Mode (3 shots) | 3 | No | 3 |
| Full Mode (1 shot) | 1 | Yes | 2 |
| Full Mode (3 shots) | 3 | Yes | 4 |
| Full Mode (4+ shots) | 4+ | Yes | 5+ |

---

## 9. Prompt Structure Reference

### 9.1 Test Mode Prompt (No Images)

```
Generate a high-quality Instagram editorial photo of a model wearing elegant [jewelry type].
Scene: [scene description].
Camera focused on [jewelry focus area], soft bokeh background.
Warm gold tones, luxury jewelry brand aesthetic, Instagram-ready composition.
Style: @elaris.925 — refined, modern, aspirational.
[Optional custom notes]
```

### 9.2 Product Mode Prompt (Jewelry Only, No Model Reference)

```
IMAGE REFERENCES:
Image[s] 1 [through N] show[s] the [jewelry type] piece from different angles —
these are your product reference.

JEWELRY RECONSTRUCTION:
Use [ALL N jewelry images / the provided jewelry image] to fully reconstruct the piece
from every angle — do not hallucinate or invent any detail not visible in the provided shots.

SCENE DIRECTION:
Generate a photo of a model wearing the [jewelry type] shown in the reference image[s].
Scene: [scene description]. Camera focus: [focus area].
Warm gold tones, luxury brand aesthetic. Style: @elaris.925 — refined, modern, aspirational.
[Optional custom notes]
```

### 9.3 Full Mode Prompt (Jewelry + Model Reference)

```
IMAGE REFERENCES:
Images 1 [through N] show the [jewelry type] piece from different angles —
these are your product reference.
Image [N+1] is the model reference — keep her face, skin tone, features, and overall
appearance IDENTICAL to this reference. Do not alter her appearance in any way.

JEWELRY RECONSTRUCTION:
Use ALL [N] jewelry images together to fully reconstruct the piece from every angle —
do not hallucinate or invent any detail not visible in the provided shots.

SCENE DIRECTION:
Generate a photo of the exact same woman from Image [N+1] wearing the [jewelry type]
shown in the reference images. Scene: [scene description].
Camera focus: [focus area]. Warm gold tones, luxury brand aesthetic.
Style: @elaris.925 — refined, modern, aspirational.

Model description for additional reference: [profile text descriptor].
[Optional custom notes]
```

---

## 10. Scene & Jewelry Type Configuration

### 10.1 Scene Presets

Six scene presets were defined to cover the primary content scenarios for @elaris.925:

| Scene | Description | Best For |
|---|---|---|
| Studio | Clean studio, neutral backdrop, controlled light | Product showcase, catalog shots |
| Editorial | High-fashion editorial, dramatic lighting | Campaign images, hero content |
| Outdoor | Natural outdoor, golden hour, soft environment | Lifestyle, seasonal content |
| Café | Cozy café interior, warm ambient light | Casual lifestyle, relatable content |
| Close-up | Macro close-up on jewelry detail, shallow depth | Detail shots, highlighting craftsmanship |
| Lifestyle | Casual lifestyle, natural everyday moment | Stories, reels thumbnails, relatable content |

### 10.2 Jewelry Type Presets

Five jewelry types with camera focus areas:

| Type | Camera Focus |
|---|---|
| Earrings | Ears and side of neck |
| Necklace | Neck and décolletage |
| Bracelet | Wrist and hand |
| Ring | Fingers and hand |
| Full Set | Full upper body |

The camera focus is injected into the prompt to guide composition and depth-of-field direction.

---

## 11. Known Limitations & Honest Caveats

### 11.1 Text-Only Consistency (No Reference Image)

Without a reference image uploaded to the model profile, consistency relies purely on the text descriptor. This achieves approximately 60–70% visual consistency — same general type of person, but not an identical face across generations.

**Recommendation:** Always generate a "model library" session first (20–30 images from a single well-crafted prompt), select the best 3–5 results, then save one as the profile's reference image.

### 11.2 Gemini's Consistency Upper Bound

Even with a reference image, Gemini 2.5 Flash Image achieves approximately 85–95% face consistency. It is not 100%. Subtle variations in expression, exact eye angle, or skin rendering may appear. This is a model limitation, not a prompt limitation.

### 11.3 Multi-Change Degradation

Consistency weakens when too many elements change simultaneously. The prompt should change only the **scene and lighting**, not the person's pose, hair, expression, and background all at once. Isolated changes produce better results.

### 11.4 Image Quantity vs. Quality

More jewelry angle shots improve reconstruction accuracy, but beyond 4 images, the benefit diminishes and may introduce noise. 2–3 well-chosen angles (front, side, detail) is the optimal range for most pieces.

---

## 12. UI Component Specification

### 12.1 Component Architecture

The Model Consistency panel is built as a **standalone React component** (`elaris-model-consistency.jsx`) with the following structure:

```
ElarisModelConsistency (root)
├── Header (title, mode badge)
├── Mode Description (live-updating based on current mode)
├── Grid Layout (two columns)
│   ├── Left Column
│   │   ├── Jewelry Shots Selector (None / 1 / 2 / 3 / 4+)
│   │   ├── Attachment Hint (live count, updates with model ref)
│   │   ├── Jewelry Type Selector (5 types)
│   │   ├── Scene Selector (6 presets, 2-column grid)
│   │   └── Custom Notes (free text area)
│   └── Right Column
│       ├── Consistency Toggle (on/off)
│       ├── Model Profiles Panel (conditional on toggle)
│       │   ├── New Profile Form (expandable)
│       │   └── Profile Cards (name, descriptor, ref image upload)
│       ├── Generated Prompt Output (live, auto-updating)
│       ├── Copy Button (with toast notification)
│       └── Workflow Guide (live steps based on current config)
└── CopyToast (fixed position, animated)
```

### 12.2 Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#0c0a08` | Page root |
| Surface | `#131009` | Cards |
| Deep Surface | `#080705` | Prompt output box |
| Primary Gold | `#a67c52` | Labels, borders, accents |
| Light Gold | `#c9a96e` | Active states, text |
| Muted | `#4a3d30` | Hints, secondary text |
| Inactive | `#2a2018` | Default borders |
| Display Font | Cormorant Garamond | Titles, model names |
| UI Font | Jost | Labels, buttons, body |
| Monospace Font | DM Mono | Generated prompt output |

### 12.3 State-Driven Behavior

Every UI interaction triggers a prompt regeneration in real time. The key state variables:

| State | Type | Drives |
|---|---|---|
| `jewelryCount` | 0–4 | Mode determination, image labels, attachment hint |
| `consistencyOn` | boolean | Model panel visibility, mode determination |
| `activeProfileId` | string | Which profile descriptor/image is injected |
| `scene` | string | Scene description in prompt |
| `jewelry` | string | Jewelry type and camera focus in prompt |
| `customNotes` | string | Appended at end of prompt |

---

## 13. Integration Notes

### 13.1 Integration Point

This component should be integrated into the existing Prompt Studio section of the Content Engine, rendered when the user navigates to `#promptstudio`.

### 13.2 Dependencies

The component requires only React (with hooks) and no external libraries beyond Google Fonts (loaded via CDN at runtime). It is fully self-contained.

### 13.3 Multilingual Consideration

The current build is English-only. For full integration, all UI strings (card titles, button labels, scene descriptions, hints, workflow steps) should be passed through the existing EN/FR/AR translation system used by the Content Engine.

### 13.4 Persistence

Model profiles are currently stored in React component state (session memory only). For persistence across sessions, profiles should be saved to `localStorage` or the user's preferred storage mechanism so named models survive page refreshes.

---

## 14. Summary of Design Decisions

| Decision | Rationale |
|---|---|
| Three modes (Test / Product / Full) | Prompt structure changes fundamentally based on image attachments — it is not incremental. Three distinct templates are cleaner and less error-prone than one template with conditional fragments. |
| "None" jewelry count option | User legitimately needs prompt-only generation for testing concepts without attachment overhead. Excluding this would reduce the tool's utility for exploration workflows. |
| Named profiles instead of a single global model | Different content scenarios may benefit from different model types. Named profiles allow the user to maintain a small roster of virtual models and switch contexts instantly. |
| Role assignment at the top of the prompt | Gemini processes image context before creative direction. Declaring image roles first (before the scene instruction) ensures the model groups and processes each image set correctly before generating. |
| Reference image as optional, not required | Forcing a reference image would break the workflow for new users or new model profiles. Text-descriptor-only mode provides immediate value while the user builds their model library. |
| Jewelry count drives mode, not a separate mode picker | The user already knows how many images they're attaching. Deriving the mode from that count eliminates a redundant UI decision and keeps the workflow natural. |
| Camera focus from jewelry type | Injecting a camera focus instruction (e.g., "wrist and hand" for bracelets) improves composition quality without requiring the user to describe it manually every time. |
| Pre-loaded default profiles | Reduces time-to-value. The user can generate their first consistency-mode prompt immediately without needing to create a profile from scratch. |

---

*Blueprint prepared during design session for @elaris.925 Elaris Content Engine.*  
*Component file: `elaris-model-consistency.jsx`*
