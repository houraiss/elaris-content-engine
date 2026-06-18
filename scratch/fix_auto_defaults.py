import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
fixes = []

# ── 1. Add 'auto' as first palette option ───────────────────────────────
OLD_PAL_GET = """get palettes() {
        return [
            { id: 'neutral', label: window.I18n ? window.I18n.t('ps_pal_neutral') : 'Neutral Beige' },"""
NEW_PAL_GET  = """get palettes() {
        return [
            { id: 'auto', label: 'Auto / Scene' },
            { id: 'neutral', label: window.I18n ? window.I18n.t('ps_pal_neutral') : 'Neutral Beige' },"""
if OLD_PAL_GET in ps:
    ps = ps.replace(OLD_PAL_GET, NEW_PAL_GET)
    fixes.append('✓ auto added to palettes getter')
else: fixes.append('✗ palettes getter not found')

# ── 2. Change palette state default from 'neutral' to 'auto' ─────────────
OLD_PAL_STATE = "palette: 'neutral',"
NEW_PAL_STATE  = "palette: 'auto',"
if OLD_PAL_STATE in ps:
    ps = ps.replace(OLD_PAL_STATE, NEW_PAL_STATE, 1)
    fixes.append('✓ palette state default → auto')
else: fixes.append('✗ palette state not found')

# ── 3. Add 'auto' as first styling option ───────────────────────────────
OLD_STY_GET = """get stylings() {
        return [
            { id: 'minimal', label: window.I18n ? window.I18n.t('ps_sty_minimal') : 'Minimal / Nude' },"""
NEW_STY_GET  = """get stylings() {
        return [
            { id: 'auto', label: 'Auto / Scene' },
            { id: 'minimal', label: window.I18n ? window.I18n.t('ps_sty_minimal') : 'Minimal / Nude' },"""
if OLD_STY_GET in ps:
    ps = ps.replace(OLD_STY_GET, NEW_STY_GET)
    fixes.append('✓ auto added to stylings getter')
else: fixes.append('✗ stylings getter not found')

# ── 4. Change styling state default from 'minimal' to 'auto' ─────────────
OLD_STY_STATE = "styling: 'minimal',"
NEW_STY_STATE  = "styling: 'auto',"
if OLD_STY_STATE in ps:
    ps = ps.replace(OLD_STY_STATE, NEW_STY_STATE, 1)
    fixes.append('✓ styling state default → auto')
else: fixes.append('✗ styling state not found')

# ── 5. Handle 'auto' in paletteMap (returns empty — AI picks freely) ────
OLD_PAL_MAP = """paletteMap = {
            'neutral': 'neutral beige and cream color palette, warm luxury tone',"""
NEW_PAL_MAP  = """paletteMap = {
            'auto': '',   // auto: no palette constraint — AI picks what fits the scene
            'neutral': 'neutral beige and cream color palette, warm luxury tone',"""
if OLD_PAL_MAP in ps:
    ps = ps.replace(OLD_PAL_MAP, NEW_PAL_MAP)
    fixes.append('✓ auto palette maps to empty string in paletteMap')
else: fixes.append('✗ paletteMap not found')

# ── 6. Handle 'auto' in stylingDesc (skip instruction — AI picks freely) ─
OLD_STY_DESC = """stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'minimal': modelGenderForStyling === 'male'
                    ? 'model in minimal clean styling, strong build as the canvas'
                    : 'model in minimal styling, skin as the canvas',"""
NEW_STY_DESC  = """stylingDesc = '';
        if (isHuman) {
            const styleMap = {
                'auto': '',   // auto: no styling constraint — AI matches the archetype scene
                'minimal': modelGenderForStyling === 'male'
                    ? 'model in minimal clean styling, strong build as the canvas'
                    : 'model in minimal styling, skin as the canvas',"""
if OLD_STY_DESC in ps:
    ps = ps.replace(OLD_STY_DESC, NEW_STY_DESC)
    fixes.append('✓ auto styling maps to empty string in styleMap')
else: fixes.append('✗ stylingDesc block not found')

with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
    f.write(ps)
print('JS saved.')

html = open('index.html', 'r', encoding='utf-8').read()
m = re.search(r'prompt-studio\.js\?v=(\d+)', html)
if m:
    v = int(m.group(1))
    html = html.replace(f'prompt-studio.js?v={v}', f'prompt-studio.js?v={v+1}')
    open('index.html', 'w', encoding='utf-8').write(html)
    print(f'v{v} → v{v+1}')

print('\n=== FIXES ===')
for f in fixes: print(f'  {f}')

# Verify
ps2 = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n=== VERIFICATION ===')
checks = [
    ("{ id: 'auto', label: 'Auto / Scene' },\n            { id: 'neutral'" in ps2, 'auto first in palettes'),
    ("{ id: 'auto', label: 'Auto / Scene' },\n            { id: 'minimal'" in ps2, 'auto first in stylings'),
    ("palette: 'auto'," in ps2,                                                    'palette default = auto'),
    ("styling: 'auto'," in ps2,                                                    'styling default = auto'),
    ("'auto': ''," in ps2,                                                         'auto maps to empty in both maps'),
    ("'auto': '',   // auto: no palette" in ps2,                                   'auto palette comment'),
    ("'auto': '',   // auto: no styling" in ps2,                                   'auto styling comment'),
]
all_ok = True
for ok, desc in checks:
    s = 'OK' if ok else 'FAIL'
    if not ok: all_ok = False
    print(f'  [{s}] {desc}')
print()
print('ALL GOOD' if all_ok else 'CHECK ISSUES')
