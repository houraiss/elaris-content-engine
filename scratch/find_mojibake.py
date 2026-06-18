import sys, io, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Find all mojibake: UTF-8 bytes read as Windows-1252
# Common patterns: ≡ƒ (= emoji first byte 0xF0 read as cp1252: ≡=0xF0, ƒ=0x83)
# Also ΓÇ (= em dash, en dash), Γÿ, etc.

js_dir = 'js'
all_files = []
for fn in os.listdir(js_dir):
    if fn.endswith('.js'):
        all_files.append(fn)

for fn in sorted(all_files):
    path = f'{js_dir}/{fn}'
    try:
        content = open(path, 'r', encoding='utf-8').read()
    except:
        print(f'ERROR reading {fn}')
        continue
    
    # Find mojibake emoji patterns
    # ≡ƒ... is the 4-byte emoji sequence read as cp1252
    # Γÿ... is the checkmark/special char
    bad_patterns = re.findall(r'[≡][ƒ][^\'\",;\s\n\r`]{0,8}', content)
    bad_patterns += re.findall(r'[Γ][ÿ][^\'\",;\s\n\r`]{0,6}', content)
    bad_patterns += re.findall(r'[Γ][Ç][^\'\",;\s\n\r`]{0,8}', content)  # em dash etc
    
    if bad_patterns:
        unique = list(dict.fromkeys(bad_patterns))
        print(f'\n{fn} ({len(unique)} unique patterns):')
        for p in unique[:30]:
            # Find context
            idx = content.find(p)
            ctx = content[max(0,idx-20):idx+len(p)+20].replace('\n', ' ')
            print(f'  {repr(p):25s} -> ...{ctx}...')
