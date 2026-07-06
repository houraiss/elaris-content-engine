/**
 * app.js — Elaris Content Engine router and core utilities.
 *
 * Handles page navigation, toast notifications, and global state.
 */

const Elaris = {
    currentPage: null,
    pageScripts: { captions: true, batch: true },

    // ── Toast ────────────────────────────────────────────────────
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        container.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    },

    // ── Router ───────────────────────────────────────────────────
    navigate(page) {
        if (this.currentPage === page) return;
        this.currentPage = page;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        window.location.hash = page;
        const titles = {
            promptstudio: 'Prompt Studio', motionstudio: 'Motion Studio', captions: 'Captions',
            trends: 'Trends', watermark: 'Watermark Studio', batch: 'Batch Mode',
        };
        document.title = `${titles[page] || page} — Elaris Content Engine`;

        this.loadPage(page);
    },

    loadPage(page) {
        const container = document.getElementById('page-container');
        container.innerHTML = '<div class="page-loading"><div class="spinner"></div><p>Loading...</p></div>';

        const renderFn = window[`render_${page}`];
        if (typeof renderFn === 'function') {
            try {
                renderFn(container);
            } catch (e) {
                console.error(`[Elaris] Render error for ${page}:`, e);
                container.innerHTML = `
                    <div class="empty-state">
                        <h3>Something went wrong</h3>
                        <p>${e.message}</p>
                        <button class="btn btn-secondary mt-4" onclick="Elaris.loadPage('${page}')">Retry</button>
                    </div>`;
            }
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Coming Soon</h3>
                    <p>The ${page} module is under construction.</p>
                </div>`;
        }
    },
};

// ── Captions Page ────────────────────────────────────────────────
window.render_captions = function(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title" data-i18n="cap_title">Caption Studio</h1>
            <p class="page-subtitle" data-i18n="cap_subtitle">Generate branded captions and hashtag sets</p>
        </div>
        <div class="caption-studio-layout">
            <div>
                <div class="card mb-4">
                    <div class="card-header">
                        <span class="card-title" data-i18n="cap_settings">Settings</span>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="cap_voice">Brand Voice</label>
                        <div class="voice-selector" id="cs-voice">
                            <button class="voice-btn active" data-voice="luxury" data-i18n="cap_voice_lux">Luxury Editorial</button>
                            <button class="voice-btn" data-voice="conversational" data-i18n="cap_voice_conv">Conversational</button>
                            <button class="voice-btn" data-voice="storytelling" data-i18n="cap_voice_story">Storytelling</button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="cap_prod_type">Product Type</label>
                        <select class="form-select" id="cs-product">
                            <option value="general">General Jewelry</option>
                            <option value="ring">Ring</option>
                            <option value="necklace">Necklace</option>
                            <option value="bracelet">Bracelet</option>
                            <option value="earrings">Earrings</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" data-i18n="cap_prod_name">Product Name (optional)</label>
                        <input type="text" class="form-input" id="cs-name" data-i18n="cap_prod_ph" placeholder="e.g. Luna Crescent Ring">
                    </div>
                    <button class="btn btn-primary btn-lg" id="cs-generate" style="width:100%" data-i18n="cap_gen_btn">✦ Generate Caption</button>
                </div>
            </div>
            <div>
                <div class="card mb-4">
                    <div class="card-header">
                        <span class="card-title" data-i18n="cap_caption">Caption</span>
                        <button class="btn btn-sm btn-secondary" id="cs-copy-caption" data-i18n="cap_copy">📋 Copy</button>
                    </div>
                    <div class="caption-editor">
                        <textarea class="caption-textarea" id="cs-caption" rows="8" placeholder="Your generated caption will appear here..."></textarea>
                        <span class="caption-char-count" id="cs-count">0</span>
                    </div>
                </div>
                <div class="card mb-4">
                    <div class="card-header">
                        <span class="card-title" data-i18n="cap_hashtags">Hashtags</span>
                        <button class="btn btn-sm btn-secondary" id="cs-copy-hashtags" data-i18n="cap_copy">📋 Copy</button>
                    </div>
                    <div class="hashtag-block" id="cs-hashtags" style="min-height:60px"></div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <span class="card-title" data-i18n="cap_full">Full Post (Caption + Hashtags)</span>
                        <button class="btn btn-sm btn-primary" id="cs-copy-full" data-i18n="cap_copy_full">📋 Copy Full Post</button>
                    </div>
                    <textarea class="caption-textarea" id="cs-full" rows="10" readonly style="opacity:0.7"></textarea>
                </div>
            </div>
        </div>
    `;

    let currentHashtags = [];

    // Voice selector
    document.getElementById('cs-voice').addEventListener('click', (e) => {
        const btn = e.target.closest('.voice-btn');
        if (!btn) return;
        document.querySelectorAll('#cs-voice .voice-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });

    // Generate
    document.getElementById('cs-generate').addEventListener('click', () => {
        const voice = document.querySelector('#cs-voice .voice-btn.active')?.dataset.voice || 'luxury';
        const category = document.getElementById('cs-product').value;
        const productName = document.getElementById('cs-name').value;

        const caption = ElarisCaption.generate({ voice, category, productName });
        currentHashtags = ElarisCaption.generateHashtags({ category });

        document.getElementById('cs-caption').value = caption;
        document.getElementById('cs-count').textContent = caption.length;
        document.getElementById('cs-hashtags').innerHTML = currentHashtags.map(h =>
            `<span class="hashtag-pill">${h}</span>`
        ).join('');
        document.getElementById('cs-full').value = ElarisCaption.formatPost(caption, currentHashtags);

        Elaris.toast('Caption generated ✦', 'success');
    });

    // Caption char count
    document.getElementById('cs-caption').addEventListener('input', (e) => {
        document.getElementById('cs-count').textContent = e.target.value.length;
        document.getElementById('cs-full').value = ElarisCaption.formatPost(e.target.value, currentHashtags);
    });

    // Copy buttons
    document.getElementById('cs-copy-caption').addEventListener('click', async () => {
        await ElarisExport.copyToClipboard(document.getElementById('cs-caption').value);
        Elaris.toast('Caption copied ✓', 'success');
    });
    document.getElementById('cs-copy-hashtags').addEventListener('click', async () => {
        await ElarisExport.copyToClipboard(currentHashtags.join(' '));
        Elaris.toast('Hashtags copied ✓', 'success');
    });
    document.getElementById('cs-copy-full').addEventListener('click', async () => {
        await ElarisExport.copyToClipboard(document.getElementById('cs-full').value);
        Elaris.toast('Full post copied ✓', 'success');
    });
};

// ── Trends Page ──────────────────────────────────────────────────
window.render_trends = function(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title" data-i18n="trd_title">Trends</h1>
            <p class="page-subtitle" data-i18n="trd_subtitle">Current jewelry & design trends — stay ahead, never repeat</p>
        </div>
        <div class="page-loading" id="trends-loading"><div class="spinner"></div><p data-i18n="trd_loading">Loading trends...</p></div>
        <div id="trends-content" style="display:none"></div>
    `;

    fetch('assets/trends.json')
        .then(r => r.json())
        .then(data => {
            document.getElementById('trends-loading').style.display = 'none';
            const content = document.getElementById('trends-content');
            content.style.display = '';

            // ── Staleness check: warn if data is older than 30 days ──
            let stalenessHtml = '';
            if (data.lastUpdated) {
                const lastDate = new Date(data.lastUpdated);
                const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSince > 30) {
                    stalenessHtml = `
                        <div class="card mb-4" style="background:linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,159,67,0.08)); border-color:rgba(255,107,107,0.3); border-left:3px solid #ff6b6b;">
                            <div class="flex items-center gap-3">
                                <span style="font-size:24px">⚠️</span>
                                <div>
                                    <div style="font-weight:600;margin-bottom:2px;color:#ff6b6b">Trends Data is ${daysSince} Days Old</div>
                                    <div class="text-sm text-muted">This data was last refreshed on ${data.lastUpdated}. Trends move fast — ask Antigravity to refresh with the latest jewelry & content trends.</div>
                                </div>
                            </div>
                        </div>`;
                }
            }

            const relevanceColors = { high: 'var(--success)', medium: 'var(--warning)', low: 'var(--text-muted)' };
            const categoryIcons = { design: '🎨', photography: '📸', content: '📱', strategy: '📊', video: '🎬' };

            content.innerHTML = `
                ${stalenessHtml}
                <div class="card mb-4" style="background:linear-gradient(135deg, rgba(166,124,82,0.1), rgba(54,68,45,0.08));border-color:rgba(166,124,82,0.15)">
                    <div class="flex items-center gap-3">
                        <span style="font-size:24px">💡</span>
                        <div>
                            <div style="font-weight:600;margin-bottom:2px" data-i18n="trd_tip_title">Content Calendar Tip</div>
                            <div class="text-sm text-muted">${data.contentCalendarTip}</div>
                        </div>
                    </div>
                </div>

                <div class="trends-grid">
                    ${data.trends.map(t => `
                        <div class="card trend-card">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-2">
                                    <span style="font-size:20px">${categoryIcons[t.category] || '✦'}</span>
                                    <span class="card-title" style="margin:0">${t.category}</span>
                                </div>
                                <span class="trend-relevance" style="color:${relevanceColors[t.relevance]}">
                                    ● ${t.relevance} relevance
                                </span>
                            </div>
                            <h3 style="font-family:var(--font-display);font-size:16px;margin-bottom:8px">${t.title}</h3>
                            <p class="text-sm" style="color:var(--text-secondary);line-height:1.6;margin-bottom:12px">${t.description}</p>
                            <div class="trend-suggestion">
                                <div class="text-sm" style="font-weight:600;color:var(--moroccan-bronze);margin-bottom:4px">✦ Suggestion for @elaris.925</div>
                                <div class="text-sm text-muted">${t.suggestion}</div>
                            </div>
                            <div class="flex gap-2 mt-3" style="flex-wrap:wrap">
                                ${t.tags.map(tag => `<span class="hashtag-pill">#${tag}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="card mt-4" style="text-align:center">
                    <p class="text-sm text-muted">Last updated: ${data.lastUpdated}</p>
                    <p class="text-sm text-muted mt-2">Ask Antigravity to refresh trends with latest data</p>
                </div>
            `;
        })
        .catch(() => {
            document.getElementById('trends-loading').innerHTML = `
                <div class="empty-state">
                    <h3>No Trends Data</h3>
                    <p>Ask Antigravity to research current trends</p>
                </div>`;
        });
};

// Batch rendering is now handled in batch.js

// ── Initialize ───────────────────────────────────────────────────
window.Elaris = Elaris;

document.addEventListener('DOMContentLoaded', () => {
    // Nav click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            Elaris.navigate(item.dataset.page);
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        const pages = ['promptstudio', 'motionstudio', 'generate', 'captions', 'trends', 'batch', 'watermark'];
        if (e.key >= '1' && e.key <= '7') {
            e.preventDefault();
            Elaris.navigate(pages[parseInt(e.key) - 1]);
        }
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('elaris-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    if (themeIcon && themeLabel) {
        themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
        themeLabel.textContent = savedTheme === 'dark' ? 'Dark' : 'Light';
    }

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('elaris-theme', next);
        const icon = document.getElementById('theme-icon');
        const label = document.getElementById('theme-label');
        if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
        if (label) label.textContent = next === 'dark' ? 'Dark' : 'Light';
        Elaris.toast(`Switched to ${next} mode`, 'info');
    });

    // Route from hash
    const hash = window.location.hash.slice(1);
    const valid = ['promptstudio', 'motionstudio', 'generate', 'captions', 'trends', 'batch', 'watermark'];
    Elaris.navigate(valid.includes(hash) ? hash : 'promptstudio');

    // ── Mobile Menu ──────────────────────────────────────────
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function toggleMobileMenu(open) {
        const isOpen = typeof open === 'boolean' ? open : !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', isOpen);
        menuBtn.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => toggleMobileMenu());
    }
    if (overlay) {
        overlay.addEventListener('click', () => toggleMobileMenu(false));
    }
    // Close sidebar when a nav link is tapped on mobile
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu(false);
            }
        });
    });
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== Elaris.currentPage) Elaris.navigate(hash);
});
