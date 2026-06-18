import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Full _getUniqueSubject
idx = ps.find('_getUniqueSubject(')
end = ps.find('\n    },', idx + 100)
print('=== _getUniqueSubject ===')
print(ps[idx:end+6])

# First half of _buildPrompt (material, silver, subject assembly)
print('\n\n=== _buildPrompt first 60 lines ===')
idx2 = ps.find('    _buildPrompt(archetype)')
if idx2 < 0:
    idx2 = ps.find('// ── Build Single Prompt')
print(ps[idx2:idx2+3500])
