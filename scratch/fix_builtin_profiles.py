import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the EXACT _loadProfiles function text to replace
old_fn = '''_loadProfiles() {
        try {
            const saved = localStorage.getItem('elaris_model_profiles');
            if (saved) {
                this.state.profiles = JSON.parse(saved);
                return;
            }
        } catch (e) { console.error('Failed to load profiles', e); }
        
        this.state.profiles = [
            {
                id: 'lina', name: 'Lina', gender: 'female',
                descriptor: 'Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture',
                referenceImage: null, color: '#c9a96e'
            },
            {
                id: 'sara', name: 'Sara', gender: 'female',
                descriptor: 'Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression',
                referenceImage: null, color: '#a67c52'
            },
            {
                id: 'amir', name: 'Amir', gender: 'male',
                descriptor: 'Man, 30 years old, olive Moroccan skin tone, strong defined jawline, deep-set dark brown eyes, sharp angular features, well-groomed dark beard stubble, athletic build, broad shoulders, confident editorial posture',
                referenceImage: null, color: '#6e9fc9'
            },
            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 27 years old, warm caramel skin tone, elegant refined features, almond-shaped dark eyes, clean-shaven, defined cheekbones, slim composed posture, sophisticated and understated expression',
                referenceImage: null, color: '#52a67c'
            },
        ];
        this._saveProfiles();
    },'''

new_fn = '''_loadProfiles() {
        // ── Built-in profiles are always guaranteed to exist ──────────────────
        // These are the hardcoded defaults. They are available on every device
        // without requiring localStorage. User edits (e.g. reference images)
        // are preserved by merging saved data over the defaults.
        const BUILT_IN = [
            {
                id: 'lina', name: 'Lina', gender: 'female',
                descriptor: 'Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture',
                referenceImage: null, color: '#c9a96e'
            },
            {
                id: 'sara', name: 'Sara', gender: 'female',
                descriptor: 'Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression',
                referenceImage: null, color: '#a67c52'
            },
            {
                id: 'amir', name: 'Amir', gender: 'male',
                descriptor: 'Man, 30 years old, olive Moroccan skin tone, strong defined jawline, deep-set dark brown eyes, sharp angular features, well-groomed dark beard stubble, athletic build, broad shoulders, confident editorial posture',
                referenceImage: null, color: '#6e9fc9'
            },
            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 27 years old, warm caramel skin tone, elegant refined features, almond-shaped dark eyes, clean-shaven, defined cheekbones, slim composed posture, sophisticated and understated expression',
                referenceImage: null, color: '#52a67c'
            },
        ];
        const BUILT_IN_IDS = BUILT_IN.map(p => p.id);

        let customProfiles = [];
        let savedBuiltIns  = {};

        try {
            const saved = localStorage.getItem('elaris_model_profiles');
            if (saved) {
                const savedProfiles = JSON.parse(saved);
                savedProfiles.forEach(p => {
                    if (BUILT_IN_IDS.includes(p.id)) {
                        // Preserve any user edits (reference image, etc.)
                        savedBuiltIns[p.id] = p;
                    } else {
                        // User-created custom profile — keep it
                        customProfiles.push(p);
                    }
                });
            }
        } catch (e) { console.error('Failed to load profiles', e); }

        // Merge: built-ins first (with any user edits), then custom profiles
        // This guarantees Lina, Sara, Amir & Tariq always appear on any device
        const mergedBuiltIns = BUILT_IN.map(p => savedBuiltIns[p.id] || p);
        this.state.profiles = [...mergedBuiltIns, ...customProfiles];
        this._saveProfiles();
    },'''

if old_fn in ps:
    ps = ps.replace(old_fn, new_fn)
    print('✓ _loadProfiles rewritten — built-ins are now always guaranteed')
else:
    print('✗ Could not find _loadProfiles — checking character by character...')
    # Show exact characters around "if (saved)"
    idx = ps.find('if (saved) {\n                this.state.profiles = JSON.parse(saved);\n                return;')
    print(f'Early return pattern at: {idx}')
    if idx > 0:
        print(repr(ps[max(0,idx-30):idx+100]))

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

# Bump JS version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'JS version: v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
print('BUILT_IN constant defined:', 'const BUILT_IN = [' in ps2)
print('BUILT_IN_IDS defined:', 'const BUILT_IN_IDS' in ps2)
print('Amir always present:', "id: 'amir'" in ps2)
print('Tariq always present:', "id: 'tariq'" in ps2)
print('Custom profiles preserved:', 'customProfiles' in ps2)
print('Saved built-ins merged:', 'savedBuiltIns' in ps2)
print('Early return REMOVED:', 'this.state.profiles = JSON.parse(saved);\n                return;' not in ps2)
print('mergedBuiltIns used:', 'mergedBuiltIns' in ps2)
print('Always saves after merge:', 'this._saveProfiles();' in ps2)
