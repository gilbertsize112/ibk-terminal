const CACHE_NAME = 'ibk-bank-v2'; // ✅ Incremented version to force update
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png' // ✅ Replaced vite.svg with your new logo
];

// 1. Install Phase: Save the files to the phone's memory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('IBK App: Caching system files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Phase: Remove old versions of the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('IBK App: Clearing old version');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Phase: Serve files from cache if network is slow
self.addEventListener('fetch', (event) => {
  // ✅ IMPORTANT: Never cache bank transfers/POST requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});