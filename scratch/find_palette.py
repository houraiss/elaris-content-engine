import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find palette state + chips
import re
for kw in ['palette', 'ps-palette', 'styling', 'ps-styling', 'modelStyling', 'paletteDesc', 'stylingDesc']:
    idx = ps.find(kw)
    if idx > 0:
        print(f'=== {kw} at {idx} ===')
        print(ps[idx:idx+300])
        print()
