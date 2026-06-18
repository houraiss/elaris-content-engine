import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()

# Find end of .ps-prompt-text rule
idx = css.find('.ps-prompt-text {', 34201)
end_brace = css.find('}', idx) + 1
print(f'.ps-prompt-text ends at {end_brace}')
print(repr(css[end_brace:end_brace+100]))

# Inject new CSS after .ps-prompt-text
NEW_CSS = """
/* ── Prompt card actions row ─────────────────────────────────────── */
.ps-prompt-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

/* ── Similar-prompt badge ─────────────────────────────────────────── */
.ps-similar-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    font-weight: 600;
    color: #b45309;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 4px;
    padding: 1px 5px;
    margin-left: 4px;
    cursor: help;
    vertical-align: middle;
}
.ps-prompt-similar .ps-prompt-header {
    border-bottom-color: rgba(245, 158, 11, 0.25);
}

/* ── Regen (↺ New) button ─────────────────────────────────────────── */
.ps-regen-one {
    font-size: 11px !important;
    padding: 3px 8px !important;
    background: transparent !important;
    color: var(--accent, #8a6535) !important;
    border: 1px solid var(--accent, #8a6535) !important;
    border-radius: var(--radius-sm, 4px) !important;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}
.ps-regen-one:hover {
    background: var(--accent, #8a6535) !important;
    color: #fff !important;
}

/* ── Caption block ──────────────────────────────────────────────────── */
.ps-caption-block {
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
}
.ps-caption-inner {
    padding: 12px 14px;
}
.ps-caption-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted, #888);
    margin-bottom: 8px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}
.ps-caption-text {
    font-size: 12px;
    line-height: 1.65;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm, 4px);
    padding: 10px 12px;
    margin-bottom: 10px;
    font-family: var(--font-body);
}
.ps-caption-block .btn {
    font-size: 11px;
}
"""

# Insert right after .ps-prompt-text closing brace
updated = css[:end_brace] + NEW_CSS + css[end_brace:]
open('css/styles.css', 'w', encoding='utf-8').write(updated)
print('CSS updated.')

# Verify
css2 = open('css/styles.css', 'r', encoding='utf-8').read()
checks = [
    ('.ps-prompt-actions' in css2,   'Prompt actions row'),
    ('.ps-similar-badge' in css2,    'Similar badge'),
    ('.ps-regen-one' in css2,        'Regen button'),
    ('.ps-caption-block' in css2,    'Caption block'),
    ('.ps-caption-text' in css2,     'Caption text'),
    ('.ps-caption-label' in css2,    'Caption label'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
