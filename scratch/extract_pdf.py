"""
Extract PDF pages as contact sheet grids for visual analysis.
Creates grids of 6 pages per sheet at decent resolution.
"""
import fitz  # PyMuPDF
from PIL import Image
import io, os

PDF_PATH = r'C:\Users\User\Default Project\elaris-content-engine\References - CONTENT ENGINE v3.0\Pipeline Image Reference_compressed.pdf'
OUT_DIR = r'C:\Users\User\Default Project\elaris-content-engine\scratch\pdf_sheets'
os.makedirs(OUT_DIR, exist_ok=True)

doc = fitz.open(PDF_PATH)
total = doc.page_count
print(f"Total pages: {total}")

# Render each page as an image, then combine into contact sheets of 6
COLS = 3
ROWS = 2
PER_SHEET = COLS * ROWS
DPI = 150  # good balance of quality vs size

page_images = []
for i in range(total):
    page = doc[i]
    mat = fitz.Matrix(DPI/72, DPI/72)
    pix = page.get_pixmap(matrix=mat)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    page_images.append(img)
    if (i+1) % 20 == 0:
        print(f"  Rendered {i+1}/{total} pages...")

print(f"All {total} pages rendered. Creating contact sheets...")

# Create contact sheets
sheet_num = 0
for start in range(0, total, PER_SHEET):
    batch = page_images[start:start+PER_SHEET]
    if not batch:
        break
    
    # Find max dimensions in this batch
    max_w = max(img.width for img in batch)
    max_h = max(img.height for img in batch)
    
    # Create grid
    grid_w = COLS * max_w + (COLS-1) * 10
    grid_h = ROWS * max_h + (ROWS-1) * 10
    grid = Image.new('RGB', (grid_w, grid_h), (30, 30, 30))
    
    for idx, img in enumerate(batch):
        row = idx // COLS
        col = idx % COLS
        x = col * (max_w + 10)
        y = row * (max_h + 10)
        # Center the image in its cell
        x_offset = (max_w - img.width) // 2
        y_offset = (max_h - img.height) // 2
        grid.paste(img, (x + x_offset, y + y_offset))
    
    out_path = os.path.join(OUT_DIR, f'sheet_{sheet_num:02d}_pages_{start+1}-{min(start+PER_SHEET, total)}.png')
    grid.save(out_path, quality=90)
    sheet_num += 1
    print(f"  Sheet {sheet_num}: pages {start+1}-{min(start+PER_SHEET, total)}")

doc.close()
print(f"\nDone! {sheet_num} contact sheets saved to {OUT_DIR}")
