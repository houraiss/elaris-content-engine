import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Read the full consistency block to see where descriptor is used
idx = ps.find('activeProfileId);')
print('=== Full consistency/profile block ===')
print(ps[max(0,idx-500):idx+500])
print()

# Find the subject-building section where hasModelDesc is used
idx2 = ps.find('hasModelDesc')
while idx2 > 0 and idx2 < 145000:
    ctx = ps[idx2:idx2+200]
    print(f'hasModelDesc at {idx2}:')
    print(ctx[:200])
    print()
    idx2 = ps.find('hasModelDesc', idx2+1)
