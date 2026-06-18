import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

OLD_MIR = """        // Model image reference: "📎 Image attached" / "📝 Text only"
        const mirGroup = q('#ps-model-image-ref');
        if (mirGroup) {
            mirGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                mirGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.modelImageAttached = chip.dataset.val === 'true';
                this._render();
                this._bind();
            });
        }"""

NEW_MIR = """        // Model image reference: "📎 Image attached" / "📝 Text only"
        const mirGroup = q('#ps-model-image-ref');
        if (mirGroup) {
            mirGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                mirGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.modelImageAttached = chip.dataset.val === 'true';
                this._render();
                this._renderArchetypeGrid(); // must follow _render() to repopulate grid
                this._bind();
            });
        }"""

if OLD_MIR in ps:
    ps = ps.replace(OLD_MIR, NEW_MIR)
    print('✓ Added _renderArchetypeGrid() to mirGroup handler')
else:
    print('✗ Could not find mirGroup handler')
    idx = ps.find('mirGroup')
    print(repr(ps[idx:idx+400]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'prompt-studio.js: v{v} → v{v+1}')

# Verify the three calls are all present in the mirGroup handler
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
idx = ps2.find('mirGroup.addEventListener')
block = ps2[idx:idx+400]
print('\nMirGroup handler:')
print(block)
print()
print('Has _render():', 'this._render()' in block)
print('Has _renderArchetypeGrid():', 'this._renderArchetypeGrid()' in block)
print('Has _bind():', 'this._bind()' in block)
