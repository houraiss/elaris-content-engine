js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

print('=== FILE STATS ===')
print('Total chars:', len(js))
print('Total lines:', js.count('\n'))

features = [
    ('Male gender selector', 'ps-gender-select'),
    ('Model profiles', '_loadProfiles'),
    ('Archetype grid', '_renderArchetypeGrid'),
    ('Build prompt', '_buildPrompt'),
    ('History render', '_renderHistory'),
    ('Generate batch', '_generate('),
    ('Hallmark injection', 'hallmarkEnabled'),
    ('Surface map', 'surfaceMap'),
    ('Styling map', 'stylingMap'),
    ('Pose map', 'poseMap'),
    ('Skin map', 'skinMap'),
    ('Body intimate archetype', 'body-intimate'),
    ('Editorial model archetype', 'editorial-model'),
    ('Heritage moroccan', 'heritage-moroccan'),
    ('Male profile Amir', 'Amir'),
    ('Male profile Tariq', 'Tariq'),
    ('Female profile Lina', 'Lina'),
    ('Masculine Editorial archetype', 'masculine-editorial'),
    ('Surface Lean archetype', 'surface-lean'),
    ('Hair Drama archetype', 'hair-drama'),
    ('Archetype compat scoring', '.compat'),
    ('Model consistency lock', 'consistencyOn'),
    ('Jewelry count', 'jewelryCount'),
]

print()
print('=== FEATURE CHECK ===')
missing = []
for label, key in features:
    found = key in js
    status = 'OK' if found else 'MISSING'
    print(status + ': ' + label)
    if not found:
        missing.append(label)

print()
if missing:
    print('MISSING FEATURES: ' + str(len(missing)))
    for m in missing:
        print('  - ' + m)
else:
    print('ALL FEATURES FOUND!')
