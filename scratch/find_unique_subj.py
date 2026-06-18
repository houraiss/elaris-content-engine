import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find _getUniqueSubject implementation
idx = ps.find('_getUniqueSubject(')
# Find its full body
print(f'Method starts at {idx}')
# Look for the actual function definition (not the call)
for m in re.finditer(r'_getUniqueSubject\s*\(', ps):
    pos = m.start()
    ctx = ps[pos:pos+20]
    # Is it a definition or a call?
    before = ps[max(0,pos-5):pos]
    if any(kw in before for kw in ['    ', '\n']):
        print(f'At {pos} ({repr(before)}): {repr(ps[pos:pos+500])}')
        print()
