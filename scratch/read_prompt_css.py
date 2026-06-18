import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()

# Find the full ps-prompt CSS area
idx = css.find('.ps-prompt-block')
# Find end of this CSS section
# Look for next major section comment
end = css.find('\n/* ──', idx+10)
if end < 0:
    end = css.find('\n\n/* ', idx+10)
print(f'Section: {idx} to {end}')
print(css[idx:end+20])
