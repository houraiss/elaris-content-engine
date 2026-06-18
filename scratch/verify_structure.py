import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

opens = js.count('{')
closes = js.count('}')
print('Open braces:', opens)
print('Close braces:', closes)
print('Balance:', opens - closes)

if 'window.PromptStudio = PromptStudio' in js:
    print('GOOD: window export found')
if 'window.render_promptstudio' in js:
    print('GOOD: render function found')
if 'ps-gender-select' in js:
    print('GOOD: Gender selector in template')
if '_getFilteredProfiles' in js:
    print('GOOD: _getFilteredProfiles method exists')
if 'surface-lean' in js:
    print('GOOD: surface-lean archetype exists')
if 'hair-drama' in js:
    print('GOOD: hair-drama archetype exists')
if 'masculine-editorial' in js:
    print('GOOD: masculine-editorial archetype exists')
if 'poseMap' in js:
    print('GOOD: poseMap exists in _buildPrompt')
if 'realismDesc' in js:
    print('GOOD: realismDesc exists')
if 'jewelryStyleDesc' in js:
    print('GOOD: jewelryStyle descriptor exists')

print('File size:', len(js), 'chars')
print('Total lines:', js.count('\n'))
