import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the broken ratio tailPart
idx = ps.find("'flat-lay', 'overhead', 'top-down-hand'")
print('=== Raw bytes around ratio ===')
raw = ps[max(0,idx-50):idx+350]
print(repr(raw))
