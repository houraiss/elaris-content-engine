import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

issues = json.load(open('scratch/audit_results.json', 'r', encoding='utf-8'))
from collections import defaultdict

sev_counts = defaultdict(int)
type_counts = defaultdict(int)
for iss in issues:
    sev_counts[iss['sev']] += 1
    type_counts[iss['type']] += 1

print(f'TOTAL: {len(issues)} issues')
print(f'  CRITICAL: {sev_counts["CRITICAL"]}')
print(f'  WARNING:  {sev_counts["WARNING"]}')
print(f'  INFO:     {sev_counts["INFO"]}')
print()

# Show unique hardcoded piece templates
by_type = defaultdict(list)
for iss in issues: by_type[iss['type']].append(iss)

print('=== HARDCODED_PIECE_NAME — unique subject templates ===')
seen = set()
for iss in by_type.get('HARDCODED_PIECE_NAME', []):
    key = iss['subject']
    if key not in seen:
        seen.add(key)
        print(f'  arch={iss["arch"]} | {iss["subject"]}')
