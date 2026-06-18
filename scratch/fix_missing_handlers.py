import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# Fix 10 + 12b: Insert regen listener + caption handlers after copy-one listener
OLD_AFTER_COPY = """        list.querySelectorAll('.ps-copy-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                navigator.clipboard.writeText(prompts[idx].text).then(() => {
                    Elaris.toast('Prompt copied ✓', 'success');
                });
            });
        });

        this._currentPrompts = prompts;"""

NEW_AFTER_COPY = """        list.querySelectorAll('.ps-copy-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                navigator.clipboard.writeText(prompts[idx].text).then(() => {
                    Elaris.toast('Prompt copied ✓', 'success');
                });
            });
        });

        // ↺ Regenerate a single prompt with a fresh scene + outfit
        list.querySelectorAll('.ps-regen-one').forEach(btn => {
            btn.addEventListener('click', () => {
                const archId = btn.dataset.archId;
                const idx    = parseInt(btn.dataset.idx, 10);
                const arch   = this.archetypes.find(a => a.id === archId);
                if (!arch) return;
                const newText = this._buildPrompt(arch);
                const block   = list.querySelector(`[data-idx="${idx}"]`);
                if (block) {
                    block.querySelector('.ps-prompt-text').textContent = newText;
                    block.classList.remove('ps-prompt-similar');
                    const badge = block.querySelector('.ps-similar-badge');
                    if (badge) badge.remove();
                    // Reset caption if previously generated
                    const capDiv = block.querySelector('.ps-caption-block');
                    if (capDiv) { capDiv.innerHTML = ''; capDiv.style.display = 'none'; delete capDiv.dataset.generated; }
                }
                prompts[idx].text = newText;
                Elaris.toast('New prompt generated ✨', 'info');
            });
        });

        // Caption: click header area to toggle caption block (lazy generation)
        list.querySelectorAll('.ps-prompt-header').forEach(header => {
            header.addEventListener('click', e => {
                if (e.target.closest('button')) return;  // ignore button clicks inside header
                const block  = header.closest('.ps-prompt-block');
                const idx    = parseInt(block.dataset.idx, 10);
                const archId = block.dataset.archId;
                const capDiv = block.querySelector('.ps-caption-block');
                if (!capDiv) return;
                if (capDiv.style.display !== 'block') {
                    if (!capDiv.dataset.generated) {
                        const cap = this._generateCaption(archId, this._lastPiece || '', this._lastMaterial || '');
                        capDiv.innerHTML = `<div class="ps-caption-inner"><div class="ps-caption-label">📝 Caption — click header again to hide</div><pre class="ps-caption-text">${cap}</pre><button class="btn btn-sm btn-secondary ps-copy-caption" data-idx="${idx}">📋 Copy Caption</button></div>`;
                        capDiv.dataset.generated = '1';
                        // Wire copy-caption btn
                        capDiv.querySelector('.ps-copy-caption').addEventListener('click', () => {
                            const text = capDiv.querySelector('.ps-caption-text')?.textContent || '';
                            navigator.clipboard.writeText(text).then(() => Elaris.toast('Caption copied! ✨', 'success'));
                        });
                    }
                    capDiv.style.display = 'block';
                } else {
                    capDiv.style.display = 'none';
                }
            });
        });

        this._currentPrompts = prompts;"""

if OLD_AFTER_COPY in ps:
    ps = ps.replace(OLD_AFTER_COPY, NEW_AFTER_COPY)
    fixes.append('FIX 10+12b OK: regen listener + caption toggle + copy-caption wired')
else:
    fixes.append('FIX 10+12b MISS: copy-one block not matched')
    idx = ps.find("list.querySelectorAll('.ps-copy-one')")
    print(repr(ps[idx:idx+200]))

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
    ('ps-regen-one' in ps2 and 'querySelectorAll' in ps2,  'Regen listener wired (querySelectorAll)'),
    ('ps-caption-block' in ps2,                             'Caption block slot present'),
    ('ps-copy-caption' in ps2,                              'Copy caption button present'),
    ('_generateCaption' in ps2,                             'Caption generator exists'),
    ('Ramadan evening' in ps2,                              'Moroccan occasions in pool'),
    ('capDiv.dataset.generated' in ps2,                     'Lazy caption generation guard'),
    ('ps-similar-badge' in ps2,                             'Similarity badge in render'),
    ('ps-caption-label' in ps2,                             'Caption label in HTML'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
