import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Check the full mobile menu toggle function in app.js
app = open('js/app.js', 'r', encoding='utf-8').read()
# Find the toggleMobileMenu function
idx = app.find('toggleMobileMenu')
if idx >= 0:
    # Get the full function
    end = app.find('\n    }', idx + 50)
    end2 = app.find('\n    }', end + 1)
    print('=== toggleMobileMenu function ===')
    print(app[idx:end2+10])

# Check if it adds .open class to the button
print('\n\nDoes it add .open to btn?', '.open' in app[idx:end2+10] if idx >= 0 else 'N/A')
print('Does it toggle btn class?', 'btn.classList' in app or 'menuBtn.classList' in app or 'mobileMenuBtn.classList' in app)

# Also check what the full context around the button is
idx2 = app.find('mobile-menu-btn')
print('\n=== Full mobile menu section ===')
print(app[idx2-50:idx2+600])

# Check the loadDefaultProfiles or similar
ps = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
print('\n\n=== Profile loading in prompt-studio.js ===')
idx3 = ps.find('_loadProfiles')
print(ps[idx3:idx3+800])

# Check how male/female gender affects profiles
idx4 = ps.find('modelGender')
while idx4 != -1:
    snippet = ps[idx4:idx4+200]
    if 'male' in snippet.lower():
        print(f'\nmodelGender context at {idx4}:')
        print(snippet[:200])
    idx4 = ps.find('modelGender', idx4+1)
    if idx4 > 80000: break
