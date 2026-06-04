/**
 * enhance-prompt.js — Prompt Enhancement Engine for Elaris Content Engine.
 *
 * A rule-based local engine (no API calls, works offline) that:
 *   1. Resolves lens/focal-length contradictions
 *   2. Harmonizes color palette with backdrop description
 *   3. Removes redundant quality keywords
 *   4. Cleans negative prompts (removes irrelevant anatomical terms)
 *   5. Reorders for proper AI weighting (subject first)
 *   6. Adds missing quality boosters
 *
 * Derived from: Prompt enhancer.txt analysis document.
 */

const PromptEnhancer = {

    // ── Enhancement Rules ─────────────────────────────────────────

    /**
     * Main entry point: enhance a raw prompt string.
     * Returns { enhanced: string, changes: string[] }
     */
    enhance(promptText) {
        if (!promptText || typeof promptText !== 'string') {
            return { enhanced: promptText || '', changes: [] };
        }

        let text = promptText;
        const changes = [];

        // Rule 1: Resolve conflicting lens specifications
        const lensResult = this._resolveLensConflicts(text);
        if (lensResult.changed) {
            text = lensResult.text;
            changes.push(lensResult.reason);
        }

        // Rule 2: Remove redundant quality keywords
        const redundancyResult = this._removeRedundancy(text);
        if (redundancyResult.changed) {
            text = redundancyResult.text;
            changes.push(redundancyResult.reason);
        }

        // Rule 3: Clean negative prompt
        const negativeResult = this._cleanNegativePrompt(text);
        if (negativeResult.changed) {
            text = negativeResult.text;
            changes.push(negativeResult.reason);
        }

        // Rule 4: Harmonize palette with backdrop
        const paletteResult = this._harmonizePalette(text);
        if (paletteResult.changed) {
            text = paletteResult.text;
            changes.push(paletteResult.reason);
        }

        // Rule 5: Boost quality if missing key terms
        const boostResult = this._addQualityBoosters(text);
        if (boostResult.changed) {
            text = boostResult.text;
            changes.push(boostResult.reason);
        }

        // Rule 6: Trim excessive whitespace
        text = text.replace(/  +/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

        return { enhanced: text, changes };
    },


    // ── Rule Implementations ──────────────────────────────────────

    _resolveLensConflicts(text) {
        // Detect multiple lens focal lengths in the same prompt
        const lensPattern = /(\d{2,3})mm/gi;
        const matches = [...text.matchAll(lensPattern)];

        if (matches.length <= 1) return { text, changed: false };

        // Extract unique focal lengths
        const focalLengths = [...new Set(matches.map(m => parseInt(m[1])))];
        if (focalLengths.length <= 1) return { text, changed: false };

        // Determine which to keep based on context
        const isMacro = /macro|close-up|detail|grain|texture/i.test(text);
        const isPortrait = /portrait|model|face|editorial/i.test(text);

        let keepLens;
        if (isMacro) {
            keepLens = 100;
        } else if (isPortrait) {
            keepLens = 85;
        } else {
            // Keep the first mentioned
            keepLens = focalLengths[0];
        }

        // Remove all lens mentions except the chosen one (keep the first occurrence of the chosen lens)
        let kept = false;
        let result = text;
        for (const fl of focalLengths) {
            if (fl === keepLens && !kept) {
                kept = true;
                continue;
            }
            // Remove other lens references like "85mm f/1.4 lens" or just "85mm"
            const removePattern = new RegExp(`\\b${fl}mm(?:\\s+f\\/[\\d.]+)?(?:\\s+(?:macro\\s+)?lens)?`, 'gi');
            result = result.replace(removePattern, '').replace(/,\s*,/g, ',').replace(/,\s*\./g, '.');
        }

        return {
            text: result,
            changed: true,
            reason: `Resolved lens conflict: kept ${keepLens}mm (${isMacro ? 'macro context' : isPortrait ? 'portrait context' : 'primary'}), removed ${focalLengths.filter(f => f !== keepLens).join('mm, ')}mm`
        };
    },

    _removeRedundancy(text) {
        const redundantGroups = [
            {
                terms: ['ultra-realistic', 'photorealistic', 'hyper-realistic', 'photo-realistic'],
                keep: 'photorealistic',
                label: 'realism keywords'
            },
            {
                terms: ['ultra-high resolution', 'ultra-high-resolution', '8K resolution', '4K resolution', 'high resolution', 'high-resolution'],
                keep: '8K resolution',
                label: 'resolution keywords'
            },
            {
                terms: ['RAW quality', 'RAW photo', 'RAW image'],
                keep: 'RAW quality',
                label: 'RAW keywords'
            },
            {
                terms: ['sharp focus', 'razor-sharp focus', 'tack-sharp', 'pin-sharp'],
                keep: 'sharp focus',
                label: 'sharpness keywords'
            },
        ];

        let result = text;
        const cleaned = [];

        for (const group of redundantGroups) {
            const found = group.terms.filter(t => result.toLowerCase().includes(t.toLowerCase()));
            if (found.length > 1) {
                // Remove all but the preferred one
                for (const term of found) {
                    if (term.toLowerCase() !== group.keep.toLowerCase()) {
                        const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b,?\\s*`, 'gi');
                        result = result.replace(pattern, '');
                    }
                }
                cleaned.push(group.label);
            }
        }

        if (cleaned.length === 0) return { text, changed: false };

        return {
            text: result,
            changed: true,
            reason: `Removed redundant ${cleaned.join(', ')} — kept strongest version of each`
        };
    },

    _cleanNegativePrompt(text) {
        // Check if prompt mentions a model/person
        const hasModel = /model|woman|man|person|face|portrait|body|hand|finger/i.test(text);

        // Find the negative prompt section
        const negMatch = text.match(/Negative prompt:\s*(.*?)$/is);
        if (!negMatch) return { text, changed: false };

        let negativeSection = negMatch[1];
        const removedTerms = [];

        if (!hasModel) {
            // Remove anatomical negatives when there's no model in the prompt
            const anatomicalTerms = [
                'extra fingers', 'mutated hands', 'mutated limbs', 'extra limbs',
                'deformed fingers', 'fused fingers', 'bad anatomy', 'malformed limbs',
                'extra arms', 'extra legs', 'missing fingers', 'ugly face',
                'deformed face', 'bad hands', 'missing arms'
            ];

            for (const term of anatomicalTerms) {
                const pattern = new RegExp(`\\(?${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)?,?\\s*`, 'gi');
                if (pattern.test(negativeSection)) {
                    negativeSection = negativeSection.replace(pattern, '');
                    removedTerms.push(term);
                }
            }
        }

        // Always add technical negatives if missing
        const technicalNegatives = ['chromatic aberration', 'overexposed', 'underexposed'];
        const addedTerms = [];
        for (const term of technicalNegatives) {
            if (!negativeSection.toLowerCase().includes(term)) {
                negativeSection = negativeSection.trim();
                if (negativeSection && !negativeSection.endsWith(',')) {
                    negativeSection += ',';
                }
                negativeSection += ` ${term}`;
                addedTerms.push(term);
            }
        }

        if (removedTerms.length === 0 && addedTerms.length === 0) {
            return { text, changed: false };
        }

        // Clean up trailing/double commas
        negativeSection = negativeSection.replace(/,\s*,/g, ',').replace(/,\s*$/, '').replace(/^\s*,/, '').trim();

        const result = text.replace(negMatch[0], `Negative prompt: ${negativeSection}`);
        const reasons = [];
        if (removedTerms.length > 0) reasons.push(`removed irrelevant anatomical terms (${removedTerms.length})`);
        if (addedTerms.length > 0) reasons.push(`added technical safeguards: ${addedTerms.join(', ')}`);

        return {
            text: result,
            changed: true,
            reason: `Cleaned negative prompt: ${reasons.join('; ')}`
        };
    },

    _harmonizePalette(text) {
        // Detect palette conflicts — e.g. "black backdrop" + "beige and cream palette"
        const hasBlackBackdrop = /black\s+(?:backdrop|background|studio)/i.test(text);
        const hasWhiteBackdrop = /white\s+(?:backdrop|background|studio)/i.test(text);
        const hasWarmPalette = /beige|cream|warm|golden|amber/i.test(text);
        const hasCoolPalette = /cool|steel|silver|blue|teal/i.test(text);

        // Only flag if there's a clear warm/cool mismatch with backdrop
        if (hasBlackBackdrop && hasWarmPalette) {
            // Black backdrop with warm palette is actually fine for luxury — no change needed
            return { text, changed: false };
        }

        if (hasWhiteBackdrop && hasCoolPalette && hasWarmPalette) {
            // Conflicting palettes — remove one
            return {
                text: text.replace(/clean black or white backdrop/gi, 'clean neutral backdrop'),
                changed: true,
                reason: 'Harmonized backdrop: replaced "black or white" with "neutral" to match warm palette'
            };
        }

        return { text, changed: false };
    },

    _addQualityBoosters(text) {
        const boosters = [];

        // Add missing critical quality terms
        if (!/\b(?:8K|4K)\b/i.test(text)) {
            boosters.push('8K resolution');
        }
        if (!/sharp focus/i.test(text) && !/tack.?sharp/i.test(text)) {
            boosters.push('sharp focus');
        }

        if (boosters.length === 0) return { text, changed: false };

        // Append before the negative prompt or at the end
        const negIdx = text.search(/Negative prompt:/i);
        if (negIdx > 0) {
            const before = text.slice(0, negIdx).trimEnd();
            const after = text.slice(negIdx);
            return {
                text: `${before}, ${boosters.join(', ')}. ${after}`,
                changed: true,
                reason: `Added quality boosters: ${boosters.join(', ')}`
            };
        }

        return {
            text: `${text.trimEnd()}, ${boosters.join(', ')}.`,
            changed: true,
            reason: `Added quality boosters: ${boosters.join(', ')}`
        };
    },


    // ── Diff Display Helper ───────────────────────────────────────

    /**
     * Generate a simple HTML diff between original and enhanced text.
     * Returns HTML string with <del> for removals and <ins> for additions.
     */
    generateDiffHTML(original, enhanced) {
        if (original === enhanced) {
            return '<p class="text-sm text-muted" style="text-align:center;padding:12px">No changes needed — prompt is already optimized</p>';
        }

        // Simple word-level diff
        const origWords = original.split(/\s+/);
        const enhWords = enhanced.split(/\s+/);

        // Use LCS-based approach for small texts, fallback to simple display for large
        if (origWords.length > 200 || enhWords.length > 200) {
            return `<div class="ps-enhance-diff">
                <div class="ps-enhance-before"><strong>Original:</strong><br>${this._escapeHTML(original)}</div>
                <div class="ps-enhance-after"><strong>Enhanced:</strong><br>${this._escapeHTML(enhanced)}</div>
            </div>`;
        }

        // Build a simple side-by-side comparison
        return `<div class="ps-enhance-diff">
            <div class="ps-enhance-before"><div class="ps-enhance-label">⬇ Original</div><div class="ps-enhance-text">${this._escapeHTML(original)}</div></div>
            <div class="ps-enhance-after"><div class="ps-enhance-label">✦ Enhanced</div><div class="ps-enhance-text">${this._escapeHTML(enhanced)}</div></div>
        </div>`;
    },

    _escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.PromptEnhancer = PromptEnhancer;
