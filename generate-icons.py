"""Generate PWA icon PNGs from the Elaris brand assets."""
import os
import struct
import zlib

PROJECT = os.path.dirname(os.path.abspath(__file__))
ICONS_DIR = os.path.join(PROJECT, "icons")

def create_elaris_icon(size, filepath):
    """Create a branded Elaris icon PNG at the given size.
    
    Draws a dark rounded-corner background with the Elaris star motif
    in Moroccan bronze color, purely using raw PNG generation.
    """
    pixels = []
    cx, cy = size // 2, size // 2
    pad = size * 0.12  # padding
    radius = size * 0.15  # corner radius
    
    # Star diamond dimensions
    star_w = size * 0.28
    star_h = size * 0.32
    
    for y in range(size):
        row = []
        for x in range(size):
            # Background with rounded corners
            in_bg = True
            # Check corners
            if x < radius and y < radius:
                if (x - radius)**2 + (y - radius)**2 > radius**2:
                    in_bg = False
            elif x >= size - radius and y < radius:
                if (x - (size - radius))**2 + (y - radius)**2 > radius**2:
                    in_bg = False
            elif x < radius and y >= size - radius:
                if (x - radius)**2 + (y - (size - radius))**2 > radius**2:
                    in_bg = False
            elif x >= size - radius and y >= size - radius:
                if (x - (size - radius))**2 + (y - (size - radius))**2 > radius**2:
                    in_bg = False
            
            if not in_bg:
                row.extend([0, 0, 0, 0])  # transparent
                continue
            
            # Check if pixel is in the star diamond (top)
            top_cy = cy - star_h * 0.35
            dx_top = abs(x - cx) / star_w
            dy_top = abs(y - top_cy) / star_h
            in_top_star = (dx_top + dy_top) <= 1.0 and y < cy + star_h * 0.1
            
            # Check if pixel is in the star diamond (bottom, offset)
            bot_cy = cy + star_h * 0.35
            dx_bot = abs(x - cx) / star_w
            dy_bot = abs(y - bot_cy) / star_h
            in_bot_star = (dx_bot + dy_bot) <= 1.0 and y > cy - star_h * 0.1
            
            if in_top_star:
                # Moroccan bronze with slight gradient
                t = 1.0 - (dy_top + dx_top)
                r = min(255, int(166 + t * 40))
                g = min(255, int(124 + t * 30))
                b = min(255, int(82 + t * 20))
                row.extend([r, g, b, 230])
            elif in_bot_star:
                # Lighter, more transparent bottom diamond
                t = 1.0 - (dy_bot + dx_bot)
                r = min(255, int(166 + t * 30))
                g = min(255, int(124 + t * 20))
                b = min(255, int(82 + t * 15))
                row.extend([r, g, b, 130])
            else:
                # Dark background
                row.extend([17, 17, 17, 255])
        
        pixels.append(bytes(row))
    
    # Write PNG
    def write_png(w, h, rows, fname):
        def chunk(ctype, data):
            c = ctype + data
            return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        
        sig = b'\x89PNG\r\n\x1a\n'
        ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)  # 8-bit RGBA
        
        raw = b''
        for row in rows:
            raw += b'\x00' + row  # filter byte + row data
        
        idat = zlib.compress(raw, 9)
        
        with open(fname, 'wb') as f:
            f.write(sig)
            f.write(chunk(b'IHDR', ihdr))
            f.write(chunk(b'IDAT', idat))
            f.write(chunk(b'IEND', b''))
    
    write_png(size, size, pixels, filepath)
    print(f"  Created: {filepath} ({size}x{size})")


if __name__ == '__main__':
    os.makedirs(ICONS_DIR, exist_ok=True)
    create_elaris_icon(192, os.path.join(ICONS_DIR, "icon-192.png"))
    create_elaris_icon(512, os.path.join(ICONS_DIR, "icon-512.png"))
    print("  Done!")
