import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Get full _loadProfiles function
idx = ps.find('_loadProfiles()')
end = ps.find('\n    },', idx + 100)
print('_loadProfiles function:')
print(ps[idx:end+7])
