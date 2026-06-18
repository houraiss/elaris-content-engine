import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the FULL stylings getter  
idx = ps.find("get stylings() {")
print('=== stylings getter ===')
end = ps.find('\n    },', idx) + 7
print(ps[idx:end])
print()

# Find the styling dropdown render (in HTML generation)
idx2 = ps.find("ps_styling")
while idx2 > 0 and idx2 < 100000:
    ctx = ps[idx2:idx2+200]
    print(f'ps_styling at {idx2}:')
    print(ctx[:200])
    print()
    idx2 = ps.find("ps_styling", idx2+1)

# Find where the profile descriptor is injected into the prompt
idx3 = ps.find('profile.descriptor')
if idx3 < 0:
    idx3 = ps.find('descriptor')
print(f'=== descriptor at {idx3} ===')
print(ps[idx3:idx3+300])
