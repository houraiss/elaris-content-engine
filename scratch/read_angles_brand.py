import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Current brand touch descriptions
idx = ps.find('brandTouchDesc =')
print('=== brandTouchDesc block ===')
print(ps[idx:idx+600])
print()

# 2. Current angles getter
idx2 = ps.find('get angles()')
print('=== angles getter ===')
print(ps[idx2:idx2+700])
print()

# 3. Current _getAnglesForCategory rankings
idx3 = ps.find('_getAnglesForCategory')
print('=== _getAnglesForCategory ===')
print(ps[idx3:idx3+1200])
