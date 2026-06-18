import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ════════════════════════════════════════════════════════════════════
# FIX 1 — Remove Jewelry Style chips from the HTML template
# ════════════════════════════════════════════════════════════════════

OLD_JEWELRY_STYLE_HTML = """                        <div class="form-group">
                            <label class="form-label">Jewelry Style</label>
                            <div class="ps-chip-group" id="ps-jewelry-style" style="flex-wrap:wrap">
                                ${this.jewelryStyles.map(s => `<button class="ps-chip ${(this.state.jewelryStyle||[]).includes(s.id) ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                            </div>
                        </div>"""

if OLD_JEWELRY_STYLE_HTML in ps:
    ps = ps.replace(OLD_JEWELRY_STYLE_HTML, '')
    fixes.append('FIX 1 OK: Jewelry Style chips removed from HTML template')
else:
    fixes.append('FIX 1 MISS: Jewelry Style HTML not matched')
    idx = ps.find('ps-jewelry-style')
    print(repr(ps[max(0,idx-80):idx+150]))

# ════════════════════════════════════════════════════════════════════
# FIX 2 — Remove Piece Description textarea + Auto-describe button
# ════════════════════════════════════════════════════════════════════

OLD_PIECE_DESC_HTML = """                        <div class="form-group">
                            <label class="form-label" data-i18n="ps_piece_desc">Piece Description</label>
                            <textarea class="form-textarea" id="ps-desc" rows="3" data-i18n="ps_piece_desc_ph" placeholder="Describe style only — e.g. multi-band crossover with pavé diamond accents (jewelry type &amp; material are auto-injected from your selections above)"></textarea>
                        </div>
                        <button class="btn btn-sm btn-secondary" id="ps-auto-desc" style="width:100%" data-i18n="ps_auto_desc">✨ Auto-describe from category</button>"""

if OLD_PIECE_DESC_HTML in ps:
    ps = ps.replace(OLD_PIECE_DESC_HTML, '')
    fixes.append('FIX 2 OK: Piece Description textarea + Auto-describe button removed')
else:
    fixes.append('FIX 2 MISS: Piece Description HTML not matched')
    idx = ps.find('ps-auto-desc" style="width:100%"')
    print(repr(ps[max(0,idx-200):idx+100]))

# ════════════════════════════════════════════════════════════════════
# FIX 3 — Remove the auto-call to _autoDescribe() in _generate()
# This is the DIRECT cause of the "Description auto-generated ✨" toast
# ════════════════════════════════════════════════════════════════════

OLD_AUTO_CALL = """        if (!this.state.pieceDesc.trim()) {
            this._autoDescribe();
        }

        const prompts"""

NEW_AUTO_CALL  = """        const prompts"""

if OLD_AUTO_CALL in ps:
    ps = ps.replace(OLD_AUTO_CALL, NEW_AUTO_CALL)
    fixes.append('FIX 3 OK: Auto _autoDescribe() call removed from _generate()')
else:
    fixes.append('FIX 3 MISS: auto-call not matched')
    idx = ps.find('this._autoDescribe();')
    print(repr(ps[max(0,idx-50):idx+80]))

# ════════════════════════════════════════════════════════════════════
# FIX 4 — Remove the ps-auto-desc event listener from _bind()
# ════════════════════════════════════════════════════════════════════

OLD_AUTO_DESC_LISTENER = """        q('#ps-auto-desc').addEventListener('click', () => this._autoDescribe());

        // Sort mode"""

NEW_AUTO_DESC_LISTENER = """        // Sort mode"""

if OLD_AUTO_DESC_LISTENER in ps:
    ps = ps.replace(OLD_AUTO_DESC_LISTENER, NEW_AUTO_DESC_LISTENER)
    fixes.append('FIX 4 OK: ps-auto-desc event listener removed from _bind()')
else:
    fixes.append('FIX 4 MISS: ps-auto-desc listener not matched')
    idx = ps.find("ps-auto-desc').addEventListener")
    print(repr(ps[max(0,idx-20):idx+100]))

# ════════════════════════════════════════════════════════════════════
# FIX 5 — Also remove Jewelry Style event listener from _bind() if present
# ════════════════════════════════════════════════════════════════════

idx_js_listener = ps.find("'ps-jewelry-style'")
if idx_js_listener < 0:
    idx_js_listener = ps.find('"ps-jewelry-style"')

if idx_js_listener > 0:
    # Find the surrounding listener block
    start = ps.rfind('\n        ', 0, idx_js_listener)
    end = ps.find('\n        }', idx_js_listener) + 9
    print(f'=== Jewelry Style listener ===')
    print(repr(ps[start:end]))
else:
    fixes.append('FIX 5 SKIP: No separate ps-jewelry-style event listener found')

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

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ('ps-jewelry-style' not in ps2,          'Jewelry Style chips removed from template'),
    ('ps-auto-desc' not in ps2,              'Auto-describe button removed'),
    ('ps-desc' not in ps2,                   'Piece Description textarea removed'),
    ('_autoDescribe();\n        }' not in ps2, 'Auto-call in _generate() removed'),
    ('Auto-describe from category' not in ps2, 'Auto-describe string gone'),
    ('auto-generated' in ps2,               '_autoDescribe method still exists (for possible reuse)'),
    ('_generate()' in ps2,                  '_generate method still exists'),
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
