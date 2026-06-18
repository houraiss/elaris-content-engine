import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find all ps-tip content
tips = re.findall(r'ps-tip[^>]*>([^<]{0,100})', js)
for i, t in enumerate(tips):
    print(f'Tip {i+1}: {repr(t[:70])}')

# Find all mojibake patterns in buttons
button_texts = re.findall(r'<button[^>]*>([^<]{0,60})', js)
for t in button_texts:
    if '≡' in t or 'Γ' in t:
        print(f'Button: {repr(t[:60])}')

# A-Z
idx = js.find('Z</button')
if idx > 0:
    print('\nA-Z button:')
    print(repr(js[max(0,idx-30):idx+15]))
