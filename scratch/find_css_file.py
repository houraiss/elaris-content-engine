import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
# Find CSS files
for f in os.listdir('css'):
    print(f'css/{f}')

css_file = 'css/prompt-studio.css'
if os.path.exists(css_file):
    css = open(css_file, 'r', encoding='utf-8').read()
    idx = css.find('.ps-prompt')
    print(f'\n.ps-prompt in CSS at {idx}')
    print(css[idx:idx+600])
