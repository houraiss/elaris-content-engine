import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find all _bindChip calls
print('=== All _bindChip calls ===')
for m in re.finditer(r'_bindChip\([^)]+\)', ps):
    idx = m.start()
    print(f'  pos {idx}: {m.group()}')

# Find the last _bindChip call to know where to insert
last = None
for m in re.finditer(r'_bindChip\([^)]+\);', ps):
    last = m
if last:
    print(f'\nLast _bindChip at {last.start()}: {last.group()}')
    print('Context after last bindChip:')
    print(ps[last.end():last.end()+300])

# Also find the stylings getter closing to add our new getters
idx_sty = ps.find('get stylings()')
end_sty = ps.find('\n    },\n', idx_sty)
print(f'\n=== stylings getter ends at {end_sty} ===')
print(ps[end_sty:end_sty+150])
