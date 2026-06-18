import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Get full _buildPrompt function
build_idx = ps.find('_buildPrompt(archetype)')
end_idx = ps.find('\n    },\n', build_idx + 100)
print('=== Full _buildPrompt function ===')
print(ps[build_idx:end_idx+6])

# Get state initialization
print('\n\n=== State init ===')
state_idx = ps.find('state: {')
if state_idx < 0:
    state_idx = ps.find('state:{')
end_state = ps.find('\n    },', state_idx + 10)
print(ps[state_idx:end_state+6])

# Check where styling is used in buildPrompt
print('\n\n=== styling usage in _buildPrompt ===')
styling_uses = [m.start() for m in re.finditer('styling', ps[build_idx:end_idx])]
for pos in styling_uses:
    print(ps[build_idx+pos:build_idx+pos+120])
    print('---')
