import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Check the actual content of _buildPlacementInstruction
idx = ps.find('_buildPlacementInstruction(category)')
print(f'_buildPlacementInstruction at: {idx}')
if idx > 0:
    print(ps[idx:idx+600])
print()

# Check _buildCategoryNegatives
idx2 = ps.find('_buildCategoryNegatives(category, isHuman)')
print(f'_buildCategoryNegatives at: {idx2}')
if idx2 > 0:
    print(ps[idx2:idx2+800])
