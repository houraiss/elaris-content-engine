import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Find "Description auto-generated" toast trigger
idx = ps.find('auto-generated')
print(f'=== auto-generated at {idx} ===')
print(ps[max(0,idx-300):idx+200])
print()

# 2. Find JEWELRY STYLE section render
idx2 = ps.find('JEWELRY STYLE')
if idx2 < 0: idx2 = ps.find('Jewelry Style')
if idx2 < 0: idx2 = ps.find('jewelryStyle')
print(f'=== jewelryStyle at {idx2} ===')
print(ps[idx2:idx2+300])
print()

# 3. Find PIECE DESCRIPTION textarea
idx3 = ps.find('PIECE DESCRIPTION')
if idx3 < 0: idx3 = ps.find('piece-desc')
if idx3 < 0: idx3 = ps.find('ps-desc')
print(f'=== piece description at {idx3} ===')
print(ps[idx3:idx3+300])
print()

# 4. Auto-describe button
idx4 = ps.find('Auto-describe')
print(f'=== Auto-describe at {idx4} ===')
print(ps[max(0,idx4-200):idx4+300])
