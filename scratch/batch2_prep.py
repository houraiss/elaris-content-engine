import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# Batch 2 – Fix 7: localStorage Deduplication for subjects
# Update _getUniqueSubject to prefer never-seen-across-sessions indices
# ════════════════════════════════════════════════════════════════════

OLD_UNIQUE_SUBJ = """    _getUniqueSubject(archetype) {
        // If pool doesn't exist or is empty, create a new shuffled pool
        if (!this._subjectPools[archetype.id] || this._subjectPools[archetype.id].length === 0) {
            let indices = archetype.subjects.map((_, i) => i);
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            this._subjectPools[archetype.id] = indices;
        }
        
        // Pop the next unique index
        const idx = this._subjectPools[archetype.id].pop();
        return archetype.subjects[idx];
    },"""

NEW_UNIQUE_SUBJ = """    _getUsedSubjectKey(archetypeId) {
        return 'elaris_used_' + archetypeId;
    },

    _getUniqueSubject(archetype) {
        // ── Cross-session deduplication via localStorage ───────────────────
        // We track which subject indices have been used in previous sessions.
        // Prefer unused-across-sessions subjects, cycling through them before repeating.
        const storageKey = this._getUsedSubjectKey(archetype.id);
        let usedAcrossSessions = [];
        try {
            usedAcrossSessions = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch(e) { usedAcrossSessions = []; }

        const allIndices = archetype.subjects.map((_, i) => i);
        const unusedAcross = allIndices.filter(i => !usedAcrossSessions.includes(i));

        // If pool doesn't exist or is empty, rebuild from unused-across-sessions first
        if (!this._subjectPools[archetype.id] || this._subjectPools[archetype.id].length === 0) {
            // Prefer subjects never seen across sessions; if all seen, reset cross-session memory
            let candidateIndices = unusedAcross.length > 0 ? unusedAcross : (() => {
                try { localStorage.removeItem(storageKey); } catch(e) {}
                return allIndices;
            })();

            // Fisher-Yates shuffle on candidates
            for (let i = candidateIndices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidateIndices[i], candidateIndices[j]] = [candidateIndices[j], candidateIndices[i]];
            }
            this._subjectPools[archetype.id] = [...candidateIndices];
        }

        // Pop the next unique index from in-session pool
        const idx = this._subjectPools[archetype.id].pop();

        // Mark as used across sessions
        try {
            const updated = [...new Set([...usedAcrossSessions, idx])];
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch(e) {}

        return archetype.subjects[idx];
    },"""

if OLD_UNIQUE_SUBJ in ps:
    ps = ps.replace(OLD_UNIQUE_SUBJ, NEW_UNIQUE_SUBJ)
    fixes.append('FIX 7 OK: _getUniqueSubject — localStorage cross-session dedup')
else:
    fixes.append('FIX 7 MISS: _getUniqueSubject body not matched')
    idx = ps.find('_getUniqueSubject(archetype)')
    print(repr(ps[idx:idx+200]))


# ════════════════════════════════════════════════════════════════════
# Batch 2 – Fix 8: Prompt Similarity Warning
# After building all prompts, compare subject keywords pairwise
# Tag similar prompts with a warning flag for the UI to display
# ════════════════════════════════════════════════════════════════════
# We need to:
# 1. Add a _computePromptSimilarity(p1, p2) helper
# 2. After the prompts[] array is built, scan for similar pairs
# 3. Add a `similar: true` flag to the lower-ranked duplicate

# Find where prompts are pushed and then rendered
TARGET_SIMILAR_INSERT = "_getUsedSubjectKey(archetypeId) {"

SIMILARITY_HELPER = """    _computePromptSimilarity(text1, text2) {
        // Simple keyword-overlap similarity (Jaccard-like) between two prompt texts
        // Returns a 0–1 score; >0.55 = suspiciously similar
        const tokenise = t => new Set(
            t.toLowerCase()
             .replace(/[^a-z0-9 ]/g, ' ')
             .split(/\\s+/)
             .filter(w => w.length > 4)   // only meaningful words
        );
        const s1 = tokenise(text1);
        const s2 = tokenise(text2);
        const intersection = [...s1].filter(w => s2.has(w)).length;
        const union = new Set([...s1, ...s2]).size;
        return union === 0 ? 0 : intersection / union;
    },

    """

if TARGET_SIMILAR_INSERT in ps:
    ps = ps.replace(TARGET_SIMILAR_INSERT, SIMILARITY_HELPER + TARGET_SIMILAR_INSERT)
    fixes.append('FIX 8a OK: _computePromptSimilarity helper added')
else:
    fixes.append('FIX 8a MISS: insertion point not found')

# Find where prompts array is assembled in _generatePrompts and add similarity scan after
# Look for the loop that builds prompts
AFTER_LOOP_TARGET = "        // ── Display prompts ──────────────────────────────────────────────\n"
if AFTER_LOOP_TARGET not in ps:
    # Try alternate
    AFTER_LOOP_TARGET = "        // ── Display prompts"
    idx_alt = ps.find(AFTER_LOOP_TARGET)
    print(f'Display prompts comment at: {idx_alt}')
    print(repr(ps[idx_alt:idx_alt+80]))

# Check for it
idx_display = ps.find('Display prompts')
print(f'Display prompts at: {idx_display}')
print(repr(ps[max(0,idx_display-50):idx_display+120]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

print()
for fix in fixes: print(f'  {fix}')
