"""
Restore prompt-studio.js from the UTF-16 backup.
Fix all encoding artifacts that came from the double-encoding process.
"""

def restore():
    # Read the UTF-16 backup
    js = open('scratch/prompt-studio-HEAD.js', 'r', encoding='utf-16').read()
    
    # The mojibake sequences we need to fix:
    # These come from UTF-8 bytes of Unicode characters being read as Latin-1/Windows-1252
    # then stored in a UTF-16 file.
    
    # BOX DRAWING CHARS: U+2500 (─) encoded as UTF-8 is E2 94 80
    # When read as Windows-1252: â (E2) + box char (94) + € (80) = 'â\x94\x80' -> ΓöÇ in UTF-16
    # The sequence ΓöÇ = Gamma(0393) + ö(F6) + Ç(C7) appears 1132 times
    # These are the comment separator lines: // ── Title ──...
    
    # EM DASH: U+2014 (—) encoded as UTF-8 is E2 80 94
    # When read as Windows-1252: â + euro(80->€) + (94) = mojibake
    # Appears as ΓÇö (0393,C7,F6) 24 times 
    
    # EMOJIS: U+1F series emojis. e.g. 💍 is F0 9F 92 8D in UTF-8
    # When read as Windows-1252 4 bytes: ≡ƒ... patterns
    
    # The cleanest fix: decode the original bytes directly
    # Since the file is UTF-16, the text IS valid UTF-16 unicode code points,
    # but some strings were ENCODED as UTF-8 then the bytes stored as individual chars
    # We need to re-encode those sequences back.
    
    # Let's try a different approach: re-encode the problematic chars
    # The ΓöÇ sequence: \u0393 \u00f6 \u00c7
    # These are Unicode codepoints that were the Latin-1 interpretation of UTF-8 bytes
    # To get the original character back, encode each as Latin-1 and decode as UTF-8
    
    def fix_mojibake_sequence(s):
        result = []
        i = 0
        while i < len(s):
            c = s[i]
            cp = ord(c)
            # Check if this might be a multi-byte UTF-8 sequence stored as Latin-1
            if cp == 0xE2 or cp == 0x393:  # Could be start of 3-byte UTF-8 seq
                # Try to decode 3 bytes
                try:
                    chunk = s[i:i+3]
                    raw = bytes(ord(ch) & 0xFF for ch in chunk)
                    decoded = raw.decode('utf-8')
                    result.append(decoded)
                    i += 3
                    continue
                except:
                    pass
            elif cp == 0xF0 or (0x261 <= cp <= 0x262):  # Could be start of 4-byte UTF-8 seq (emoji)
                try:
                    chunk = s[i:i+4]
                    raw = bytes(ord(ch) & 0xFF for ch in chunk)
                    decoded = raw.decode('utf-8')
                    result.append(decoded)
                    i += 4
                    continue
                except:
                    pass
            result.append(c)
            i += 1
        return ''.join(result)
    
    # Actually the simplest approach: look at what characters exist above ASCII
    # and try to re-encode them as latin-1 bytes, then decode as utf-8
    
    def try_fix_char_sequence(s, start, length):
        """Try to fix a sequence of latin-1 chars that are really UTF-8 bytes."""
        try:
            chunk = s[start:start+length]
            raw = bytes(ord(c) & 0xFF for c in chunk)
            return raw.decode('utf-8'), True
        except:
            return s[start], False
    
    # Build result character by character
    result = []
    i = 0
    fixes = 0
    while i < len(js):
        c = js[i]
        cp = ord(c)
        
        # Latin-1/cp1252 high bytes that could be start of UTF-8 sequences
        if cp > 127 and cp < 0x400:
            # Try 4-byte sequence first (for emojis)
            if i + 3 < len(js):
                fixed, ok = try_fix_char_sequence(js, i, 4)
                if ok and all(ord(ch) < 0x1000 for ch in fixed):
                    # Sanity check: the fixed version should be reasonable
                    if len(fixed) <= 2:  # 4 bytes → 1-2 chars
                        result.append(fixed)
                        i += 4
                        fixes += 1
                        continue
            
            # Try 3-byte sequence
            if i + 2 < len(js):
                fixed, ok = try_fix_char_sequence(js, i, 3)
                if ok and len(fixed) == 1 and ord(fixed) > 0x100:
                    result.append(fixed)
                    i += 3
                    fixes += 1
                    continue
            
            # Try 2-byte sequence
            if i + 1 < len(js):
                fixed, ok = try_fix_char_sequence(js, i, 2)
                if ok and len(fixed) == 1 and ord(fixed) > 0x100:
                    result.append(fixed)
                    i += 2
                    fixes += 1
                    continue
        
        result.append(c)
        i += 1
    
    fixed_js = ''.join(result)
    print(f"Fixed {fixes} encoding sequences")
    print(f"Original length: {len(js)}, Fixed length: {len(fixed_js)}")
    
    # Write the cleaned version as UTF-8
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(fixed_js)
    
    print("Restored js/prompt-studio.js successfully!")
    
    # Sample check
    sample_idx = fixed_js.find('Body Intimate')
    if sample_idx > 0:
        print("\nSample from archetypes section:")
        print(fixed_js[sample_idx-20:sample_idx+100])

if __name__ == '__main__':
    restore()
