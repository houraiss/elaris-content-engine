import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Check degree sign encoding
print('Degree sign encoding:')
bad_degree = re.findall(r'[┬][░°][^\'"]{0,30}', ps)
for b in bad_degree:
    print(f'  {repr(b[:60])}')
if not bad_degree:
    print('  None found')

# 2. Check for all encoding issues in angle labels
print('\nAngle labels with encoding issues:')
angle_labels = re.findall(r'label:\s*[\'"]([^\'\"]{0,80})[\'"]', ps)
for lbl in angle_labels:
    if any(c in lbl for c in ['├','╕','┬','╖','∩','≡','Γ']):
        print(f'  BAD: {repr(lbl)}')

# 3. Poses
print('\nPoses check:')
pose_idx = ps.find('poses')
if pose_idx >= 0:
    print('  poses found at index:', pose_idx)
    print('  Context:', ps[pose_idx:pose_idx+200])
else:
    print('  No poses found')

# 4. Male model profiles
print('\nModel profiles:')
profile_idx = ps.find('modelProfile')
if profile_idx >= 0:
    print('  modelProfile found at:', profile_idx)
    print('  Context:', ps[profile_idx:profile_idx+300])
male_idx = ps.find('gender.*?male')
print('  gender/male mentions:', 'male' in ps)

# 5. Check all bestFor strings for ├ characters
print('\nbestFor strings with encoding issues:')
bestfor = re.findall(r"bestFor:\s*'([^']{0,200})'", ps)
for bf in bestfor:
    if any(c in bf for c in ['├','╕','┬','╖','∩','≡','Γ']):
        print(f'  BAD: {repr(bf[:100])}')

# 6. Find ├ anywhere in the file
print('\nAll ├ occurrences (mojibake for UTF-8 sequences):')
matches = [(m.start(), ps[max(0,m.start()-20):m.start()+40]) for m in re.finditer('[├]', ps)]
for pos, ctx in matches[:10]:
    print(f'  pos {pos}: {repr(ctx)}')
