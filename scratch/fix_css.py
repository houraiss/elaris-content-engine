"""
Clean replacement of the Prompt Studio CSS section in styles.css.
Replaces lines 1118-1660 (0-indexed) with the correct 3-column layout CSS.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
lines = css.split('\n')

# The new clean CSS to inject (replacing lines 1118..1660 inclusive)
NEW_CSS = """/* ═══════════════════════════════════════════════════════════════
   PROMPT STUDIO — Clean 3-Column Layout
   ═══════════════════════════════════════════════════════════════ */

/* Outer grid — page scrolls naturally, no overflow:hidden */
.ps-layout {
    display: grid;
    grid-template-columns: 300px 1fr 280px;
    gap: 20px;
    align-items: start;
}

/* Left & right: sticky + independently scrollable */
.ps-left,
.ps-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: 16px;
    max-height: calc(100vh - 100px);
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
}
.ps-left::-webkit-scrollbar,
.ps-right::-webkit-scrollbar { width: 3px; }
.ps-left::-webkit-scrollbar-thumb,
.ps-right::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* Center */
.ps-center {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
}

/* ── Archetype Grid ─────────────────────────────────────────── */
.ps-archetype-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

/* ── Archetype Cards ────────────────────────────────────────── */
.ps-arch-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius-lg);
    border: 2px solid var(--border);
    cursor: pointer;
    transition: all var(--transition);
    background: rgba(255,255,255,0.02);
    min-height: 76px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}
.ps-arch-card:hover {
    border-color: var(--border-hover);
    background: rgba(255,255,255,0.05);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}
.ps-arch-card.active {
    border-color: var(--moroccan-bronze);
    background: var(--accent-subtle);
    box-shadow: 0 0 16px var(--accent-glow);
}
.ps-arch-icon {
    width: 48px; height: 48px;
    border-radius: var(--radius-md);
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    font-size: 22px;
    flex-shrink: 0;
    transition: all 0.3s ease;
}
.ps-arch-info { flex: 1; min-width: 0; overflow: hidden; }
.ps-arch-name {
    font-size: 13px; font-weight: 700;
    color: var(--text-primary); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ps-arch-tag {
    font-size: 11px; color: var(--text-secondary);
    font-style: italic; margin-top: 3px; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ps-arch-bestfor {
    font-size: 10px; color: var(--moroccan-bronze);
    margin-top: 3px; font-weight: 500; opacity: 0.9; line-height: 1.3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ps-arch-score {
    font-size: 13px; font-weight: 800;
    flex-shrink: 0; margin-left: auto;
    min-width: 28px; text-align: right;
    font-variant-numeric: tabular-nums; opacity: 0.85;
}
.ps-arch-card:hover .ps-arch-score { opacity: 1; }

/* ── Sort Toggle ────────────────────────────────────────────── */
.ps-sort-group { gap: 4px !important; }

/* ── Chip Groups & Chips ────────────────────────────────────── */
.ps-chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
.ps-chip {
    padding: 6px 12px;
    border-radius: 99px;
    font-size: 11px; font-weight: 600;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    transition: all var(--transition);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
}
.ps-chip:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
    background: var(--bg-hover);
}
.ps-chip.active {
    background: var(--accent-subtle);
    border-color: var(--moroccan-bronze);
    color: var(--moroccan-bronze);
}

/* ── Prompt Output ──────────────────────────────────────────── */
.ps-prompt-block {
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    margin-bottom: 12px;
    overflow: hidden;
}
.ps-prompt-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    font-size: 13px; font-weight: 600;
    color: var(--text-primary); gap: 8px;
}
.ps-prompt-text {
    padding: 14px;
    font-size: 12px; line-height: 1.7;
    color: var(--text-secondary);
    white-space: pre-wrap;
    word-break: break-word; overflow-wrap: break-word;
}

/* ── History Panel ──────────────────────────────────────────── */
.ps-history-list {
    display: flex; flex-direction: column; gap: 6px;
    max-height: 420px; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.ps-history-list::-webkit-scrollbar { width: 3px; }
.ps-history-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ps-history-item {
    padding: 10px 12px;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition);
    background: var(--bg-secondary);
}
.ps-history-item:hover { border-color: var(--moroccan-bronze); background: var(--accent-subtle); }
.ps-history-head {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 12px; font-weight: 600;
    color: var(--text-primary); margin-bottom: 4px; gap: 8px;
}
.ps-history-preview {
    font-size: 11px; color: var(--text-muted);
    line-height: 1.5; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
}

/* ── Tips ───────────────────────────────────────────────────── */
.ps-tips { display: flex; flex-direction: column; gap: 8px; }
.ps-tip {
    font-size: 12px; color: var(--text-muted); line-height: 1.5;
    padding: 8px 10px; border-radius: var(--radius-sm);
    background: var(--bg-hover); border-left: 2px solid var(--moroccan-bronze);
}

/* ── Arch Sort Bar ──────────────────────────────────────────── */
.ps-arch-sort-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px; gap: 8px;
}
.ps-arch-sort-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: 0.6px; text-transform: uppercase;
    color: var(--text-muted);
}

/* ── Legacy classes (preserved for compatibility) ───────────── */
.ps-icon-rail { display: none; }
.ps-rail-btn, .ps-rail-label, .ps-rail-divider { display: none; }
.ps-panel { display: none; }
.ps-panel.open { display: none; }
.ps-panel-inner, .ps-panel-header, .ps-panel-title, .ps-panel-close { }
.ps-panel-section { margin-bottom: 16px; }
.ps-panel-label {
    font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 6px; display: block;
}
.ps-panel-overlay { display: none; }
.ps-panel-overlay.active { display: none; }
.ps-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.ps-arch-area { flex: 1; overflow-y: auto; padding: 16px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.ps-arch-area::-webkit-scrollbar { width: 4px; }
.ps-arch-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ps-context-bar { padding: 10px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-shrink: 0; background: var(--bg); flex-wrap: wrap; }
.ps-context-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; }
.ps-ctx-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
.ps-ctx-chip:hover { border-color: var(--moroccan-bronze); color: var(--moroccan-bronze); }
.ps-ctx-chip.ctx-active { background: var(--accent-subtle); border-color: rgba(166,124,82,0.3); color: var(--moroccan-bronze); }
.ps-ctx-sep { width: 1px; height: 16px; background: var(--border); }
.ps-generate-bar { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ps-arch-count-badge { font-size: 11px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
.ps-output-area { border-top: 1px solid var(--border); padding: 16px; flex-shrink: 0; max-height: 45%; overflow-y: auto; display: none; }
.ps-output-area.visible { display: block; }
.ps-output-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ps-output-title { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: var(--text-secondary); }
.ps-tab-bar { display: none; }
.ps-tab-bar-inner { display: flex; align-items: stretch; height: 100%; gap: 4px; }
.ps-tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: none; background: transparent; cursor: pointer; border-radius: var(--radius-md); color: var(--text-muted); transition: all 0.2s; padding: 6px 4px; -webkit-tap-highlight-color: transparent; }
.ps-tab-btn.active { color: var(--moroccan-bronze); background: var(--accent-subtle); }
.ps-tab-icon { font-size: 20px; line-height: 1; }
.ps-tab-label { font-size: 9px; font-weight: 600; letter-spacing: 0.3px; text-transform: uppercase; }

/* ── Wide Desktop (>= 1400px) ──────────────────────────────── */
@media (min-width: 1400px) {
    .ps-layout { grid-template-columns: 320px 1fr 300px; }
    .ps-archetype-grid { grid-template-columns: repeat(3, 1fr); }
}

/* ── Medium Desktop (<= 1280px) ────────────────────────────── */
@media (max-width: 1280px) {
    .ps-layout { grid-template-columns: 280px 1fr 260px; gap: 16px; }
}

/* ── Tablet (<= 1024px) ─────────────────────────────────────── */
@media (max-width: 1024px) {
    .ps-layout { grid-template-columns: 260px 1fr; }
    .ps-right { display: none; }
    .ps-archetype-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ── Small Tablet / Mobile (<= 768px) ──────────────────────── */
@media (max-width: 768px) {
    .mobile-menu-btn { display: flex; }
    html, body { overflow: auto; overflow-x: hidden; }
    body { display: block; }
    .sidebar {
        position: fixed; top: 0; left: 0;
        width: 280px; height: 100vh; height: 100dvh;
        transform: translateX(-100%);
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 100;
    }
    .sidebar.open { transform: translateX(0); box-shadow: 8px 0 40px rgba(0,0,0,0.5); }
    .main-content { width: 100%; height: auto; min-height: 100vh; min-height: 100dvh; overflow-y: auto; }
    .page-container { padding: 60px 14px 24px; max-width: 100%; }
    .page-header { margin-bottom: 14px; }
    .page-title { font-size: 20px; }
    .page-subtitle { font-size: 12px; line-height: 1.4; }
    /* Prompt Studio: single column */
    .ps-layout { grid-template-columns: 1fr !important; gap: 12px; }
    .ps-left, .ps-right {
        position: static !important;
        max-height: none !important;
        overflow: visible !important;
    }
    .ps-right { display: flex !important; }
    .composer-layout, .enhance-layout, .caption-studio-layout { grid-template-columns: 1fr !important; gap: 12px; }
    .card { border-radius: var(--radius-md); padding: 14px; }
    .card-header { padding: 0; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
    .form-group { margin-bottom: 12px; }
    .form-label { font-size: 11px; margin-bottom: 4px; }
    .ps-chip-group { flex-wrap: wrap; padding-bottom: 4px; }
    .ps-chip { flex-shrink: 0; padding: 8px 14px; font-size: 12px; }
    .ps-sort-group { flex-shrink: 0; }
    .ps-archetype-grid { grid-template-columns: 1fr !important; gap: 6px; }
    .ps-arch-card { padding: 12px 14px; min-height: 60px; gap: 12px; }
    .ps-arch-icon { width: 40px; height: 40px; font-size: 18px; }
    .ps-arch-name { font-size: 13px; }
    .ps-arch-tag { font-size: 10px; }
    .ps-arch-bestfor { font-size: 10px; }
    .ps-arch-score { font-size: 12px; }
    .ps-arch-info { min-width: 0; overflow: hidden; }
    .form-select, .form-input, .form-textarea { font-size: 16px; padding: 10px 12px; width: 100%; max-width: 100%; }
    .btn { min-height: 46px; padding: 10px 16px; font-size: 14px; width: 100%; }
    .btn-sm { min-height: 38px; width: auto; }
    .btn-lg { min-height: 52px; font-size: 15px; }
    .ps-center > div[style*="display:flex"][style*="gap:10px"] { flex-direction: column !important; }
    .form-group > div[style*="display:flex"][style*="justify-content:space-between"] { flex-wrap: wrap; gap: 8px; }
    .form-group > div[style*="display:flex"] p[style*="max-width"] { max-width: 100% !important; }
    .ps-prompt-text { font-size: 12px; line-height: 1.6; word-break: break-word; overflow-wrap: break-word; }
    .ps-prompt-header { font-size: 12px; padding: 8px 12px; }
    .ps-prompt-block { margin-bottom: 10px; }
    .ps-history-list { max-height: 300px; }
    .wm-layout { grid-template-columns: 1fr !important; gap: 12px; }
    .wm-left, .wm-right { max-height: none; overflow: visible; }
    .toast-container { left: 10px; right: 10px; bottom: 10px; }
    .toast { max-width: 100%; }
}

/* ── Phone (<= 480px) ───────────────────────────────────────── */
@media (max-width: 480px) {
    .page-container { padding: 56px 10px 20px; }
    .page-title { font-size: 18px; }
    .page-subtitle { font-size: 11px; }
    .sidebar { width: 260px; }
    .card { padding: 12px; }
    .ps-arch-card { padding: 10px 12px; min-height: 52px; gap: 10px; }
    .ps-arch-icon { width: 36px; height: 36px; font-size: 16px; border-radius: 8px; }
    .ps-arch-name { font-size: 12px; }
    .ps-arch-tag { font-size: 9px; }
    .ps-arch-bestfor { font-size: 9px; }
    .ps-chip { padding: 7px 11px; font-size: 11px; }
    .form-select { font-size: 15px; padding: 9px 10px; }
    .form-textarea { font-size: 14px; min-height: 70px; }
    .card-title { font-size: 12px; }
    .nav-section-label { font-size: 9px; }
    .gallery-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
}

/* ── Very Small Phone (<= 360px) ────────────────────────────── */
@media (max-width: 360px) {
    .page-container { padding: 52px 6px 14px; }
    .sidebar { width: 240px; }
    .ps-chip { padding: 6px 9px; font-size: 10px; }
    .page-title { font-size: 16px; }
    .card { padding: 10px; }
    .ps-arch-card { min-height: 48px; }
    .btn { min-height: 42px; font-size: 13px; }
}

/* ── Theme Toggle ───────────────────────────────────────────── */
.theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    background: transparent;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition);
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
}
.theme-toggle:hover {
    background: var(--accent-subtle);
    color: var(--text-primary);
    border-color: var(--border-hover);
}"""

# Find the exact line range to replace
# Start: line index 1117 (0-based) = the comment line
# End: need to find where the old section ends — look for .theme-toggle-track

start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if '/* -- Prompt Studio' in line or ('Prompt Studio' in line and 'Tabbed Icon Rail' in line):
        start_idx = i
        break

if start_idx is None:
    # Find by the old .ps-layout definition
    for i, line in enumerate(lines):
        if line.strip() == '.ps-layout {' and i > 1000:
            # Look back for a comment
            for j in range(i, max(0, i-5), -1):
                if lines[j].startswith('/*'):
                    start_idx = j
                    break
            if start_idx is None:
                start_idx = i
            break

# Find end: the line AFTER the theme-toggle hover rule that starts the watermark section
for i in range(start_idx + 1, len(lines)):
    line = lines[i]
    if '.theme-toggle-track {' in line:
        # This is the real theme-toggle section that should come after ours
        end_idx = i
        break
    if '.wm-layout {' in line or '/* -- Watermark Studio' in line or '/* Watermark Studio' in line:
        # Found watermark section — end_idx is just before this
        end_idx = i
        break

print(f'Replacing lines {start_idx+1} to {end_idx} (1-indexed)')
print(f'Start: {lines[start_idx][:60]}')
print(f'End context: {lines[end_idx][:60]}')

# Replace the section
new_lines = lines[:start_idx] + [NEW_CSS] + lines[end_idx:]
new_css = '\n'.join(new_lines)

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(new_css)

print(f'Done! File now {len(new_css)} chars, {new_css.count(chr(10))} lines')

# Verify
css2 = open('css/styles.css', 'r', encoding='utf-8').read()
checks = [
    ('grid-template-columns: 300px 1fr 280px', 'Main 3-col grid'),
    ('position: sticky', 'Sticky left/right'),
    ('ps-layout {', 'ps-layout class'),
    ('display: grid', 'Grid display'),
    ('.ps-chip.active', 'Chip active state'),
    ('overflow: hidden;\n    border-radius', 'OLD broken css'),
]
for needle, label in checks:
    found = needle in css2
    marker = 'OK' if (found and 'OLD' not in label) or (not found and 'OLD' in label) else 'FAIL'
    print(f'{marker}: {label} -> {"found" if found else "NOT found"}')
