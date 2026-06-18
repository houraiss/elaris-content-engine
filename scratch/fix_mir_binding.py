import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

OLD_BIND = """        const consToggle = q('#ps-consistency-toggle');
        if (consToggle) {
            consToggle.addEventListener('change', e => {
                this.state.consistencyOn = e.target.checked;
                this._render(); // Re-render to show/hide profile panel
                this._renderArchetypeGrid();
                this._bind();   // Re-bind events since DOM rebuilt
            });
        }

        const newProfBtn = q('#ps-new-profile');"""

NEW_BIND = """        const consToggle = q('#ps-consistency-toggle');
        if (consToggle) {
            consToggle.addEventListener('change', e => {
                this.state.consistencyOn = e.target.checked;
                this._render(); // Re-render to show/hide profile panel
                this._renderArchetypeGrid();
                this._bind();   // Re-bind events since DOM rebuilt
            });
        }

        // Model image reference: "📎 Image attached" / "📝 Text only"
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
        }

        const newProfBtn = q('#ps-new-profile');"""

if OLD_BIND in ps:
    ps = ps.replace(OLD_BIND, NEW_BIND)
    print('✓ Added ps-model-image-ref binding')
else:
    print('✗ Could not find binding context')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Final verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
checks = [
    ('ps-model-image-ref' in ps2,               'sub-UI in template'),
    ('mirGroup' in ps2,                          'mirGroup binding'),
    ('mirGroup.addEventListener' in ps2,         'click listener on mirGroup'),
    ('modelImageAttached: true' in ps2,          'state default'),
    ('hasModelImage' in ps2,                     'hasModelImage in _buildPrompt'),
    ('sole appearance reference' in ps2,         'text-only prompt label'),
]
all_ok = True
for ok, desc in checks:
    s = '✓' if ok else '✗'
    if not ok: all_ok = False
    print(f'  {s} {desc}')
print()
print('✅ ALL GOOD' if all_ok else '⚠️  ISSUES')
