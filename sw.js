/*
 * Service worker
 * --------------
 * Strategy:
 *  - Pages, CSS, JS, JSON and PDFs: network-first, so a new GitHub Pages
 *    deployment (or a replaced CV/report) is never trapped behind an old cache.
 *  - Everything else (images, fonts, icons): stale-while-revalidate, so it is
 *    fast and still refreshes in the background.
 *  - Offline: cached copy if available; offline.html only for page navigations.
 *
 * Bump CACHE_VERSION only when you add/remove files in CORE or change this
 * file's behaviour. Normal content edits do NOT need a bump.
 */
const CACHE_VERSION = 'v23';
const CACHE = `saikat-portfolio-${CACHE_VERSION}`;

const CORE = [
  './',
  './index.html',
  './projects.html',
  './project.html',
  './experience.html',
  './education.html',
  './research.html',
  './certificates.html',
  './courses.html',
  './github.html',
  './offline.html',
  './style.css',
  './script.js',
  './site-common.js',
  './enhancements.js',
  './scroll-animations.js',
  './hero-motion.js',
  './analytics.js',
  './data/portfolio-loader.js',
  './data/portfolio.json',
  './site.webmanifest',
  './images/Logo.webp',
  './images/profile.png',
  './images/icon-192.png',
  './documents/CV.pdf',
];

// Admin tooling is never cached or served offline.
const NEVER_CACHE = ['/admin.html', '/admin.js', '/admin.css'];

const NETWORK_FIRST_EXT = ['.html', '.css', '.js', '.json', '.pdf', '.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Cache files one by one so a single missing file can't abort the install.
      .then((cache) =>
        Promise.all(
          CORE.map((url) =>
            cache.add(url).catch((err) => console.warn('SW precache skipped:', url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Only full, successful responses can be stored (cache.put rejects 206 partial PDF/media responses).
function cacheable(response) {
  return response && response.status === 200 && response.type !== 'opaque';
}

function putInCache(request, response) {
  if (!cacheable(response)) return;
  const copy = response.clone();
  caches
    .open(CACHE)
    .then((cache) => cache.put(request, copy))
    .catch(() => {});
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (NEVER_CACHE.some((path) => url.pathname.endsWith(path))) return;
  // Range requests (PDF/video seeking) go straight to the network.
  if (request.headers.has('range')) return;

  const isNavigation = request.mode === 'navigate';
  const networkFirst = isNavigation || NETWORK_FIRST_EXT.some((ext) => url.pathname.endsWith(ext));

  if (networkFirst) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() =>
          caches.match(request, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return isNavigation ? caches.match('./offline.html') : Response.error();
          })
        )
    );
    return;
  }

  // Stale-while-revalidate for images, fonts and other static assets.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      const refresh = fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || refresh;
    })
  );
});
