const CACHE_NAME = 'sentinel-pwa-v3';

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Install Event - Pre-cache static icon/manifest assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Cache pre-fill partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up all stale caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Never cache Vite dev modules (/src/, /node_modules/, ?v=), API routes, or real-time streams
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  if (
    request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('/src/') ||
    url.includes('/node_modules/') ||
    url.includes('/@vite') ||
    url.includes('/@fs/') ||
    url.includes('firebase-applet-config.json') ||
    url.includes('?v=') ||
    url.includes('?t=') ||
    url.includes('?import') ||
    url.includes('binance.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('api.rss2json.com') ||
    url.startsWith('ws://') ||
    url.startsWith('wss://')
  ) {
    return;
  }

  // Network-first for HTML navigation requests so index.html is always fresh
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Network-first with cache fallback for static assets (icons, manifest)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});
