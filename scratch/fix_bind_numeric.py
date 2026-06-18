import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Fix _bindChipGroup to preserve numeric types
# dataset.val always returns a string; for numeric chip groups (jewelry count, etc.)
# this causes === comparisons to fail in the render template
OLD_BIND = """_bindChipGroup(groupId, stateKey) {
        const group = this.container.querySelector(`#${groupId}`);
        group.addEventListener('click', e => {
            const chip = e.target.closest('.ps-chip');
            if (!chip) return;
            group.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.state[stateKey] = chip.dataset.val;
        });
    }"""

NEW_BIND = """_bindChipGroup(groupId, stateKey) {
        const group = this.container.querySelector(`#${groupId}`);
        group.addEventListener('click', e => {
            const chip = e.target.closest('.ps-chip');
            if (!chip) return;
            group.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            // Preserve numeric type: if the raw value is a pure integer string
            // (e.g. "0", "5", "10"), store it as a Number so === comparisons work.
            // Non-numeric values ('none', 'natural', 'female', etc.) stay as strings.
            const raw = chip.dataset.val;
            const asNum = parseFloat(raw);
            this.state[stateKey] = (!isNaN(asNum) && String(asNum) === raw) ? asNum : raw;
        });
    }"""

if OLD_BIND in ps:
    ps = ps.replace(OLD_BIND, NEW_BIND)
    print('✓ _bindChipGroup now preserves numeric types')
else:
    print('✗ Could not find _bindChipGroup — checking...')
    idx = ps.find('_bindChipGroup(groupId, stateKey)')
    print(repr(ps[idx:idx+300]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\nVerification:')
print('  parseFloat fix:', 'parseFloat(raw)' in ps2)
print('  String(asNum) check:', 'String(asNum) === raw' in ps2)
print('  Old string-only assign gone:', "this.state[stateKey] = chip.dataset.val;" not in ps2)
