import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Full consistencyOn block in _buildPrompt
idx = ps.find('consistencyOn;               // model descriptor enabled')
print('=== consistency block in _buildPrompt ===')
print(ps[max(0,idx-20):idx+800])
print()

# styleMap full block
idx2 = ps.find("const styleMap = {")
print(f'=== styleMap at {idx2} ===')
end2 = ps.find('};', idx2) + 2
print(ps[idx2:end2])
print()

# How is poseDesc / expressionDesc built? (should be suppressed for consistency)
idx3 = ps.find('const poseDesc')
print(f'=== poseDesc at {idx3} ===')
print(ps[idx3:idx3+200])
print()

# Find stylings getter (where ai-choice would go)
idx4 = ps.find("{ id: 'auto', label:")
print(f'=== stylings getter at {idx4} ===')
print(ps[idx4:idx4+500])
