import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# See full bodyParts + tailParts
idx = ps.find('const bodyParts = [')
end = ps.find('const standardPrompt', idx)
print('=== bodyParts + tailParts ===')
print(ps[idx:end+100])
print()

# See _buildCategoryNegatives full body
idx2 = ps.find('_buildCategoryNegatives(category, isHuman)')
end2 = ps.find('\n    },', idx2) + 6
print('=== _buildCategoryNegatives ===')
print(ps[idx2:end2])
print()

# See where material is found (for metal affinity lookup)
idx3 = ps.find("this.state.material)")
print(f'=== material state at {idx3} ===')
print(ps[max(0,idx3-30):idx3+80])
