import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find what calls _autoDescribe (the method that fires the toast)
idx = ps.find('_autoDescribe')
while idx > 0 and idx < 165000:
    ctx = ps[idx:idx+200]
    print(f'_autoDescribe at {idx}:')
    print(ctx[:200])
    print()
    idx = ps.find('_autoDescribe', idx+1)

# Find the PIECE DESCRIPTION card section fully (from card header to end)
idx2 = ps.find("'PIECE DESCRIPTION'")
if idx2 < 0: idx2 = ps.find('"PIECE DESCRIPTION"')
if idx2 < 0:
    # search for the card containing ps-desc
    idx2 = ps.find('ps-desc')
print(f'\n=== ps-desc card section ===')
# find from card header before it
start = ps.rfind('<div class="card">', 0, idx2)
end = ps.find('</div>\n\n                    <div class="card">', start+10) + 6
print(ps[start:end])
print()

# Find JEWELRY STYLE chip section
idx3 = ps.find('ps-jewelry-style')
if idx3 < 0: idx3 = ps.find('ps_sty_')
print(f'\n=== jewelry style section ===')
start3 = ps.rfind('<div class="card">', 0, idx3)
end3 = ps.find('</div>\n\n                    <div class="card">', start3+10) + 6
print(ps[start3:end3])
