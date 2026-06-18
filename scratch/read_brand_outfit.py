import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# 1. Current brandTouchDesc / wordmark building
idx = ps.find('brandTouchDesc')
while idx > 0 and idx < 145000:
    ctx = ps[idx:idx+200]
    if 'const' in ctx or 'let' in ctx or '=' in ctx:
        print(f'brandTouchDesc at {idx}:')
        print(ctx[:200])
        print()
    idx = ps.find('brandTouchDesc', idx+1)

# 2. Current outfit pool structure (first few)
idx2 = ps.find("{ t: 'wearing a soft camel")
print(f'=== Outfit pool at {idx2} ===')
print(ps[idx2:idx2+200])

# 3. sceneVariant in bodyParts
idx3 = ps.find("sceneVariant + '.'")
print(f'\n=== sceneVariant bodyPart at {idx3} ===')
print(ps[max(0,idx3-30):idx3+80])

# 4. humanEnvs pool (check time-of-day mixing)
idx4 = ps.find('humanEnvs = [')
print(f'\n=== humanEnvs pool at {idx4} ===')
end4 = ps.find('];', idx4) + 2
print(ps[idx4:end4])
