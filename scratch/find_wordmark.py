import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find exact current wordmark description
idx = ps.find('"ELARIS" brand name as genuine haute couture embroidery')
end = ps.find("';", idx)
print(f'wordmark desc at {idx}:{end}')
print(repr(ps[idx:end+2]))
