import re

def restore_methods():
    with open('scratch/prompt-studio-HEAD.js', 'r', encoding='utf-16') as f:
        head_js = f.read()
        
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        curr_js = f.read()

    # Extract init
    init_start = head_js.find('    init(container) {')
    init_end = head_js.find('    _renderArchetypeGrid() {', init_start)
    if init_start == -1 or init_end == -1:
        print("Missing init")
        return
    init_code = head_js[init_start:init_end]
    init_code = re.sub(r'    // [^\n]+\n\s*$', '', init_code)
    
    # Extract _renderArchetypeGrid
    grid_start = head_js.find('    _renderArchetypeGrid() {')
    grid_end = head_js.find('    _render() {', grid_start)
    if grid_start == -1 or grid_end == -1:
        print("Missing _renderArchetypeGrid")
        return
    grid_code = head_js[grid_start:grid_end]
    grid_code = re.sub(r'    // [^\n]+\n\s*$', '', grid_code)

    # Clean up mojibake
    init_code = init_code.replace('â”€', '─')
    grid_code = grid_code.replace('â”€', '─')
    
    # We will inject these right before `_render()`
    render_idx = curr_js.find('    // ── Render ───────────────────────────────────────────────────\n    _render() {')
    
    if render_idx == -1:
        print("Could not find _render in current JS")
        return
        
    injected_js = curr_js[:render_idx] + init_code + '\n' + grid_code + '\n' + curr_js[render_idx:]
    
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(injected_js)
        
    print("Methods restored.")

if __name__ == '__main__':
    restore_methods()
