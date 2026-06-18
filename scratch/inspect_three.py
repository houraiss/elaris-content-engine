import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Brand wordmark current text
idx = ps.find('"ELARIS" haute couture')
print('=== WORDMARK DESC ===')
print(ps[idx:idx+400])
print()

# 2. _getUniqueSubject function
idx2 = ps.find('_getUniqueSubject')
print('=== _getUniqueSubject ===')
print(ps[idx2:idx2+600])
print()

# 3. Styling / auto-styling injection
idx3 = ps.find('diverse contemporary styling')
print('=== STYLING (auto) ===')
print(ps[max(0,idx3-50):idx3+200])
print()

# 4. lifestyle-moment subjects (first archetype example)
idx4 = ps.find("'lifestyle-moment'")
if idx4 < 0: idx4 = ps.find('"lifestyle-moment"')
print(f'lifestyle-moment at {idx4}')
# Find subjects array nearby
idx5 = ps.find('subjects:', idx4)
end5 = ps.find(']', idx5) + 1
print(ps[idx5:end5])
