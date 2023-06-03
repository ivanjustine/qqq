const CACHE_NAME = 'tetris-cache-v1';
const urlsToCache = [
  '/',
  'script.js',
  'img/icon-192x192.png',
  'img/icon-512x512.png',
  // add more game assets to cache here if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
