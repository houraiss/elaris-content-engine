import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# The broken line — raw backtick escapes caused parser crash
# Find it using a unique substring
BROKEN = "(['flat-lay', 'overhead', 'top-down-hand'].includes(this.state.angle) && ratio === '9:16')"
idx = ps.find(BROKEN)
print(f'Found broken ratio at {idx}')

# Find the full ternary extent (from the comment line to the end of the ternary + comma)
COMMENT_BEFORE = "            // Aspect ratio: flat-lay/overhead angles read better in 1:1 or 4:5\n"
start = ps.rfind(COMMENT_BEFORE, 0, idx)
# Find end: look for the next tailParts entry after the ternary
end_search = ps.find(',\n            negativePrompt,', idx)
end = end_search + 1  # include the comma

print(f'Replacement range: {start} to {end}')
print('OLD:')
print(repr(ps[start:end]))
print()

# Clean replacement — store ratio string in a variable BEFORE the tailParts array
# We need to insert the variable declaration BEFORE the tailParts array
TAILPARTS_START = "        const tailParts = ["
idx_tail = ps.find(TAILPARTS_START)
print(f'tailParts at {idx_tail}')

# Replacement: remove the broken ternary from tailParts and replace with `ratioStr`
NEW_RATIO_COMMENT_LINE = "            // Aspect ratio: aerial/flat-lay angles read better in square/4:5\n            ratioStr,"

if start > 0 and end > start:
    ps_fixed = ps[:start] + NEW_RATIO_COMMENT_LINE + ps[end:]
    
    # Now insert `const ratioStr = ...` before `const tailParts = [`
    RATIO_VAR = """        // Compute ratio string — flat-lay/overhead angles get a framing note in 9:16
        const _flatAngles = ['flat-lay', 'overhead', 'top-down-hand'];
        const ratioStr = (_flatAngles.includes(this.state.angle) && ratio === '9:16')
            ? `Aspect ratio ${ratio}. Note: this overhead/flat angle composition is optimised for 1:1 or 4:5 framing.`
            : `Aspect ratio ${ratio}.`;

        """
    ps_fixed = ps_fixed.replace(TAILPARTS_START, RATIO_VAR + TAILPARTS_START)
    
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(ps_fixed)
    print('Fixed and saved.')
else:
    print('ERROR: Range not found correctly')

# Bump version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print()
# Check backtick balance in ratio area
idx2 = ps2.find('_flatAngles')
print('=== Ratio area (clean) ===')
print(ps2[idx2:idx2+300])

# Check overall balance
bt = ps2.count('`')
ob = ps2.count('{')
cb = ps2.count('}')
print(f'\nBackticks: {bt} (even: {bt%2==0}), Braces: {{{ob}}} {cb} (diff: {ob-cb})')

# Check the broken pattern is gone
broken_gone = '\\\\`' not in ps2 and '\\`Aspect' not in ps2
print(f'Broken backtick escape removed: {broken_gone}')
print(f'ratioStr in tailParts: {"ratioStr," in ps2}')
