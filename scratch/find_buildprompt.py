import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── FIX A: Add method bodies before _buildPrompt ─────────────────────────
# Find the actual _buildPrompt method definition
idx_bp = ps.find('    _buildPrompt() {')
print(f'_buildPrompt method at: {idx_bp}')
if idx_bp < 0:
    # Try without exact spacing
    for m in re.finditer(r'_buildPrompt\s*\(\s*\)', ps):
        print(f'  found at {m.start()}: {repr(ps[m.start()-4:m.start()+40])}')

# Find _computeScore which is a method we know exists
idx_cs = ps.find('    _computeScore(archetype, state) {')
print(f'_computeScore at: {idx_cs}')

# Actually find the text just before _buildPrompt using a different anchor
# Look for "_renderArchetypeGrid" end and then _buildPrompt
idx_rag_end = ps.rfind('_renderArchetypeGrid')
print(f'Last _renderArchetypeGrid at: {idx_rag_end}')
print(repr(ps[idx_rag_end:idx_rag_end+50]))

# Search for the pattern of "_buildPrompt" directly
idx_bp2 = ps.find('_buildPrompt')
while idx_bp2 >= 0:
    ctx = ps[max(0, idx_bp2-10):idx_bp2+30]
    print(f'  _buildPrompt at {idx_bp2}: {repr(ctx)}')
    idx_bp2 = ps.find('_buildPrompt', idx_bp2+1)
