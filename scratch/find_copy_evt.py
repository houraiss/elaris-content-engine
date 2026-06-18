import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the copy-one listener area
idx = ps.find('.ps-copy-one')
print('=== .ps-copy-one area ===')
print(ps[max(0,idx-30):idx+400])
print()
# Find end of that listener
idx2 = ps.find('});', idx+100)
print(f'End of copy-one listener at: {idx2}')
print(repr(ps[idx2:idx2+100]))
