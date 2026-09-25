/**
 * pieces.js — Piece Library: the store's real pieces, with photos.
 *
 * A piece is saved once (name, category, material, stones, size, a short description
 * and up to 4 photos). Picked in Prompt Studio or Studio Beta, it makes the prompt
 * describe that exact piece; on the Generate page its photos are sent with the prompt
 * so the image model reproduces it.
 *
 * Stored in IndexedDB (photos are too big for localStorage). Nothing leaves the device.
 */
(function () {
    'use strict';

    const T = (k, en) => (window.I18n ? window.I18n.t(k, en) : en);
    const DB_NAME = 'elaris';
    const DB_VERSION = 1;
    const STORE = 'pieces';
    const MAX_PHOTOS = 4;
    const PHOTO_MAX_SIDE = 1600;

    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // ── IndexedDB ────────────────────────────────────────────────
    let dbPromise = null;
    function openDB() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                if (!window.indexedDB) { reject(new Error(T('pc_err_nodb', 'This browser cannot store pieces (IndexedDB is unavailable).'))); return; }
                const req = indexedDB.open(DB_NAME, DB_VERSION);
                req.onupgradeneeded = () => {
                    if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
                req.onblocked = () => reject(new Error('IndexedDB is blocked by another tab'));
            });
            dbPromise.catch(() => { dbPromise = null; });   // let a later call retry
        }
        return dbPromise;
    }

    const done = req => new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });

    // Runs one request in its own transaction and resolves once the transaction commits.
    async function run(mode, makeRequest) {
        const db = await openDB();
        const tx = db.transaction(STORE, mode);
        const committed = new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
        });
        const result = await done(makeRequest(tx.objectStore(STORE)));
        await committed;
        return result;
    }

    const newId = () => 'pc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    // ── Photos ───────────────────────────────────────────────────
    // A phone photo can be 10+ MB: keep a JPEG with the long side at most 1600 px.
    function resizePhoto(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                try {
                    const s = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
                    const c = document.createElement('canvas');
                    c.width = Math.max(1, Math.round(img.naturalWidth * s));
                    c.height = Math.max(1, Math.round(img.naturalHeight * s));
                    const ctx = c.getContext('2d');
                    ctx.fillStyle = '#ffffff';   // transparent cut-outs stay white, not black
                    ctx.fillRect(0, 0, c.width, c.height);
                    ctx.drawImage(img, 0, 0, c.width, c.height);
                    c.toBlob(b => (b ? resolve(b) : reject(new Error(T('pc_err_photo', 'That photo could not be read')))), 'image/jpeg', 0.88);
                } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(T('pc_err_photo', 'That photo could not be read'))); };
            img.src = url;
        });
    }

    // ── Labels (the studios own the option lists) ────────────────
    const PS = () => window.PromptStudio || {};
    const categories = () => (PS().categories || ['ring', 'necklace', 'earrings', 'bracelet', 'bangles', 'anklet', 'brooch', 'pendant', 'body-jewelry', 'jewelry-set']);
    // (labels shared with the studios: ps_cat_* / ps_mat_* / ps_stone_*)
    const catLabel = id => T('ps_cat_' + String(id).replace(/-/g, '_'), String(id).replace(/-/g, ' ').replace(/\b\w/, c => c.toUpperCase()));
    const translated = (prefix, list) => list.map(x => ({ id: x.id, label: T(prefix + String(x.id).replace(/-/g, '_'), x.label) }));
    const materials = () => translated('ps_mat_', PS().materials || [{ id: 'sterling-silver', label: '925 Sterling Silver' }]);
    const stones = () => translated('ps_stone_', PS().stones || [{ id: 'none', label: 'No Stones' }]);
    const labelOf = (list, id) => (list.find(x => x.id === id) || { label: id || '' }).label;

    const Pieces = {
        MAX_PHOTOS,
        list: () => run('readonly', s => s.getAll()).then(all => all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))),
        get: id => (id ? run('readonly', s => s.get(id)) : Promise.resolve(undefined)),
        async save(piece) {
            const now = Date.now();
            const p = { ...piece, id: piece.id || newId(), createdAt: piece.createdAt || now, updatedAt: now };
            await run('readwrite', s => s.put(p));
            return p;
        },
        remove: id => run('readwrite', s => s.delete(id)),
        resizePhoto,

        // The fields the prompt engine reads from a studio's state.
        applyTo(state, piece) {
            Object.assign(state, {
                pieceId: piece.id, pieceName: piece.name || '',
                category: piece.category || state.category, material: piece.material || state.material, stone: piece.stone || 'none',
                pieceNotes: piece.notes || '', pieceSize: piece.size || '', piecePhotoCount: (piece.photos || []).length,
            });
        },
        clearFrom(state) {
            Object.assign(state, { pieceId: null, pieceName: '', pieceNotes: '', pieceSize: '', piecePhotoCount: 0 });
        },

        // A studio's "Your piece" picker: filled once the library has loaded.
        pickerHTML(selectId, activeId, cls = 'form-select') {
            return `<select class="${cls} pc-picker" id="${selectId}" data-active="${esc(activeId || '')}">
                <option value="">${esc(T('pc_picker_none', '— Not from the library —'))}</option>
            </select>`;
        },
        async fillPicker(select) {
            if (!select) return [];
            let list = [];
            try { list = await this.list(); } catch (e) { return []; }
            const active = select.dataset.active || '';
            list.forEach(p => {
                const o = document.createElement('option');
                o.value = p.id;
                o.textContent = `${p.name} · ${catLabel(p.category)}`;
                if (p.id === active) o.selected = true;
                select.appendChild(o);
            });
            return list;
        },
    };
    window.Pieces = Pieces;

    // ── Page ─────────────────────────────────────────────────────
    const urls = [];   // object URLs for thumbnails, revoked on each re-render
    const thumb = blob => { const u = URL.createObjectURL(blob); urls.push(u); return u; };
    const revokeAll = () => { while (urls.length) URL.revokeObjectURL(urls.pop()); };

    window.render_pieces = function (container) {
        revokeAll();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${esc(T('pc_title', 'Piece Library'))}</h1>
                <p class="page-subtitle">${esc(T('pc_subtitle', 'Save your real pieces with photos. Pick one in the studios and the prompt describes it exactly; on the Generate page its photos go with the prompt.'))}</p>
            </div>
            <div class="pc-toolbar">
                <button type="button" class="btn btn-primary" id="pc-add">＋ ${esc(T('pc_add', 'Add a piece'))}</button>
                <span class="text-sm text-muted" id="pc-count"></span>
            </div>
            <div id="pc-form-slot"></div>
            <div class="pc-grid" id="pc-grid"><div class="spinner"></div></div>
        `;
        const $ = id => container.querySelector('#' + id);

        const renderGrid = async () => {
            revokeAll();
            const grid = $('pc-grid');
            let list;
            try { list = await Pieces.list(); } catch (e) {
                grid.innerHTML = `<div class="empty-state"><p>${esc(e.message)}</p></div>`;
                return;
            }
            $('pc-count').textContent = T('pc_count', '{n} piece(s)').replace('{n}', list.length);
            if (!list.length) {
                grid.innerHTML = `<div class="empty-state pc-empty">
                    <div style="font-size:34px">💍</div>
                    <h3>${esc(T('pc_empty_title', 'No pieces yet'))}</h3>
                    <p>${esc(T('pc_empty_desc', 'Add your best sellers first: a name, the metal, and 2 or 3 clear photos on a plain background.'))}</p>
                </div>`;
                return;
            }
            grid.innerHTML = list.map(p => `
                <div class="card pc-card" data-id="${esc(p.id)}">
                    <div class="pc-photo">${p.photos && p.photos.length
                        ? `<img src="${thumb(p.photos[0])}" alt="${esc(p.name)}" loading="lazy">${p.photos.length > 1 ? `<span class="pc-photo-count">+${p.photos.length - 1}</span>` : ''}`
                        : '<span class="pc-photo-empty">💍</span>'}
                        <div class="pc-tools">
                            <button type="button" class="pc-tool" data-act="edit" title="${esc(T('pc_edit', 'Edit'))}" aria-label="${esc(T('pc_edit', 'Edit'))}">✏️</button>
                            <button type="button" class="pc-tool" data-act="delete" title="${esc(T('pc_delete', 'Delete'))}" aria-label="${esc(T('pc_delete', 'Delete'))}">🗑</button>
                        </div>
                    </div>
                    <div class="pc-body">
                        <div class="pc-name">${esc(p.name)}</div>
                        <div class="pc-meta">${esc([catLabel(p.category), labelOf(materials(), p.material), p.stone && p.stone !== 'none' ? labelOf(stones(), p.stone) : '', p.size].filter(Boolean).join(' · '))}</div>
                        ${p.notes ? `<div class="pc-notes">${esc(p.notes)}</div>` : ''}
                    </div>
                    <div class="pc-actions">
                        <button type="button" class="btn btn-sm btn-primary" data-act="studio">✨ ${esc(T('nav_promptstudio', 'Prompt Studio'))}</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-act="beta">🧪 ${esc(T('nav_promptstudiobeta', 'Studio Beta'))}</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-act="generate">🖼️ ${esc(T('nav_generate', 'Generate'))}</button>
                    </div>
                </div>`).join('');
        };

        const openForm = (piece) => {
            const p = piece || { name: '', category: 'ring', material: 'sterling-silver', stone: 'none', size: '', notes: '', photos: [] };
            let photos = (p.photos || []).slice();
            const slot = $('pc-form-slot');
            slot.innerHTML = `
                <div class="card pc-form">
                    <div class="card-header"><span class="card-title">${esc(piece ? T('pc_edit_title', 'Edit piece') : T('pc_new_title', 'New piece'))}</span></div>
                    <div class="pc-form-grid">
                        <div class="form-group">
                            <label class="form-label" for="pc-name">${esc(T('pc_name', 'Name'))}</label>
                            <input class="form-input" id="pc-name" maxlength="80" placeholder="${esc(T('pc_name_ph', 'e.g. Tilila ring'))}">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="pc-category">${esc(T('pc_category', 'Category'))}</label>
                            <select class="form-select" id="pc-category">${categories().map(c => `<option value="${esc(c)}">${esc(catLabel(c))}</option>`).join('')}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="pc-material">${esc(T('pc_material', 'Metal & finish'))}</label>
                            <select class="form-select" id="pc-material">${materials().map(m => `<option value="${esc(m.id)}">${esc(m.label)}</option>`).join('')}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="pc-stone">${esc(T('pc_stone', 'Stones'))}</label>
                            <select class="form-select" id="pc-stone">${stones().map(s => `<option value="${esc(s.id)}">${esc(s.label)}</option>`).join('')}</select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="pc-size">${esc(T('pc_size', 'Real size'))}</label>
                            <input class="form-input" id="pc-size" maxlength="80" placeholder="${esc(T('pc_size_ph', 'e.g. band 4 mm wide, pendant 2 cm'))}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="pc-notes">${esc(T('pc_notes', 'What makes it unique'))}</label>
                        <textarea class="form-textarea" id="pc-notes" maxlength="400" rows="3" placeholder="${esc(T('pc_notes_ph', 'Shape, pattern, stone cut, clasp… e.g. braided Amazigh pattern with one oval turquoise'))}"></textarea>
                        <p class="text-sm text-muted" style="margin-top:4px">${esc(T('pc_notes_hint', 'Written into every prompt for this piece, so keep it short and visual.'))}</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">${esc(T('pc_photos', 'Photos'))} <span class="text-sm text-muted">(${esc(T('pc_photos_max', 'up to {n}').replace('{n}', MAX_PHOTOS))})</span></label>
                        <div class="pc-photo-row" id="pc-photo-row"></div>
                        <input type="file" id="pc-photo-input" accept="image/*" multiple style="display:none">
                        <p class="text-sm text-muted" style="margin-top:6px">${esc(T('pc_photos_hint', 'Clear, well-lit photos on a plain background work best: front, side and a close-up.'))}</p>
                    </div>
                    <div class="pc-form-actions">
                        <button type="button" class="btn btn-secondary" id="pc-cancel">${esc(T('pc_cancel', 'Cancel'))}</button>
                        <button type="button" class="btn btn-primary" id="pc-save">${esc(T('pc_save', 'Save piece'))}</button>
                    </div>
                </div>`;
            // Values go in through DOM properties, never through the HTML template.
            $('pc-name').value = p.name || '';
            $('pc-category').value = categories().includes(p.category) ? p.category : 'ring';
            $('pc-material').value = p.material || 'sterling-silver';
            $('pc-stone').value = p.stone || 'none';
            $('pc-size').value = p.size || '';
            $('pc-notes').value = p.notes || '';

            const photoUrls = [];
            const drawPhotos = () => {
                photoUrls.forEach(u => URL.revokeObjectURL(u));
                photoUrls.length = 0;
                const row = $('pc-photo-row');
                row.innerHTML = photos.map((b, i) => {
                    const u = URL.createObjectURL(b); photoUrls.push(u);
                    return `<div class="pc-photo-thumb"><img src="${u}" alt=""><button type="button" class="pc-photo-remove" data-i="${i}" aria-label="${esc(T('pc_remove_photo', 'Remove photo'))}">✕</button></div>`;
                }).join('') + (photos.length < MAX_PHOTOS ? `<button type="button" class="pc-photo-add" id="pc-photo-add">＋<span>${esc(T('pc_add_photo', 'Add photo'))}</span></button>` : '');
                const add = $('pc-photo-add');
                if (add) add.addEventListener('click', () => $('pc-photo-input').click());
                row.querySelectorAll('.pc-photo-remove').forEach(btn => btn.addEventListener('click', () => {
                    photos.splice(parseInt(btn.dataset.i, 10), 1);
                    drawPhotos();
                }));
            };
            drawPhotos();

            $('pc-photo-input').addEventListener('change', async e => {
                const files = [...e.target.files].slice(0, MAX_PHOTOS - photos.length);
                e.target.value = '';
                for (const f of files) {
                    try { photos.push(await resizePhoto(f)); } catch (err) { Elaris.toast(err.message, 'error'); }
                }
                drawPhotos();
            });
            const close = () => { photoUrls.forEach(u => URL.revokeObjectURL(u)); slot.innerHTML = ''; };
            $('pc-cancel').addEventListener('click', close);
            $('pc-save').addEventListener('click', async () => {
                const name = $('pc-name').value.trim();
                if (!name) { Elaris.toast(T('pc_need_name', 'Give the piece a name first'), 'error'); $('pc-name').focus(); return; }
                try {
                    await Pieces.save({
                        ...(piece || {}), name,
                        category: $('pc-category').value, material: $('pc-material').value, stone: $('pc-stone').value,
                        size: $('pc-size').value.trim(), notes: $('pc-notes').value.trim(), photos,
                    });
                    close();
                    Elaris.toast(T('pc_saved', 'Piece saved ✓'), 'success');
                    renderGrid();
                } catch (err) {
                    Elaris.toast(T('pc_err_save', 'Could not save the piece:') + ' ' + err.message, 'error');
                }
            });
            slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
            $('pc-name').focus();
        };

        $('pc-add').addEventListener('click', () => openForm(null));
        $('pc-grid').addEventListener('click', async e => {
            const btn = e.target.closest('[data-act]');
            const card = e.target.closest('.pc-card');
            if (!btn || !card) return;
            const piece = await Pieces.get(card.dataset.id);
            if (!piece) return;
            const act = btn.dataset.act;
            if (act === 'edit') openForm(piece);
            else if (act === 'delete') {
                if (!confirm(T('pc_confirm_delete', 'Delete "{name}" and its photos?').replace('{name}', piece.name))) return;
                await Pieces.remove(piece.id);
                Elaris.toast(T('pc_deleted', 'Piece deleted'), 'info');
                renderGrid();
            } else if (act === 'studio' && window.PromptStudio) {
                Pieces.applyTo(PromptStudio.state, piece);
                PromptStudio.state.product = 'silver';   // a library piece is jewelry, not a watch
                Elaris.navigate('promptstudio');
            } else if (act === 'beta' && window.PromptStudioBeta) {
                Pieces.applyTo(PromptStudioBeta.state, piece);
                Elaris.navigate('promptstudiobeta');
            } else if (act === 'generate') {
                // Opens Generate with this piece's photos ready, keeping the prompt that is there.
                window.ElarisGenerateHandoff = { text: null, spec: null, target: null, pieceId: piece.id, ts: Date.now() };
                try { sessionStorage.setItem('elaris_generate_handoff', JSON.stringify(window.ElarisGenerateHandoff)); } catch (err) { /* storage blocked */ }
                Elaris.navigate('generate');
            }
        });
        renderGrid();
    };
})();
