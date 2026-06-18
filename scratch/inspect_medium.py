import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── M2: Check mobile menu toggle in app.js ──────────────────────
print('=== M2: app.js mobile menu toggle ===')
js = open('js/app.js', 'r', encoding='utf-8').read()
idx = js.find('mobile-menu')
count = 0
while idx != -1 and count < 20:
    snippet = js[max(0,idx-10):idx+200]
    print(f'\n[pos {idx}]')
    print(snippet)
    print('---')
    idx = js.find('mobile-menu', idx + 1)
    count += 1

# ── M1: Check male model profiles in prompt-studio.js ──────────
print('\n\n=== M1: Male model profiles in prompt-studio.js ===')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the model profiles section
profile_idx = ps.find('modelProfiles')
if profile_idx >= 0:
    print('modelProfiles found at:', profile_idx)
    print(ps[profile_idx:profile_idx+2000])
else:
    print('modelProfiles NOT found')
    # Check how the consistency/model system works
    consistency_idx = ps.find('consistency')
    print('consistency found at:', consistency_idx)
    if consistency_idx >= 0:
        print(ps[consistency_idx:consistency_idx+500])
