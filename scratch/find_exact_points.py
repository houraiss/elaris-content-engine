import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()

# Find stylings array exact pattern
idx = ps.find("this.stylings = [")
if idx > 0:
    end = ps.find('\n        ];', idx)
    print(f'stylings array: {idx} to {end+13}')
    print(repr(ps[end:end+30]))
    # Find EXACTLY what comes after the array
    after = ps[end+13:end+100]
    print('After stylings array:')
    print(repr(after))

# Find the event binding area
print()
idx2 = ps.find("state.styling =")
if idx2 > 0:
    print(f'state.styling = at {idx2}')
    # Go back to find the start of the handler
    start = ps.rfind('\n        this.container', 0, idx2)
    # Go forward to find the end
    end2 = ps.find('\n        });', idx2)
    print(ps[start:end2+13])
    print(f'\nEnd of styling handler at {end2+13}')
    after2 = ps[end2+13:end2+200]
    print('After styling handler:')
    print(repr(after2))
