import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Check the generic group binding helper at pos 83254
print('=== Generic chip binding helper (pos 83254) ===')
print(ps[83150:83600])

# 2. Check how angle/surface/palette events are bound (they must be near the generic helper)
print('\n=== Event binding section around pos 82000-85000 ===')
section = ps[82000:86000]
# Find all chip group bindings
bindings = re.findall(r"#ps-[a-z\-]+['\"].*?state\.[a-z]+\s*=", section, re.DOTALL)
for b in bindings[:10]:
    print(repr(b[:100]))
    print()

# 3. Check the exact stylings getter
print('=== stylings getter ===')
idx = ps.find('get stylings()')
print(ps[idx:idx+600])

# 4. After the last getter, find where to add realism getters
print('\n=== What comes after stylings? ===')
idx_after = ps.find('\n    },\n\n    // ──', idx)
if idx_after < 0:
    idx_after = ps.find('\n    },\n\n    _', idx)
print(f'After stylings at {idx_after}:')
print(ps[idx_after:idx_after+200])
