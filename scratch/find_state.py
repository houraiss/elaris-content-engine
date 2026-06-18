import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find exact pattern before state: block
idx = js.find('    state: {')
print('state: block at char:', idx)
print('Context before state:')
print(repr(js[idx-80:idx+20]))
