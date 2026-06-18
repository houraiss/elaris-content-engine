import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# FIX 2 (retry) — Remove Piece Description form-group + auto-desc button
# Use exact string from file inspection
# ════════════════════════════════════════════════════════════════════

# Find the exact block
start_marker = '                        <div class="form-group">\n                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>'
end_marker = '✨ Auto-describe from category</button>'

idx_start = ps.find(start_marker)
idx_end = ps.find(end_marker)
if idx_start > 0 and idx_end > idx_start:
    # Find the end of the button tag
    end_pos = ps.find('\n', idx_end) + 1
    removed = ps[idx_start:end_pos]
    print(f'Removing {len(removed)} chars:')
    print(repr(removed[:100]))
    ps = ps[:idx_start] + ps[end_pos:]
    fixes.append(f'FIX 2 OK: Piece Description + auto-describe button removed ({len(removed)} chars)')
else:
    fixes.append(f'FIX 2 MISS: start={idx_start}, end={idx_end}')

# ════════════════════════════════════════════════════════════════════
# FIX 5 — Remove Jewelry Style event listener from _bind()
# ════════════════════════════════════════════════════════════════════

OLD_JS_LISTENER = """        // Jewelry Style multi-select chips
        const jsGroup = q('#ps-jewelry-style');
        if (jsGroup) {
            jsGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;"""

# Find the exact block including its closing
idx_js = ps.find(OLD_JS_LISTENER)
if idx_js > 0:
    # Find end of this if block (closing `}`)
    # Count braces from start of the block to find matching close
    block_start = idx_js
    # Find the `if (jsGroup) {` opening
    open_pos = ps.find('{', ps.find('if (jsGroup)', block_start))
    depth = 0
    pos = open_pos
    while pos < len(ps):
        if ps[pos] == '{': depth += 1
        elif ps[pos] == '}':
            depth -= 1
            if depth == 0:
                block_end = pos + 1
                break
        pos += 1
    # Also remove any trailing newline
    while block_end < len(ps) and ps[block_end] == '\n':
        block_end += 1
    removed_block = ps[idx_js:block_end]
    print(f'\nRemoving JS listener ({len(removed_block)} chars):')
    print(repr(removed_block[:200]))
    ps = ps[:idx_js] + ps[block_end:]
    fixes.append('FIX 5 OK: Jewelry Style event listener removed from _bind()')
else:
    fixes.append('FIX 5 MISS: Jewelry Style listener not matched')
    # Try to find it differently
    idx2 = ps.find('ps-jewelry-style')
    print(repr(ps[max(0,idx2-100):idx2+200]))

# ════════════════════════════════════════════════════════════════════
# Save + version bump
# ════════════════════════════════════════════════════════════════════
with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

print()
for fix in fixes: print(f'  {fix}')

# Final verification
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== FINAL VERIFICATION ===')
checks = [
    ('ps-jewelry-style' not in ps2,                 'Jewelry Style fully removed (template + listener)'),
    ('ps-auto-desc' not in ps2,                     'Auto-describe button fully removed'),
    ('ps-desc' not in ps2,                          'Piece Description textarea removed'),
    ('Auto-describe from category' not in ps2,      'Auto-describe string gone'),
    ('_autoDescribe();\n        }' not in ps2,      'Auto-call in _generate() gone'),
    ('_autoDescribe()' in ps2,                      '_autoDescribe method itself still exists'),
    ('const prompts = []' in ps2,                   '_generate() still works'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')

bt = ps2.count('`')
ob = ps2.count('{')
cb = ps2.count('}')
print(f'\n  Backticks: {bt} (even: {bt%2==0}), Braces diff: {ob-cb}')
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
