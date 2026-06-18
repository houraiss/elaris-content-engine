import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. REMOVE the declaration from its current late position
OLD_LATE_DECL = """            // When a named profile is active, its descriptor defines the model's appearance.
            // We must NOT inject random skin tone or random styling on top of it — it contradicts.
            const hasNamedProfile = hasModelDesc && !!this.state.profiles.find(
                prof => prof.id === this.state.activeProfileId
            );\n"""

if OLD_LATE_DECL in ps:
    ps = ps.replace(OLD_LATE_DECL, '')
    print('Step 1 OK: Late hasNamedProfile declaration removed')
else:
    print('Step 1 MISS: Late declaration not matched')
    idx = ps.find('const hasNamedProfile')
    print(repr(ps[max(0,idx-20):idx+200]))

# 2. INSERT early: right before "const bodyParts = ["
# Use a unique anchor that's just before bodyParts
OLD_BEFORE_BODYPARTS = "        const bodyParts = [\n"
NEW_BEFORE_BODYPARTS  = """        // hasNamedProfile: computed early to avoid TDZ — used in bodyParts below
        // When a named profile (Amir, Lina...) is active, don't inject random skin tone on top.
        const hasNamedProfile = this.state.consistencyOn && !!this.state.profiles.find(
            prof => prof.id === this.state.activeProfileId
        );

        const bodyParts = [
"""

if OLD_BEFORE_BODYPARTS in ps:
    ps = ps.replace(OLD_BEFORE_BODYPARTS, NEW_BEFORE_BODYPARTS, 1)
    print('Step 2 OK: hasNamedProfile moved early before bodyParts')
else:
    print('Step 2 MISS: bodyParts anchor not found')
    idx = ps.find('const bodyParts = [')
    print(repr(ps[max(0,idx-20):idx+50]))

# Save + bump version
with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
idx_use  = ps2.find('!hasNamedProfile')
idx_decl = ps2.find('const hasNamedProfile')
idx_bp   = ps2.find('const bodyParts = [')
print(f'\n=== ORDER CHECK ===')
print(f'hasNamedProfile DECLARED: {idx_decl}')
print(f'bodyParts starts:         {idx_bp}')
print(f'hasNamedProfile USED:     {idx_use}')
print(f'Declaration before use: {idx_decl < idx_use} (MUST be True)')
print(f'Declaration before bodyParts: {idx_decl < idx_bp} (MUST be True)')

bt = ps2.count('`')
ob = ps2.count('{')
cb = ps2.count('}')
print(f'\nBackticks: {bt} (even: {bt%2==0}), Braces diff: {ob-cb}')
print('ALL GOOD' if (idx_decl < idx_use and idx_decl < idx_bp and bt%2==0 and ob==cb) else 'CHECK ISSUES')
