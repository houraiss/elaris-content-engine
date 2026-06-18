import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Hallmark section
idx = ps.find('hallmarkEnabled')
print('=== hallmark section ===')
print(ps[idx:idx+600])
print()

# bodyParts array
idx2 = ps.find('const bodyParts = [')
print('=== bodyParts ===')
print(ps[idx2:idx2+800])
print()

# angle chips render section
idx3 = ps.find('ps-angle')
print('=== angle chips render ===')
print(ps[max(0,idx3-300):idx3+300])
