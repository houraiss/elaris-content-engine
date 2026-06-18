import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# Remove the ps-desc input event listener from _bind()
OLD_DESC_LISTENER = "        q('#ps-desc').addEventListener('input', e => { this.state.pieceDesc = e.target.value; });\n"
if OLD_DESC_LISTENER in ps:
    ps = ps.replace(OLD_DESC_LISTENER, '')
    fixes.append('FIX A OK: ps-desc input listener removed from _bind()')
else:
    fixes.append('FIX A MISS: ps-desc listener not matched')
    idx = ps.find("q('#ps-desc')")
    print(repr(ps[max(0,idx-20):idx+100]))

# Remove the querySelector('#ps-desc').value = in _autoDescribe
# The _autoDescribe method is still fine to keep (no harm), but 
# remove the querySelector call that now references a non-existent element
OLD_QDESC = "        this.container.querySelector('#ps-desc').value = desc;\n        this.state.pieceDesc = desc;\n        Elaris.toast('Description auto-generated ✨', 'info');"
NEW_QDESC  = "        this.state.pieceDesc = desc;\n        // (textarea removed — desc stored in state only)"

if OLD_QDESC in ps:
    ps = ps.replace(OLD_QDESC, NEW_QDESC)
    fixes.append('FIX B OK: querySelector(ps-desc).value removed from _autoDescribe')
else:
    fixes.append('FIX B MISS: querySelector line not matched')
    idx = ps.find("querySelector('#ps-desc')")
    print(repr(ps[max(0,idx-20):idx+100]))

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

ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== FINAL CLEAN CHECK ===')
checks = [
    ('ps-desc' not in ps2,               'ps-desc fully removed'),
    ('ps-jewelry-style' not in ps2,      'ps-jewelry-style fully removed'),
    ('ps-auto-desc' not in ps2,          'ps-auto-desc fully removed'),
    ('Auto-describe from category' not in ps2, 'Auto-describe string gone'),
    ('_generate()' in ps2,              '_generate still present'),
    ('const prompts = []' in ps2,       'prompts loop intact'),
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
