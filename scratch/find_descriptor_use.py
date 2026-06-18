import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find where the active profile descriptor is actually used in _buildPrompt
idx = ps.find('activeProfileId')
while idx > 0 and idx < 165000:
    ctx = ps[idx:idx+200]
    if 'profile' in ctx.lower() and ('const' in ctx or 'let' in ctx or 'find' in ctx):
        print(f'activeProfileId usage at {idx}:')
        print(ctx[:200])
        print()
    idx = ps.find('activeProfileId', idx+1)

# Also look for profile.descriptor in the build
idx2 = ps.find('activeProfile')
while idx2 > 0 and idx2 < 165000:
    ctx = ps[idx2:idx2+300]
    if 'descriptor' in ctx or 'desc' in ctx.lower():
        print(f'activeProfile/descriptor at {idx2}:')
        print(ctx[:300])
        print()
    idx2 = ps.find('activeProfile', idx2+1)
