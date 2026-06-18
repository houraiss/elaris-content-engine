import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Get the SECOND half: from anatomy constraint onwards
idx = ps.find('        // ── Anatomy constraints')
end = ps.find('\n    },\n\n    // ── Auto-descri', idx)
if end < 0:
    end = ps.find('\n    },\n\n    _', idx)
print(ps[idx:end])

# Also get the _getUniqueSubject and cameraMap for full context
print('\n\n=== _getUniqueSubject ===')
idx2 = ps.find('_getUniqueSubject')
end2 = ps.find('\n    },', idx2 + 100)
print(ps[idx2:end2+6])

print('\n\n=== cameraMap ===')
idx3 = ps.find('const cameraMap = {')
end3 = ps.find('};', idx3 + 100) + 2
print(ps[idx3:end3])
