import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Show the complete new piece builder
idx = ps.find('PIECE LABEL: Always enforce')
end = ps.find('const subject =', idx)
print('=== Full new piece builder ===')
print(ps[max(0,idx-50):end+50])
