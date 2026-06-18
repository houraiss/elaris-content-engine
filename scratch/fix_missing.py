import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── A: Insert method bodies before _buildPrompt(archetype) ──────────────
OLD_BUILD = "    _buildPrompt(archetype) {"
NEW_BUILD  = """    // ── Category-specific jewelry placement instructions ──────────────────────
    _buildPlacementInstruction(category) {
        const rules = {
            'necklace': 'PLACEMENT: necklace worn at the FRONT of neck, chain visible at front of chest, pendant at chest/décolletage — NEVER on the back or shoulders',
            'earring':  'PLACEMENT: earrings in earlobes one on each ear, visible from front or side, correctly proportioned to face size',
            'ring':     'PLACEMENT: ring fitted on a finger at correct anatomical size, ring width proportional to finger, never floating or oversized',
            'bracelet': 'PLACEMENT: bracelet on the wrist at proportional scale, sized for wrist diameter',
            'bangle':   'PLACEMENT: bangle on the wrist, correctly sized, not oversized',
            'anklet':   'PLACEMENT: anklet around the ankle, slender and proportional to ankle width',
            'pendant':  'PLACEMENT: pendant necklace at front of chest, pendant at correct scale, never on back',
            'brooch':   'PLACEMENT: brooch on lapel or upper chest of clothing, visible from front',
        };
        return rules[category] || '';
    },

    // ── Category-specific negative prompts ──────────────────────────────
    _buildCategoryNegatives(category, isHuman) {
        const anatomy = isHuman
            ? 'three arms, extra arms, extra limbs, malformed anatomy, extra fingers, six fingers, mutated limbs, fused fingers, asymmetrical geometry'
            : '(hand, fingers, skin, arm, human), distorted shape, asymmetrical geometry';

        const scale = 'oversized jewelry, jewelry disproportionate to body, necklace wider than shoulders, pendant larger than hand, ring wider than palm, earring larger than face, jewelry not to correct real-world scale';

        const placement = {
            'necklace': 'necklace on the back, necklace hanging behind model, pendant on back, chain only visible from behind, necklace on shoulder, necklace placed at back of neck',
            'earring':  'earring too large, earring disproportionate to face size, earring larger than head, misplaced earring',
            'ring':     'ring too large for finger, ring not on finger, floating ring, ring covering entire hand',
            'bracelet': 'bracelet not on wrist, bracelet floating off body, bracelet on wrong limb',
            'bangle':   'bangle not on wrist, floating bangle, bangle on wrong body part',
            'anklet':   'anklet on wrist, anklet not on ankle, anklet floating',
            'pendant':  'pendant on back, pendant not visible from front, pendant hanging behind neck',
            'brooch':   'brooch floating off clothing, brooch not on lapel',
        };

        const placementNeg = placement[category] || '';
        const parts = [anatomy, scale];
        if (placementNeg) parts.push(placementNeg);
        parts.push('AI artifacts, text overlay, watermarks, logos, cartoon, illustration, painting, low quality, blurry, chromatic aberration, plastic texture, 3d render');

        return `Negative prompt: ${parts.join(', ')}.`;
    },

    _buildPrompt(archetype) {"""

if OLD_BUILD in ps:
    ps = ps.replace(OLD_BUILD, NEW_BUILD, 1)
    print('✓ Method bodies added before _buildPrompt')
else:
    print('✗ _buildPrompt(archetype) not found')
    idx = ps.find('_buildPrompt')
    print(repr(ps[idx:idx+60]))

# ── B: Brand Touch UI — insert before the "Model & Human Elements" card ──
# Find exact string in the template
idx_mhe = ps.find('Model &amp; Human Elements')
print(f'\nModel & Human Elements at: {idx_mhe}')
print(repr(ps[max(0,idx_mhe-400):idx_mhe+100]))
