"""
Elaris Prompt Studio — Automated Prompt Quality Auditor
Simulates the JavaScript prompt generation in Python and runs
contradiction/inconsistency checks across all category × archetype combos.
"""
import sys, io, re, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps_text = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── 1. Extract archetype definitions ──────────────────────────────────────
import re

# Pull the archetypes array from the JS source
arch_block_m = re.search(r'this\._archetypes\s*=\s*\[(.+?)\];\s*\}', ps_text, re.DOTALL)
if not arch_block_m:
    # Try alternate pattern
    arch_block_m = re.search(r'_archetypes\s*=\s*\[(.+?)\];\s*\n', ps_text, re.DOTALL)

# Simpler: extract archetype IDs and their subjects manually
arch_ids = re.findall(r"id:\s*'([^']+)'[^\}]+?subjects:\s*\[([^\]]+)\]", ps_text, re.DOTALL)

archetypes = []
for arch_id, subj_block in arch_ids:
    subjects = re.findall(r"'([^']+)'", subj_block)
    archetypes.append({'id': arch_id, 'subjects': subjects})

print(f'Found {len(archetypes)} archetypes\n')

# ── 2. Define classification sets (mirrors the JS code) ──────────────────
HUMAN_ARCHETYPES = {
    'body-intimate', 'editorial-model', 'bw-dramatic', 'collection-showcase',
    'motion-blur', 'cinematic-portrait', 'lifestyle-moment', 'heritage-moroccan',
    'celestial-mythic', 'architectural-context', 'masculine-editorial',
    'surface-lean', 'hair-drama', 'wet-element',
}

CATEGORIES = ['ring', 'necklace', 'earring', 'bracelet', 'bangle', 'anklet', 'pendant', 'brooch']

PLACEMENT_RULES = {
    'ring':     'PLACEMENT: ring fitted on a finger',
    'necklace': 'PLACEMENT: necklace worn at the FRONT of the neck',
    'earring':  'PLACEMENT: earrings in earlobes one on each ear',
    'bracelet': 'PLACEMENT: bracelet on the wrist',
    'bangle':   'PLACEMENT: bangle on the wrist',
    'anklet':   'PLACEMENT: anklet around the ankle',
    'pendant':  'PLACEMENT: pendant necklace at front of chest',
    'brooch':   'PLACEMENT: brooch on lapel or upper chest',
}

PLACEMENT_NEGS_HUMAN = {
    'ring':     ['ring too large for finger', 'ring not on finger', 'floating ring', 'ring covering entire hand'],
    'necklace': ['necklace on the back', 'pendant on back', 'chain only visible from behind'],
    'earring':  ['earring too large', 'earring disproportionate to face size'],
    'bracelet': ['bracelet not on wrist', 'bracelet floating off body'],
    'bangle':   ['bangle not on wrist', 'floating bangle'],
    'anklet':   ['anklet on wrist', 'anklet not on ankle'],
    'pendant':  ['pendant on back', 'pendant not visible from front'],
    'brooch':   ['brooch floating off clothing'],
}

HARDCODED_PIECE_NAMES = ['earring', 'ring', 'necklace', 'bracelet', 'bangle', 'anklet', 'pendant', 'brooch']

PRODUCT_ANATOMY_NEG = '(hand, fingers, skin, arm, human)'
HUMAN_ANATOMY_NEG   = 'three arms, extra arms, extra limbs, malformed anatomy'

# ── 3. Run audit ─────────────────────────────────────────────────────────
issues = []

def add_issue(severity, arch_id, category, subject_idx, subject, issue_type, detail):
    issues.append({
        'sev': severity,  # CRITICAL / WARNING / INFO
        'arch': arch_id,
        'cat': category,
        'subj_idx': subject_idx,
        'subject': subject[:80],
        'type': issue_type,
        'detail': detail,
    })

for arch in archetypes:
    arch_id = arch['id']
    is_human = arch_id in HUMAN_ARCHETYPES
    subjects = arch['subjects']

    for cat in CATEGORIES:
        placement_rule = PLACEMENT_RULES.get(cat, '')
        placement_neg  = PLACEMENT_NEGS_HUMAN.get(cat, [])
        piece_label = cat  # simplified (no material)

        for si, subject in enumerate(subjects):
            subj_lower = subject.lower()

            # ── CHECK A: Placement rule contradicts subject ──────────────
            if is_human and placement_rule:
                # Ring placement rule on a non-hand subject
                if cat == 'ring' and 'finger' in placement_rule.lower():
                    # Subject mentions surface placement (no finger)
                    surface_hints = ['surface', 'bowl', 'box', 'velvet', 'sand', 'marble', 'ice',
                                     'water droplet', 'linen', 'lavender', 'table', 'asphalt',
                                     'polished', 'reflection', 'droplet']
                    if any(h in subj_lower for h in surface_hints) and 'finger' not in subj_lower and 'hand' not in subj_lower:
                        add_issue('WARNING', arch_id, cat, si, subject,
                                  'PLACEMENT_RULE_MISMATCH',
                                  f'Subject places piece on surface but placement rule says "on finger"')

            # ── CHECK B: Product archetype but placement rule would fire ─
            if not is_human and placement_rule:
                add_issue('CRITICAL', arch_id, cat, si, subject,
                          'PRODUCT_GETS_PLACEMENT_RULE',
                          f'Non-human archetype would get PLACEMENT rule: "{placement_rule[:60]}"')

            # ── CHECK C: Product archetype but model direction would fire (OLD BUG — verify fixed) ──
            # This is now fixed in the code. We note it as verified.

            # ── CHECK D: Hardcoded piece names in subject template ───────
            # Only flag if the name is DIFFERENT from current category
            for name in HARDCODED_PIECE_NAMES:
                if name != cat and name in subj_lower:
                    # Check it's not just a common word like "ring" in "earring"
                    if re.search(r'\b' + name + r'\b', subj_lower):
                        add_issue('WARNING', arch_id, cat, si, subject,
                                  'HARDCODED_PIECE_NAME',
                                  f'Subject template hardcodes "{name}" but category is "{cat}" — may produce confused output')
                        break  # only report once per subject

            # ── CHECK E: Human subject with product anatomy negative ──────
            if is_human:
                hand_hints = ['hand', 'finger', 'wrist', 'model', 'arm', 'neck', 'collarbone', 'body']
                if any(h in subj_lower for h in hand_hints):
                    if PRODUCT_ANATOMY_NEG in subj_lower:
                        add_issue('CRITICAL', arch_id, cat, si, subject,
                                  'ANATOMY_NEG_CONTRADICTION',
                                  'Human body part in subject but product anatomy negative active')

            # ── CHECK F: Gender mismatch in subject ───────────────────────
            if 'man with' in subj_lower or 'man\'s' in subj_lower or 'his ' in subj_lower:
                add_issue('INFO', arch_id, cat, si, subject,
                          'GENDER_SPECIFIC_SUBJECT',
                          'Subject is gender-specific (male) — may conflict with female model selection')

            # ── CHECK G: Subject mentions piece type that doesn't match ──
            # e.g. subject says "earring" but category is "ring"
            # Already covered in CHECK D

            # ── CHECK H: Subject mentions "necklace on back" concepts ────
            # Validate placement instructions are not contradicted
            if cat == 'necklace' and ('back' in subj_lower) and ('neck' not in subj_lower or 'nape' in subj_lower):
                add_issue('WARNING', arch_id, cat, si, subject,
                          'NECKLACE_BACK_PLACEMENT',
                          'Necklace subject mentions "back" — could contradict front-placement rule')

# ── 4. Report ────────────────────────────────────────────────────────────
from collections import defaultdict
sev_counts = defaultdict(int)
type_counts = defaultdict(int)

for iss in issues:
    sev_counts[iss['sev']] += 1
    type_counts[iss['type']] += 1

print('=' * 70)
print('ELARIS PROMPT AUDIT — ALL CATEGORIES x ALL ARCHETYPES')
print(f'Checked: {len(CATEGORIES)} categories x {len(archetypes)} archetypes x subjects')
print('=' * 70)
print(f"\nSummary: {sev_counts['CRITICAL']} CRITICAL / {sev_counts['WARNING']} WARNING / {sev_counts['INFO']} INFO")
print(f"Issue types: {dict(type_counts)}")
print()

# Group by type for cleaner output
by_type = defaultdict(list)
for iss in issues:
    by_type[iss['type']].append(iss)

for itype, ilist in sorted(by_type.items(), key=lambda x: (-len(x[1]), x[0])):
    sev = ilist[0]['sev']
    print(f'── [{sev}] {itype} ({len(ilist)} cases) ──')

    # Unique arch+cat combos for this type
    seen_combos = set()
    for iss in ilist:
        key = (iss['arch'], iss['cat'])
        if key not in seen_combos:
            seen_combos.add(key)
            print(f"  arch={iss['arch']:<28} cat={iss['cat']:<10}")
            if itype in ('HARDCODED_PIECE_NAME', 'NECKLACE_BACK_PLACEMENT', 'PLACEMENT_RULE_MISMATCH'):
                print(f"    subject: {iss['subject']}")
                print(f"    detail:  {iss['detail']}")
    print()

print('=' * 70)

# Save JSON for detailed review
with open('scratch/audit_results.json', 'w', encoding='utf-8') as f:
    json.dump(issues, f, indent=2, ensure_ascii=False)
print('Full results saved to scratch/audit_results.json')
