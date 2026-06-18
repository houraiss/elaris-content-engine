import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Count comment mojibake
comment_bad = re.findall(r'[ΓöǓ]+[öÇ]', ps)
print(f'Comment mojibake occurrences: {len(comment_bad)}')

# These are box-drawing dividers in comments like:
# // ΓöǓöǓöÇ Section Name ΓöǓöǓöÇ
# Original: // ══════ Section Name ══════
# Strategy: replace the entire comment line pattern

# Pattern: // ...ΓöǓöÇ... text ...ΓöǓöÇ...
# Replace with: // ── text ──────────────────────

def replace_comment_dividers(text):
    lines = text.split('\n')
    fixed = 0
    result = []
    for line in lines:
        if ('ΓöǓ' in line or 'Γö' in line) and '//' in line:
            # Extract the section label between the box chars
            # Pattern: // ΓöǓö[Ç] [Label] ΓöǓö...
            # Remove all mojibake box-drawing chars and replace with clean divider
            clean = re.sub(r'[ΓöǓÇ]+', '', line)
            # Clean up remaining whitespace artifacts
            clean = re.sub(r'//\s*(.+?)\s*$', lambda m: f'// ── {m.group(1).strip()} ──────────────────────', clean)
            clean = re.sub(r'//\s*──\s*──', '//', clean)  # Empty dividers
            result.append(clean)
            fixed += 1
        else:
            result.append(line)
    print(f'Fixed {fixed} comment lines')
    return '\n'.join(result)

ps_fixed = replace_comment_dividers(ps)

# Verify no more comment mojibake
remaining = re.findall(r'[ΓöǓ]+[öÇ]', ps_fixed)
print(f'Remaining comment mojibake: {len(remaining)}')
if remaining:
    # Do a simpler brute-force replacement
    for bad in ['ΓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöǓöÇ',
                'ΓöǓöÇ', 'ΓöǓöǓöǓöǓöÇ', 'ΓöǓöǓöǓöǓöǓöǓöǓöǓöÇ', 'ΓöǓöǓöǓöÇ',
                'Γö', 'ǓöÇ', 'ǓöǓö']:
        ps_fixed = ps_fixed.replace(bad, '═')
    # Re-clean consecutive ═
    ps_fixed = re.sub(r'═{3,}', '══════════════════', ps_fixed)
    print(f'After brute-force: {len(re.findall(chr(0x0393) + r"[öǓ]", ps_fixed))} remaining')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps_fixed)
print('prompt-studio.js saved.')

# Bump JS version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'JS version bumped: v{v} → v{v+1}')

# Also bump i18n version if it's versioned
html2 = open('index.html', 'r', encoding='utf-8').read()
m2 = re.search(r'i18n\.js\?v=(\d+)', html2)
if m2:
    v2 = int(m2.group(1))
    html2 = html2.replace(f'i18n.js?v={v2}', f'i18n.js?v={v2+1}')
    open('index.html', 'w', encoding='utf-8').write(html2)
    print(f'i18n JS version bumped: v{v2} → v{v2+1}')
else:
    print('i18n.js has no version string (loaded without cache-buster)')
