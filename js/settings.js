/* ═══════════════════════════════════════════════════════════════════════
   Elaris Content Engine — Appearance Settings
   ───────────────────────────────────────────────────────────────────────
   Live controls for the iOS 26 layer. Every knob here is a CSS custom
   property that css/ios26.css already reads, so a change is a single
   setProperty on :root — no re-render, no reload, and the app behind the
   panel updates as the slider moves.

   Values persist in localStorage under ELARIS_UI_KEY and are re-applied
   on boot by apply() at the bottom of this file, which runs before the
   router paints so there is no flash of unstyled defaults.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var KEY = 'elaris-ui-settings';

    /* Each control maps 1:1 onto a token in css/ios26.css. `def` must stay
       in sync with that file's :root — Reset writes these back. */
    var CONTROLS = [
        {
            id: 'mesh', prop: '--i26-mesh-alpha',
            label: ['set_mesh', 'Backdrop intensity'],
            hint:  ['set_mesh_hint', 'Strength of the colour mesh behind the glass'],
            min: 0, max: 1, step: 0.02, def: 0.78, fmt: 'pct'
        },
        {
            id: 'blur', prop: '--i26-blur-px',
            label: ['set_blur', 'Glass blur'],
            hint:  ['set_blur_hint', 'How much the panels diffuse what is behind them'],
            min: 0, max: 48, step: 1, def: 32, unit: 'px', fmt: 'px'
        },
        {
            id: 'glow', prop: '--i26-spec-alpha',
            label: ['set_glow', 'Cursor glow'],
            hint:  ['set_glow_hint', 'The light that follows your pointer across a panel'],
            min: 0, max: 0.4, step: 0.01, def: 0.20, fmt: 'pct40'
        },
        {
            id: 'rim', prop: '--i26-rim-alpha',
            label: ['set_rim', 'Edge highlight'],
            hint:  ['set_rim_hint', 'Brightens the border nearest the pointer'],
            min: 0, max: 0.6, step: 0.02, def: 0.00, fmt: 'pct60'
        },
        {
            id: 'sheen', prop: '--i26-sheen',
            label: ['set_sheen', 'Diagonal sheen'],
            hint:  ['set_sheen_hint', 'Fixed reflection band across each panel — off by default'],
            min: 0, max: 1, step: 0.05, def: 0, fmt: 'pct'
        }
    ];

    /* Corner rounding is four tokens moving together, so it is a preset
       rather than a slider. */
    var ROUNDING = {
        prop: 'rounding',
        def: 'default',
        presets: {
            sharp:   { '--radius-sm': '4px',  '--radius-md': '7px',  '--radius-lg': '10px', '--radius-xl': '13px' },
            default: { '--radius-sm': '10px', '--radius-md': '16px', '--radius-lg': '22px', '--radius-xl': '28px' },
            soft:    { '--radius-sm': '14px', '--radius-md': '22px', '--radius-lg': '30px', '--radius-xl': '38px' }
        }
    };

    function t(key, en) { return window.I18n ? window.I18n.t(key, en) : en; }

    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
        catch (e) { return {}; }   // corrupt or blocked storage: fall back to defaults
    }
    function save(state) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    /* Push the saved state onto :root. Only values that differ from the
       stylesheet default are written, so clearing a key really does hand
       control back to the stylesheet. */
    function apply(state) {
        var root = document.documentElement;
        CONTROLS.forEach(function (c) {
            var v = state[c.id];
            if (v === undefined || v === null || +v === c.def) {
                root.style.removeProperty(c.prop);
            } else {
                root.style.setProperty(c.prop, c.unit ? v + c.unit : String(v));
            }
        });

        var r = state.rounding;
        var preset = ROUNDING.presets[r] || null;
        Object.keys(ROUNDING.presets.default).forEach(function (k) {
            if (!preset || r === ROUNDING.def) root.style.removeProperty(k);
            else root.style.setProperty(k, preset[k]);
        });
    }

    function format(c, v) {
        if (c.fmt === 'px') return Math.round(v) + 'px';
        if (c.fmt === 'pct') return Math.round(v * 100) + '%';
        if (c.fmt === 'pct40') return Math.round((v / 0.4) * 100) + '%';
        if (c.fmt === 'pct60') return Math.round((v / 0.6) * 100) + '%';
        return String(v);
    }

    window.render_settings = function (container) {
        var state = load();
        var val = function (c) { return state[c.id] === undefined ? c.def : +state[c.id]; };
        var rounding = state.rounding || ROUNDING.def;

        container.innerHTML =
            '<div class="page-header">' +
                '<h1 class="page-title">' + t('set_title', 'Settings') + '</h1>' +
                '<p class="page-subtitle">' + t('set_subtitle', 'Tune the interface. Changes apply instantly and are remembered on this device.') + '</p>' +
            '</div>' +
            '<div class="set-layout">' +
                '<div class="card">' +
                    '<div class="card-header"><span class="card-title">' + t('set_appearance', 'Appearance') + '</span></div>' +
                    CONTROLS.map(function (c) {
                        return '<div class="set-row">' +
                            '<div class="set-row-head">' +
                                '<label class="set-label" for="set-' + c.id + '">' + t(c.label[0], c.label[1]) + '</label>' +
                                '<span class="set-value" id="set-val-' + c.id + '">' + format(c, val(c)) + '</span>' +
                            '</div>' +
                            '<input class="range-slider set-slider" type="range" id="set-' + c.id + '"' +
                                ' min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + val(c) + '">' +
                            '<p class="set-hint">' + t(c.hint[0], c.hint[1]) + '</p>' +
                        '</div>';
                    }).join('') +
                    '<div class="set-row">' +
                        '<div class="set-row-head">' +
                            '<label class="set-label">' + t('set_rounding', 'Corner rounding') + '</label>' +
                        '</div>' +
                        '<div class="ps-chip-group" id="set-rounding">' +
                            ['sharp', 'default', 'soft'].map(function (r) {
                                return '<button class="ps-chip' + (r === rounding ? ' active' : '') + '" data-val="' + r + '">' +
                                    t('set_round_' + r, r.charAt(0).toUpperCase() + r.slice(1)) + '</button>';
                            }).join('') +
                        '</div>' +
                        '<p class="set-hint">' + t('set_rounding_hint', 'Radius of panels, buttons and fields') + '</p>' +
                    '</div>' +
                '</div>' +

                '<div class="card set-side">' +
                    '<div class="card-header"><span class="card-title">' + t('set_preview', 'Preview') + '</span></div>' +
                    '<p class="set-hint" style="margin-bottom:14px">' + t('set_preview_hint', 'This panel uses the same glass as the rest of the app — hover it to test the cursor glow.') + '</p>' +
                    '<div class="set-swatch">' +
                        '<button class="btn btn-primary btn-sm">' + t('set_sample_btn', 'Primary') + '</button>' +
                        '<button class="btn btn-secondary btn-sm">' + t('set_sample_btn2', 'Secondary') + '</button>' +
                    '</div>' +
                    '<div class="ps-chip-group" style="margin-top:10px">' +
                        '<span class="ps-chip active">' + t('set_sample_chip', 'Selected') + '</span>' +
                        '<span class="ps-chip">' + t('set_sample_chip2', 'Option') + '</span>' +
                    '</div>' +
                    '<hr class="set-divider">' +
                    '<button class="btn btn-secondary set-reset" id="set-reset">' +
                        '↺ ' + t('set_reset', 'Reset to defaults') + '</button>' +
                    '<p class="set-hint" style="margin-top:8px">' + t('set_reset_hint', 'Restores every control above. Theme and language are unaffected.') + '</p>' +
                '</div>' +
            '</div>';

        CONTROLS.forEach(function (c) {
            var input = container.querySelector('#set-' + c.id);
            var out = container.querySelector('#set-val-' + c.id);
            input.addEventListener('input', function () {
                var v = +input.value;
                state[c.id] = v;
                out.textContent = format(c, v);
                apply(state);
                save(state);
            });
        });

        var roundGroup = container.querySelector('#set-rounding');
        roundGroup.addEventListener('click', function (e) {
            var chip = e.target.closest('.ps-chip');
            if (!chip) return;
            roundGroup.querySelectorAll('.ps-chip').forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            state.rounding = chip.dataset.val;
            apply(state);
            save(state);
        });

        container.querySelector('#set-reset').addEventListener('click', function () {
            state = {};
            try { localStorage.removeItem(KEY); } catch (e) {}
            apply(state);
            window.render_settings(container);          // rebuild at defaults
            if (window.I18n) window.I18n.applyLanguage();
            if (window.Elaris && Elaris.toast) {
                Elaris.toast(t('set_toast_reset', 'Appearance reset to defaults'), 'info');
            }
        });

        if (window.I18n) window.I18n.applyLanguage();
    };

    // Re-apply saved settings at boot, before the router paints.
    apply(load());
})();
