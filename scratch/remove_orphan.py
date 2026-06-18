"""Remove orphaned CSS line and fix brace balance."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
lines = css.split('\n')

# Find the orphaned line
orphan_idx = None
for i, line in enumerate(lines):
    if line.strip().startswith('x ') and 'var(--border)' in line:
        orphan_idx = i
        print(f'Found orphan at line {i+1}: {repr(line[:60])}')
        break

if orphan_idx is not None:
    # Remove lines from orphan through the closing brace of the orphaned block
    # Lines: 'x solid var(--border);', '    cursor: pointer;', '    transition:...', etc, '}'
    # Find the closing brace
    end_idx = orphan_idx
    for j in range(orphan_idx, min(len(lines), orphan_idx + 15)):
        if lines[j].strip() == '}':
            end_idx = j
            print(f'Found closing brace at line {j+1}')
            break
    
    print(f'Removing lines {orphan_idx+1} to {end_idx+1}:')
    for i in range(orphan_idx, end_idx+1):
        print(f'  {i+1}: {repr(lines[i][:50])}')
    
    # Remove the orphaned lines
    new_lines = lines[:orphan_idx] + lines[end_idx+1:]
    new_css = '\n'.join(new_lines)
    
    # Verify
    opens = new_css.count('{')
    closes = new_css.count('}')
    print(f'\nAfter removal: {opens} {{ vs {closes} }}, balance = {opens - closes}')
    
    # Check for remaining orphaned lines
    bad_lines = [f'{i+1}: {l[:60]}' for i, l in enumerate(new_lines) if l.strip().startswith('x ') and 'var(' in l]
    print(f'Remaining orphaned lines: {len(bad_lines)}')
    
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(new_css)
    print('CSS saved successfully.')
else:
    print('No orphaned line found!')
    opens = css.count('{')
    closes = css.count('}')
    print(f'Braces: {opens} {{ vs {closes} }}, balance = {opens - closes}')
