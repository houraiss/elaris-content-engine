import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where hasNamedProfile is declared vs where it's used
idx_decl = ps.find('const hasNamedProfile')
print(f'hasNamedProfile DECLARED at {idx_decl}:')
print(ps[max(0,idx_decl-200):idx_decl+300])
print()

# Find where it's USED
idx_use = ps.find('!hasNamedProfile')
print(f'hasNamedProfile USED at {idx_use}:')
print(ps[max(0,idx_use-50):idx_use+80])
print()

# Check: is the declaration inside an if(isHuman) block?
# Find nearest if(isHuman) before the declaration
idx_ish = ps.rfind('if (isHuman)', 0, idx_decl)
print(f'Nearest if(isHuman) BEFORE declaration: at {idx_ish}')
# Find its closing brace
if idx_ish > 0:
    depth = 0
    pos = ps.find('{', idx_ish)
    while pos < idx_decl + 100:
        if ps[pos] == '{': depth += 1
        elif ps[pos] == '}':
            depth -= 1
            if depth == 0:
                print(f'  Closes at {pos}')
                if pos < idx_decl:
                    print('  *** DECLARATION IS OUTSIDE the if(isHuman) block ***')
                else:
                    print(f'  Declaration at {idx_decl} is INSIDE this block (block closes at {pos})')
                break
        pos += 1
print()

# Also check where isHuman is first declared
idx_human_decl = ps.find('const isHuman')
print(f'isHuman declared at {idx_human_decl}: {repr(ps[idx_human_decl:idx_human_decl+60])}')
# Is hasNamedProfile after isHuman at top level?
print(f'\nDeclaration order: isHuman={idx_human_decl}, hasNamedProfile={idx_decl}')
if idx_decl > idx_human_decl:
    print('  hasNamedProfile is after isHuman — probably OK if both at same scope')
