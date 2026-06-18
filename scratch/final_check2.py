import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()
ps  = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

checks = [
    ('scale(1.02)' not in css,          'scale(1.02) REMOVED from CSS'),
    ('overflow-x: visible' in css,       'overflow-x: visible in ps-arch-area'),
    ('translateY(-2px)' in css,          'translateY lift still present'),
    ('facialExpression' in ps,           'facialExpression in state'),
    ('get facialExpressions()' in ps,    'facialExpressions getter'),
    ('ps-facial-expression' in ps,       'facial-expression chip group in HTML'),
    ("ps-facial-expression', 'facialExpression" in ps, 'facialExpression _bindChipGroup'),
    ('expressionDesc' in ps,             'expressionDesc in _buildPrompt'),
    ('expressionMap' in ps,              'expressionMap defined'),
    (css.count('{') == css.count('}'),   'CSS brace balance'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')

print()
print('ALL GOOD' if all_ok else 'ISSUES REMAIN')
print()

# Show all 3 hover rules to verify scale is gone
for m in re.finditer(r'\.ps-arch-card:hover \{[^}]+\}', css):
    print('Hover rule:')
    print(m.group()[:160])
    print()
