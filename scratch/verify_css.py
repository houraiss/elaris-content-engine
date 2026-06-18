import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

css = open('css/styles.css', 'r', encoding='utf-8').read()
print('=== CSS VERIFICATION ===')
print('CSS brace balance:', css.count('{') - css.count('}'))
print('minmax in main layout:', 'minmax(0, 1fr)' in css)
print('max-width 1600:', 'max-width: 1600px' in css)
print('CSS total lines:', css.count('\n'))

# Check how many times minmax appears (should be multiple for responsive)
import re
minmax_count = css.count('minmax(0, 1fr)')
print(f'minmax(0, 1fr) count: {minmax_count} (expected >= 3)')

# Show the ps-layout block
idx = css.find('.ps-layout {')
print('\n.ps-layout block:')
print(css[idx:idx+150])
