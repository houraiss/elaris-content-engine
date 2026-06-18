import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} -> v{v+1}')

checks = [
    ('necklace worn at the FRONT' in ps,       'Necklace placement rule'),
    ('necklace on the back' in ps,             'Necklace-on-back negative'),
    ('disproportionate to body' in ps,         'Scale negative'),
    ('_buildCategoryNegatives' in ps,          '_buildCategoryNegatives defined'),
    ('_buildPlacementInstruction' in ps,       '_buildPlacementInstruction defined'),
    ('Brand Identity' in ps,                   'Brand Identity UI card'),
    ('ps-brand-touch' in ps,                   'Brand Touch chips'),
    ('four-pointed star pin brooch' in ps,     'Logomark description'),
    ('ELARIS Wordmark' in ps,                  'Wordmark chip'),
    ('_getAnglesForCategory' in ps,            'Smart angle ordering'),
    ("nour" in ps,                             'Nour profile'),
    ("malak" in ps,                            'Malak profile'),
    ("rania" in ps,                            'Rania profile'),
    ("younes" in ps,                           'Younes profile'),
    ("mehdi" in ps,                            'Mehdi profile'),
    ("karim" in ps,                            'Karim profile'),
    ('brandTouch' in ps,                       'brandTouch state'),
    ('brandTouchDesc' in ps,                   'brandTouchDesc in bodyParts'),
    ('btGroup' in ps,                          'btGroup binding'),
    ('placementRule' in ps,                    'placementRule in bodyParts'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
