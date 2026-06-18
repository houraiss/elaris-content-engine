import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find all subjects arrays — find the multiline ones
# Each archetype has: subjects: ['...', '...', ...]
# Find the archetype id and then its subjects
pattern = r"id:\s*'([^']+)'.*?subjects:\s*\[(.*?)\]"
for m in re.finditer(pattern, ps, re.DOTALL):
    arch_id = m.group(1)
    subjects_raw = m.group(2)
    # Extract individual subject strings
    subjects = re.findall(r"'([^']*)'", subjects_raw)
    if subjects:
        print(f'=== {arch_id} ===')
        for i, s in enumerate(subjects):
            print(f'  [{i}] {s[:120]}')
        print()
