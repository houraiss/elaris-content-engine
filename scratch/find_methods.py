import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find ALL occurrences of each method name
import re
for name in ['_buildPlacementInstruction', '_buildCategoryNegatives']:
    print(f'=== {name} ===')
    for m in re.finditer(name, ps):
        ctx = ps[max(0,m.start()-10):m.start()+80]
        print(f'  at {m.start()}: {repr(ctx)}')
    print()
