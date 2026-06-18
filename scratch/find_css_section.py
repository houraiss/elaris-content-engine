"""
Replace the broken Prompt Studio CSS section cleanly.
The old section starts at '/* -- Prompt Studio' comment and has
duplicate .ps-layout blocks + broken nested media queries.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
lines = css.split('\n')

# Find the start: the line with the old PS CSS header
start_line = None
for i, line in enumerate(lines):
    if 'Prompt Studio' in line and 'Tabbed Icon Rail' in line:
        start_line = i
        break

if start_line is None:
    # Try alternate marker
    for i, line in enumerate(lines):
        if line.strip() == '.ps-layout {' and i > 1000:
            start_line = i - 1
            break

print('Start line (0-based):', start_line, ':', lines[start_line] if start_line else 'NOT FOUND')

# Find the end: the line with .theme-toggle definition
end_line = None
for i in range(start_line + 1, len(lines)):
    if '/* -- Theme Toggle' in lines[i] or '.theme-toggle {' in lines[i]:
        # Check we're at the right theme-toggle (not inside a media query)
        end_line = i
        break

print('End line (0-based):', end_line, ':', lines[end_line] if end_line else 'NOT FOUND')

# Show context around problematic area
print('\n--- Lines around start ---')
for i in range(max(0, start_line-2), min(len(lines), start_line+6)):
    print(f'{i+1}: {lines[i][:80]}')

if start_line and end_line:
    print(f'\nWill replace lines {start_line+1} to {end_line} ({end_line - start_line} lines)')
