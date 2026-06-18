import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where 'category' is declared in _buildPrompt
idx = ps.find('_buildPrompt(archetype)')
end = idx + 15000  # search within the function
import re
for m in re.finditer(r'const category\s*=', ps[idx:end]):
    pos = idx + m.start()
    print(f'const category at absolute {pos}:')
    print(ps[pos:pos+100])
    print()
