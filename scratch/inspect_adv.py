import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── 1. Find Advanced Controls section ──────────────────────────────────
print('=== Advanced Controls section ===')
adv_idx = ps.find('ps_adv_controls')
if adv_idx > 0:
    # Find the HTML render area for Advanced Controls
    print(ps[max(0,adv_idx-50):adv_idx+2000])

# ── 2. Find archetype card CSS references ──────────────────────────────
print('\n\n=== Archetype card render (text truncation) ===')
# Find where bestFor is rendered in HTML template
bf_idx = ps.find('bestForVal')
print(ps[max(0,bf_idx-100):bf_idx+400])

# Find the card HTML template
card_idx = ps.find('ps-arch-card')
contexts = []
idx = card_idx
while idx != -1:
    snippet = ps[idx:idx+400]
    if 'innerHTML' in snippet or 'return' in snippet or 'template' in snippet.lower():
        contexts.append((idx, snippet))
    idx = ps.find('ps-arch-card', idx+1)
    if len(contexts) > 3: break
for pos, ctx in contexts[:2]:
    print(f'\nCard template at pos {pos}:')
    print(ctx[:300])
