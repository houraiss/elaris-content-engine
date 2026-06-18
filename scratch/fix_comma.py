import re

def fix():
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        js = f.read()

    js = js.replace("this._copyAll());\n    }\n\n", "this._copyAll());\n    },\n\n")
    
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(js)
    
    print("Fixed syntax error")

if __name__ == '__main__':
    fix()
