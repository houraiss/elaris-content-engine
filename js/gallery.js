/**
 * gallery.js — Dedicated gallery to browse and filter all generated assets.
 */

const GalleryModule = {
    state: {
        images: [],
        filterPiece: 'all',
        filterArchetype: 'all'
    },

    init(container) {
        this.container = container;
        this._render();
        this._loadManifest();
    },

    _render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Gallery</h1>
                <p class="page-subtitle">Browse and filter all generated editorial assets across collections</p>
            </div>

            <div class="gallery-filters" style="display:flex;gap:16px;margin-bottom:24px;background:var(--panel-bg);padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05)">
                <div class="form-group" style="margin:0;flex:1">
                    <label class="form-label" style="font-size:10px;margin-bottom:4px">FILTER BY PIECE</label>
                    <select class="form-select" id="gal-filter-piece">
                        <option value="all">All Pieces</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;flex:1">
                    <label class="form-label" style="font-size:10px;margin-bottom:4px">FILTER BY ARCHETYPE</label>
                    <select class="form-select" id="gal-filter-arch">
                        <option value="all">All Archetypes</option>
                    </select>
                </div>
            </div>

            <div id="gal-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:24px;">
                <div class="page-loading"><div class="spinner"></div><p>Loading gallery...</p></div>
            </div>
        `;

        this.container.querySelector('#gal-filter-piece').addEventListener('change', e => {
            this.state.filterPiece = e.target.value;
            this._renderGrid();
        });
        this.container.querySelector('#gal-filter-arch').addEventListener('change', e => {
            this.state.filterArchetype = e.target.value;
            this._renderGrid();
        });
    },

    async _loadManifest() {
        try {
            const resp = await fetch('assets/enhanced/manifest.json?v=' + Date.now());
            const data = await resp.json();
            this.state.images = data.files.map(f => ({
                ...f,
                pieceId: f.file.split('_')[0] + '_' + f.file.split('_')[1] // extract piece_001
            }));

            // Populate filters
            const pieces = [...new Set(this.state.images.map(img => img.pieceId))];
            const archs = [...new Set(this.state.images.map(img => img.direction))];

            const pieceSelect = this.container.querySelector('#gal-filter-piece');
            pieces.forEach(p => pieceSelect.innerHTML += `<option value="${p}">${p.toUpperCase()}</option>`);

            const archSelect = this.container.querySelector('#gal-filter-arch');
            archs.forEach(a => archSelect.innerHTML += `<option value="${a}">${a.toUpperCase()}</option>`);

            this._renderGrid();
        } catch (e) {
            console.error('Gallery failed to load manifest:', e);
            this.container.querySelector('#gal-grid').innerHTML = '<p class="text-error">Failed to load gallery data.</p>';
        }
    },

    _renderGrid() {
        const grid = this.container.querySelector('#gal-grid');
        let filtered = this.state.images;

        if (this.state.filterPiece !== 'all') {
            filtered = filtered.filter(img => img.pieceId === this.state.filterPiece);
        }
        if (this.state.filterArchetype !== 'all') {
            filtered = filtered.filter(img => img.direction === this.state.filterArchetype);
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:40px">No images match your filters.</p>';
            return;
        }

        grid.innerHTML = filtered.map(img => `
            <div class="gal-card" style="background:var(--panel-bg);border:1px solid rgba(255,255,255,0.05);border-radius:12px;overflow:hidden;transition:all 0.3s ease;">
                <div style="aspect-ratio:1/1;background:#000;position:relative;overflow:hidden">
                    <img src="assets/enhanced/${img.file}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" class="gal-img" loading="lazy">
                </div>
                <div style="padding:16px;">
                    <div style="font-size:10px;color:var(--moroccan-gold);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${img.pieceId.replace('_', ' ')}</div>
                    <div style="font-weight:500;margin-bottom:4px">${img.name}</div>
                    <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${img.archetype}">${img.archetype}</div>
                    <button class="btn btn-sm btn-secondary" style="width:100%;margin-top:12px" onclick="Elaris.navigate('enhance'); window.dispatchEvent(new CustomEvent('load_enhance_image', {detail: '${img.file}'}))">Open in Enhance</button>
                </div>
            </div>
        `).join('');

        // Add hover effects
        grid.querySelectorAll('.gal-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
                card.style.borderColor = 'var(--moroccan-gold)';
                card.querySelector('.gal-img').style.transform = 'scale(1.05)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'none';
                card.style.borderColor = 'rgba(255,255,255,0.05)';
                card.querySelector('.gal-img').style.transform = 'none';
            });
        });
    }
};

window.render_gallery = function(container) { GalleryModule.init(container); };
