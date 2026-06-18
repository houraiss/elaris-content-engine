import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Search for where the subject template is resolved
# It's likely something like: archetype.subjects[idx].replace('{piece}', ...)
# or: const subject = ... .replace(...)

search_terms = ['subject.replace', '.replace(', 'subjectText', 'selectedSubject', 'pickedSubject', 'subj']
for term in search_terms:
    idx = ps.find(term, 109609)  # within _buildPrompt
    if idx > 0 and idx < 135000:
        print(f'=== "{term}" at {idx} ===')
        print(ps[idx:idx+200])
        print()

# Also look for const subject = 
idx = ps.find('const subject', 109609)
if idx > 0:
    print(f'=== const subject at {idx} ===')
    print(ps[idx:idx+300])
