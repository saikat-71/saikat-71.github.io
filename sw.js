/*
 * Service worker
 * -------------
 * Static assets are cached for speed. HTML, CSS, JavaScript and portfolio
 * data use network-first loading so a new GitHub Pages deployment is not
 * trapped behind an old cached version.
 */
const CACHE = 'saikat-portfolio-v10';
const CORE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './site-common.js',
  './enhancements.js',
  './data/portfolio-loader.js',
  './data/portfolio.json',
  './images/Logo.webp',
  './images/profile.webp',
  './images/favicon.png',
  './offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  const isPageRequest = event.request.mode === 'navigate';
  const isCodeOrData =
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.json');

  if (isPageRequest || isCodeOrData) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(cached => cached || caches.match('./offline.html'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('./offline.html'))
    )
  );
});
