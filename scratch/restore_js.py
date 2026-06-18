import json

def restore():
    with open('scratch/transcript_matches.jsonl', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    best_call = None
    max_len = 0
    
    for line in lines:
        try:
            data = json.loads(line)
            tool_calls = data.get('tool_calls', [])
            for call in tool_calls:
                name = call.get('name', '')
                if name.endswith('replace_file_content'):
                    args = call.get('arguments', call.get('args', {}))
                    
                    if isinstance(args, str):
                        args = json.loads(args)
                    
                    # Parse values if they are strings
                    parsed_args = {}
                    for k, v in args.items():
                        if isinstance(v, str):
                            try:
                                parsed_args[k] = json.loads(v)
                            except:
                                parsed_args[k] = v
                        else:
                            parsed_args[k] = v
                            
                    args = parsed_args
                        
                    if 'prompt-studio.js' in args.get('TargetFile', ''):
                        chunks = args.get('ReplacementChunks', [])
                        if not chunks and 'ReplacementContent' in args:
                            chunks = [args]
                        for chunk in chunks:
                            content = chunk.get('ReplacementContent', '')
                            if len(content) > max_len:
                                max_len = len(content)
                                best_call = args
        except Exception as e:
            pass
            
    if not best_call:
        print("No matching tool call found.")
        return
        
    print(f"Found best call with max replacement len: {max_len}")
    
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        current_js = f.read()
        
    chunks = best_call.get('ReplacementChunks', [])
    if not chunks:
        chunks = [best_call]
        
    for i, chunk in enumerate(chunks):
        target = chunk.get('TargetContent', '')
        replacement = chunk.get('ReplacementContent', '')
        
        if target in current_js:
            current_js = current_js.replace(target, replacement)
            print(f"Applied chunk {i}")
        else:
            print(f"Warning: Target content not found for chunk {i}. Target: {target[:30]}...")
            
    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(current_js)
        
    print(f"Restored JS from transcript.")

if __name__ == '__main__':
    restore()
