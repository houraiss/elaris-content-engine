import re

def rewrite():
    with open('js/prompt-studio.js', 'r', encoding='utf-8') as f:
        js = f.read()

    start_idx = js.find('    // â”€â”€ Profiles Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n    _loadProfiles() {')
    if start_idx == -1:
        start_idx = js.find('    _loadProfiles() {')
        
    end_idx = js.find('    _autoDescribe() {')
    if end_idx != -1:
        # Step back to include the comment before _autoDescribe
        # Just find the previous newline, or go back a bit.
        # It's easier to just do:
        end_idx = js.rfind('\n', 0, end_idx) # finds the newline right before `    _autoDescribe`
        end_idx = js.rfind('\n', 0, end_idx) # finds the newline before the comment probably
        
    if start_idx == -1 or end_idx == -1:
        print("Could not find boundaries", start_idx, end_idx)
        return

    new_code = """    // ── Profiles Management ──────────────────────────────────────
    _loadProfiles() {
        try {
            const saved = localStorage.getItem('elaris_model_profiles');
            if (saved) {
                this.state.profiles = JSON.parse(saved);
                return;
            }
        } catch (e) { console.error('Failed to load profiles', e); }
        
        this.state.profiles = [
            {
                id: 'lina', name: 'Lina', gender: 'female',
                descriptor: 'Woman, 25 years old, olive Mediterranean skin tone, almond-shaped dark brown eyes, high cheekbones, sharp jawline, full lips, straight dark brown hair shoulder-length, slim graceful neck, elegant posture',
                referenceImage: null, color: '#c9a96e'
            },
            {
                id: 'sara', name: 'Sara', gender: 'female',
                descriptor: 'Woman, 28 years old, warm golden-beige skin tone, deep hazel eyes, soft round face, defined brows, wavy chestnut hair past shoulders, delicate features, natural beauty, relaxed confident expression',
                referenceImage: null, color: '#a67c52'
            },
            {
                id: 'amir', name: 'Amir', gender: 'male',
                descriptor: 'Man, 27 years old, olive skin tone, dark brown expressive eyes, strong angular jawline, short textured dark hair, well-groomed stubble, confident editorial gaze',
                referenceImage: null, color: '#526e8a'
            },
            {
                id: 'tariq', name: 'Tariq', gender: 'male',
                descriptor: 'Man, 32 years old, deep brown skin tone, sharp facial features, intense hazel eyes, clean-shaven, strong profile, elegant and composed',
                referenceImage: null, color: '#4a5d4e'
            }
        ];
        this._saveProfiles();
    },

    _saveProfiles() {
        try {
            localStorage.setItem('elaris_model_profiles', JSON.stringify(this.state.profiles));
        } catch (e) { console.error('Failed to save profiles', e); }
    },

    // ── UI Components Renderers ──────────────────────────────────
    _renderContextBar() {
        const cat = this.state.category || 'ring';
        const mat = this.materials.find(m => m.id === this.state.material)?.label || '';
        const mood = this.moods.find(m => m.id === this.state.mood)?.label || '';
        const light = this.lightings.find(l => l.id === this.state.lighting)?.label || '';
        
        return `
            <div class="ps-context-chips">
                <div class="ps-ctx-chip" data-target="product">💍 ${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                <div class="ps-ctx-chip" data-target="product">✨ ${mat}</div>
                <div class="ps-ctx-sep"></div>
                <div class="ps-ctx-chip" data-target="modifiers">🎨 ${mood}</div>
                <div class="ps-ctx-chip" data-target="modifiers">💡 ${light}</div>
                ${this.state.consistencyOn ? `<div class="ps-ctx-chip ctx-active" data-target="model">👩 Model Locked</div>` : ''}
            </div>
            <div class="ps-generate-bar">
                <span class="ps-arch-count-badge" id="ps-arch-count">${this.state.selectedArchetypes.length} selected</span>
                <button class="btn btn-primary btn-sm" id="ps-generate-top" style="padding: 4px 12px; font-size: 11px;">✦ Generate</button>
            </div>
        `;
    },

    _renderPanelInner(tab) {
        if (tab === 'product') {
            return `
                <div class="ps-panel-header">
                    <span class="ps-panel-title">Product Specs</span>
                    <button class="ps-panel-close">×</button>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Category</label>
                    <select class="form-select" id="ps-category">
                        ${this.categories.map(c => `<option value="${c}" ${c === this.state.category ? 'selected' : ''}>${c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ')}</option>`).join('')}
                    </select>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Material</label>
                    <select class="form-select" id="ps-material">
                        ${this.materials.map(m => `<option value="${m.id}" ${m.id === this.state.material ? 'selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Stones</label>
                    <select class="form-select" id="ps-stone">
                        ${this.stones.map(s => `<option value="${s.id}" ${s.id === this.state.stone ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Piece Description</label>
                    <textarea class="form-textarea" id="ps-desc" rows="3" placeholder="e.g. multi-band crossover ring...">${this.state.pieceDesc || ''}</textarea>
                    <button class="btn btn-sm btn-secondary" id="ps-auto-desc" style="width:100%;margin-top:8px">✦ Auto-describe</button>
                </div>
            `;
        }
        if (tab === 'model') {
            const isMale = this.state.gender === 'male';
            return `
                <div class="ps-panel-header">
                    <span class="ps-panel-title">Model Consistency</span>
                    <button class="ps-panel-close">×</button>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Jewelry Shots</label>
                    <div class="ps-chip-group" id="ps-jewelry-count">
                        ${[0, 1, 2, 3, 4].map(n => `<button class="ps-chip ${this.state.jewelryCount === n ? 'active' : ''}" data-val="${n}">${n === 0 ? 'None' : n === 4 ? '4+' : n}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section" style="padding-top:12px;border-top:1px solid var(--border)">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                        <label class="ps-panel-label" style="margin:0">Model Gender</label>
                        <div class="ps-chip-group" id="ps-gender-select" style="gap:4px">
                            <button class="ps-chip ${!isMale ? 'active' : ''}" data-val="female" style="padding:4px 8px;font-size:10px">Female</button>
                            <button class="ps-chip ${isMale ? 'active' : ''}" data-val="male" style="padding:4px 8px;font-size:10px">Male</button>
                        </div>
                    </div>
                </div>
                <div class="ps-panel-section" style="padding-top:12px;border-top:1px solid var(--border)">
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <div>
                            <label class="ps-panel-label" style="margin-bottom:2px">Lock Model</label>
                            <span class="text-sm text-muted" style="font-size:10px">Maintain identity</span>
                        </div>
                        <label class="wm-toggle-label">
                            <input type="checkbox" id="ps-consistency-toggle" ${this.state.consistencyOn ? 'checked' : ''}>
                            <span class="wm-toggle-switch"></span>
                        </label>
                    </div>
                </div>
                ${this.state.consistencyOn ? `
                <div class="ps-panel-section" style="margin-top:12px;padding-top:12px;border-top:1px dashed var(--border)">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                        <label class="ps-panel-label" style="margin:0">Profiles</label>
                        <button class="btn btn-sm btn-secondary" id="ps-new-profile" style="padding:2px 6px;font-size:10px">+ New</button>
                    </div>
                    <div id="ps-new-profile-form" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:12px">
                        <input type="text" id="ps-new-profile-name" placeholder="Name" style="width:100%;background:transparent;border:none;border-bottom:1px solid var(--border);color:var(--primary);margin-bottom:6px;padding:4px 0;font-size:11px;outline:none">
                        <textarea id="ps-new-profile-desc" rows="2" placeholder="Descriptor..." style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:4px;color:var(--text);padding:6px;font-size:10px;outline:none"></textarea>
                        <button class="btn btn-sm btn-primary" id="ps-save-profile" style="width:100%;margin-top:6px;font-size:10px;padding:4px">Save</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px" id="ps-profile-list">
                        ${this.state.profiles.filter(p => !p.gender || p.gender === this.state.gender).map(p => `
                            <div class="profile-card ${this.state.activeProfileId === p.id ? 'active' : ''}" data-id="${p.id}" style="border:1px solid ${this.state.activeProfileId === p.id ? p.color : 'var(--border)'};border-radius:6px;padding:8px;cursor:pointer;background:${this.state.activeProfileId === p.id ? p.color+'15' : 'transparent'};transition:all 0.2s">
                                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                                    <div style="width:24px;height:24px;border-radius:50%;background:${p.referenceImage ? 'transparent' : p.color+'30'};border:1px solid ${p.color};display:flex;align-items:center;justify-content:center;color:${p.color};position:relative;overflow:hidden;font-size:10px">
                                        ${p.referenceImage ? `<img src="${p.referenceImage}" style="width:100%;height:100%;object-fit:cover">` : p.name.charAt(0)}
                                    </div>
                                    <div style="flex:1">
                                        <div style="font-size:11px;font-weight:600;color:var(--text)">${p.name}</div>
                                    </div>
                                </div>
                                <div style="font-size:10px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${p.descriptor}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            `;
        }
        if (tab === 'modifiers') {
            return `
                <div class="ps-panel-header">
                    <span class="ps-panel-title">Environment</span>
                    <button class="ps-panel-close">×</button>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Mood</label>
                    <div class="ps-chip-group" id="ps-mood">
                        ${this.moods.map(m => `<button class="ps-chip ${m.id === this.state.mood ? 'active' : ''}" data-val="${m.id}">${m.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Lighting</label>
                    <div class="ps-chip-group" id="ps-lighting">
                        ${this.lightings.map(l => `<button class="ps-chip ${l.id === this.state.lighting ? 'active' : ''}" data-val="${l.id}">${l.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Format</label>
                    <div class="ps-chip-group" id="ps-format">
                        ${this.formats.map(f => `<button class="ps-chip ${f.id === this.state.format ? 'active' : ''}" data-val="${f.id}">${f.label}</button>`).join('')}
                    </div>
                </div>
            `;
        }
        if (tab === 'advanced') {
            return `
                <div class="ps-panel-header">
                    <span class="ps-panel-title">Advanced</span>
                    <button class="ps-panel-close">×</button>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Camera Angle</label>
                    <div class="ps-chip-group" id="ps-angle">
                        ${this.angles.map(a => `<button class="ps-chip ${a.id === this.state.angle ? 'active' : ''}" data-val="${a.id}">${a.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Surface / Backdrop</label>
                    <div class="ps-chip-group" id="ps-surface">
                        ${this.surfaces.map(s => `<button class="ps-chip ${s.id === this.state.surface ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Color Palette</label>
                    <div class="ps-chip-group" id="ps-palette">
                        ${this.palettes.map(p => `<button class="ps-chip ${p.id === this.state.palette ? 'active' : ''}" data-val="${p.id}">${p.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section">
                    <label class="ps-panel-label">Model Styling</label>
                    <div class="ps-chip-group" id="ps-styling">
                        ${this.stylings.map(s => `<button class="ps-chip ${s.id === this.state.styling ? 'active' : ''}" data-val="${s.id}">${s.label}</button>`).join('')}
                    </div>
                </div>
                <div class="ps-panel-section" style="padding-top:12px;border-top:1px solid var(--border)">
                    <div style="display:flex;align-items:center;justify-content:space-between">
                        <div>
                            <label class="ps-panel-label" style="margin-bottom:2px">Hallmark Injection</label>
                            <span class="text-sm text-muted" style="font-size:10px">Engrave 'ELARIS'</span>
                        </div>
                        <label class="wm-toggle-label">
                            <input type="checkbox" id="ps-hallmark-toggle" ${this.state.hallmarkEnabled ? 'checked' : ''}>
                            <span class="wm-toggle-switch"></span>
                        </label>
                    </div>
                </div>
            `;
        }
        if (tab === 'history') {
            return `
                <div class="ps-panel-header">
                    <span class="ps-panel-title">History</span>
                    <div style="display:flex;gap:4px">
                        <button class="btn btn-sm btn-secondary" id="ps-clear-history" style="padding:2px 6px;font-size:10px">Clear</button>
                        <button class="ps-panel-close">×</button>
                    </div>
                </div>
                <div id="ps-history" class="ps-history-list" style="max-height:80vh;overflow-y:auto;padding-right:4px">
                    <p class="text-sm text-muted" style="text-align:center;padding:20px">No prompts generated yet</p>
                </div>
            `;
        }
        return '';
    },

    // ── Render ───────────────────────────────────────────────────
    _render() {
        if (!this.state.gender) this.state.gender = 'female';
        const activeTab = this.state.activeTab || 'product';

        this.container.innerHTML = `
            <div class="page-header" style="display:none">
                <h1 class="page-title">Prompt Studio</h1>
            </div>

            <div class="ps-layout">
                <!-- Icon Rail -->
                <div class="ps-icon-rail" id="ps-icon-rail">
                    <button class="ps-rail-btn ${activeTab==='product'?'active':''}" data-tab="product" title="Product Specs"><span class="icon">💍</span></button>
                    <button class="ps-rail-btn ${activeTab==='model'?'active':''}" data-tab="model" title="Model & Consistency"><span class="icon">👩</span></button>
                    <button class="ps-rail-btn ${activeTab==='modifiers'?'active':''}" data-tab="modifiers" title="Modifiers & Environment"><span class="icon">🎨</span></button>
                    <button class="ps-rail-btn ${activeTab==='advanced'?'active':''}" data-tab="advanced" title="Advanced Controls"><span class="icon">⚙️</span></button>
                    <div style="flex:1"></div>
                    <button class="ps-rail-btn ${activeTab==='history'?'active':''}" data-tab="history" title="History"><span class="icon">📜</span></button>
                </div>

                <!-- Panel Overlay Background (mobile) -->
                <div class="ps-panel-overlay" id="ps-panel-overlay" style="${this.state.panelOpen ? 'display:block' : 'display:none'}"></div>

                <!-- Side Panel -->
                <div class="ps-panel ${this.state.panelOpen ? 'open' : ''}" id="ps-panel">
                    <div class="ps-panel-inner" id="ps-panel-inner">
                        ${this._renderPanelInner(activeTab)}
                    </div>
                </div>

                <!-- Main Area -->
                <div class="ps-main">
                    <div class="ps-context-bar" id="ps-context-bar">
                        ${this._renderContextBar()}
                    </div>
                    
                    <div class="ps-arch-area" id="ps-arch-area">
                        <div class="ps-arch-sort-bar">
                            <span class="ps-arch-sort-label">Select Archetypes</span>
                            <div class="ps-chip-group" id="ps-sort-mode" style="gap:4px">
                                <button class="ps-chip active" data-val="recommended" style="font-size:10px;padding:2px 8px">⭐ Recommended</button>
                                <button class="ps-chip" data-val="alpha" style="font-size:10px;padding:2px 8px">A-Z</button>
                            </div>
                        </div>
                        <div class="ps-archetype-grid" id="ps-archetypes"></div>
                    </div>

                    <!-- Output Area -->
                    <div class="ps-output-area" id="ps-output-area">
                        <div class="ps-output-header">
                            <span class="ps-output-title">Generated Prompts</span>
                            <button class="btn btn-sm btn-secondary" id="ps-copy-all">📋 Copy All</button>
                        </div>
                        <div id="ps-prompts-list"></div>
                    </div>
                </div>
            </div>

            <!-- Mobile Tab Bar -->
            <div class="ps-tab-bar">
                <div class="ps-tab-bar-inner">
                    <button class="ps-tab-btn ${activeTab==='product'?'active':''}" data-tab="product"><span class="icon">💍</span></button>
                    <button class="ps-tab-btn ${activeTab==='model'?'active':''}" data-tab="model"><span class="icon">👩</span></button>
                    <button class="ps-tab-btn ${activeTab==='modifiers'?'active':''}" data-tab="modifiers"><span class="icon">🎨</span></button>
                    <button class="ps-tab-btn ${activeTab==='advanced'?'active':''}" data-tab="advanced"><span class="icon">⚙️</span></button>
                    <button class="ps-tab-btn ${activeTab==='history'?'active':''}" data-tab="history"><span class="icon">📜</span></button>
                </div>
            </div>
        `;
        if (activeTab === 'history') this._renderHistory();
    },

    // ── Event Binding ────────────────────────────────────────────
    _bind() {
        const q = id => this.container.querySelector(id);
        const qa = id => this.container.querySelectorAll(id);

        // Tab Navigation
        const switchTab = (tab) => {
            this.state.activeTab = tab;
            this.state.panelOpen = true;
            this._render();
            this._renderArchetypeGrid();
            this._bind();
        };

        qa('.ps-rail-btn, .ps-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (this.state.activeTab === tab && this.state.panelOpen) {
                    this.state.panelOpen = false;
                    this._render();
                    this._renderArchetypeGrid();
                    this._bind();
                } else {
                    switchTab(tab);
                }
            });
        });

        // Close Panel
        qa('.ps-panel-close, .ps-panel-overlay').forEach(el => {
            el?.addEventListener('click', () => {
                this.state.panelOpen = false;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        });

        // Top context chips open panel
        qa('.ps-ctx-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.target;
                if (tab) switchTab(tab);
            });
        });

        // Inputs inside active panel
        const catSelect = q('#ps-category');
        if (catSelect) {
            catSelect.addEventListener('change', e => {
                this.state.category = e.target.value;
                this._renderArchetypeGrid();
                const ctxBar = q('#ps-context-bar');
                if (ctxBar) { ctxBar.innerHTML = this._renderContextBar(); this._bind(); }
            });
        }
        
        const matSelect = q('#ps-material');
        if (matSelect) matSelect.addEventListener('change', e => { 
            this.state.material = e.target.value; 
            const ctxBar = q('#ps-context-bar');
            if (ctxBar) { ctxBar.innerHTML = this._renderContextBar(); this._bind(); }
        });
        
        const stoneSelect = q('#ps-stone');
        if (stoneSelect) stoneSelect.addEventListener('change', e => { this.state.stone = e.target.value; });
        
        const descInput = q('#ps-desc');
        if (descInput) descInput.addEventListener('input', e => { this.state.pieceDesc = e.target.value; });
        
        const autoDescBtn = q('#ps-auto-desc');
        if (autoDescBtn) autoDescBtn.addEventListener('click', () => this._autoDescribe());

        // Gender selection
        const genderSelect = q('#ps-gender-select');
        if (genderSelect) {
            genderSelect.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                genderSelect.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.gender = chip.dataset.val;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }

        // Chip groups binding helper
        const bindChip = (id, stateKey) => {
            const group = q('#' + id);
            if (group) {
                group.addEventListener('click', e => {
                    const chip = e.target.closest('.ps-chip');
                    if (!chip) return;
                    group.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    this.state[stateKey] = chip.dataset.val;
                    if (stateKey === 'mood' || stateKey === 'lighting') {
                        const ctxBar = q('#ps-context-bar');
                        if (ctxBar) { ctxBar.innerHTML = this._renderContextBar(); this._bind(); }
                    }
                });
            }
        };

        bindChip('ps-mood', 'mood');
        bindChip('ps-lighting', 'lighting');
        bindChip('ps-format', 'format');
        bindChip('ps-angle', 'angle');
        bindChip('ps-surface', 'surface');
        bindChip('ps-palette', 'palette');
        bindChip('ps-styling', 'styling');

        // Toggle
        const hmToggle = q('#ps-hallmark-toggle');
        if (hmToggle) hmToggle.addEventListener('change', e => { this.state.hallmarkEnabled = e.target.checked; });

        // Model Consistency
        const jcGroup = q('#ps-jewelry-count');
        if (jcGroup) {
            jcGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                jcGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.state.jewelryCount = parseInt(chip.dataset.val);
            });
        }

        const consToggle = q('#ps-consistency-toggle');
        if (consToggle) {
            consToggle.addEventListener('change', e => {
                this.state.consistencyOn = e.target.checked;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }

        const newProfBtn = q('#ps-new-profile');
        if (newProfBtn) {
            newProfBtn.addEventListener('click', () => {
                const form = q('#ps-new-profile-form');
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
            });
        }

        const saveProfBtn = q('#ps-save-profile');
        if (saveProfBtn) {
            saveProfBtn.addEventListener('click', () => {
                const nameInput = q('#ps-new-profile-name');
                const descInput = q('#ps-new-profile-desc');
                const name = nameInput.value.trim();
                const desc = descInput.value.trim();
                if (!name) return;
                const id = name.toLowerCase().replace(/\\s+/g, '-') + '-' + Date.now();
                this.state.profiles.push({
                    id, name, descriptor: desc, referenceImage: null, color: '#c9a96e', gender: this.state.gender || 'female'
                });
                this.state.activeProfileId = id;
                this._saveProfiles();
                this._render();
                this._renderArchetypeGrid();
                this._bind();
                if(window.Elaris) Elaris.toast('Profile saved', 'success');
            });
        }

        const profileList = q('#ps-profile-list');
        if (profileList) {
            profileList.addEventListener('click', e => {
                const card = e.target.closest('.profile-card');
                if (!card) return;
                this.state.activeProfileId = card.dataset.id;
                this._render();
                this._renderArchetypeGrid();
                this._bind();
            });
        }

        // Generate and Arch Count
        const generateTop = q('#ps-generate-top');
        if (generateTop) generateTop.addEventListener('click', () => this._generateBatchMulti());
        
        const generateBtn = q('#ps-generate');
        if (generateBtn) generateBtn.addEventListener('click', () => this._generateBatchMulti());

        // Sort
        const sortGroup = q('#ps-sort-mode');
        if (sortGroup) {
            sortGroup.addEventListener('click', e => {
                const chip = e.target.closest('.ps-chip');
                if (!chip) return;
                sortGroup.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this._sortMode = chip.dataset.val;
                this._renderArchetypeGrid();
            });
        }

        // Archetype selection
        const archGrid = q('#ps-archetypes');
        if (archGrid) {
            archGrid.addEventListener('click', e => {
                const card = e.target.closest('.ps-arch-card');
                if (!card) return;
                const id = card.dataset.arch;
                const idx = this.state.selectedArchetypes.indexOf(id);
                if (idx >= 0) {
                    this.state.selectedArchetypes.splice(idx, 1);
                    card.classList.remove('active');
                } else {
                    this.state.selectedArchetypes.push(id);
                    card.classList.add('active');
                }
                const countEl = q('#ps-arch-count');
                if (countEl) countEl.textContent = `${this.state.selectedArchetypes.length} selected`;
            });
        }

        // History
        const clearBtn = q('#ps-clear-history');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm('Clear all prompt history?')) {
                this.state.history = [];
                this._saveHistory();
                this._renderHistory();
            }
        });

        // Output Copy All
        const copyAllBtn = q('#ps-copy-all');
        if (copyAllBtn) copyAllBtn.addEventListener('click', () => this._copyAll());
    }\n\n"""

    patched_js = js[:start_idx] + new_code + js[end_idx:]

    with open('js/prompt-studio.js', 'w', encoding='utf-8') as f:
        f.write(patched_js)
    
    print("Rewritten _render and _bind cleanly")

if __name__ == '__main__':
    rewrite()
