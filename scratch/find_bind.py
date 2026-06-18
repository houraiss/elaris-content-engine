import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the full _bind() function
print('=== _bind() function ===')
idx = ps.find('    _bind()')
if idx < 0:
    idx = ps.find('    _bind ()')
print(f'_bind() at {idx}')
# Get the function body (until next method at same indentation)
end = ps.find('\n    },\n\n    ', idx + 100)
print(ps[idx:end+6])
