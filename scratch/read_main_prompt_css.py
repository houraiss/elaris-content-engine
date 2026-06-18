import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
css = open('css/styles.css', 'r', encoding='utf-8').read()

# Main block at 34201
print(css[34201:34800])
