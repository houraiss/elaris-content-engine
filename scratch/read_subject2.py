import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

idx = ps.find('_getUniqueSubject(')
end = ps.find('\n    },', idx + 100)
print(ps[idx:end+6])
