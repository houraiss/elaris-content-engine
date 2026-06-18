import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Check what exactly is left
idx = ps.find('ps-auto-desc')
print(f'Remaining ps-auto-desc at {idx}:')
print(repr(ps[max(0,idx-100):idx+200]))
print()

# Check ps-jewelry-style remaining
idx2 = ps.find('ps-jewelry-style')
print(f'Remaining ps-jewelry-style at {idx2}:')
print(repr(ps[max(0,idx2-100):idx2+200]))
print()

# Find exact bytes around textarea placeholder
idx3 = ps.find('ps-desc')
print(f'ps-desc at {idx3}:')
print(repr(ps[max(0,idx3-200):idx3+300]))
