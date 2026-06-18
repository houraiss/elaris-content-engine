import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

i18n = open('js/i18n.js', 'r', encoding='utf-8').read()

print('=== Before: tpl_cat_beldi count ===')
print('Occurrences:', i18n.count('tpl_cat_beldi'))

# Show all occurrences with context
for m in re.finditer(r'tpl_cat_beldi', i18n):
    idx = m.start()
    print(f'  pos {idx}: {repr(i18n[max(0,idx-40):idx+60])}')

print()
print('=== Fix: Remove duplicate consecutive entries ===')

# Strategy: For each language section, keep only ONE tpl_cat_beldi
# Find each language section by finding the language key patterns
# The duplicates happen because the script added after tpl_cat_classic (pos in section)
# AND then again with the fallback logic

# Simple dedup: replace any case of two tpl_cat_beldi lines in a row
# or tpl_cat_beldi before tpl_cat_classic AND after tpl_cat_classic

# Find all tpl_cat_beldi positions
positions = [m.start() for m in re.finditer(r'[ \t]+tpl_cat_beldi:[^\n]+\n', i18n)]
print(f'Found {len(positions)} tpl_cat_beldi entries at positions: {positions}')

# Remove the EXTRA ones - keep only the first in each group that's close together
# (within 200 chars = same language block)
to_remove = []
for i in range(len(positions)-1):
    # If two entries are within 500 chars of each other, remove the second
    if positions[i+1] - positions[i] < 500:
        to_remove.append(positions[i+1])
        print(f'  Will remove duplicate at pos {positions[i+1]}')

# Remove from end to start (to preserve positions)
new_i18n = i18n
for pos in sorted(to_remove, reverse=True):
    # Find the exact line at this position
    line_start = new_i18n.rfind('\n', 0, pos) + 1
    line_end = new_i18n.find('\n', pos) + 1
    line = new_i18n[line_start:line_end]
    print(f'  Removing: {repr(line)}')
    new_i18n = new_i18n[:line_start] + new_i18n[line_end:]

print(f'\nAfter: tpl_cat_beldi count = {new_i18n.count("tpl_cat_beldi")}')

# Show remaining occurrences
for m in re.finditer(r'tpl_cat_beldi', new_i18n):
    idx = m.start()
    print(f'  pos {idx}: {repr(new_i18n[max(0,idx-40):idx+60])}')

with open('js/i18n.js', 'w', encoding='utf-8') as f:
    f.write(new_i18n)
print('\ni18n.js saved.')
