import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find exact cameraMap format
idx = ps.find("cameraMap = {")
print(f'cameraMap at {idx}:')
end = ps.find('};', idx)
print(repr(ps[idx:end+2]))

# Count angles in getter
idx2 = ps.find('get angles()')
end2 = ps.find('];', idx2) + 2
block = ps[idx2:end2]
count = block.count("{ id: '")
print(f'\nAngles count: {count}')
print(block)
