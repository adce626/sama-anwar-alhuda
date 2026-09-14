/* ============================================================
   سما انوار الهدى | Service Worker — PWA v2
   ============================================================ */

const CACHE_NAME = 'sama-v6';

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
  '/job-detail.html',
  '/worker-request.html',
  '/404.html',
  '/css/style.css',
  '/js/config.js',
  '/js/translations.js',
  '/js/components.js',
  '/js/main.js',
  '/js/jobs.js',
  '/js/job-detail.js',
  '/js/worker-request.js',
  '/js/pwa.js',
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
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Cache failed:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (!url.protocol.startsWith('http')) {
    return;
  }

  if (excludedUrls.some(excluded => url.href.includes(excluded))) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          if (response) return response;
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
