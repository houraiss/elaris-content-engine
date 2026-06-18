import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()

# Find the ps-prompt-block CSS (probably deeper in the file, not the light-theme override)
# Let's find where the ps-prompt components are really styled
for m in re.finditer(r'\.ps-prompt', css):
    pos = m.start()
    print(f'At {pos}: {repr(css[pos:pos+80])}')
print()

# Also search for the ps-prompt-actions or ps-copy-one
idx = css.find('.ps-copy-one')
print(f'.ps-copy-one at {idx}')
idx2 = css.find('.btn-outline')
print(f'.btn-outline at {idx2}: {repr(css[idx2:idx2+100])}')
