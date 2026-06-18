import re

def clean_and_restore():
    """Read the UTF-16 backup, clean encoding artifacts, save as clean UTF-8."""
    js = open('scratch/prompt-studio-HEAD.js', 'r', encoding='utf-16').read()
    
    # The file was saved as UTF-16 by Windows, and contains legitimate Unicode content
    # The garbled sequences like 'ΓÇö' are actually double-encoded - UTF-8 bytes of U+2014 
    # read as UTF-16 code units then decoded as the wrong encoding.
    # Let's find and fix these patterns:
    
    # Map common mojibake to proper chars
    mojibake_map = {
        'ΓÇö': '—',        # em-dash
        'ΓÇô': '–',        # en-dash
        'Γÿò': '☕',       # coffee cup
        'ΓöÇ': '─',        # box drawing
        '≡ƒ': '',          # this is a partial emoji prefix
    }
    
    # Actually, let's check what the unique sequences are
    # by looking at sequences that contain 3+ unusual chars
    import collections
    
    # Find repeated 2-char sequences
    all_chars = list(js)
    pairs = [''.join(all_chars[i:i+3]) for i in range(len(all_chars)-2) if ord(all_chars[i]) > 200]
    counter = collections.Counter(pairs)
    
    with open('scratch/encoding_analysis.txt', 'w', encoding='utf-8') as f:
        f.write("Most common non-ASCII 3-char sequences:\n")
        for seq, count in counter.most_common(30):
            codepoints = ' '.join(f'U+{ord(c):04X}' for c in seq)
            f.write(f"  Count={count}: {repr(seq)} -> [{codepoints}]\n")
    
    print("Analysis saved to scratch/encoding_analysis.txt")
    print(f"Total JS length: {len(js)} chars")

if __name__ == '__main__':
    clean_and_restore()
