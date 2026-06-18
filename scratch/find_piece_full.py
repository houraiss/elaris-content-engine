import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Look at the input element (around where pieceDesc listener is)
print('=== INPUT ELEMENT (UI) ===')
print(ps[91700:91920])
print()

# 2. Look at the full piece variable + material section in _buildPrompt
print('=== PIECE + MATERIAL IN _buildPrompt ===')
print(ps[109643:110000])
