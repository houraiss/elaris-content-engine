import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
css = open('css/styles.css', 'r', encoding='utf-8').read()

# Get the FULL archetype card template HTML
print('=== Full archetype card HTML template ===')
bf_idx = ps.find('bestForVal')
# Go back to find the return statement
return_idx = ps.rfind('return `', 0, bf_idx)
# Go forward to find closing backtick
end_idx = ps.find('\n            `;', bf_idx)
if end_idx < 0:
    end_idx = ps.find('`;', bf_idx)
print(ps[return_idx:end_idx+3])

# Get CSS for archetype cards (text truncation)
print('\n\n=== CSS for ps-arch-card text ===')
for selector in ['.ps-arch-name', '.ps-arch-tagline', '.ps-arch-best', '.ps-arch-info', '.ps-arch-card', '.ps-arch-score']:
    idx = css.find(selector)
    if idx > 0:
        end = css.find('}', idx)
        print(f'{css[idx:end+1]}')
        print()

# Check for text-overflow / truncation CSS
print('\n=== Truncation CSS ===')
trunc = re.findall(r'[^{]*\{[^}]*(?:overflow|ellipsis|line-clamp|white-space)[^}]*\}', css)
for t in trunc[:10]:
    if 'arch' in t or 'ps-' in t:
        print(t[:200])
        print()

# Find Advanced Controls END point for insertion
print('\n\n=== Advanced Controls section end ===')
adv_start = ps.find('ps_adv_controls')
# Find the closing </div> of the advanced controls card
styling_end = ps.find('</div>\n                    \n\n', adv_start)
if styling_end < 0:
    styling_end = ps.find('ps-right', adv_start)
print(f'Advanced controls from {adv_start} to ~{styling_end}')
print(ps[styling_end-200:styling_end+100])
