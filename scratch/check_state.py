import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Check 1: Is _buildCategoryNegatives method actually there?
idx = ps.find('_buildCategoryNegatives')
print(f'_buildCategoryNegatives at: {idx}')
if idx > 0:
    print(ps[idx:idx+200])
print()

# Check 2: What does negativePrompt section look like now?
idx2 = ps.find('negativePrompt')
print(f'negativePrompt at: {idx2}')
print(ps[idx2:idx2+400])
print()

# Check 3: Where is the hallmark toggle UI (need to find what comes after it)
idx3 = ps.find('ps-hallmark-toggle')
print(f'hallmark toggle at {idx3}:')
print(ps[idx3:idx3+500])
print()

# Check 4: Is _buildPrompt() being found?
idx4 = ps.find('_buildPrompt()')
print(f'All _buildPrompt occurrences:')
pos = 0
while True:
    idx4 = ps.find('_buildPrompt()', pos)
    if idx4 < 0: break
    print(f'  at {idx4}: {repr(ps[max(0,idx4-20):idx4+40])}')
    pos = idx4 + 1
