import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Bump CSS version
html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'styles\.css\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'styles.css?v={v}', f'styles.css?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'CSS version bumped: v{v} → v{v+1}')

# Verify M2 fix in CSS
css = open('css/styles.css', 'r', encoding='utf-8').read()
print('\n=== M2 Verification ===')
print('.mobile-menu-btn.active span selectors present:', css.count('.mobile-menu-btn.active') == 3)
print('.mobile-menu-btn.open selectors remain:', '.mobile-menu-btn.open' in css)
print('CSS brace balance:', css.count('{') - css.count('}'))

# Verify full toggle logic in app.js
app = open('js/app.js', 'r', encoding='utf-8').read()
idx = app.find('toggleMobileMenu')
toggle_fn = app[idx:idx+400]
print('\n=== M2: Full toggle function ===')
print(toggle_fn)
print('Toggles .active on button:', "menuBtn.classList.toggle('active'" in toggle_fn)
print('Toggles .open on sidebar:', "sidebar.classList.toggle('open'" in toggle_fn)
print('Toggles .active on overlay:', "overlay.classList.toggle('active'" in toggle_fn)

# Verify M1: Male profiles in prompt-studio.js
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== M1 Verification ===')
amir = "'id': 'amir'" in ps or "id: 'amir'" in ps
tariq = "'id': 'tariq'" in ps or "id: 'tariq'" in ps
print(f'Amir male profile present: {amir}')
print(f'Tariq male profile present: {tariq}')

# Check gender filter function
filter_fn_idx = ps.find('p.gender')
if filter_fn_idx >= 0:
    print(f'Gender filter function: {ps[filter_fn_idx:filter_fn_idx+100]}')
