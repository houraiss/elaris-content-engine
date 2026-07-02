## **Prompt Studio — the core engine**

This is by far the most developed module (v3.0–v3.6 iterations, smart-guide scoring, similarity-dedup, per-archetype camera/lighting recommendations). The archetype library is already huge, so more archetypes should target actual cultural/brand gaps rather than volume:

**Stones — a real gap:** the list has diamond, emerald, sapphire, ruby, pearl, turquoise, cubic zirconia, mixed — but **no amber or coral**, which are foundational to traditional Amazigh/Berber silver jewelry (the exact heritage this brand leans on in its captions — "Berber Traditional" is already a jewelry style option). Adding them would be more on-brand than almost anything else here.

**Material finishes:** the materials list is intentionally narrow (925 Sterling / 800 Moroccan Silver — matches the `@elaris.925` identity), but you could add *finish* variants without breaking that scope: oxidized/antiqued silver, brushed matte, high-polish/rhodium-plated, and silver vermeil. These plug straight into the existing prompt-building logic as modifiers, not new materials.

**Archetype ideas with real brand grounding** (vs. generic additions):

* *Artisan-at-work* — hands shaping silver at the bench; provenance/behind-the-scenes content performs very well for handmade brands, and nothing here covers it  
* *Bridal/trousseau* — traditional Moroccan wedding jewelry sets, a culturally significant, high-value content category  
* *Souk/market editorial* — piece styled against Agadir souk textures (brass trays, spices, woven baskets)  
* *Heirloom/generational* — mother-daughter or hand-to-hand framing, ties into the "handed down through craft" caption voice already in `captions.js`

## **Generate page — half the providers are stubs**

Of the 6 AI model options, only **Pollinations** (free, works) and **Gemini/Imagen** are actually wired up. Fal, Together, Replicate, and OpenAI are mock calls with a fake 2-second delay and a "coming soon" toast. Fal (Flux Schnell) and OpenAI (DALL-E 3\) both have simple enough REST APIs to implement for real — that's the highest-leverage fix in this file since the UI already promises them.

## **Trends page — fully static**

`assets/trends.json` is hand-curated with no freshness signal beyond a "last updated" date and a note to "ask Antigravity to refresh." Cheap improvement: a staleness warning if the JSON is older than, say, 30 days, so it doesn't quietly go stale without anyone noticing.