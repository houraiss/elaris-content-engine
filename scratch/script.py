import re

with open('Update and Ideas By User/elaris-prompt-studio-expanded.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract from 'const ARCHETYPES' to '// ── Section Header'
match = re.search(r'(const ARCHETYPES.*?)(?=// ── Section Header)', content, re.DOTALL)
arrays_code = match.group(1) if match else ''

# Also extract the buildPrompt function
match_build = re.search(r'(function buildPrompt\(.*?\n})', content, re.DOTALL)
build_func = match_build.group(1) if match_build else ''

out = f'''
// ═══════════════════════════════════════════════════════════
// EXPANDED PROMPT STUDIO
// ═══════════════════════════════════════════════════════════

{arrays_code}

{build_func}

const ExpandedPromptStudio = {{
    state: {{
        archetype: 'editorial',
        jewelry: 'hoops',
        shots: 0,
        angle: 'three_q',
        scene: 'studio_dark',
        palette: 'warm_gold',
        lighting: 'soft',
        ratio: 'port_4_5',
        consistency: false,
        activeModel: 'lina',
        profiles: DEFAULT_PROFILES,
        notes: ''
    }},
    
    init(container) {{
        this.container = container;
        this._loadProfiles();
        this._render();
        this._bind();
    }},
    
    _loadProfiles() {{
        try {{
            const saved = localStorage.getItem('elaris_expanded_profiles');
            if (saved) this.state.profiles = JSON.parse(saved);
        }} catch(e) {{}}
    }},
    
    _saveProfiles() {{
        localStorage.setItem('elaris_expanded_profiles', JSON.stringify(this.state.profiles));
    }},
    
    _updatePrompt() {{
        const prompt = buildPrompt({{
            archetype: this.state.archetype,
            jewelry: this.state.jewelry,
            shots: this.state.shots,
            angle: this.state.angle,
            scene: this.state.scene,
            palette: this.state.palette,
            lighting: this.state.lighting,
            ratio: this.state.ratio,
            consistency: this.state.consistency,
            profile: this.state.profiles.find(p => p.id === this.state.activeModel),
            notes: this.state.notes
        }});
        const box = this.container.querySelector('#eps-prompt-box');
        if (box) box.textContent = prompt;
        
        // Update tags
        const R = RATIOS.find(x => x.id === this.state.ratio);
        const A = ARCHETYPES.find(x => x.id === this.state.archetype);
        
        const tags = this.container.querySelector('#eps-prompt-tags');
        if (tags) {{
            let html = '';
            if (this.state.shots > 0) html += `<span class="eps-pill" style="color:#a67c52;border-color:#a67c5240">${{this.state.shots===4?'4+':this.state.shots}} jewelry</span>`;
            if (this.state.consistency && this.state.shots > 0) html += `<span class="eps-pill" style="color:#7a9e87;border-color:#7a9e8740">+ model ref</span>`;
            if (R) html += `<span class="eps-pill" style="color:#4a3d30;border-color:#4a3d3040">${{R.label}}</span>`;
            if (A) html += `<span class="eps-pill" style="color:#4a3d30;border-color:#4a3d3040">${{A.label}}</span>`;
            tags.innerHTML = html;
        }}
    }},
    
    _render() {{
        const A = ARCHETYPES.find(x => x.id === this.state.archetype);
        const J = JEWELRY.find(x => x.id === this.state.jewelry);
        const AN = ANGLES.find(x => x.id === this.state.angle);
        const SC = SCENES.find(x => x.id === this.state.scene);
        const P = PALETTES.find(x => x.id === this.state.palette);
        const L = LIGHTING.find(x => x.id === this.state.lighting);
        const R = RATIOS.find(x => x.id === this.state.ratio);
        
        const SectionLabel = (title, active) => `<div class="eps-sec-label"><span>${{title}}</span>${{active ? `<span class="eps-sec-active">— ${{active}}</span>` : ''}}</div>`;

        let html = `<div class="eps-root">`;
        
        html += `<div class="eps-section">${{SectionLabel('01 — Archetype', A?.label)}}<div class="eps-arch-scroll">`;
        ARCHETYPES.forEach(a => {{
            const isSel = this.state.archetype === a.id;
            html += `
            <button class="eps-arch-card ${{isSel?'active':''}}" data-id="${{a.id}}" style="--c:${{a.color}}">
                <span class="eps-arch-icon">${{a.icon}}</span>
                <span class="eps-arch-label">${{a.label}}</span>
                <span class="eps-arch-mood">${{a.mood}}</span>
            </button>`;
        }});
        html += `</div></div>`;
        
        html += `<div class="eps-main-grid">`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${{SectionLabel('02 — Jewelry Type', J?.label)}}`;
        JEWELRY_GROUPS.forEach(g => {{
            html += `<div class="eps-group-label">${{g}}</div><div class="eps-tag-row">`;
            JEWELRY.filter(j => j.group === g).forEach(j => {{
                const isSel = this.state.jewelry === j.id;
                html += `<button class="eps-tag ${{isSel?'active':''}}" data-id="${{j.id}}">${{j.label}}</button>`;
            }});
            html += `</div>`;
        }});
        html += `</div>`;
        
        html += `<div class="eps-card">${{SectionLabel('03 — Jewelry Shots')}}`;
        html += `<div class="eps-count-row">`;
        [0,1,2,3,4].forEach(n => {{
            html += `<button class="eps-count-btn ${{this.state.shots===n?'active':''}}" data-n="${{n}}">${{n===0?'None':n===4?'4+':n}}</button>`;
        }});
        html += `</div>`;
        if (this.state.shots > 0) {{
            html += `<div class="eps-hint-box">📎 Attach ${{this.state.shots===4?'4+':this.state.shots}} jewelry shot${{this.state.shots!==1?'s':''}} ${{this.state.consistency ? '+ 1 model ref = '+(this.state.shots===4?'5+':this.state.shots+1)+' total' : ''}}</div>`;
        }}
        html += `</div>`;
        
        html += `<div class="eps-card">${{SectionLabel('04 — Camera Angle', AN?.label)}}<div class="eps-angle-grid">`;
        ANGLES.forEach(a => {{
            html += `<button class="eps-angle-btn ${{this.state.angle===a.id?'active':''}}" data-id="${{a.id}}"><span class="eps-angle-icon">${{a.icon}}</span><span class="eps-angle-name">${{a.label}}</span><span class="eps-angle-desc">${{a.desc}}</span></button>`;
        }});
        html += `</div></div></div>`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${{SectionLabel('05 — Scene', SC?.label)}}`;
        SCENE_GROUPS.forEach(g => {{
            html += `<div class="eps-group-label">${{g}}</div><div class="eps-scene-grid">`;
            SCENES.filter(x => x.group === g).forEach(sc => {{
                html += `<button class="eps-scene-btn ${{this.state.scene===sc.id?'active':''}}" data-id="${{sc.id}}"><span class="eps-scene-icon">${{sc.icon}}</span><span class="eps-scene-name">${{sc.label}}</span><span class="eps-scene-desc">${{sc.desc}}</span></button>`;
            }});
            html += `</div>`;
        }});
        html += `</div>`;
        
        html += `<div class="eps-card">${{SectionLabel('06 — Lighting', L?.label)}}<div style="display:flex;flex-direction:column;gap:6px">`;
        LIGHTING.forEach(l => {{
            html += `<button class="eps-lighting-btn ${{this.state.lighting===l.id?'active':''}}" data-id="${{l.id}}"><span class="eps-lighting-icon">${{l.icon}}</span><div style="text-align:left"><span class="eps-lighting-name">${{l.label}}</span><span class="eps-lighting-desc">${{l.desc}}</span></div></button>`;
        }});
        html += `</div></div></div>`;
        
        html += `<div class="eps-col">`;
        html += `<div class="eps-card">${{SectionLabel('07 — Color Palette', P?.label)}}<div style="display:flex;flex-direction:column;gap:6px">`;
        PALETTES.forEach(p => {{
            let swatches = p.swatches.map(c => `<span class="eps-swatch" style="background:${{c}}"></span>`).join('');
            html += `<button class="eps-palette-btn ${{this.state.palette===p.id?'active':''}}" data-id="${{p.id}}"><div class="eps-swatches">${{swatches}}</div><div style="text-align:left"><span class="eps-palette-name">${{p.label}}</span><span class="eps-palette-desc">${{p.desc}}</span></div></button>`;
        }});
        html += `</div></div>`;
        
        html += `<div class="eps-card">${{SectionLabel('08 — Aspect Ratio', R?.sub + ' ' + R?.label)}}<div class="eps-ratio-grid">`;
        RATIOS.forEach(r => {{
            html += `<button class="eps-ratio-btn ${{this.state.ratio===r.id?'active':''}}" data-id="${{r.id}}"><div class="eps-ratio-viz" style="width:${{r.css.width}}px;height:${{r.css.height}}px"></div><span class="eps-ratio-label">${{r.label}}</span><span class="eps-ratio-sub">${{r.sub}}</span><span class="eps-ratio-dims">${{r.dims}}</span></button>`;
        }});
        html += `</div></div>`;
        
        html += `<div class="eps-card">${{SectionLabel('09 — Notes')}}<textarea class="eps-textarea" id="eps-notes" rows="3" placeholder="Extra creative direction, mood words...">${{this.state.notes}}</textarea></div>`;
        html += `</div></div>`;
        
        html += `<div class="eps-section">`;
        html += `<div class="eps-consistency-bar"><div>${{SectionLabel('10 — Model Consistency')}}<span class="eps-consistency-hint">Lock a virtual model across all shots</span></div>
        <button class="eps-toggle ${{this.state.consistency?'active':''}}" id="eps-consistency-toggle"><span class="eps-toggle-knob"></span></button></div>`;
        
        if (this.state.consistency) {{
            html += `<div class="eps-profile-area">`;
            html += `<div class="eps-profile-header"><span>SELECT PROFILE</span><button id="eps-add-model-btn">+ New Model</button></div>`;
            
            html += `<div id="eps-new-model-form" style="display:none" class="eps-new-model-form">
                <input type="text" id="eps-new-name" placeholder="Model name" class="eps-input">
                <textarea id="eps-new-desc" rows="2" placeholder="Physical description..." class="eps-textarea"></textarea>
                <button id="eps-save-model-btn" class="eps-save-model-btn">Save Profile</button>
            </div>`;
            
            html += `<div class="eps-profile-grid">`;
            this.state.profiles.forEach(p => {{
                const isSel = this.state.activeModel === p.id;
                html += `
                <div class="eps-profile-card ${{isSel?'active':''}}" data-id="${{p.id}}" style="--c:${{p.color}}">
                    <div class="eps-profile-avatar" style="background:${{p.color}}15;border-color:${{p.color}}50">
                        ${{p.ref ? `<img src="${{p.ref}}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `<span style="color:${{p.color}}">${{p.name[0]}}</span>`}}
                        <label class="eps-profile-upload" title="Upload reference">📷<input type="file" class="eps-ref-upload" data-id="${{p.id}}" style="display:none" accept="image/*"></label>
                    </div>
                    <div style="flex:1">
                        <div class="eps-profile-name">${{p.name}}</div>
                        ${{p.ref ? `<div class="eps-profile-refbadge">✓ Reference</div>` : ''}}
                        <div class="eps-profile-desctext">${{p.descriptor.slice(0,80)}}...</div>
                    </div>
                    ${{isSel ? `<span class="eps-active-badge">Active</span>` : ''}}
                </div>`;
            }});
            html += `</div></div>`;
        }}
        html += `</div>`;
        
        html += `<div class="eps-section">`;
        html += `<div class="eps-output-header">${{SectionLabel('Generated Prompt')}}<div id="eps-prompt-tags" style="display:flex;gap:6px"></div></div>`;
        html += `<div class="eps-prompt-box" id="eps-prompt-box"></div>`;
        html += `<button class="eps-copy-btn" id="eps-copy-btn">Copy Prompt →</button>`;
        html += `</div></div>`;
        
        this.container.innerHTML = html;
        this._updatePrompt();
    }},
    
    _bind() {{
        this.container.addEventListener('click', e => {{
            const t = e.target.closest('button, .eps-profile-card');
            if (!t) return;
            
            if (t.classList.contains('eps-arch-card')) {{ this.state.archetype = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-tag')) {{ this.state.jewelry = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-count-btn')) {{ this.state.shots = parseInt(t.dataset.n); this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-angle-btn')) {{ this.state.angle = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-scene-btn')) {{ this.state.scene = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-lighting-btn')) {{ this.state.lighting = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-palette-btn')) {{ this.state.palette = t.dataset.id; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-ratio-btn')) {{ this.state.ratio = t.dataset.id; this._render(); this._bind(); return; }}
            
            if (t.id === 'eps-consistency-toggle') {{ this.state.consistency = !this.state.consistency; this._render(); this._bind(); return; }}
            if (t.classList.contains('eps-profile-card')) {{ this.state.activeModel = t.dataset.id; this._render(); this._bind(); return; }}
            
            if (t.id === 'eps-add-model-btn') {{
                const f = this.container.querySelector('#eps-new-model-form');
                f.style.display = f.style.display === 'none' ? 'flex' : 'none';
                t.textContent = f.style.display === 'none' ? '+ New Model' : 'Cancel';
            }}
            if (t.id === 'eps-save-model-btn') {{
                const n = this.container.querySelector('#eps-new-name').value.trim();
                const d = this.container.querySelector('#eps-new-desc').value.trim();
                if (n) {{
                    const id = n.toLowerCase().replace(/\s+/g,'-') + '-' + Date.now();
                    this.state.profiles.push({{ id, name:n, descriptor:d, color:'#c9a96e', ref:null }});
                    this.state.activeModel = id;
                    this._saveProfiles();
                    this._render();
                    this._bind();
                }}
            }}
            if (t.id === 'eps-copy-btn') {{
                navigator.clipboard.writeText(this.container.querySelector('#eps-prompt-box').textContent);
                Elaris.toast('✓ Prompt copied');
            }}
        }});
        
        this.container.addEventListener('change', e => {{
            if (e.target.classList.contains('eps-ref-upload')) {{
                const id = e.target.dataset.id;
                const f = e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = ev => {{
                    const p = this.state.profiles.find(x => x.id === id);
                    if (p) p.ref = ev.target.result;
                    this._saveProfiles();
                    this._render();
                    this._bind();
                }};
                r.readAsDataURL(f);
            }}
        }});
        
        const ta = this.container.querySelector('#eps-notes');
        if (ta) {{
            ta.addEventListener('input', e => {{
                this.state.notes = e.target.value;
                this._updatePrompt();
            }});
        }}
    }}
}};

// Hook into existing UI
window.render_promptstudio = function(container) {{
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title" data-i18n="ps_title">Prompt Studio</h1>
            <p class="page-subtitle" data-i18n="ps_subtitle">Generate editorial prompts - paste into Gemini, Midjourney, or any AI tool</p>
        </div>
        <div class="ps-tabs" style="display:flex;gap:10px;margin-bottom:20px;border-bottom:1px solid var(--border);padding-bottom:15px">
            <button class="btn btn-sm btn-secondary active" id="tab-expanded">Expanded Studio</button>
            <button class="btn btn-sm btn-secondary" id="tab-classic">Classic Generator</button>
        </div>
        <div id="ps-expanded-view"></div>
        <div id="ps-classic-view" style="display:none"></div>
    `;
    
    const expView = container.querySelector('#ps-expanded-view');
    const claView = container.querySelector('#ps-classic-view');
    
    ExpandedPromptStudio.init(expView);
    
    const oldContainer = document.createElement('div');
    PromptStudio.init(oldContainer);
    // Remove the page header from classic
    const ph = oldContainer.querySelector('.page-header');
    if (ph) ph.remove();
    claView.appendChild(oldContainer);
    
    container.querySelector('#tab-expanded').addEventListener('click', e => {{
        e.target.classList.add('active');
        container.querySelector('#tab-classic').classList.remove('active');
        expView.style.display = 'block';
        claView.style.display = 'none';
    }});
    container.querySelector('#tab-classic').addEventListener('click', e => {{
        e.target.classList.add('active');
        container.querySelector('#tab-expanded').classList.remove('active');
        claView.style.display = 'block';
        expView.style.display = 'none';
    }});
}};
'''

with open('scratch/gen_eps.js', 'w', encoding='utf-8') as f:
    f.write(out)
