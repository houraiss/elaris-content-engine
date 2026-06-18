import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

idx = ps.find('_getUniqueSubject(archetype) {')
print(ps[idx:idx+900])
print()

# Also find the styleMap block
idx2 = ps.find('const styleMap =')
print('=== styleMap ===')
end2 = ps.find('};', idx2) + 2
print(ps[idx2:end2])
