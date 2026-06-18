import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()
idx = css.find('.ps-prompt')
print(f'.ps-prompt found at {idx}')
if idx > 0:
    print(css[idx:idx+800])
else:
    # CSS might be inline in JS; check for ps-copy-one in JS
    ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
    idx2 = ps.find('.ps-prompt-block {')
    if idx2 < 0:
        idx2 = ps.find('ps-copy-one {')
    print(f'In JS at {idx2}: {repr(ps[idx2:idx2+200])}')
    # Find the style string/template
    idx3 = ps.find('<style>')
    print(f'\n<style> at {idx3}: {repr(ps[idx3:idx3+300])}')
