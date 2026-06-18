import sys

def fix_mojibake_file(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()
    
    # The file was originally UTF-8, but some text was inserted as UTF-8 encoded as CP1252.
    # We will decode the file as UTF-8, then look for CP1252-looking mojibake and decode it.
    
    # Try decoding the whole file as utf-8 first
    try:
        text = raw_bytes.decode('utf-8')
    except Exception as e:
        print("File is not valid utf-8:", e)
        return
        
    replacements = {
        'ðŸ“¦': '📦',
        'ðŸ‘¤': '👤',
        'ðŸŽ­': '🎬',
        'âœ¨': '✨',
        'ðŸ• ': '🕒',
        'ðŸ’ ': '💍',
        'âš—ï¸ ': '⚙️',
        'ðŸŽ¨': '🎨',
        'âœ•': '✖',
        'ðŸ ·ï¸ ': '🏷️',
        'ðŸ“·': '📷',
        'â­ ': '⭐',
        'ðŸŽ¯': '🎯',
        'ðŸ“‹': '📋',
        'ðŸ”„': '🔄',
        'ðŸ“„': '📄',
        'ðŸ“Š': '📊',
        'âš¡': '⚡',
        'â–²': '▲',
        'â–¼': '▼',
        'âœ¦': '✦',
        'âœ“': '✓',
        'â™‚': '♂',
        'â™€': '♀'
    }
    
    for bad, good in replacements.items():
        text = text.replace(bad, good)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
        
    print(f"Fixed {filepath} emojis.")

if __name__ == "__main__":
    fix_mojibake_file(sys.argv[1])
