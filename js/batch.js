/**
 * batch.js — Batch Mode for Elaris Content Engine.
 *
 * Handles uploading multiple photos and processing them with a single template.
 */

const Batch = {
    container: null,
    photos: [],
    activeTemplate: 'dark-hero',
    currentFormat: 'post',
    engine: null,
    isProcessing: false,

    init(container) {
        this.container = container;
        this.photos = [];
        this._render();
        this._setupCanvas();
        this._setupEvents();
    },

    _render() {
        const templates = window.getTemplates ? window.getTemplates({ format: this.currentFormat }) : [];

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="bat_title">Batch Mode</h1>
                <p class="page-subtitle" data-i18n="bat_subtitle">Generate multiple posts at once</p>
            </div>

            <div class="composer-layout" style="grid-template-columns: 1fr 1fr; gap: 24px;">
                <!-- LEFT: Upload Zone -->
                <div class="composer-sidebar" style="width: 100%;">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Batch Photos</span>
                            <button class="btn btn-sm btn-secondary" id="batch-btn-upload">+ Add Photos</button>
                            <button class="btn btn-sm btn-secondary" id="batch-btn-clear" style="margin-left: 8px;">Clear All</button>
                        </div>
                        <div class="upload-zone" id="batch-upload-zone" style="min-height: 200px; margin-top: 12px;">
                            <div class="upload-zone-icon">📸</div>
                            <div class="upload-zone-text">
                                <strong>Drop multiple photos here</strong><br>
                                <span>or click to browse</span>
                            </div>
                        </div>
                        <div class="photo-library mt-3" id="batch-photo-list" style="max-height: 400px; overflow-y: auto;"></div>
                    </div>
                </div>

                <!-- RIGHT: Settings & Templates -->
                <div class="composer-settings" style="width: 100%;">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Select Template</span>
                        </div>
                        <div class="format-tabs mb-3" id="batch-format-tabs">
                            <button class="format-tab ${this.currentFormat === 'post' ? 'active' : ''}" data-format="post">Post 1:1</button>
                            <button class="format-tab ${this.currentFormat === 'portrait' ? 'active' : ''}" data-format="portrait">Portrait 4:5</button>
                            <button class="format-tab ${this.currentFormat === 'story' ? 'active' : ''}" data-format="story">Story 9:16</button>
                        </div>
                        <div class="template-grid" id="batch-template-grid" style="grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));">
                            ${templates.map(t => `
                                <div class="template-card ${t.id === this.activeTemplate ? 'active' : ''}"
                                     data-template="${t.id}" title="${t.name}">
                                    <canvas class="template-card-preview" data-preview="${t.id}"></canvas>
                                    <div class="template-card-name">${t.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="card mt-4">
                        <div class="card-header">
                            <span class="card-title">Global Overlays</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Global Headline (Optional)</label>
                            <input type="text" class="form-input" id="batch-input-headline" placeholder="Applied to all images if the template supports it">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Caption Generation</label>
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-top: 8px;">
                                <span class="text-sm">Auto-generate caption (.txt) for each image</span>
                                <label class="wm-toggle-label">
                                    <input type="checkbox" id="batch-captions-toggle" checked>
                                    <span class="wm-toggle-switch"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="card mt-4" style="background: transparent; border: none; padding: 0;">
                        <button class="btn btn-primary btn-lg" id="btn-generate-batch" style="width: 100%;">
                            ✦ Start Batch Export
                        </button>
                        <div id="batch-progress-container" style="display:none; margin-top: 16px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size: 14px;">
                                <span>Processing...</span>
                                <span id="batch-progress-text">0 / 0</span>
                            </div>
                            <div style="width: 100%; background: var(--surface); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div id="batch-progress-bar" style="width: 0%; height: 100%; background: var(--success); transition: width 0.3s;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hidden canvas for processing -->
            <div style="display:none;">
                <canvas id="batch-hidden-canvas"></canvas>
            </div>
            
            <input type="file" id="batch-file-input" accept="image/*" multiple style="display:none">
        `;
        if (window.I18n) setTimeout(() => window.I18n.applyLanguage(), 10);
    },

    _setupCanvas() {
        if (window.CanvasEngine) {
            this.engine = new window.CanvasEngine('batch-hidden-canvas');
            
            // Render template previews
            document.querySelectorAll('canvas[data-preview]').forEach(c => {
                const t = window.getTemplate ? window.getTemplate(c.dataset.preview) : null;
                if (t && window.renderTemplatePreview) {
                    window.renderTemplatePreview(t, c, 100);
                }
            });
        }
    },

    _setupEvents() {
        const fileInput = document.getElementById('batch-file-input');
        const uploadZone = document.getElementById('batch-upload-zone');

        // Upload Zone
        uploadZone.addEventListener('click', () => fileInput.click());
        document.getElementById('batch-btn-upload').addEventListener('click', () => fileInput.click());
        document.getElementById('batch-btn-clear').addEventListener('click', () => {
            this.photos = [];
            this._refreshPhotoList();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this._handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this._handleFiles(e.target.files);
            fileInput.value = '';
        });

        // Format tabs
        document.getElementById('batch-format-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.format-tab');
            if (!tab) return;
            this.currentFormat = tab.dataset.format;
            document.querySelectorAll('#batch-format-tabs .format-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (this.engine) this.engine.setFormat(this.currentFormat);
            this._refreshTemplateGrid();
        });

        // Template Grid
        document.getElementById('batch-template-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (!card) return;
            this.activeTemplate = card.dataset.template;
            document.querySelectorAll('#batch-template-grid .template-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });

        // Generate Button
        document.getElementById('btn-generate-batch').addEventListener('click', () => {
            this._generateBatch();
        });
    },

    _handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.photos.push({ img, name: file.name.replace(/\.[^/.]+$/, ""), src: e.target.result });
                    this._refreshPhotoList();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    _refreshPhotoList() {
        const list = document.getElementById('batch-photo-list');
        list.innerHTML = this.photos.map((p, i) => `
            <div class="photo-thumb" data-index="${i}" style="position:relative; display:inline-block; margin: 4px;">
                <img src="${p.src}" alt="${p.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <button class="remove-btn batch-remove-photo" data-remove="${i}" style="position:absolute; top:-4px; right:-4px;">×</button>
            </div>
        `).join('');

        list.querySelectorAll('.batch-remove-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.remove);
                this.photos.splice(idx, 1);
                this._refreshPhotoList();
            });
        });
        
        const btnGen = document.getElementById('btn-generate-batch');
        if (this.photos.length > 0) {
            btnGen.textContent = \`✦ Start Batch Export (\${this.photos.length} photos)\`;
            btnGen.disabled = false;
        } else {
            btnGen.textContent = '✦ Start Batch Export';
            btnGen.disabled = true;
        }
    },

    _refreshTemplateGrid() {
        const templates = window.getTemplates ? window.getTemplates({ format: this.currentFormat }) : [];
        const grid = document.getElementById('batch-template-grid');
        
        // Auto-select first template of new format if current is missing
        if (templates.length > 0 && !templates.find(t => t.id === this.activeTemplate)) {
            this.activeTemplate = templates[0].id;
        }

        grid.innerHTML = templates.map(t => `
            <div class="template-card ${t.id === this.activeTemplate ? 'active' : ''}"
                 data-template="${t.id}" title="${t.name}">
                <canvas class="template-card-preview" data-preview="${t.id}"></canvas>
                <div class="template-card-name">${t.name}</div>
            </div>
        `).join('');

        grid.querySelectorAll('canvas[data-preview]').forEach(c => {
            const t = window.getTemplate(c.dataset.preview);
            if (t && window.renderTemplatePreview) renderTemplatePreview(t, c, 100);
        });
    },

    async _generateBatch() {
        if (this.photos.length === 0 || this.isProcessing) return;
        
        const template = window.getTemplate ? window.getTemplate(this.activeTemplate) : null;
        if (!template || !this.engine) return;

        this.isProcessing = true;
        
        // Setup UI for processing
        const btn = document.getElementById('btn-generate-batch');
        const progContainer = document.getElementById('batch-progress-container');
        const progText = document.getElementById('batch-progress-text');
        const progBar = document.getElementById('batch-progress-bar');
        
        btn.disabled = true;
        progContainer.style.display = 'block';
        
        // Gather settings
        const headline = document.getElementById('batch-input-headline').value;
        const generateCaptions = document.getElementById('batch-captions-toggle').checked;
        
        // Set Logo if applicable (use existing logo from Composer if available)
        if (window.Composer && window.Composer.logoWhiteImg) {
            const useDarkLogo = template.darkLogo;
            const logoImg = useDarkLogo ? window.Composer.logoBlackImg : window.Composer.logoWhiteImg;
            if (logoImg && template.logo) {
                this.engine.setLogo(logoImg, template.logo);
            }
        }
        
        // Setup Overlays
        const overlays = (template.defaultText || []).map(t => {
            const overlay = { ...t };
            if (t.id === 'title') overlay.text = headline || t.text || '';
            return overlay;
        });

        // Loop through photos
        for (let i = 0; i < this.photos.length; i++) {
            const photo = this.photos[i];
            
            // Update progress
            progText.textContent = \`\${i + 1} / \${this.photos.length}\`;
            progBar.style.width = \`\${((i + 1) / this.photos.length) * 100}%\`;
            
            // Load photo into engine
            this.engine.setPhoto(photo.img, { scale: 1, fit: 'cover' });
            
            // Re-apply template and overlays for each photo to ensure fresh render
            this.engine.applyTemplate(template);
            this.engine.setTextOverlays(overlays);
            
            // Wait for canvas to draw
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Determine filename base
            const safeName = photo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
            const baseName = \`batch_\${dateStr}_\${safeName}\`;
            
            // Generate Caption if requested
            let captionText = null;
            if (generateCaptions && window.ElarisCaption) {
                const text = window.ElarisCaption.generate({ voice: 'luxury', category: 'general', productName: headline });
                const tags = window.ElarisCaption.generateHashtags({ category: 'general' });
                captionText = window.ElarisCaption.formatPost(text, tags);
            }
            
            // Export
            if (window.ElarisExport) {
                if (captionText) {
                    await window.ElarisExport.downloadPair(this.engine, captionText, baseName);
                } else {
                    await window.ElarisExport.downloadPNG(this.engine, \`\${baseName}.png\`);
                }
            }
            
            // Delay to prevent browser from blocking multiple downloads
            await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        // Cleanup UI
        this.isProcessing = false;
        btn.disabled = false;
        btn.textContent = \`✦ Start Batch Export (\${this.photos.length} photos)\`;
        
        if (window.Elaris && window.Elaris.toast) {
            window.Elaris.toast('Batch export complete! ✓', 'success');
        }
        
        // Wait a bit, then hide progress
        setTimeout(() => {
            progContainer.style.display = 'none';
            progBar.style.width = '0%';
        }, 3000);
    }
};

window.render_batch = function(container) {
    Batch.init(container);
};
