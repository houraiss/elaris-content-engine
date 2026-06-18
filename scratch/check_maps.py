import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
js = open('js/prompt-studio.js', 'r', encoding='utf-8').read()
for term in ['surfMap', 'surfaceMap', 'styleMap', 'stylingDesc', 'paletteMap', 'cameraMap', 'poseMap', 'poseDesc', 'skinTone', 'skinMap']:
    idx = js.find(term)
    print(term + ': ' + str(idx))
