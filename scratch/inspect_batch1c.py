import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find anatomyConstraint
idx = ps.find('anatomyConstraint')
while idx > 0 and idx < 145000:
    ctx = ps[max(0,idx-10):idx+150]
    if 'const' in ctx or '=' in ctx:
        print(f'at {idx}: {repr(ctx[:150])}')
        print()
    idx = ps.find('anatomyConstraint', idx+1)

print()
# Find where lighting desc is built
idx2 = ps.find('lightingDesc') 
while idx2 > 0 and idx2 < 145000:
    ctx = ps[idx2:idx2+120]
    print(f'lightingDesc at {idx2}: {repr(ctx[:120])}')
    print()
    idx2 = ps.find('lightingDesc', idx2+1)

print()
# Find the angle state/cameraMap area
idx3 = ps.find('cameraMap')
print(f'cameraMap at {idx3}: {repr(ps[idx3:idx3+100])}')

# Find where ratio is set / format selected
idx4 = ps.find('const ratio =')
print(f'ratio at {idx4}: {repr(ps[idx4:idx4+100])}')
