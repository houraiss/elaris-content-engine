/**
 * canvas-engine.js — HTML5 Canvas compositing engine for Elaris Content Engine.
 *
 * Handles all image compositing: background + photo + logo + text overlays.
 * Renders at exact Instagram dimensions and exports as PNG.
 */

class CanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
        }
        this.ctx = this.canvas.getContext('2d');

        // State
        this.format = 'post';  // post | story | portrait
        this.dimensions = { post: [1080, 1080], story: [1080, 1920], portrait: [1080, 1350] };

        // Layers
        this.background = { type: 'solid', color: '#171717' };
        this.photo = null;         // { img, x, y, scale, brightness, contrast, saturation }
        this.logo = null;          // { img, position, scale, opacity }
        this.textOverlays = [];    // [{ text, x, y, font, size, color, align, weight }]
        this.frame = null;         // { type, color, width }

        // Template
        this.template = null;

        this._setDimensions();
    }

    _setDimensions() {
        const [w, h] = this.dimensions[this.format] || this.dimensions.post;
        this.canvas.width = w;
        this.canvas.height = h;
    }

    setFormat(format) {
        this.format = format;
        this._setDimensions();
        this.render();
    }

    // ── Background ───────────────────────────────────────────────
    setBackground(opts) {
        this.background = { ...this.background, ...opts };
        this.render();
    }

    // ── Photo ────────────────────────────────────────────────────
    setPhoto(imageElement, opts = {}) {
        this.photo = {
            img: imageElement,
            x: opts.x ?? 0.5,       // 0-1 normalized center position
            y: opts.y ?? 0.5,
            scale: opts.scale ?? 1,
            brightness: opts.brightness ?? 100,
            contrast: opts.contrast ?? 100,
            saturation: opts.saturation ?? 100,
            fit: opts.fit ?? 'cover', // cover | contain | fill
        };
        this.render();
    }

    updatePhoto(opts) {
        if (!this.photo) return;
        Object.assign(this.photo, opts);
        this.render();
    }

    // ── Logo ─────────────────────────────────────────────────────
    setLogo(imageElement, opts = {}) {
        this.logo = {
            img: imageElement,
            position: opts.position ?? 'bottom-right', // top-left, top-right, bottom-left, bottom-right, center
            scale: opts.scale ?? 0.12,  // fraction of canvas width
            opacity: opts.opacity ?? 0.8,
            padding: opts.padding ?? 40,
        };
        this.render();
    }

    updateLogo(opts) {
        if (!this.logo) return;
        Object.assign(this.logo, opts);
        this.render();
    }

    // ── Text Overlays ────────────────────────────────────────────
    setTextOverlays(overlays) {
        this.textOverlays = overlays;
        this.render();
    }

    // ── Template ─────────────────────────────────────────────────
    applyTemplate(template) {
        this.template = template;
        if (template.background) {
            this.background = { ...template.background };
        }
        if (template.frame) {
            this.frame = { ...template.frame };
        }
        this.render();
    }

    // ── Core Render ──────────────────────────────────────────────
    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);

        // 1. Background
        this._drawBackground(ctx, w, h);

        // 2. Photo
        if (this.photo && this.photo.img) {
            this._drawPhoto(ctx, w, h);
        }

        // 3. Frame overlay
        if (this.frame) {
            this._drawFrame(ctx, w, h);
        }

        // 4. Vignette (subtle)
        if (this.template?.vignette) {
            this._drawVignette(ctx, w, h, this.template.vignette);
        }

        // 5. Logo
        if (this.logo && this.logo.img) {
            this._drawLogo(ctx, w, h);
        }

        // 6. Text overlays
        if (this.textOverlays.length > 0) {
            this._drawTextOverlays(ctx, w, h);
        }

        // 7. Handle watermark
        if (this.template?.showHandle !== false) {
            this._drawHandle(ctx, w, h);
        }
    }

    // ── Draw Background ──────────────────────────────────────────
    _drawBackground(ctx, w, h) {
        const bg = this.background;

        if (bg.type === 'solid') {
            ctx.fillStyle = bg.color || '#171717';
            ctx.fillRect(0, 0, w, h);
        } else if (bg.type === 'gradient') {
            const grd = ctx.createLinearGradient(
                0, 0,
                bg.angle === 'horizontal' ? w : 0,
                bg.angle === 'horizontal' ? 0 : h
            );
            (bg.stops || [['#171717', 0], ['#2a2a2a', 1]]).forEach(([color, pos]) => {
                grd.addColorStop(pos, color);
            });
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);
        } else if (bg.type === 'image' && bg.img) {
            ctx.drawImage(bg.img, 0, 0, w, h);
        }
    }

    // ── Draw Photo ───────────────────────────────────────────────
    _drawPhoto(ctx, w, h) {
        const p = this.photo;
        const img = p.img;

        // Apply filters
        ctx.save();
        ctx.filter = `brightness(${p.brightness}%) contrast(${p.contrast}%) saturate(${p.saturation}%)`;

        // Determine photo area from template or default
        const area = this.template?.photoArea || { x: 0, y: 0, w: 1, h: 1 };
        const ax = area.x * w;
        const ay = area.y * h;
        const aw = area.w * w;
        const ah = area.h * h;

        // Apply clip if template has a mask
        if (this.template?.photoMask === 'circle') {
            ctx.beginPath();
            ctx.arc(ax + aw / 2, ay + ah / 2, Math.min(aw, ah) / 2, 0, Math.PI * 2);
            ctx.clip();
        } else if (this.template?.photoMask === 'rounded') {
            this._roundRect(ctx, ax, ay, aw, ah, this.template.photoRadius || 20);
            ctx.clip();
        } else if (area.x !== 0 || area.y !== 0 || area.w !== 1 || area.h !== 1) {
            ctx.beginPath();
            ctx.rect(ax, ay, aw, ah);
            ctx.clip();
        }

        // Calculate cover/contain dimensions
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const areaRatio = aw / ah;
        let dw, dh;

        if (p.fit === 'cover') {
            if (imgRatio > areaRatio) {
                dh = ah * p.scale;
                dw = dh * imgRatio;
            } else {
                dw = aw * p.scale;
                dh = dw / imgRatio;
            }
        } else if (p.fit === 'contain') {
            if (imgRatio > areaRatio) {
                dw = aw * p.scale;
                dh = dw / imgRatio;
            } else {
                dh = ah * p.scale;
                dw = dh * imgRatio;
            }
        } else {
            dw = aw * p.scale;
            dh = ah * p.scale;
        }

        // Position (p.x and p.y are 0-1 pan values)
        const maxPanX = (dw - aw) / 2;
        const maxPanY = (dh - ah) / 2;
        const panX = (p.x - 0.5) * 2 * maxPanX;
        const panY = (p.y - 0.5) * 2 * maxPanY;

        const dx = ax + (aw - dw) / 2 - panX;
        const dy = ay + (ah - dh) / 2 - panY;

        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
    }

    // ── Draw Frame ───────────────────────────────────────────────
    _drawFrame(ctx, w, h) {
        const f = this.frame;
        if (f.type === 'border') {
            ctx.strokeStyle = f.color || '#A67C52';
            ctx.lineWidth = f.width || 20;
            const inset = ctx.lineWidth / 2;
            ctx.strokeRect(inset, inset, w - ctx.lineWidth, h - ctx.lineWidth);
        } else if (f.type === 'double') {
            ctx.strokeStyle = f.color || '#A67C52';
            ctx.lineWidth = 2;
            const outer = f.outerPad || 30;
            const inner = f.innerPad || 45;
            ctx.strokeRect(outer, outer, w - outer * 2, h - outer * 2);
            ctx.strokeRect(inner, inner, w - inner * 2, h - inner * 2);
        } else if (f.type === 'corners') {
            ctx.strokeStyle = f.color || '#A67C52';
            ctx.lineWidth = f.lineWidth || 2;
            const len = f.cornerLength || 60;
            const pad = f.pad || 40;
            // Top-left
            ctx.beginPath();
            ctx.moveTo(pad, pad + len); ctx.lineTo(pad, pad); ctx.lineTo(pad + len, pad);
            ctx.stroke();
            // Top-right
            ctx.beginPath();
            ctx.moveTo(w - pad - len, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + len);
            ctx.stroke();
            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(pad, h - pad - len); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + len, h - pad);
            ctx.stroke();
            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(w - pad - len, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - len);
            ctx.stroke();
        }
    }

    // ── Draw Vignette ────────────────────────────────────────────
    _drawVignette(ctx, w, h, strength = 0.3) {
        const grd = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, `rgba(0,0,0,${strength})`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
    }

    // ── Draw Logo ────────────────────────────────────────────────
    _drawLogo(ctx, w, h) {
        const l = this.logo;
        const logoW = w * l.scale;
        const logoH = logoW * (l.img.naturalHeight / l.img.naturalWidth);
        const pad = l.padding;

        let x, y;
        switch (l.position) {
            case 'top-left':     x = pad; y = pad; break;
            case 'top-right':    x = w - logoW - pad; y = pad; break;
            case 'bottom-left':  x = pad; y = h - logoH - pad; break;
            case 'bottom-right': x = w - logoW - pad; y = h - logoH - pad; break;
            case 'center':       x = (w - logoW) / 2; y = (h - logoH) / 2; break;
            default:             x = w - logoW - pad; y = h - logoH - pad;
        }

        ctx.save();
        ctx.globalAlpha = l.opacity;
        ctx.drawImage(l.img, x, y, logoW, logoH);
        ctx.restore();
    }

    // ── Draw Text Overlays ───────────────────────────────────────
    _drawTextOverlays(ctx, w, h) {
        this.textOverlays.forEach(t => {
            if (!t.text) return;

            const fontSize = (t.size || 36) * (w / 1080);
            const fontFamily = t.fontFamily || "'Playfair Display', serif";
            const weight = t.weight || '700';

            ctx.save();
            ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = t.color || '#FFFFFF';
            ctx.textAlign = t.align || 'center';
            ctx.textBaseline = t.baseline || 'middle';

            const tx = (t.x || 0.5) * w;
            const ty = (t.y || 0.5) * h;

            // Text shadow
            if (t.shadow !== false) {
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 2;
            }

            // Word wrap
            if (t.maxWidth) {
                this._drawWrappedText(ctx, t.text, tx, ty, t.maxWidth * w, fontSize * 1.3);
            } else {
                ctx.fillText(t.text, tx, ty);
            }

            // Letter spacing for labels
            if (t.letterSpacing) {
                // Canvas doesn't support letterSpacing natively, draw char by char
                ctx.textAlign = 'left';
                const chars = t.text.split('');
                let cx = tx - (chars.length * (fontSize * 0.6 + t.letterSpacing)) / 2;
                chars.forEach(c => {
                    ctx.fillText(c, cx, ty);
                    cx += ctx.measureText(c).width + t.letterSpacing;
                });
            }

            ctx.restore();
        });
    }

    _drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lines = [];

        words.forEach(word => {
            const testLine = line ? line + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        });
        lines.push(line);

        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((l, i) => {
            ctx.fillText(l, x, startY + i * lineHeight);
        });
    }

    // ── Draw Handle Watermark ────────────────────────────────────
    _drawHandle(ctx, w, h) {
        const fontSize = 14 * (w / 1080);
        ctx.save();
        ctx.font = `500 ${fontSize}px 'Montserrat', sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('@elaris.925', w / 2, h - 20 * (w / 1080));
        ctx.restore();
    }

    // ── Utility: Rounded Rectangle ───────────────────────────────
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ── Export ────────────────────────────────────────────────────
    toBlob(type = 'image/png', quality = 1.0) {
        return new Promise(resolve => {
            this.canvas.toBlob(resolve, type, quality);
        });
    }

    toDataURL(type = 'image/png') {
        return this.canvas.toDataURL(type);
    }
}

// Make globally available
window.CanvasEngine = CanvasEngine;
