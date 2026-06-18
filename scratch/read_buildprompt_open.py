import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Show everything from _buildPrompt start to where subject is built
idx = ps.find('_buildPrompt(archetype)')
end = ps.find('const subject =', idx)
print(f'_buildPrompt start at {idx}, subject at {end}')
print()
print(ps[idx:end+20])
