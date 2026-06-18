import sys
import codecs

def fix_mojibake(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content = ""
    for char in content:
        try:
            # Check if this character is part of a mojibake sequence by trying to encode to cp1252
            # For characters that don't need fixing, this might fail or succeed, but if the whole string
            # fails, it's easier to process by blocks or handle specific exceptions.
            # Actually, the simplest way is to try to encode the whole text to cp1252 and decode to utf-8.
            pass
        except:
            pass
            
    # Simpler approach: 
    # If the file contains valid UTF-8, but those characters represent cp1252 decoded from utf-8 bytes
    try:
        # Re-encode the string as cp1252 (getting the original utf-8 bytes back)
        raw_bytes = content.encode('cp1252')
        # Decode the bytes as utf-8
        fixed_content = raw_bytes.decode('utf-8')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed {filepath} successfully.")
    except Exception as e:
        print(f"Could not fix whole file at once: {e}")
        # Sometimes there are mixed characters (some correct, some mojibake)
        # In this case we can replace specific known strings or just use regex.

if __name__ == "__main__":
    fix_mojibake(sys.argv[1])
