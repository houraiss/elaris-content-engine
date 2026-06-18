"""
Remove the leftover old CSS block (lines 1481-1563) which contains:
- Orphaned .wm-layout rules (not inside any media query)
- Duplicate @media (max-width: 480px) block
- Duplicate @media (max-width: 360px) block
- Broken unclosed .theme-toggle { block with nested @media rules
- The repeat(3,1fr) that keeps coming back
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
lines = css.split('\n')

print(f'Before: {len(lines)} lines')

# Find the start of the bad block: the orphaned .wm-layout after .theme-toggle:hover
# Looking for the line that has .wm-layout inside the mobile @media closing context
# From our view: line 1481 (1-indexed) = index 1480 (0-indexed)
# Let's find it programmatically

# The orphaned block starts right after:
# "    border-color: var(--border-hover);\n}\n    .wm-layout {"
# And ends at line 1563 (before .theme-toggle:hover { which is the correct next rule)

# Strategy: Find ".theme-toggle:hover {" -> that's at line 1476 (correct one)
# Then find NEXT ".wm-layout {" that appears OUTSIDE any @media block
# But this is complex. Let's just find the exact lines.

start_marker = "    .wm-layout {\n        grid-template-columns: 1fr !important;"
end_marker = ".theme-toggle:hover {\n    background: var(--accent-subtle);\n    color: var(--text-primary);\n    border-color: var(--border-hover);\n}\n.theme-toggle-track {"

start_idx = css.find(start_marker)
end_idx = css.find(end_marker, start_idx)

if start_idx == -1:
    print("Start marker not found, trying alternate...")
    # Try finding by line content
    for i, line in enumerate(lines):
        if '/* ── Phone: <=' in line or ('480px (Galaxy' in line):
            print(f"Found duplicate 480px at line {i+1}: {line[:60]}")
            start_idx_line = i
            break
    print("Manual search needed")
else:
    start_line = css[:start_idx].count('\n')  # 0-indexed
    end_line = css[:end_idx].count('\n')  # 0-indexed
    print(f"Found orphaned block: lines {start_line+1} to {end_line+1} (1-indexed)")
    print(f"  Start: {repr(lines[start_line][:60])}")
    print(f"  End context: {repr(lines[end_line][:60])}")
    
    # Remove the orphaned block (from start_idx to end_idx)
    new_css = css[:start_idx] + '\n' + css[end_idx:]
    new_lines = new_css.split('\n')
    print(f"After: {len(new_lines)} lines")
    print(f"Brace balance: {new_css.count('{') - new_css.count('}')}")
    
    # Check for remaining repeat(3, 1fr)
    import re
    r3 = [(m.start(), new_css[:m.start()].count('\n')+1) for m in re.finditer(r'repeat\(3', new_css)]
    print(f'Remaining repeat(3) occurrences: {len(r3)}')
    for pos, ln in r3:
        print(f'  Line {ln}: {repr(new_css[pos:pos+60])}')
    
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(new_css)
    print('\nCSS saved!')
