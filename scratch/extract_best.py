import json

def extract_best():
    with open('scratch/transcript_matches.jsonl', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    best_args = None
    max_len = 0
    
    for line in lines:
        data = json.loads(line)
        for tc in data.get('tool_calls', []):
            if tc.get('name') in ['default_api:multi_replace_file_content', 'default_api:replace_file_content', 'multi_replace_file_content', 'replace_file_content']:
                args = tc.get('arguments', tc.get('args', {}))
                
                if isinstance(args, str):
                    args = json.loads(args, strict=False)
                    
                parsed = {}
                for k, v in args.items():
                    if isinstance(v, str):
                        try:
                            parsed[k] = json.loads(v, strict=False)
                        except:
                            parsed[k] = v
                    else:
                        parsed[k] = v
                args = parsed
                
                if 'prompt-studio.js' in args.get('TargetFile', ''):
                    chunks = args.get('ReplacementChunks', [])
                    if not chunks and 'ReplacementContent' in args:
                        chunks = [args]
                    
                    if not isinstance(chunks, list):
                        continue
                        
                    total_len = sum(len(c.get('ReplacementContent', '')) for c in chunks if isinstance(c, dict))
                    if total_len > max_len:
                        max_len = total_len
                        best_args = args
                        
    if best_args:
        print(f"Found best args. Max len: {max_len}")
        with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
            curr = f.read()
            
        chunks = best_args.get('ReplacementChunks', [])
        if not chunks and 'ReplacementContent' in best_args:
            chunks = [best_args]
            
        for chunk in chunks:
            tc = chunk.get('TargetContent', '')
            rc = chunk.get('ReplacementContent', '')
            if tc in curr:
                curr = curr.replace(tc, rc)
                print("Applied chunk successfully.")
            else:
                print("Could not find TargetContent in current JS.")
                
        with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
            f.write(curr)
            
    else:
        print("No best args found.")

if __name__ == "__main__":
    extract_best()
