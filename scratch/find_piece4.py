import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where subject template is filled in
idx = ps.find('.replace(/\\{piece\\}/g, piece)')
if idx < 0: idx = ps.find("replace(/\\{piece\\}/g")
print(f'{piece} replace at: {idx}')
# Get more context
print(ps[max(0,idx-300):idx+200])
