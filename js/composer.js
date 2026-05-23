/**
 * composer.js — Main Composer page for Elaris Content Engine.
 *
 * Handles photo upload, template selection, live preview, settings, and export.
 */

const Composer = {
    engine: null,
    photos: [],
    activePhotoIndex: -1,
    activeTemplate: 'dark-hero',
    currentFormat: 'post',
    logoImg: null,
    logoWhiteImg: null,
    logoBlackImg: null,

    // ── Initialize ───────────────────────────────────────────────
    init(container) {
        this.container = container;
        this._render();
        this._setupCanvas();
        this._setupEvents();
        this._loadDefaultLogo();
        this._applyTemplate(this.activeTemplate);
    },

    // ── Render HTML ──────────────────────────────────────────────
    _render() {
        const templates = getTemplates({ format: this.currentFormat });

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="comp_title">Composer</h1>
                <p class="page-subtitle" data-i18n="comp_subtitle">Upload photos, pick a template, create content</p>
            </div>

            <div class="composer-layout">
                <!-- LEFT: Upload & Photo Library -->
                <div class="composer-sidebar">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="comp_library">Photo Library</span>
                            <button class="btn btn-sm btn-secondary" id="btn-upload">+ Upload</button>
                        </div>
                        <div class="upload-zone" id="upload-zone">
                            <div class="upload-zone-icon">📸</div>
                            <div class="upload-zone-text">
                                <strong>Drop photos here</strong><br>
                                or click to browse
                            </div>
                        </div>
                        <div class="photo-library mt-3" id="photo-library"></div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="comp_templates">Templates</span>
                        </div>
                        <div class="template-grid" id="template-grid">
                            ${templates.map(t => `
                                <div class="template-card ${t.id === this.activeTemplate ? 'active' : ''}"
                                     data-template="${t.id}" title="${t.name} — ${t.description}">
                                    <canvas class="template-card-preview" data-preview="${t.id}"></canvas>
                                    <div class="template-card-name">${t.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- CENTER: Live Preview -->
                <div class="composer-preview">
                    <div class="format-tabs" id="format-tabs">
                        <button class="format-tab ${this.currentFormat === 'post' ? 'active' : ''}" data-format="post" data-i18n="comp_post_1_1">Post 1:1</button>
                        <button class="format-tab ${this.currentFormat === 'portrait' ? 'active' : ''}" data-format="portrait" data-i18n="comp_portrait_4_5">Portrait 4:5</button>
                        <button class="format-tab ${this.currentFormat === 'story' ? 'active' : ''}" data-format="story" data-i18n="comp_story_9_16">Story 9:16</button>
                    </div>
                    <div class="preview-wrapper">
                        <div class="preview-canvas-container" id="preview-container">
                            <canvas id="main-canvas"></canvas>
                        </div>
                    </div>
                    <div class="action-bar">
                        <button class="btn btn-primary btn-lg" id="btn-export" disabled data-i18n="comp_export">
                            ⬇ Export PNG
                        </button>
                        <button class="btn btn-secondary" id="btn-copy-caption" disabled data-i18n="comp_copy_cap">
                            📋 Copy Caption
                        </button>
                        <button class="btn btn-secondary" id="btn-download-pair" disabled data-i18n="comp_export_all">
                            📦 Export All
                        </button>
                    </div>
                </div>

                <!-- RIGHT: Settings -->
                <div class="composer-settings">
                    <!-- Photo Adjustments -->
                    <div class="card" id="photo-settings" style="display:none">
                        <div class="card-header">
                            <span class="card-title">Photo</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Scale</label>
                            <input type="range" class="range-slider" id="slider-scale" min="50" max="200" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Brightness</label>
                            <input type="range" class="range-slider" id="slider-brightness" min="50" max="150" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Contrast</label>
                            <input type="range" class="range-slider" id="slider-contrast" min="50" max="150" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Saturation</label>
                            <input type="range" class="range-slider" id="slider-saturation" min="0" max="200" value="100">
                        </div>
                    </div>

                    <!-- Text Overlays -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Text</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Headline</label>
                            <input type="text" class="form-input" id="input-headline" placeholder="Product name...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Subtitle</label>
                            <input type="text" class="form-input" id="input-subtitle" placeholder="925 Sterling Silver">
                        </div>
                    </div>

                    <!-- Logo -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Logo</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Position</label>
                            <select class="form-select" id="select-logo-pos">
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                                <option value="center">Center</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Size</label>
                            <input type="range" class="range-slider" id="slider-logo-size" min="3" max="25" value="8">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Opacity</label>
                            <input type="range" class="range-slider" id="slider-logo-opacity" min="0" max="100" value="60">
                        </div>
                    </div>

                    <!-- Background Override -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Background</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Color</label>
                            <div class="flex gap-2" id="bg-color-swatches">
                                <button class="btn-icon" data-bg="#171717" style="background:#171717" title="Elaris Black"></button>
                                <button class="btn-icon" data-bg="#EEEEEE" style="background:#EEEEEE" title="Elaris Light"></button>
                                <button class="btn-icon" data-bg="#EEE6D3" style="background:#EEE6D3" title="Warm Sand"></button>
                                <button class="btn-icon" data-bg="#36442D" style="background:#36442D" title="Atlas Cedar"></button>
                                <button class="btn-icon" data-bg="#35394D" style="background:#35394D" title="Night Slate"></button>
                                <input type="color" id="bg-color-custom" value="#171717" style="width:36px;height:36px;padding:0;border:1px solid var(--border);border-radius:var(--radius-md);cursor:pointer">
                            </div>
                        </div>
                    </div>

                    <!-- Caption -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Caption</span>
                            <button class="btn btn-sm btn-secondary" id="btn-generate-caption">✦ Generate</button>
                        </div>
                        <div class="form-group">
                            <div class="voice-selector" id="voice-selector">
                                <button class="voice-btn active" data-voice="luxury">Luxury</button>
                                <button class="voice-btn" data-voice="conversational">Casual</button>
                                <button class="voice-btn" data-voice="storytelling">Story</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Product Type</label>
                            <select class="form-select" id="select-product-type">
                                <option value="general">General</option>
                                <option value="ring">Ring</option>
                                <option value="necklace">Necklace</option>
                                <option value="bracelet">Bracelet</option>
                                <option value="earrings">Earrings</option>
                            </select>
                        </div>
                        <div class="caption-editor">
                            <textarea class="caption-textarea" id="caption-text" placeholder="Click 'Generate' to create a caption..."></textarea>
                            <span class="caption-char-count" id="caption-count">0</span>
                        </div>
                        <div class="mt-2">
                            <label class="form-label">Hashtags</label>
                            <div class="hashtag-block" id="hashtag-block"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (window.I18n) window.I18n.applyLanguage();
    },

    // ── Setup Canvas ─────────────────────────────────────────────
    _setupCanvas() {
        this.engine = new CanvasEngine('main-canvas');

        // Render template previews
        document.querySelectorAll('canvas[data-preview]').forEach(c => {
            const t = getTemplate(c.dataset.preview);
            if (t) renderTemplatePreview(t, c, 100);
        });
    },

    // ── Setup Events ─────────────────────────────────────────────
    _setupEvents() {
        const fileInput = document.getElementById('file-input');
        const uploadZone = document.getElementById('upload-zone');

        // Upload zone click
        uploadZone.addEventListener('click', () => fileInput.click());
        document.getElementById('btn-upload').addEventListener('click', () => fileInput.click());

        // Drag & drop
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

        // File input change
        fileInput.addEventListener('change', (e) => {
            this._handleFiles(e.target.files);
            fileInput.value = '';
        });

        // Format tabs
        document.getElementById('format-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.format-tab');
            if (!tab) return;
            this.currentFormat = tab.dataset.format;
            document.querySelectorAll('.format-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.engine.setFormat(this.currentFormat);
            this._refreshTemplateGrid();
        });

        // Template selection
        document.getElementById('template-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (!card) return;
            this._applyTemplate(card.dataset.template);
        });

        // Photo adjustments
        ['scale', 'brightness', 'contrast', 'saturation'].forEach(prop => {
            const slider = document.getElementById(`slider-${prop}`);
            if (slider) {
                slider.addEventListener('input', () => {
                    const val = parseFloat(slider.value);
                    this.engine.updatePhoto({ [prop]: prop === 'scale' ? val / 100 : val });
                });
            }
        });

        // Text overlays
        const updateText = () => this._updateTextOverlays();
        document.getElementById('input-headline').addEventListener('input', updateText);
        document.getElementById('input-subtitle').addEventListener('input', updateText);

        // Logo controls
        document.getElementById('select-logo-pos').addEventListener('change', (e) => {
            this.engine.updateLogo({ position: e.target.value });
        });
        document.getElementById('slider-logo-size').addEventListener('input', (e) => {
            this.engine.updateLogo({ scale: parseFloat(e.target.value) / 100 });
        });
        document.getElementById('slider-logo-opacity').addEventListener('input', (e) => {
            this.engine.updateLogo({ opacity: parseFloat(e.target.value) / 100 });
        });

        // Background swatches
        document.getElementById('bg-color-swatches').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-bg]');
            if (!btn) return;
            this.engine.setBackground({ type: 'solid', color: btn.dataset.bg });
        });
        document.getElementById('bg-color-custom').addEventListener('input', (e) => {
            this.engine.setBackground({ type: 'solid', color: e.target.value });
        });

        // Caption
        document.getElementById('btn-generate-caption').addEventListener('click', () => this._generateCaption());
        document.getElementById('caption-text').addEventListener('input', (e) => {
            document.getElementById('caption-count').textContent = e.target.value.length;
        });

        // Voice selector
        document.getElementById('voice-selector').addEventListener('click', (e) => {
            const btn = e.target.closest('.voice-btn');
            if (!btn) return;
            document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });

        // Export buttons
        document.getElementById('btn-export').addEventListener('click', () => this._exportPNG());
        document.getElementById('btn-copy-caption').addEventListener('click', () => this._copyCaption());
        document.getElementById('btn-download-pair').addEventListener('click', () => this._exportAll());
    },

    // ── Handle File Upload ───────────────────────────────────────
    _handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.photos.push({ img, name: file.name, src: e.target.result });
                    this._refreshPhotoLibrary();

                    // Auto-select first photo
                    if (this.photos.length === 1) {
                        this._selectPhoto(0);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    },

    // ── Photo Library ────────────────────────────────────────────
    _refreshPhotoLibrary() {
        const lib = document.getElementById('photo-library');
        lib.innerHTML = this.photos.map((p, i) => `
            <div class="photo-thumb ${i === this.activePhotoIndex ? 'active' : ''}" data-index="${i}">
                <img src="${p.src}" alt="${p.name}">
                <button class="remove-btn" data-remove="${i}">×</button>
            </div>
        `).join('');

        // Click events
        lib.querySelectorAll('.photo-thumb').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.remove-btn')) {
                    const idx = parseInt(e.target.dataset.remove);
                    this.photos.splice(idx, 1);
                    if (this.activePhotoIndex >= this.photos.length) {
                        this.activePhotoIndex = this.photos.length - 1;
                    }
                    if (this.activePhotoIndex >= 0) {
                        this._selectPhoto(this.activePhotoIndex);
                    }
                    this._refreshPhotoLibrary();
                    return;
                }
                this._selectPhoto(parseInt(el.dataset.index));
            });
        });
    },

    _selectPhoto(index) {
        if (index < 0 || index >= this.photos.length) return;
        this.activePhotoIndex = index;
        const photo = this.photos[index];

        this.engine.setPhoto(photo.img, { scale: 1, fit: 'cover' });

        // Show photo settings
        document.getElementById('photo-settings').style.display = '';
        // Reset sliders
        document.getElementById('slider-scale').value = 100;
        document.getElementById('slider-brightness').value = 100;
        document.getElementById('slider-contrast').value = 100;
        document.getElementById('slider-saturation').value = 100;

        // Enable exports
        document.getElementById('btn-export').disabled = false;
        document.getElementById('btn-copy-caption').disabled = false;
        document.getElementById('btn-download-pair').disabled = false;

        this._refreshPhotoLibrary();
        Elaris.toast('Photo loaded', 'info');
    },

    // ── Apply Template ───────────────────────────────────────────
    _applyTemplate(templateId) {
        const template = getTemplate(templateId);
        if (!template) return;

        this.activeTemplate = templateId;

        // Switch format if template requires it
        if (template.format !== this.currentFormat) {
            this.currentFormat = template.format;
            this.engine.setFormat(this.currentFormat);
            document.querySelectorAll('.format-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.format === this.currentFormat);
            });
        }

        this.engine.applyTemplate(template);

        // Update logo based on template
        const useDarkLogo = template.darkLogo;
        const logoImg = useDarkLogo ? this.logoBlackImg : this.logoWhiteImg;
        if (logoImg && template.logo) {
            this.engine.setLogo(logoImg, template.logo);
        }

        // Update text overlays
        this._updateTextOverlays();

        // Update UI
        document.querySelectorAll('.template-card').forEach(c => {
            c.classList.toggle('active', c.dataset.template === templateId);
        });

        // Update logo position select
        if (template.logo) {
            const posSelect = document.getElementById('select-logo-pos');
            if (posSelect) posSelect.value = template.logo.position || 'bottom-right';
        }
    },

    // ── Refresh Template Grid ────────────────────────────────────
    _refreshTemplateGrid() {
        const templates = getTemplates({ format: this.currentFormat });
        const grid = document.getElementById('template-grid');

        grid.innerHTML = templates.map(t => `
            <div class="template-card ${t.id === this.activeTemplate ? 'active' : ''}"
                 data-template="${t.id}" title="${t.name} — ${t.description}">
                <canvas class="template-card-preview" data-preview="${t.id}"></canvas>
                <div class="template-card-name">${t.name}</div>
            </div>
        `).join('');

        grid.querySelectorAll('canvas[data-preview]').forEach(c => {
            const t = getTemplate(c.dataset.preview);
            if (t) renderTemplatePreview(t, c, 100);
        });

        // Auto-select first template of new format
        if (templates.length > 0 && !templates.find(t => t.id === this.activeTemplate)) {
            this._applyTemplate(templates[0].id);
        }
    },

    // ── Update Text Overlays ─────────────────────────────────────
    _updateTextOverlays() {
        const template = getTemplate(this.activeTemplate);
        if (!template) return;

        const headline = document.getElementById('input-headline')?.value || '';
        const subtitle = document.getElementById('input-subtitle')?.value || '';

        const overlays = (template.defaultText || []).map(t => {
            const overlay = { ...t };
            if (t.id === 'title') overlay.text = headline || t.text || '';
            else if (t.id === 'subtitle') overlay.text = subtitle || t.text || '';
            return overlay;
        });

        this.engine.setTextOverlays(overlays);
    },

    // ── Load Default Logo ────────────────────────────────────────
    _loadDefaultLogo() {
        // Create SVG-based logos programmatically
        this._createSvgLogo('white').then(img => {
            this.logoWhiteImg = img;
            this.logoImg = img;
            const template = getTemplate(this.activeTemplate);
            if (template?.logo) {
                this.engine.setLogo(img, template.logo);
            }
        });
        this._createSvgLogo('black').then(img => {
            this.logoBlackImg = img;
        });
    },

    _createSvgLogo(color) {
        return new Promise(resolve => {
            const fill = color === 'white' ? '#F0ECE6' : '#171717';
            const accent = '#A67C52';
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
                    <text x="200" y="55" text-anchor="middle" font-family="Georgia, serif"
                          font-size="52" font-weight="700" letter-spacing="12" fill="${fill}">ELARIS</text>
                    <text x="200" y="85" text-anchor="middle" font-family="Arial, sans-serif"
                          font-size="12" font-weight="400" letter-spacing="6" fill="${accent}">JEWELRY • STORE</text>
                    <path d="M200 16 L205 26 L200 36 L195 26 Z" fill="${accent}" opacity="0.8"/>
                </svg>
            `;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.src = url;
        });
    },

    // ── Caption Generation ───────────────────────────────────────
    _generateCaption() {
        const voice = document.querySelector('.voice-btn.active')?.dataset.voice || 'luxury';
        const category = document.getElementById('select-product-type')?.value || 'general';
        const productName = document.getElementById('input-headline')?.value || '';

        const caption = ElarisCaption.generate({ voice, category, productName });
        const hashtags = ElarisCaption.generateHashtags({ category });

        document.getElementById('caption-text').value = caption;
        document.getElementById('caption-count').textContent = caption.length;

        // Render hashtags
        const block = document.getElementById('hashtag-block');
        block.innerHTML = hashtags.map(h => `<span class="hashtag-pill">${h}</span>`).join('');

        // Store for export
        this._currentCaption = caption;
        this._currentHashtags = hashtags;

        Elaris.toast('Caption generated ✦', 'success');
    },

    // ── Export Functions ──────────────────────────────────────────
    async _exportPNG() {
        const name = document.getElementById('input-headline')?.value || 'elaris';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        const filename = `elaris_${this.currentFormat}_${slug}.png`;

        const ok = await ElarisExport.downloadPNG(this.engine, filename);
        if (ok) Elaris.toast('PNG exported ✓', 'success');
    },

    async _copyCaption() {
        const text = document.getElementById('caption-text')?.value || '';
        const hashtags = this._currentHashtags || [];
        const full = ElarisCaption.formatPost(text, hashtags);

        const ok = await ElarisExport.copyToClipboard(full);
        if (ok) Elaris.toast('Caption + hashtags copied ✓', 'success');
    },

    async _exportAll() {
        const text = document.getElementById('caption-text')?.value || '';
        const hashtags = this._currentHashtags || [];
        const full = ElarisCaption.formatPost(text, hashtags);
        const name = document.getElementById('input-headline')?.value || 'elaris';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);

        await ElarisExport.downloadPair(this.engine, full, `elaris_${slug}`);
        Elaris.toast('Image + caption exported ✓', 'success');
    },
};

window.Composer = Composer;

// Page render function for router
window.render_composer = function(container) {
    Composer.init(container);
};
