import re

def fix():
    # Read the corrupted file
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        curr = f.read()
        
    # Read the good HEAD file
    with open('scratch/prompt-studio-HEAD.js', 'r', encoding='utf-8') as f:
        head = f.read()

    # In the HEAD file, extract everything from `    _buildPrompt(archetype) {` 
    # to the end of `_buildPrompt`, which is followed by `    _copyAll() {`
    
    match_head = re.search(r'(\n    _buildPrompt\(archetype\) \{.*?\n    _copyAll\(\) \{)', head, re.DOTALL)
    if not match_head:
        print("Could not find _buildPrompt in HEAD")
        return
        
    good_buildPrompt = match_head.group(1).replace('\n    _copyAll() {', '')
    
    # Also extract `_generateBatchMulti` from HEAD to see what I might have corrupted
    # Wait, in curr, I saw the corruption started around line 2090.
    # The diff block from the bad tool call:
    # -        }
    # -        this._saveHistory();
    # -        this._renderHistory();
    # -
    # -        Elaris.toast(`${prompts.length} batch prompt(s) generated ✦`, 'success');
    # -        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    # -    },
    # -
    # -    // â”€â”€ Build Single Prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # -    _buildPrompt(archetype) {
    # -        const piece = this.state.pieceDesc || 'jewelry piece';
    
    # I can just re-inject `_renderOutputList` ending, and the entire `_buildPrompt`!
    
    # In curr, find where `_renderOutputList` was truncated.
    # It was truncated after:
    #         for (const p of prompts) {
    #             this.state.history.unshift({ ...p, timestamp: new Date().toLocaleTimeString() });
    
    # Find this exact string in curr:
    truncation_point = curr.find("            this.state.history.unshift({ ...p, timestamp: new Date().toLocaleTimeString() });")
    if truncation_point == -1:
        print("Could not find truncation point")
        return
        
    # The part BEFORE the truncation point is good.
    # But wait, there is a `        const palette = this.palettes.find(p => p.id === this.state.palette)?.label.toLowerCase() || '';` after it which is the corrupted splicing.
    
    # Let's just find the exact string `_copyAll() {` in curr. The part AFTER `_copyAll() {` is good.
    copyall_point = curr.find("    _copyAll() {")
    
    # We want to reconstruct curr as:
    # curr[:truncation_point + length(truncation_line)]
    # + the missing end of _renderOutputList
    # + good_buildPrompt
    # + curr[copyall_point:]
    
    trunc_str = "            this.state.history.unshift({ ...p, timestamp: new Date().toLocaleTimeString() });\n        }\n"
    idx1 = curr.find(trunc_str) + len(trunc_str)
    
    idx2 = curr.find("    _copyAll() {")
    
    missing_end_of_render = """        this._saveHistory();
        this._renderHistory();

        Elaris.toast(`${prompts.length} batch prompt(s) generated ✦`, 'success');
        outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

"""
    
    new_curr = curr[:idx1] + missing_end_of_render + good_buildPrompt + curr[idx2:]
    
    # wait, there's another corruption I did before this one!
    # I corrupted lines 2214-2221 earlier in `curr`.
    # But wait, `good_buildPrompt` replaces the entire `_buildPrompt()` function, which contains lines 2214-2221 !
    # So replacing the whole `_buildPrompt` with `good_buildPrompt` fixes BOTH corruptions simultaneously!
    
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(new_curr)
    
    print("Fixed corrupted prompt-studio.js")

if __name__ == "__main__":
    fix()
