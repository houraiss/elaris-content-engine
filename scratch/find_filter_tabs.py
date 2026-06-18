import sys, io, re, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Search ALL JS files for filter tab generation
print('=== Searching for template filter tab rendering ===')
for fn in sorted(os.listdir('js')):
    if not fn.endswith('.js'): continue
    content = open(f'js/{fn}', 'r', encoding='utf-8').read()
    # Look for template category filter rendering
    patterns = [
        'tpl_cat_',
        'category-filter',
        'cat-filter',
        'filterBtn',
        'filter-tab',
        'category.*rhodie',
        'rhodie.*heritage'
    ]
    for p in patterns:
        m = re.search(p, content, re.IGNORECASE)
        if m:
            idx = m.start()
            print(f'\n{fn} - "{p}" at pos {idx}:')
            print(content[max(0,idx-60):idx+300])
            print('...')
            break

# Also check index.html
print('\n\n=== Searching in index.html ===')
html = open('index.html', 'r', encoding='utf-8').read()
for keyword in ['tpl_cat_', 'rhodie', 'category-filter', 'filter-btn']:
    idx = html.find(keyword)
    if idx > 0:
        print(f'"{keyword}" in HTML at {idx}:')
        print(html[max(0,idx-40):idx+200])
        print('---')
