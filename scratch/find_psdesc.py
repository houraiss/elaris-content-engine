import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find remaining ps-desc
idx = ps.find('ps-desc')
while idx > 0:
    print(f'ps-desc at {idx}: {repr(ps[max(0,idx-50):idx+100])}')
    print()
    idx = ps.find('ps-desc', idx+1)
