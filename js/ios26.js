/* ═══════════════════════════════════════════════════════════════════════
   Elaris Content Engine — iOS 26 Liquid Glass — runtime
   ───────────────────────────────────────────────────────────────────────
   Two behaviours that CSS alone cannot express:

     1. Specular tracking. Liquid Glass is a lens, not a frosted pane —
        its highlight and its edge follow the light source. On a desktop
        the pointer stands in for that light. This writes --i26-mx /
        --i26-my on whichever glass surface the pointer is over; the
        ::before highlight and the ::after rim in ios26.css read them.

     2. Scroll edge state. Toggles .i26-scrolled on the scroller so the
        blur band at the top only appears once there is content beneath
        it to dissolve.

   Both are progressive enhancement: with this file absent every surface
   still renders correctly, just with the highlight parked at its default
   position and the edge band always hidden.

   Ported from the mechanic proven on .psb-panel in prompt-studio-beta.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* Surfaces that carry a specular highlight. Kept in sync with the
       ::before / ::after selector lists in css/ios26.css. */
    var GLASS = [
        '.card', '.ps-panel', '.trend-card', '.wm-guide',
        '.ms-prompt-block', '.ps-prompt-block', '.sidebar'
    ].join(',');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /* ── 1 · Specular tracking ──────────────────────────────────────── */
    var frame = null;
    var latest = null;
    var lit = null;

    function paint() {
        frame = null;
        var ev = latest;
        if (!ev) return;

        var el = ev.target && ev.target.closest ? ev.target.closest(GLASS) : null;

        /* Leaving a surface: drop its custom props so the highlight
           fades from wherever it was rather than snapping to centre. */
        if (lit && lit !== el) {
            lit.style.removeProperty('--i26-mx');
            lit.style.removeProperty('--i26-my');
        }
        lit = el;
        if (!el) return;

        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;

        el.style.setProperty('--i26-mx', (((ev.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
        el.style.setProperty('--i26-my', (((ev.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    }

    function onMove(ev) {
        /* A highlight chasing the cursor is continuous motion, so it is
           dropped under prefers-reduced-motion. Checked per-event rather
           than at bind time so the setting can change mid-session. */
        if (reduced.matches) {
            if (lit) {
                lit.style.removeProperty('--i26-mx');
                lit.style.removeProperty('--i26-my');
                lit = null;
            }
            return;
        }
        /* Touch has no hover state, and a finger is not a light source. */
        if (ev.pointerType === 'touch') return;
        latest = ev;
        if (frame === null) frame = requestAnimationFrame(paint);
    }

    document.addEventListener('pointermove', onMove, { passive: true });

    /* ── 2 · Scroll edge state ──────────────────────────────────────── */
    var scroller = document.getElementById('main-content');
    if (scroller) {
        var ticking = false;
        var sync = function () {
            ticking = false;
            scroller.classList.toggle('i26-scrolled', scroller.scrollTop > 8);
        };
        scroller.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(sync);
        }, { passive: true });
        sync();
    }
})();
