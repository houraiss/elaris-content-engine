import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Fix: replace ${category} with ${this.state.category || 'piece'} in ai-choice
OLD_AICHOICE = """                'ai-choice': `outfit creatively chosen by the art director — high-fashion luxury jewelry campaign, neckline naturally open to display the ${category} piece, elevated editorial styling, garment silhouette and color chosen by the photographer to best complement the jewelry`,"""

NEW_AICHOICE  = """                'ai-choice': `outfit creatively chosen by the art director — high-fashion luxury jewelry campaign, neckline naturally open to display the ${this.state.category || 'piece'} piece, elevated editorial styling, garment silhouette and color chosen by the photographer to best complement the jewelry`,"""

if OLD_AICHOICE in ps:
    ps = ps.replace(OLD_AICHOICE, NEW_AICHOICE)
    print('FIX OK: ${category} → ${this.state.category || "piece"} in ai-choice')
else:
    print('MISS: ai-choice line not found')
    idx = ps.find("'ai-choice': `outfit")
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

# Verify no more TDZ in the styleMap
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
idx_build = ps2.find('    _buildPrompt(')
idx_stylemap = ps2.find('const styleMap = {', idx_build)
idx_cat_decl = ps2.find('const category = this.state.category', idx_build)
print(f'\nstyleMap at {idx_stylemap}, const category at {idx_cat_decl}')
print(f'TDZ fixed: {"YES" if "${category}" not in ps2[idx_stylemap:idx_stylemap+500] else "NO — still has bare ${category}"}')

bt = ps2.count('`')
ob = ps2.count('{')
cb = ps2.count('}')
print(f'Backticks: {bt} (even: {bt%2==0}), Braces diff: {ob-cb}')
