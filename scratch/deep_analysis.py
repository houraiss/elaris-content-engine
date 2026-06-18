import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Find the full humanArchetypes list in _buildPrompt
idx = ps.find('humanArchetypes')
print(f'humanArchetypes at: {idx}')
print(ps[idx:idx+500])
print()

# 2. Full mirror-reflection subjects
idx2 = ps.find("id: 'mirror-reflection'")
print(f'mirror-reflection subjects at: {idx2}')
print(ps[idx2:idx2+600])
print()

# 3. Find HUMAN set in _computeScore
idx3 = ps.find('const HUMAN = new Set')
print(f'HUMAN set at: {idx3}')
print(ps[idx3:idx3+400])
print()

# 4. Full wet-element archetype entry
idx4 = ps.find("id: 'wet-element'")
print(f'wet-element archetype at: {idx4}')
print(ps[idx4:idx4+800])
print()

# 5. Check where hasModelDesc is guarded by isHuman
idx5 = ps.find('if (hasModelDesc)')
print(f'if(hasModelDesc) full block at {idx5}:')
print(ps[max(0,idx5-200):idx5+600])
