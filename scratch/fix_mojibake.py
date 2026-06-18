import re

def fix():
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # The file currently has mojibake comment headers and box drawings, like:
    # // â”€â”€ Pose override â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    
    # We will replace these specific mojibake strings with proper dashes.
    js = js.replace('â”€', '─')
    
    # Check if there are other corrupted characters
    js = js.replace('Â', '') # often seen in CP1252 corruption
    
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(js)
    
    print("Fixed mojibake in js/prompt-studio.js")

if __name__ == '__main__':
    fix()
