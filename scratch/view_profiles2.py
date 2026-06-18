import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the full _loadProfiles function
idx = ps.find('_loadProfiles()')
end = ps.find('\n    },', idx + 100)
print('=== Current _loadProfiles ===')
print(ps[idx:end+7])
print(f'\n(from {idx} to {end+7})')
