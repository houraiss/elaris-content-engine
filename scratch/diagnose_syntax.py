import sys, io, re, ast
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print(f'File size: {len(ps)} chars')

# Check for common JS syntax killers:
# 1. Unmatched backticks (template literals)
bt_count = ps.count('`')
print(f'Backtick count: {bt_count} (should be even: {bt_count % 2 == 0})')

# 2. Unmatched braces
opens  = ps.count('{')
closes = ps.count('}')
print(f'Braces: {{ = {opens}, }} = {closes}, diff = {opens - closes}')

# 3. Unmatched parens
op = ps.count('(')
cp = ps.count(')')
print(f'Parens: ( = {op}, ) = {cp}, diff = {op - cp}')

# 4. Unmatched brackets
ob = ps.count('[')
cb = ps.count(']')
print(f'Brackets: [ = {ob}, ] = {cb}, diff = {ob - cb}')

# 5. Scan for obvious issues around recent changes
# Check the area of the new methods we added
for marker in ['_getRandomSkinTone', '_getLightingForScene', '_generateCaption',
                '_computePromptSimilarity', '_getRandomOutfit', '_getUniqueSubject']:
    idx = ps.find(f'{marker}(')
    if idx > 0:
        print(f'\n--- {marker} at {idx} ---')
        # Count braces in a window around it
        window = ps[idx:idx+800]
        print(window[:300])

# 6. Look for the regen/caption listener area
idx2 = ps.find('ps-regen-one')
if idx2 > 0:
    print(f'\n--- ps-regen-one at {idx2} ---')
    print(ps[max(0,idx2-100):idx2+400])
