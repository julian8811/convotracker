/**
 * BioInteractiva Service Worker
 * Enables offline functionality with auto-versioning
 */

const CACHE_VERSION = 'v8';
const CACHE_NAME = `biointeractiva-${CACHE_VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './js/core.js'
  // NOTA: cli-module.js ya no se usa (deprecated 2026-03-28)
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] ${CACHE_NAME} - caching assets`);
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Cache error:', err))
  );
});

// Activate event - clean old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Delete all old caches that don't match current version
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('biointeractiva-') && name !== CACHE_NAME)
            .map((name) => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log(`[SW] ${CACHE_NAME} activated`);
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache first, then network (Stale-while-revalidate)
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          // Fetch from network in background to update cache
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {}); // Ignore network errors
          
          return cachedResponse;
        }
        
        // No cache - fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses or opaque responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache));
            
            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

console.log(`[SW] BioInteractiva Service Worker loaded: ${CACHE_NAME}`);
