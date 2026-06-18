import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find the advanced controls card section - find the end of the styling form-group
adv_start = ps.find('ps_adv_controls')
styling_idx = ps.find('ps_styling', adv_start)
# Get the full styling form-group block
print('=== Styling form-group area ===')
print(ps[styling_idx:styling_idx+600])

# Find exactly where it ends (after the chip group closing div)
# Look for the pattern: </div>\n                        </div> after styling chips
after_styling = ps.find('</div>\n                        </div>', styling_idx + 200)
print(f'\n\n=== After styling (at {after_styling}) ===')
print(ps[after_styling:after_styling+300])

# Find the ps-arch-tagline CSS class
css = open('css/styles.css', 'r', encoding='utf-8').read()
print('\n\n=== All ps-arch- CSS classes ===')
arch_classes = re.findall(r'\.ps-arch-[a-z]+\s*\{[^}]*\}', css)
for c in arch_classes:
    print(c[:150])
    print()

# How the realism would be added to prompt generation - check _buildPrompt
print('=== _buildPrompt structure ===')
build_idx = ps.find('_buildPrompt')
print(ps[build_idx:build_idx+3000])
