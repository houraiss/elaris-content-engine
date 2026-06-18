import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Get the full _buildPrompt function
idx = ps.find('    // ── Build Single Prompt ──────────────────────')
if idx < 0:
    idx = ps.find('    _buildPrompt(archetype)')
end = ps.find('\n\n\n', idx + 500)
if end < 0 or end - idx > 30000:
    # find next method
    end = ps.find('\n    // ──', idx + 500)
print(ps[idx:end])
print(f'\n\n=== Length: {end - idx} chars ===')
