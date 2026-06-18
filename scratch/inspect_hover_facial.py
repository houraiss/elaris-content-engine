import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# ── Find all archetype card hover/active/transform CSS ──────────────────
print('=== ps-arch-card hover/active/transform CSS ===')
# Find all blocks that contain ps-arch-card
for m in re.finditer(r'\.ps-arch-card[^{]*\{[^}]*\}', css):
    block = m.group()
    if any(kw in block for kw in ['hover', 'active', 'transform', 'scale', 'transition', 'selected']):
        print(block[:200])
        print()

# Also search for transform: scale near arch
print('\n=== transform scale context ===')
idx = css.find('transform:')
while idx != -1:
    ctx = css[max(0,idx-80):idx+100]
    if 'arch' in ctx or 'scale' in css[idx:idx+30]:
        print(f'pos {idx}:', repr(css[idx:idx+80]))
    idx = css.find('transform:', idx+1)

# ── Find Scene Realism section end for facial expressions insertion ──────
print('\n\n=== Scene Realism section end in JS ===')
# Find the skin-detail chip group (last realism control)
skin_detail_idx = ps.find('id="ps-skin-detail"')
if skin_detail_idx > 0:
    # Find the next form-group or section after it
    next_section = ps.find('</div>\n                        </div>\n                        <div class="form-group"', skin_detail_idx)
    if next_section < 0:
        next_section = ps.find('</div>\n                        </div>\n\n                        <div class="form-group" style="margin-top:6px', skin_detail_idx)
    print(f'ps-skin-detail at {skin_detail_idx}')
    print(f'After skin-detail at {next_section}:')
    print(ps[skin_detail_idx:skin_detail_idx+600])

# ── Also check how the realism section header ends ──────────────────────
print('\n\n=== Full realism section HTML ===')
realism_header = ps.find('Scene Realism')
print(ps[realism_header:realism_header+1500])
