import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Full _generate() function
idx = ps.find('_generate()')
# find end
end = ps.find('\n    },\n', idx) + 7
print('=== _generate() ===')
print(ps[idx:end])
print()

# 2. Where the generate button is bound
idx2 = ps.find('ps-generate')
while idx2 > 0 and idx2 < 165000:
    ctx = ps[idx2:idx2+200]
    print(f'ps-generate at {idx2}: {repr(ctx[:200])}')
    print()
    idx2 = ps.find('ps-generate', idx2+1)
