import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the 45 angle label exactly
print('Searching for 45-degree / Three-Quarter / angle context:')
for m in re.finditer(r'45', js):
    idx = m.start()
    snippet = js[idx:idx+50]
    if any(c in snippet.lower() for c in ['quarter', 'degree', 'three']) or any(ord(c) > 127 for c in snippet[:6]):
        print(f'  pos {idx}: {repr(snippet)}')

print()
# Check for any character in range 0x80-0xFF remaining in JS  
print('All non-ASCII character ranges in JS:')
non_ascii = set()
for i, c in enumerate(js):
    if ord(c) > 127 and ord(c) < 0x2000:  # Exclude normal Unicode emoji
        ctx = js[max(0,i-10):i+20]
        non_ascii.add((ord(c), repr(c), repr(ctx[:30])))

for code, char, ctx in sorted(non_ascii)[:30]:
    print(f'  U+{code:04X} {char}: {ctx}')
