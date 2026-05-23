/**
 * sw.js — Service Worker for Elaris Content Engine PWA.
 *
 * Strategy: Cache-first for app shell (HTML/CSS/JS/icons),
 * network-first for dynamic content (images, API calls).
 * This ensures the app works fully offline after the first visit.
 */

const CACHE_NAME = 'elaris-v13';

// App shell — everything needed for the app to work offline
const APP_SHELL = [
    './',
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/canvas-engine.js',
    './js/templates.js',
    './js/captions.js',
    './js/export.js',
    './js/enhance.js',
    './js/prompt-studio.js',
    './js/composer.js',
    './js/gallery.js',
    './js/watermark.js',
    './js/generate.js',
    './js/i18n.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './manifest.json',
];

// ── Install: Pre-cache the app shell ─────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
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

    // App shell files: cache-first
    const isAppShell = APP_SHELL.some(path => {
        const cleanPath = path.replace('./', '');
        return cleanPath === '' 
            ? url.pathname.endsWith('/') 
            : url.pathname.endsWith('/' + cleanPath);
    });

    if (isAppShell) {
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
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
            .catch(() => caches.match(event.request))
    );
});
