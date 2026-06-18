import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Simply replace the bare ${cat} in the title with the actual state accessor
OLD_TITLE = 'title="Compatibility with ${cat}"'
NEW_TITLE = 'title="Compatibility with ${this.state.category || \'ring\'}"'

if OLD_TITLE in ps:
    ps = ps.replace(OLD_TITLE, NEW_TITLE)
    print('✓ Fixed ${cat} in title attribute')
else:
    print('✗ Not found')

# Also verify _renderArchetypeGrid no longer uses bare `cat`
import re
idx = ps.find('_renderArchetypeGrid() {')
end = ps.find('\n    },', idx + 200)
chunk = ps[idx:end]
remaining = [(m.start(), ps[max(0,idx+m.start()-20):idx+m.start()+40]) for m in re.finditer(r'\bcat\b', chunk)]
print(f'\nRemaining cat references in _renderArchetypeGrid: {len(remaining)}')
for pos, ctx in remaining:
    print(f'  {repr(ctx)}')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('\nJS saved.')

# Bump version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')
