/* ============================================================
   سما انوار الهدى | Service Worker — PWA v3 (Optimized)
   Updated: 2026-09-17
   ============================================================ */

const CACHE_NAME = 'sama-v8';
const CACHE_STATIC = 'sama-static-v8';
const CACHE_DYNAMIC = 'sama-dynamic-v8';
const CACHE_IMAGES = 'sama-images-v8';

// Core files for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/catering.html',
  '/cleaning.html',
  '/transport.html',
  '/delivery.html',
  '/workforce.html',
  '/advertising.html',
  '/jobs.html',
  '/job.html',
  '/worker-request.html',
  '/404.html',
  '/css/style.css',
  '/js/bundle.min.js',
  '/js/service-form.min.js',
  '/js/jobs.min.js',
  '/js/job-detail.min.js',
  '/js/worker-request.min.js',
  '/js/pwa.min.js',
  '/assets/logo/logo.jpg',
  '/assets/logo/logo-192.png',
  '/manifest.json'
];

const excludedUrls = [
  '/admin/',
  '/api/',
  'googleapis.com',
  'googletagmanager.com',
  'fonts.googleapis.com',
  'cdnjs.cloudflare.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => {
            console.warn('[SW] Failed to cache:', url, err);
          }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip external resources that shouldn't be cached
  if (excludedUrls.some(excluded => url.href.includes(excluded))) {
    return;
  }

  // Strategy: Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        
        // Determine which cache to use
        let cacheName = CACHE_DYNAMIC;
        if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
          cacheName = CACHE_IMAGES;
        } else if (url.pathname.match(/\.(js|css)$/i)) {
          cacheName = CACHE_STATIC;
        }

        // Cache the response
        caches.open(cacheName).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // If requesting a page and not in cache, show 404
          if (event.request.destination === 'document') {
            return caches.match('/404.html');
          }
        });
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
