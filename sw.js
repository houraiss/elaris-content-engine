/**
 * sw.js — Service Worker for Elaris Content Engine PWA.
 *
 * Strategy: Cache-first for app shell (HTML/CSS/JS/icons),
 * network-first for dynamic content (images, API calls).
 * This ensures the app works fully offline after the first visit.
 *
 * index.html requests every script and stylesheet with a ?v= cache-buster, while the
 * shell is stored without one — so shell lookups ignore the query string. (They used to
 * match exactly, which left an offline launch stuck on "Loading…".)
 */

const CACHE_NAME = 'elaris-v54';

// App shell — everything needed for the app to work offline
const APP_SHELL = [
    './',
    './index.html',
    './css/styles.css',
    './css/beta.css',
    './css/ios26.css',
    './css/rtl.css',
    './js/i18n.js',
    './js/captions.js',
    './js/export.js',
    './js/prompt-studio.js',
    './js/prompt-studio-beta.js',
    './js/motion-studio.js',
    './js/generate.js',
    './js/pieces.js',
    './js/watermark.js',
    './js/canvas-engine.js',
    './js/templates.js',
    './js/batch.js',
    './js/app.js',
    './js/settings.js',
    './js/ios26.js',
    './js/pwa.js',
    './icons/icon-180.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './manifest.json',
    './Elaris Jewelry Logo/Elaris Lite White.svg',
    './Elaris Jewelry Logo/Elaris Lite Black.svg',
    './Elaris Jewelry Logo/Asset 1Elaris Logo.png',
    './Elaris Jewelry Logo/Asset 2Elaris Logo.png',
    './Elaris Jewelry Logo/Asset 3Elaris Logo.png',
    './Elaris Jewelry Logo/Asset 4Elaris Logo.png',
];

// Absolute, percent-encoded paths (e.g. "Elaris%20Jewelry%20Logo/…") for matching requests.
const SHELL_PATHS = new Set(APP_SHELL.map(p => new URL(p, self.location).pathname));

// ── Install: Pre-cache the app shell ─────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            // cache: 'reload' skips the browser's HTTP cache, so a new version never
            // precaches a stale copy of a file.
            .then(cache => cache.addAll(APP_SHELL.map(p => new Request(p, { cache: 'reload' }))))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: Clean up old caches ────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: Cache-first for app shell, network-first for rest ─
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET requests (POST to /api/generate, etc.)
    if (event.request.method !== 'GET') return;

    // For Google Fonts: cache on first use
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // App shell files: cache-first, ignoring the ?v= cache-buster
    if (url.origin === self.location.origin && SHELL_PATHS.has(url.pathname)) {
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request))
        );
        return;
    }

    // Everything else (images, API, etc.): network-first with cache fallback
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses for offline use
                if (response.ok && url.origin === self.location.origin) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
});
