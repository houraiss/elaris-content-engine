import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Check the ratio tailPart (the tricky backtick escape)
idx = ps.find("flat-lay', 'overhead'")
print('=== Ratio tail area ===')
print(repr(ps[max(0,idx-50):idx+300]))
print()

# 2. Check the new regen listener for syntax issues
idx2 = ps.find('querySelectorAll(.ps-regen-one')
if idx2 < 0:
    idx2 = ps.find("querySelectorAll('.ps-regen-one')")
print(f'=== Regen listener at {idx2} ===')
print(ps[idx2:idx2+500])
print()

# 3. Check the caption header listener  
idx3 = ps.find("querySelectorAll('.ps-prompt-header')")
print(f'=== Caption listener at {idx3} ===')
print(ps[idx3:idx3+700])
print()

# 4. Find any stray backticks or unterminated strings
# Look for lines that have an odd number of backticks (potential issue)
lines = ps.split('\n')
for i, line in enumerate(lines, 1):
    cnt = line.count('`')
    if cnt % 2 == 1:
        print(f'Line {i} has ODD backtick count ({cnt}): {repr(line[:100])}')
