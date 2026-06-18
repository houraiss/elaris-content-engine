import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Show _generatePrompts flow around pieceDesc check
idx = ps.find('if (!this.state.pieceDesc.trim())')
print('=== _generatePrompts pieceDesc check ===')
print(ps[max(0,idx-200):idx+400])
print()

# 2. Show the new piece builder in _buildPrompt  
idx2 = ps.find('PIECE LABEL: Always enforce')
print('=== New piece builder ===')
print(ps[idx2:idx2+900])
