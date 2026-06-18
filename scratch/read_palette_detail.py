import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Full palettes getter
idx = ps.find('get palettes()')
end = ps.find('\n    },', idx+100)
print('=== palettes getter ===')
print(ps[idx:end+4])
print()

# Full stylings getter
idx2 = ps.find('get stylings()')
end2 = ps.find('\n    },', idx2+100)
print('=== stylings getter ===')
print(ps[idx2:end2+4])
print()

# palette state default
idx3 = ps.find("palette: '")
print(f'palette state at: {idx3}: {repr(ps[idx3:idx3+30])}')

# styling state default
idx4 = ps.find("styling: '")
print(f'styling state at: {idx4}: {repr(ps[idx4:idx4+30])}')

# paletteMap in _buildPrompt
idx5 = ps.find('paletteMap')
print()
print('=== paletteMap ===')
print(ps[idx5:idx5+700])

# stylingDesc full block
idx6 = ps.find('stylingDesc = ')
print()
print('=== stylingDesc block ===')
print(ps[idx6:idx6+800])
