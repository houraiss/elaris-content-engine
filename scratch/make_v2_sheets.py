"""
Create contact sheet grids from V2 reference images.
Arranges images in grids of 6 (3 cols x 2 rows) per sheet,
matching the format used for the PDF sheets.
"""
from PIL import Image
import os, glob

IMG_DIR = r'C:\Users\User\Default Project\elaris-content-engine\References - CONTENT ENGINE v3.0\V2'
OUT_DIR = r'C:\Users\User\Default Project\elaris-content-engine\scratch\pdf_sheets\v2_sheets'
os.makedirs(OUT_DIR, exist_ok=True)

# Gather all images sorted by name
images = sorted(glob.glob(os.path.join(IMG_DIR, '*.jpg')))
total = len(images)
print(f"Found {total} images in V2 folder")

COLS = 3
ROWS = 2
PER_SHEET = COLS * ROWS
GAP = 10  # pixels between cells
BG_COLOR = (30, 30, 30)  # dark background matching previous sheets

# Load all images
page_images = []
for path in images:
    img = Image.open(path)
    page_images.append(img)
    print(f"  Loaded: {os.path.basename(path)} ({img.width}x{img.height})")

print(f"\nAll {total} images loaded. Creating contact sheets...")

# Create contact sheets
sheet_num = 0
for start in range(0, total, PER_SHEET):
    batch = page_images[start:start + PER_SHEET]
    if not batch:
        break

    # Find max dimensions in this batch
    max_w = max(img.width for img in batch)
    max_h = max(img.height for img in batch)

    # Create grid
    grid_w = COLS * max_w + (COLS - 1) * GAP
    grid_h = ROWS * max_h + (ROWS - 1) * GAP
    grid = Image.new('RGB', (grid_w, grid_h), BG_COLOR)

    for idx, img in enumerate(batch):
        row = idx // COLS
        col = idx % COLS
        x = col * (max_w + GAP)
        y = row * (max_h + GAP)
        # Center the image in its cell
        x_offset = (max_w - img.width) // 2
        y_offset = (max_h - img.height) // 2
        grid.paste(img, (x + x_offset, y + y_offset))

    end_idx = min(start + PER_SHEET, total)
    out_path = os.path.join(OUT_DIR, f'v2_sheet_{sheet_num:02d}_imgs_{start + 1}-{end_idx}.png')
    grid.save(out_path, quality=90)
    sheet_num += 1
    print(f"  Sheet {sheet_num}: images {start + 1}-{end_idx}")

# Close images
for img in page_images:
    img.close()

print(f"\nDone! {sheet_num} contact sheets saved to {OUT_DIR}")
