import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where prompt block CSS is defined (inside the JS template literal style block)
# The CSS for .ps-prompt-block should be near the render area
idx = ps.find('.ps-prompt-block')
while idx > 0:
    ctx = ps[max(0,idx-20):idx+80]
    if 'border' in ctx or 'padding' in ctx or 'background' in ctx:
        print(f'CSS at {idx}: {repr(ctx[:100])}')
        break
    idx = ps.find('.ps-prompt-block', idx+1)

# Find the CSS block (usually inside a style tag in the JS)
idx2 = ps.find('.ps-prompt-header {')
print(f'\n.ps-prompt-header CSS at {idx2}')
print(ps[max(0,idx2-20):idx2+200])
