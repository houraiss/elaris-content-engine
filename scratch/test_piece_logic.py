import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Simulate the new piece construction logic (mirrors the JS)
def build_piece(category, pieceDesc, material_label):
    catLabels = {
        'ring': 'ring', 'necklace': 'necklace', 'earring': 'earrings',
        'bracelet': 'bracelet', 'bangle': 'bangle', 'anklet': 'anklet',
        'pendant': 'pendant', 'brooch': 'brooch',
    }
    catWord = catLabels.get(category, category)
    _typeWords = 'ring|rings|necklace|necklaces|earring|earrings|bracelet|bracelets|bangle|bangles|anklet|anklets|pendant|pendants|brooch|brooches|brooche'
    _matWords  = r'925\s*sterling\s*silver|sterling\s*silver|18k\s*gold|14k\s*gold|rose\s*gold|yellow\s*gold|white\s*gold|platinum|\b925\b'
    _rawDesc = pieceDesc or ''
    _rawDesc = re.sub(r'\b(' + _typeWords + r')\b', '', _rawDesc, flags=re.IGNORECASE)
    _rawDesc = re.sub(_matWords, '', _rawDesc, flags=re.IGNORECASE)
    _rawDesc = re.sub(r'\s+', ' ', _rawDesc).strip()
    return f"{material_label} {catWord} {_rawDesc}".strip() if _rawDesc else f"{material_label} {catWord}"

print('=== SIMULATION: piece sanitization ===\n')

test_cases = [
    # (category, user_typed_pieceDesc, material, expected_contains, expected_not_contains)
    ('ring',      'link bracelet with diamonds accents',                  '925 Sterling Silver',  ['ring', '925 Sterling Silver'], ['bracelet']),
    ('ring',      '925 sterling silver link bracelet with diamonds accents', '925 Sterling Silver', ['ring', '925 Sterling Silver'], ['bracelet']),
    ('ring',      'with diamonds accents',                                '925 Sterling Silver',  ['ring', 'diamonds'], ['bracelet']),
    ('ring',      'elegant ring with pavé diamonds',                      '925 Sterling Silver',  ['ring', 'pavé'], []),
    ('necklace',  'chain bracelet style',                                 '18K Gold',             ['necklace', '18K Gold'], ['bracelet']),
    ('earring',   'drop earring with sapphire',                           'Platinum',             ['earrings', 'Platinum'], []),
    ('bracelet',  'Cuban link bracelet with gold accents',                '14K Gold',             ['bracelet', '14K Gold'], []),
    ('pendant',   'teardrop pendant with emerald',                        '925 Sterling Silver',  ['pendant', 'emerald'], []),
]

all_pass = True
for cat, user_desc, mat, must_have, must_not in test_cases:
    result = build_piece(cat, user_desc, mat)
    ok = all(h.lower() in result.lower() for h in must_have) and \
         all(n.lower() not in result.lower() for n in must_not)
    status = 'PASS' if ok else 'FAIL'
    if not ok: all_pass = False
    print(f'[{status}] cat={cat:<10} input="{user_desc[:40]}"')
    print(f'         → "{result}"')
    if not ok:
        fails = [h for h in must_have if h.lower() not in result.lower()] + \
                [f'!{n}' for n in must_not if n.lower() in result.lower()]
        print(f'         FAILED on: {fails}')
    print()

print('ALL PASS' if all_pass else 'SOME FAILURES')
