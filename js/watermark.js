/**
 * watermark.js — Watermark Studio for Elaris Content Engine.
 *
 * Multi-layer brand protection:
 *   1. Corner Logo Badge — icon in corner
 *   2. Diagonal Text — repeated text across image
 *   3. Tiled Emblem — star icon grid
 *   4. Steganographic — invisible data in pixels
 *   5. Hallmark Injection — prompt engineering (in prompt-studio.js)
 */

const WatermarkStudio = {

    // ── Asset Paths ─────────────────────────────────────────────
    assets: {
        iconBlack: 'Elaris Jewelry Logo/Asset 1Elaris Logo.png',
        logoBlack: 'Elaris Jewelry Logo/Asset 2Elaris Logo.png',
        iconWhite: 'Elaris Jewelry Logo/Asset 3Elaris Logo.png',
        logoWhite: 'Elaris Jewelry Logo/Asset 4Elaris Logo.png',
    },

    // ── State ────────────────────────────────────────────────────
    state: {
        image: null,        // loaded Image object
        imageFile: null,    // original File
        canvas: null,
        ctx: null,

        // Layer toggles
        cornerLogo: true,
        diagonalText: true,
        tiledEmblem: false,
        steganographic: true,

        // Corner Logo settings
        cornerPosition: 'br',   // tl, tr, bl, br
        cornerSize: 60,
        cornerOpacity: 25,
        cornerVariant: 'white',  // 'white' or 'black'

        // Diagonal Text settings
        diagText: '@elaris.925',
        diagFontSize: 28,
        diagOpacity: 8,
        diagAngle: -30,
        diagSpacing: 200,

        // Tiled Emblem settings
        tileSize: 80,
        tileOpacity: 6,
        tileRotation: 15,
        tileVariant: 'white',

        // Stego settings
        stegoText: '© Elaris Jewelry Store @elaris.925 — All Rights Reserved',
    },

    // ── Preloaded images ─────────────────────────────────────────
    _loadedIcons: {},

    // ── Init ─────────────────────────────────────────────────────
    init(container) {
        this.container = container;
        this._render();
        this._bind();
        this._preloadAssets();
    },

    // ── Preload brand assets ─────────────────────────────────────
    _preloadAssets() {
        for (const [key, path] of Object.entries(this.assets)) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => { this._loadedIcons[key] = img; };
            img.src = path;
        }
    },

    // ── Render ───────────────────────────────────────────────────
    _render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="wm_title">Watermark Studio</h1>
                <p class="page-subtitle" data-i18n="wm_subtitle">Protect your images with multi-layer brand watermarking</p>
            </div>

            <div class="wm-layout">
                <!-- LEFT: Controls -->
                <div class="wm-left">
                    <!-- Upload -->
                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="wm_source">Image Source</span></div>
                        <div class="upload-zone" id="wm-upload-zone">
                            <div class="upload-zone-icon">🖼️</div>
                            <div class="upload-zone-text">
                                <strong data-i18n="wm_drop">Drop image here</strong> <span data-i18n="wm_browse">or click to browse</span>
                            </div>
                        </div>
                        <input type="file" id="wm-file-input" accept="image/*" style="display:none">
                    </div>

                    <!-- Layer 1: Corner Logo -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="wm_l1">1 · Corner Logo</span>
                            <label class="wm-toggle-label">
                                <input type="checkbox" id="wm-corner-toggle" ${this.state.cornerLogo ? 'checked' : ''}>
                                <span class="wm-toggle-switch"></span>
                            </label>
                        </div>
                        <div class="wm-layer-body" id="wm-corner-body">
                            <div class="form-group">
                                <label class="form-label" data-i18n="wm_pos">Position</label>
                                <div class="ps-chip-group" id="wm-corner-pos">
                                    <button class="ps-chip ${this.state.cornerPosition === 'tl' ? 'active' : ''}" data-val="tl" data-i18n="wm_tl">↖ Top Left</button>
                                    <button class="ps-chip ${this.state.cornerPosition === 'tr' ? 'active' : ''}" data-val="tr" data-i18n="wm_tr">↗ Top Right</button>
                                    <button class="ps-chip ${this.state.cornerPosition === 'bl' ? 'active' : ''}" data-val="bl" data-i18n="wm_bl">↙ Bottom Left</button>
                                    <button class="ps-chip ${this.state.cornerPosition === 'br' ? 'active' : ''}" data-val="br" data-i18n="wm_br">↘ Bottom Right</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" data-i18n="wm_var">Variant</label>
                                <div class="ps-chip-group" id="wm-corner-variant">
                                    <button class="ps-chip ${this.state.cornerVariant === 'white' ? 'active' : ''}" data-val="white" data-i18n="wm_white_dark">White (dark images)</button>
                                    <button class="ps-chip ${this.state.cornerVariant === 'black' ? 'active' : ''}" data-val="black" data-i18n="wm_black_light">Black (light images)</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_size">Size:</span> <span id="wm-corner-size-val">${this.state.cornerSize}px</span></label>
                                <input type="range" class="range-slider" id="wm-corner-size" min="30" max="150" value="${this.state.cornerSize}">
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_opacity">Opacity:</span> <span id="wm-corner-opacity-val">${this.state.cornerOpacity}%</span></label>
                                <input type="range" class="range-slider" id="wm-corner-opacity" min="5" max="100" value="${this.state.cornerOpacity}">
                            </div>
                        </div>
                    </div>

                    <!-- Layer 2: Diagonal Text -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="wm_l2">2 · Diagonal Text</span>
                            <label class="wm-toggle-label">
                                <input type="checkbox" id="wm-diag-toggle" ${this.state.diagonalText ? 'checked' : ''}>
                                <span class="wm-toggle-switch"></span>
                            </label>
                        </div>
                        <div class="wm-layer-body" id="wm-diag-body">
                            <div class="form-group">
                                <label class="form-label" data-i18n="wm_text">Text</label>
                                <input type="text" class="form-input" id="wm-diag-text" value="${this.state.diagText}">
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_font_size">Font Size:</span> <span id="wm-diag-size-val">${this.state.diagFontSize}px</span></label>
                                <input type="range" class="range-slider" id="wm-diag-size" min="12" max="72" value="${this.state.diagFontSize}">
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_opacity">Opacity:</span> <span id="wm-diag-opacity-val">${this.state.diagOpacity}%</span></label>
                                <input type="range" class="range-slider" id="wm-diag-opacity" min="2" max="40" value="${this.state.diagOpacity}">
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_spacing">Spacing:</span> <span id="wm-diag-spacing-val">${this.state.diagSpacing}px</span></label>
                                <input type="range" class="range-slider" id="wm-diag-spacing" min="80" max="400" value="${this.state.diagSpacing}">
                            </div>
                        </div>
                    </div>

                    <!-- Layer 3: Tiled Emblem -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="wm_l3">3 · Tiled Emblem</span>
                            <label class="wm-toggle-label">
                                <input type="checkbox" id="wm-tile-toggle" ${this.state.tiledEmblem ? 'checked' : ''}>
                                <span class="wm-toggle-switch"></span>
                            </label>
                        </div>
                        <div class="wm-layer-body" id="wm-tile-body">
                            <div class="form-group">
                                <label class="form-label" data-i18n="wm_var">Variant</label>
                                <div class="ps-chip-group" id="wm-tile-variant">
                                    <button class="ps-chip ${this.state.tileVariant === 'white' ? 'active' : ''}" data-val="white" data-i18n="wm_white">White</button>
                                    <button class="ps-chip ${this.state.tileVariant === 'black' ? 'active' : ''}" data-val="black" data-i18n="wm_black">Black</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_size">Tile Size:</span> <span id="wm-tile-size-val">${this.state.tileSize}px</span></label>
                                <input type="range" class="range-slider" id="wm-tile-size" min="30" max="200" value="${this.state.tileSize}">
                            </div>
                            <div class="form-group">
                                <label class="form-label"><span data-i18n="wm_opacity">Opacity:</span> <span id="wm-tile-opacity-val">${this.state.tileOpacity}%</span></label>
                                <input type="range" class="range-slider" id="wm-tile-opacity" min="2" max="30" value="${this.state.tileOpacity}">
                            </div>
                        </div>
                    </div>

                    <!-- Layer 4: Steganographic -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title" data-i18n="wm_l4">4 · Invisible Data</span>
                            <label class="wm-toggle-label">
                                <input type="checkbox" id="wm-stego-toggle" ${this.state.steganographic ? 'checked' : ''}>
                                <span class="wm-toggle-switch"></span>
                            </label>
                        </div>
                        <div class="wm-layer-body" id="wm-stego-body">
                            <div class="form-group">
                                <label class="form-label" data-i18n="wm_hidden_msg">Hidden Message</label>
                                <textarea class="form-textarea" id="wm-stego-text" rows="2">${this.state.stegoText}</textarea>
                            </div>
                            <p class="text-sm text-muted" style="line-height:1.5" data-i18n="wm_stego_desc">
                                Embeds invisible data into pixel structure. Won't survive screenshots, but proves ownership on original files.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- CENTER: Preview -->
                <div class="wm-center">
                    <div class="card" style="padding:0;overflow:hidden">
                        <div class="card-header" style="padding:14px 20px;margin-bottom:0">
                            <span class="card-title" data-i18n="wm_preview">Live Preview</span>
                            <span class="text-sm text-muted" id="wm-dimensions"></span>
                        </div>
                        <div class="wm-preview-area" id="wm-preview-area">
                            <canvas id="wm-canvas" style="display:none"></canvas>
                            <div class="wm-empty-state" id="wm-empty">
                                <div style="font-size:48px;opacity:0.3;margin-bottom:12px">🛡️</div>
                                <h3 data-i18n="wm_empty_title">Upload an Image to Begin</h3>
                                <p class="text-sm text-muted" data-i18n="wm_empty_desc">Drop an image on the left panel or click to browse</p>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex;gap:10px;margin-top:12px">
                        <button class="btn btn-primary btn-lg" id="wm-export" style="flex:1" disabled data-i18n="wm_export_btn">
                            🛡️ Export Protected Image
                        </button>
                    </div>

                    <!-- Verify Tool -->
                    <div class="card" style="margin-top:16px">
                        <div class="card-header">
                            <span class="card-title" data-i18n="wm_verify_title">🔍 Verify Ownership</span>
                        </div>
                        <p class="text-sm text-muted" style="margin-bottom:12px;line-height:1.5" data-i18n="wm_verify_desc">
                            Upload a suspected stolen image to check for hidden steganographic data.
                        </p>
                        <div style="display:flex;gap:10px">
                            <button class="btn btn-secondary" id="wm-verify-btn" style="flex:1" data-i18n="wm_verify_btn">Upload & Verify</button>
                            <input type="file" id="wm-verify-input" accept="image/*" style="display:none">
                        </div>
                        <div id="wm-verify-result" style="margin-top:12px;display:none"></div>
                    </div>
                </div>

                <!-- RIGHT: Hallmark Tips -->
                <div class="wm-right">
                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="wm_l5">5 · Hallmark Injection</span></div>
                        <p class="text-sm" style="color:var(--text-secondary);line-height:1.6;margin-bottom:12px" data-i18n="wm_hallmark_desc">
                            When enabled in Prompt Studio's <strong>Advanced Controls</strong>, prompts will include hallmark instructions — the AI will attempt
                            to render "ELARIS" engravings directly into the jewelry.
                        </p>
                        <div style="padding:10px;border-radius:var(--radius-md);background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);margin-bottom:12px">
                            <div style="font-size:11px;color:#fbbf24;font-weight:600;margin-bottom:4px">⚠️ AI Limitation</div>
                            <p class="text-sm text-muted" style="line-height:1.5">
                                AI generators can't reproduce exact brand typography. The engraving will look generic. For pixel-perfect branding, use the <strong>Corner Logo</strong> or <strong>Tiled Emblem</strong> layers above instead.
                            </p>
                        </div>
                        <div class="wm-hallmark-examples">
                            <div class="wm-hallmark-item">
                                <span class="wm-hallmark-icon">💍</span>
                                <div>
                                    <div style="font-weight:600;font-size:12px">Rings</div>
                                    <div class="text-sm text-muted">"ELARIS" engraved on inner band + 925 hallmark stamp</div>
                                </div>
                            </div>
                            <div class="wm-hallmark-item">
                                <span class="wm-hallmark-icon">📿</span>
                                <div>
                                    <div style="font-weight:600;font-size:12px">Necklaces</div>
                                    <div class="text-sm text-muted">Star emblem on clasp + "ELARIS" tag on chain end</div>
                                </div>
                            </div>
                            <div class="wm-hallmark-item">
                                <span class="wm-hallmark-icon">✨</span>
                                <div>
                                    <div style="font-weight:600;font-size:12px">Earrings</div>
                                    <div class="text-sm text-muted">"ELARIS" micro-stamp on post back</div>
                                </div>
                            </div>
                            <div class="wm-hallmark-item">
                                <span class="wm-hallmark-icon">⌚</span>
                                <div>
                                    <div style="font-weight:600;font-size:12px">Bracelets</div>
                                    <div class="text-sm text-muted">Star emblem on inner clasp plate</div>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-accent" style="margin-top:12px;font-weight:600">
                            🏷️ Toggle in Prompt Studio → Advanced Controls
                        </p>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title" data-i18n="wm_guide_title">Protection Guide</span></div>
                        <div class="wm-guide">
                            <div class="wm-guide-row">
                                <span class="wm-guide-level" style="color:#4ade80">● Light</span>
                                <span class="text-sm">Corner Logo alone</span>
                            </div>
                            <div class="wm-guide-row">
                                <span class="wm-guide-level" style="color:#fbbf24">● Medium</span>
                                <span class="text-sm">Corner + Hallmark injection</span>
                            </div>
                            <div class="wm-guide-row">
                                <span class="wm-guide-level" style="color:#f97316">● Strong</span>
                                <span class="text-sm">Diagonal text + Tiled emblem</span>
                            </div>
                            <div class="wm-guide-row">
                                <span class="wm-guide-level" style="color:#ef4444">● Maximum</span>
                                <span class="text-sm">All layers combined</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ── Event Binding ────────────────────────────────────────────
    _bind() {
        const q = id => this.container.querySelector(id);
        const qAll = sel => this.container.querySelectorAll(sel);

        // Upload
        const uploadZone = q('#wm-upload-zone');
        const fileInput = q('#wm-file-input');
        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', e => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) this._loadImage(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', e => {
            if (e.target.files.length) this._loadImage(e.target.files[0]);
        });

        // Layer toggles
        q('#wm-corner-toggle').addEventListener('change', e => { this.state.cornerLogo = e.target.checked; this._updatePreview(); });
        q('#wm-diag-toggle').addEventListener('change', e => { this.state.diagonalText = e.target.checked; this._updatePreview(); });
        q('#wm-tile-toggle').addEventListener('change', e => { this.state.tiledEmblem = e.target.checked; this._updatePreview(); });
        q('#wm-stego-toggle').addEventListener('change', e => { this.state.steganographic = e.target.checked; });

        // Corner Logo controls
        this._bindChipGroup('wm-corner-pos', (val) => { this.state.cornerPosition = val; this._updatePreview(); });
        this._bindChipGroup('wm-corner-variant', (val) => { this.state.cornerVariant = val; this._updatePreview(); });
        this._bindSlider('wm-corner-size', 'wm-corner-size-val', 'px', (val) => { this.state.cornerSize = val; this._updatePreview(); });
        this._bindSlider('wm-corner-opacity', 'wm-corner-opacity-val', '%', (val) => { this.state.cornerOpacity = val; this._updatePreview(); });

        // Diagonal Text controls
        q('#wm-diag-text').addEventListener('input', e => { this.state.diagText = e.target.value; this._updatePreview(); });
        this._bindSlider('wm-diag-size', 'wm-diag-size-val', 'px', (val) => { this.state.diagFontSize = val; this._updatePreview(); });
        this._bindSlider('wm-diag-opacity', 'wm-diag-opacity-val', '%', (val) => { this.state.diagOpacity = val; this._updatePreview(); });
        this._bindSlider('wm-diag-spacing', 'wm-diag-spacing-val', 'px', (val) => { this.state.diagSpacing = val; this._updatePreview(); });

        // Tiled Emblem controls
        this._bindChipGroup('wm-tile-variant', (val) => { this.state.tileVariant = val; this._updatePreview(); });
        this._bindSlider('wm-tile-size', 'wm-tile-size-val', 'px', (val) => { this.state.tileSize = val; this._updatePreview(); });
        this._bindSlider('wm-tile-opacity', 'wm-tile-opacity-val', '%', (val) => { this.state.tileOpacity = val; this._updatePreview(); });

        // Stego text
        q('#wm-stego-text').addEventListener('input', e => { this.state.stegoText = e.target.value; });

        // Export
        q('#wm-export').addEventListener('click', () => this._export());

        // Verify
        const verifyInput = q('#wm-verify-input');
        q('#wm-verify-btn').addEventListener('click', () => verifyInput.click());
        verifyInput.addEventListener('change', e => {
            if (e.target.files.length) this._verifyImage(e.target.files[0]);
        });
    },

    _bindChipGroup(groupId, callback) {
        const group = this.container.querySelector(`#${groupId}`);
        if (!group) return;
        group.addEventListener('click', e => {
            const chip = e.target.closest('.ps-chip');
            if (!chip) return;
            group.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            callback(chip.dataset.val);
        });
    },

    _bindSlider(sliderId, labelId, unit, callback) {
        const slider = this.container.querySelector(`#${sliderId}`);
        const label = this.container.querySelector(`#${labelId}`);
        if (!slider) return;
        slider.addEventListener('input', e => {
            const val = parseInt(e.target.value);
            if (label) label.textContent = `${val}${unit}`;
            callback(val);
        });
    },

    // ── Load Image ───────────────────────────────────────────────
    _loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.state.image = img;
                this.state.imageFile = file;

                const canvas = this.container.querySelector('#wm-canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.display = 'block';
                this.state.canvas = canvas;
                this.state.ctx = canvas.getContext('2d');

                this.container.querySelector('#wm-empty').style.display = 'none';
                this.container.querySelector('#wm-export').disabled = false;
                this.container.querySelector('#wm-dimensions').textContent = `${img.width} × ${img.height}`;

                this._updatePreview();
                Elaris.toast('Image loaded ✓', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // ── Update Preview ───────────────────────────────────────────
    _updatePreview() {
        if (!this.state.image) return;
        const { ctx, canvas, image } = this.state;
        const w = canvas.width;
        const h = canvas.height;

        // Draw base image
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(image, 0, 0, w, h);

        // Layer 1: Corner Logo
        if (this.state.cornerLogo) this._drawCornerLogo(ctx, w, h);

        // Layer 2: Diagonal Text
        if (this.state.diagonalText) this._drawDiagonalText(ctx, w, h);

        // Layer 3: Tiled Emblem
        if (this.state.tiledEmblem) this._drawTiledEmblem(ctx, w, h);
    },

    // ── Layer 1: Corner Logo ─────────────────────────────────────
    _drawCornerLogo(ctx, w, h) {
        const key = this.state.cornerVariant === 'white' ? 'iconWhite' : 'iconBlack';
        const icon = this._loadedIcons[key];
        if (!icon) return;

        const size = this.state.cornerSize;
        const margin = Math.round(size * 0.3);
        const alpha = this.state.cornerOpacity / 100;

        let x, y;
        switch (this.state.cornerPosition) {
            case 'tl': x = margin; y = margin; break;
            case 'tr': x = w - size - margin; y = margin; break;
            case 'bl': x = margin; y = h - size - margin; break;
            case 'br': default: x = w - size - margin; y = h - size - margin; break;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(icon, x, y, size, size);
        ctx.restore();
    },

    // ── Layer 2: Diagonal Text ───────────────────────────────────
    _drawDiagonalText(ctx, w, h) {
        const text = this.state.diagText || '@elaris.925';
        const fontSize = this.state.diagFontSize;
        const alpha = this.state.diagOpacity / 100;
        const angle = (this.state.diagAngle * Math.PI) / 180;
        const spacing = this.state.diagSpacing;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `600 ${fontSize}px 'Montserrat', 'Inter', sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Rotate and tile
        ctx.translate(w / 2, h / 2);
        ctx.rotate(angle);

        const diagonal = Math.sqrt(w * w + h * h);
        const halfDiag = diagonal / 2;
        const textWidth = ctx.measureText(text + '    ').width;

        for (let y = -halfDiag; y < halfDiag; y += spacing) {
            for (let x = -halfDiag; x < halfDiag; x += textWidth) {
                ctx.fillText(text, x, y);
            }
        }

        ctx.restore();
    },

    // ── Layer 3: Tiled Emblem ────────────────────────────────────
    _drawTiledEmblem(ctx, w, h) {
        const key = this.state.tileVariant === 'white' ? 'iconWhite' : 'iconBlack';
        const icon = this._loadedIcons[key];
        if (!icon) return;

        const size = this.state.tileSize;
        const alpha = this.state.tileOpacity / 100;
        const rotation = (this.state.tileRotation * Math.PI) / 180;
        const spacing = size * 2;

        ctx.save();
        ctx.globalAlpha = alpha;

        for (let y = -size; y < h + size; y += spacing) {
            for (let x = -size; x < w + size; x += spacing) {
                ctx.save();
                ctx.translate(x + size / 2, y + size / 2);
                ctx.rotate(rotation);
                ctx.drawImage(icon, -size / 2, -size / 2, size, size);
                ctx.restore();
            }
        }

        ctx.restore();
    },

    // ── Layer 4: Steganographic Encoding ─────────────────────────
    _encodeSteganographic(canvas, text) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert text to binary with a delimiter
        const message = 'ELARIS_SIG:' + text + '\0';
        let binary = '';
        for (let i = 0; i < message.length; i++) {
            binary += message.charCodeAt(i).toString(2).padStart(8, '0');
        }

        // Check capacity
        const maxBits = Math.floor((data.length / 4) * 3); // RGB channels only, skip alpha
        if (binary.length > maxBits) {
            Elaris.toast('Message too long for this image', 'error');
            return false;
        }

        // Encode into LSB of RGB channels
        let bitIndex = 0;
        for (let i = 0; i < data.length && bitIndex < binary.length; i++) {
            if (i % 4 === 3) continue; // Skip alpha channel
            data[i] = (data[i] & 0xFE) | parseInt(binary[bitIndex], 2);
            bitIndex++;
        }

        ctx.putImageData(imageData, 0, 0);
        return true;
    },

    // ── Steganographic Decoding ──────────────────────────────────
    _decodeSteganographic(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let binary = '';
        for (let i = 0; i < data.length; i++) {
            if (i % 4 === 3) continue; // Skip alpha
            binary += (data[i] & 1).toString();
        }

        // Convert binary to text
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substring(i, i + 8);
            if (byte.length < 8) break;
            const charCode = parseInt(byte, 2);
            if (charCode === 0) break; // Null terminator
            text += String.fromCharCode(charCode);
        }

        // Check for signature
        if (text.startsWith('ELARIS_SIG:')) {
            return { found: true, message: text.replace('ELARIS_SIG:', '') };
        }
        return { found: false, message: null };
    },

    // ── Export ────────────────────────────────────────────────────
    _export() {
        if (!this.state.image) return;

        // Create a fresh full-resolution canvas for export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.state.image.width;
        exportCanvas.height = this.state.image.height;
        const exportCtx = exportCanvas.getContext('2d');
        const w = exportCanvas.width;
        const h = exportCanvas.height;

        // Draw base image
        exportCtx.drawImage(this.state.image, 0, 0, w, h);

        // Apply visible layers
        const origCtx = this.state.ctx;
        const origCanvas = this.state.canvas;
        this.state.ctx = exportCtx;
        this.state.canvas = exportCanvas;

        if (this.state.cornerLogo) this._drawCornerLogo(exportCtx, w, h);
        if (this.state.diagonalText) this._drawDiagonalText(exportCtx, w, h);
        if (this.state.tiledEmblem) this._drawTiledEmblem(exportCtx, w, h);

        // Apply steganographic encoding
        if (this.state.steganographic && this.state.stegoText) {
            const timestamp = new Date().toISOString();
            const fullMessage = this.state.stegoText + ' | Protected: ' + timestamp;
            this._encodeSteganographic(exportCanvas, fullMessage);
        }

        // Restore original canvas refs
        this.state.ctx = origCtx;
        this.state.canvas = origCanvas;

        // Download
        exportCanvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            a.download = `elaris_protected_${date}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const layers = [];
            if (this.state.cornerLogo) layers.push('Corner Logo');
            if (this.state.diagonalText) layers.push('Diagonal Text');
            if (this.state.tiledEmblem) layers.push('Tiled Emblem');
            if (this.state.steganographic) layers.push('Invisible Data');
            Elaris.toast(`Protected with ${layers.length} layer(s): ${layers.join(', ')} ✓`, 'success');
        }, 'image/png');
    },

    // ── Verify Image ─────────────────────────────────────────────
    _verifyImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const result = this._decodeSteganographic(canvas);
                const resultEl = this.container.querySelector('#wm-verify-result');
                resultEl.style.display = 'block';

                if (result.found) {
                    resultEl.innerHTML = `
                        <div style="padding:14px;border-radius:var(--radius-md);background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2)">
                            <div style="font-weight:700;color:#4ade80;font-size:13px;margin-bottom:6px">✅ ELARIS WATERMARK DETECTED</div>
                            <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
                                <strong>Hidden message:</strong><br>
                                <code style="font-size:11px;word-break:break-all">${result.message}</code>
                            </div>
                            <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
                                This image contains a verified Elaris ownership signature.
                            </div>
                        </div>
                    `;
                } else {
                    resultEl.innerHTML = `
                        <div style="padding:14px;border-radius:var(--radius-md);background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2)">
                            <div style="font-weight:700;color:#f87171;font-size:13px;margin-bottom:6px">❌ NO WATERMARK FOUND</div>
                            <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
                                No steganographic signature detected. This image either wasn't watermarked or the data was destroyed (e.g. by screenshot or re-compression).
                            </div>
                        </div>
                    `;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },
};

window.WatermarkStudio = WatermarkStudio;
window.render_watermark = function(container) { WatermarkStudio.init(container); };
