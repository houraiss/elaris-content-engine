import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Get full context around piece construction
idx = ps.find("const piece = this.state.pieceDesc")
# Go back to find _buildPrompt
build_start = ps.rfind('_buildPrompt', 0, idx)
# Show 600 chars from piece declaration
print(f'_buildPrompt at: {build_start}')
print(f'piece declaration at: {idx}')
print()
print(ps[idx:idx+600])
