import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

idx_build = ps.find('    _buildPrompt(')

# 1. Find stylingDesc / styleMap block (it's inside if(isHuman))
idx_style = ps.find('let stylingDesc', idx_build)
print(f'=== stylingDesc + styleMap block at {idx_style} ===')
print(ps[idx_style:idx_style+1200])
print()

# 2. Where is `const category` declared in _buildPrompt?
for keyword in ['const', 'let', 'var']:
    idx_cat = ps.find(f'{keyword} category', idx_build)
    if idx_cat > 0:
        print(f'category declared as {keyword} at {idx_cat}: {repr(ps[idx_cat:idx_cat+60])}')
        break
else:
    print('NO local category declaration found in _buildPrompt')
    # Check for this.state.category usage
    idx_cat2 = ps.find('this.state.category', idx_build)
    print(f'this.state.category first used at {idx_cat2}: {repr(ps[idx_cat2:idx_cat2+60])}')
print()

# 3. Where is modelGenderForStyling declared?
idx_mgs = ps.find('modelGenderForStyling', idx_build)
while idx_mgs > 0 and idx_mgs < 130000:
    ctx = ps[idx_mgs:idx_mgs+100]
    if 'const' in ctx or 'let' in ctx:
        print(f'modelGenderForStyling at {idx_mgs}: {repr(ctx[:100])}')
    idx_mgs = ps.find('modelGenderForStyling', idx_mgs+1)
