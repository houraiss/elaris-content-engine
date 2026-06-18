import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Find profiles / Amir definition
idx = ps.find("'amir'") 
if idx < 0: idx = ps.find('"amir"')
if idx < 0: idx = ps.find('Amir')
print(f'=== Amir profile at {idx} ===')
print(ps[max(0,idx-50):idx+400])
print()

# 2. How consistency mode works in _buildPrompt
idx2 = ps.find('consistencyOn')
while idx2 > 0 and idx2 < 145000:
    ctx = ps[idx2:idx2+200]
    if 'const' in ctx or 'if' in ctx or 'profile' in ctx.lower():
        print(f'consistencyOn at {idx2}:')
        print(ctx[:200])
        print()
    idx2 = ps.find('consistencyOn', idx2+1)

# 3. Where _getRandomSkinTone is injected
idx3 = ps.find('isHuman ? this._getRandomSkinTone()')
print(f'\n=== skinTone injection at {idx3} ===')
print(ps[max(0,idx3-30):idx3+100])

# 4. styleMap auto entry and the dropdown render
idx4 = ps.find("'auto': this._getRandomOutfit")
print(f'\n=== auto outfit at {idx4} ===')
print(ps[idx4:idx4+100])

# 5. Styling dropdown HTML (find where it's rendered)
idx5 = ps.find('Model Styling')
print(f'\n=== Model Styling UI at {idx5} ===')
print(ps[idx5:idx5+200])
