import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find all angle IDs in cameraMap
idx = ps.find('cameraMap = {')
end = ps.find('};', idx) + 2
print('=== cameraMap ===')
print(ps[idx:end])
print()

# Find where cameraDesc is set from angle
idx2 = ps.find('const cameraDesc')
print(f'cameraDesc at {idx2}:')
print(ps[idx2:idx2+200])
print()

# Where is angle state used
idx3 = ps.find("this.state.angle")
print(f'angle state at {idx3}: {repr(ps[idx3:idx3+80])}')
