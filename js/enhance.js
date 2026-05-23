/**
 * enhance.js — AI-Powered Photo Enhancement for Elaris Content Engine.
 *
 * Workflow: User drops photos into input/ → Antigravity transforms them →
 * Enhanced results load here → Manual touch-ups → Send to Composer.
 *
 * The AI heavy-lifting is done by Antigravity's image generation.
 * This page handles: loading enhanced photos, before/after comparison,
 * manual Canvas touch-ups, and sending to Composer.
 */

const Enhance = {
    canvas: null,
    ctx: null,
    sourceImg: null,
    originalData: null,
    enhancedPhotos: [],

    settings: {
        brightness: 0, contrast: 0, saturation: 0, temperature: 0,
        shadows: 0, highlights: 0, clarity: 0, vignette: 0, grain: 0,
    },

    directions: [
        { id: 'cartier-noir', name: 'Cartier Noir', icon: '🖤', desc: 'Deep black, dramatic shadows, cinematic', vibe: 'Dark & Dramatic', color: '#171717' },
        { id: 'tiffany-ice', name: 'Tiffany Ice', icon: '💎', desc: 'Clean white, bright, cool blue tints', vibe: 'Clean & Bright', color: '#E8F0F8' },
        { id: 'bvlgari-vivid', name: 'Bvlgari Vivid', icon: '🔥', desc: 'Bold colors, marble, saturated luxury', vibe: 'Bold & Rich', color: '#8B6914' },
        { id: 'heritage-gold', name: 'Heritage Gold', icon: '✦', desc: 'Warm amber, Moroccan textures, artisanal', vibe: 'Warm & Artisanal', color: '#A67C52' },
        { id: 'gucci-editorial', name: 'Gucci Editorial', icon: '🎭', desc: 'Muted artistic, unconventional, fashion-forward', vibe: 'Artistic & Bold', color: '#4A5040' },
        { id: 'studio-clean', name: 'Studio Clean', icon: '◇', desc: 'Neutral pro shot, versatile, no strong mood', vibe: 'Professional', color: '#D4D4D4' },
    ],

    init(container) {
        this.container = container;
        this._render();
        this._setupCanvas();
        this._setupEvents();
        this._loadEnhancedPhotos();

        // Listen for global events to load an image
        window.addEventListener('load_enhance_image', (e) => {
            const fileName = e.detail;
            this._loadImage(`assets/enhanced/${fileName}`);
        });
    },

    _render() {
        const dirCards = this.directions.map(d => `
            <div class="direction-card" data-dir="${d.id}">
                <div class="direction-preview" style="background:${d.color}">
                    <span class="direction-icon">${d.icon}</span>
                </div>
                <div class="direction-info">
                    <div class="direction-name">${d.name}</div>
                    <div class="direction-desc">${d.desc}</div>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title" data-i18n="enh_title">Enhance</h1>
                <p class="page-subtitle" data-i18n="enh_subtitle">AI-powered photo transformation — drop raw shots, get professional imagery</p>
            </div>

            <div class="enhance-layout">
                <!-- LEFT: Creative Directions + Enhanced Gallery -->
                <div class="enhance-left">
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Creative Directions</span>
                        </div>
                        <p class="text-sm text-muted mb-4">Drop photos in <code>input/</code> folder, then tell Antigravity which direction to use.</p>
                        <div class="direction-grid">${dirCards}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">Enhanced Photos</span>
                            <button class="btn btn-sm btn-secondary" id="enh-refresh">↻ Refresh</button>
                        </div>
                        <div class="upload-zone" id="enh-upload-zone">
                            <div class="upload-zone-icon">📸</div>
                            <div class="upload-zone-text">
                                <strong>Load enhanced photo</strong><br>
                                or drop to touch-up manually
                            </div>
                        </div>
                        <div class="photo-library mt-3" id="enh-gallery"></div>
                    </div>
                </div>

                <!-- CENTER: Preview -->
                <div class="enhance-center">
                    <div class="enhance-compare" id="enh-compare">
                        <div class="enhance-empty" id="enh-empty">
                            <div style="font-size:48px;opacity:0.3;margin-bottom:12px">✦</div>
                            <h3>AI Enhancement Workflow</h3>
                            <p class="text-sm text-muted" style="max-width:320px;margin:8px auto 16px">
                                1. Drop raw photos in <code>input/</code><br>
                                2. Tell Antigravity the direction<br>
                                3. Enhanced photos appear here<br>
                                4. Touch-up → Send to Composer
                            </p>
                        </div>
                        <canvas id="enh-canvas" style="display:none"></canvas>
                    </div>
                    <div class="enhance-actions" id="enh-actions" style="display:none">
                        <button class="btn btn-secondary" id="enh-reset">↺ Reset Tweaks</button>
                        <button class="btn btn-primary btn-lg" id="enh-use-in-composer">Use in Composer →</button>
                        <button class="btn btn-secondary" id="enh-download">⬇ Download</button>
                    </div>
                </div>

                <!-- RIGHT: Manual Touch-up Controls -->
                <div class="enhance-right">
                    <div class="card">
                        <div class="card-header"><span class="card-title">Touch-Up</span></div>
                        <p class="text-sm text-muted mb-4">Fine-tune after AI enhancement</p>
                        ${this._slider('brightness', 'Brightness', -50, 50, 0)}
                        ${this._slider('contrast', 'Contrast', -50, 50, 0)}
                        ${this._slider('saturation', 'Saturation', -50, 50, 0)}
                        ${this._slider('temperature', 'Temperature', -50, 50, 0)}
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Lighting</span></div>
                        ${this._slider('shadows', 'Shadows', -50, 50, 0)}
                        ${this._slider('highlights', 'Highlights', -50, 50, 0)}
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">Effects</span></div>
                        ${this._slider('clarity', 'Clarity', 0, 50, 0)}
                        ${this._slider('vignette', 'Vignette', 0, 60, 0)}
                        ${this._slider('grain', 'Film Grain', 0, 40, 0)}
                    </div>
                </div>
            </div>
        `;
        if (window.I18n) window.I18n.applyLanguage();
    },

    _slider(id, label, min, max, val) {
        return `
            <div class="form-group">
                <div class="flex justify-between items-center">
                    <label class="form-label" style="margin:0">${label}</label>
                    <span class="text-sm text-muted" id="enh-val-${id}">${val}</span>
                </div>
                <input type="range" class="range-slider" id="enh-${id}" min="${min}" max="${max}" value="${val}" data-prop="${id}">
            </div>`;
    },

    _setupCanvas() {
        this.canvas = document.getElementById('enh-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    },

    _setupEvents() {
        const fileInput = document.getElementById('file-input');
        const zone = document.getElementById('enh-upload-zone');

        zone.addEventListener('click', () => fileInput.click());
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragover'); this._loadFile(e.dataTransfer.files[0]); });
        fileInput.addEventListener('change', e => { if (e.target.files[0]) this._loadFile(e.target.files[0]); fileInput.value = ''; });

        // Sliders
        this.container.querySelectorAll('.range-slider[data-prop]').forEach(s => {
            s.addEventListener('input', () => {
                this.settings[s.dataset.prop] = parseInt(s.value);
                document.getElementById(`enh-val-${s.dataset.prop}`).textContent = s.value;
                this._process();
            });
        });

        // Refresh gallery
        document.getElementById('enh-refresh').addEventListener('click', () => this._loadEnhancedPhotos());

        // Actions
        document.getElementById('enh-reset').addEventListener('click', () => this._resetSliders());
        document.getElementById('enh-download').addEventListener('click', () => this._download());
        document.getElementById('enh-use-in-composer').addEventListener('click', () => this._sendToComposer());
    },

    // ── Load Enhanced Photos from Server ─────────────────────────
    async _loadEnhancedPhotos() {
        const gallery = document.getElementById('enh-gallery');
        this.enhancedPhotos = [];

        // Load from manifest
        try {
            const resp = await fetch('assets/enhanced/manifest.json');
            if (resp.ok) {
                const manifest = await resp.json();
                this._manifestMeta = manifest;
                for (const entry of manifest.files || []) {
                    const img = new Image();
                    const loaded = await new Promise(r => { img.onload = () => r(true); img.onerror = () => r(false); img.src = `assets/enhanced/${entry.file}`; });
                    if (loaded) {
                        this.enhancedPhotos.push({
                            img, src: img.src,
                            name: entry.name || entry.file,
                            file: entry.file,
                            direction: entry.direction,
                            archetype: entry.archetype,
                            reference: entry.reference
                        });
                    }
                }
            }
        } catch (e) { /* no manifest */ }

        gallery.innerHTML = this.enhancedPhotos.length > 0
            ? `<div class="enh-gallery-grid">${this.enhancedPhotos.map((p, i) => `
                <div class="enh-thumb-card" data-enh-index="${i}" title="${p.archetype || p.name}">
                    <div class="enh-thumb-img">
                        <img src="${p.src}" alt="${p.name}">
                    </div>
                    <div class="enh-thumb-meta">
                        <div class="enh-thumb-name">${p.name}</div>
                        <div class="enh-thumb-dir">${p.direction || ''}</div>
                    </div>
                </div>
            `).join('')}</div>`
            : '<p class="text-sm text-muted" style="grid-column:1/-1;text-align:center;padding:8px">No enhanced photos yet — run the pipeline first</p>';

        // Click to load
        gallery.querySelectorAll('.enh-thumb-card').forEach(el => {
            el.addEventListener('click', () => this._loadEnhanced(parseInt(el.dataset.enhIndex)));
        });

        if (this.enhancedPhotos.length > 0) {
            Elaris.toast(`${this.enhancedPhotos.length} editorial transformations loaded ✦`, 'success');
        }
    },

    _loadEnhanced(index) {
        const photo = this.enhancedPhotos[index];
        if (!photo) return;
        this._loadImage(photo.img);

        // Highlight active
        document.querySelectorAll('#enh-gallery .photo-thumb').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
    },

    _loadFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => this._loadImage(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    _loadImage(img) {
        this.sourceImg = img;
        const maxDim = 1500;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > maxDim || h > maxDim) {
            const s = maxDim / Math.max(w, h);
            w = Math.round(w * s); h = Math.round(h * s);
        }
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(img, 0, 0, w, h);
        this.originalData = this.ctx.getImageData(0, 0, w, h);

        this.canvas.style.display = '';
        document.getElementById('enh-empty').style.display = 'none';
        document.getElementById('enh-actions').style.display = '';
        this._resetSliders();
        Elaris.toast('Photo loaded — adjust or send to Composer', 'info');
    },

    // ── Canvas Processing (Touch-up) ─────────────────────────────
    _process() {
        if (!this.originalData) return;
        const s = this.settings;
        const src = this.originalData;
        const w = src.width, h = src.height;
        const out = this.ctx.createImageData(w, h);
        const sd = src.data, od = out.data;

        const bF = s.brightness / 100;
        const cF = (100 + s.contrast) / 100;
        const sF = (100 + s.saturation) / 100;
        const temp = s.temperature / 100;

        for (let i = 0; i < sd.length; i += 4) {
            let r = sd[i], g = sd[i+1], b = sd[i+2];
            r += r * bF; g += g * bF; b += b * bF;
            r = ((r - 128) * cF) + 128; g = ((g - 128) * cF) + 128; b = ((b - 128) * cF) + 128;
            const lum = 0.299*r + 0.587*g + 0.114*b;
            r = lum + (r - lum) * sF; g = lum + (g - lum) * sF; b = lum + (b - lum) * sF;
            r += temp * 30; b -= temp * 30; g += temp * 5;
            if (lum < 80) { const a = (80-lum)/80*(s.shadows/100)*50; r+=a; g+=a; b+=a; }
            if (lum > 180) { const a = (lum-180)/75*(s.highlights/100)*40; r+=a; g+=a; b+=a; }
            od[i] = Math.max(0, Math.min(255, r));
            od[i+1] = Math.max(0, Math.min(255, g));
            od[i+2] = Math.max(0, Math.min(255, b));
            od[i+3] = sd[i+3];
        }
        this.ctx.putImageData(out, 0, 0);

        if (s.clarity > 0) {
            this.ctx.globalCompositeOperation = 'overlay';
            this.ctx.globalAlpha = s.clarity / 100;
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1;
        }
        if (s.vignette > 0) {
            const grd = this.ctx.createRadialGradient(w/2, h/2, Math.min(w,h)*0.3, w/2, h/2, Math.max(w,h)*0.7);
            grd.addColorStop(0, 'rgba(0,0,0,0)');
            grd.addColorStop(1, `rgba(0,0,0,${s.vignette/100})`);
            this.ctx.fillStyle = grd;
            this.ctx.fillRect(0, 0, w, h);
        }
        if (s.grain > 0) {
            const gd = this.ctx.getImageData(0, 0, w, h);
            const intensity = (s.grain/100) * 40;
            for (let i = 0; i < gd.data.length; i += 4) {
                const n = (Math.random() - 0.5) * intensity;
                gd.data[i] += n; gd.data[i+1] += n; gd.data[i+2] += n;
            }
            this.ctx.putImageData(gd, 0, 0);
        }
    },

    _resetSliders() {
        Object.keys(this.settings).forEach(k => {
            this.settings[k] = 0;
            const slider = document.getElementById(`enh-${k}`);
            if (slider) slider.value = 0;
            const val = document.getElementById(`enh-val-${k}`);
            if (val) val.textContent = '0';
        });
        if (this.originalData) {
            this.ctx.putImageData(this.originalData, 0, 0);
        }
    },

    // ── Actions ──────────────────────────────────────────────────
    _download() {
        this.canvas.toBlob(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `elaris_enhanced_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(a.href);
        });
        Elaris.toast('Enhanced photo downloaded ✓', 'success');
    },

    _sendToComposer() {
        const dataUrl = this.canvas.toDataURL('image/png');
        const img = new Image();
        img.onload = () => {
            window._enhancedPhoto = { img, src: dataUrl, name: 'enhanced_photo.png' };
            Elaris.navigate('composer');
            setTimeout(() => {
                if (window.Composer) {
                    Composer.photos.push(window._enhancedPhoto);
                    Composer._refreshPhotoLibrary();
                    Composer._selectPhoto(Composer.photos.length - 1);
                    Elaris.toast('Enhanced photo loaded in Composer ✦', 'success');
                }
            }, 200);
        };
        img.src = dataUrl;
    },
};

window.Enhance = Enhance;
window.render_enhance = function(container) { Enhance.init(container); };
