// Change this when the deployed assets change. Old caches are removed during
// activation, so returning visitors receive the current files automatically.
const CACHE_NAME = 'sam-maier-games-v9';
const PRECACHE_URLS = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './offline.js', './recolor.css', './recolor.js', './marck-script-v22-latin-regular.woff2',
  './twiceasclever/index.html', './twiceasclever/style.css', './twiceasclever/app.js',
  './thatsprettyclever/index.html', './thatsprettyclever/style.css', './thatsprettyclever/app.js',
  './clevercubed/index.html', './clevercubed/style.css', './clevercubed/app.js',
  './euchre/index.html', './euchre/style.css', './euchre/app.js',
  './pickleball/index.html', './pickleball/style.css', './pickleball/app.js'
];
self.addEventListener('install', (event) => {
  const freshRequests = PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(freshRequests)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  // Network-first keeps published changes visible while retaining offline use.
  event.respondWith(fetch(event.request, { cache: 'no-cache' }).then((networkResponse) => {
    const copy = networkResponse.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return networkResponse;
  }).catch(() => caches.match(event.request, { ignoreSearch: true })));
});
