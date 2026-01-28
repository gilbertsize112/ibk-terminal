const CACHE_NAME = 'ibk-bank-v3'; // ✅ Version bumped for auto-update
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png' 
];

// 1. Install Phase: Save the files to the phone's memory
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('IBK App: Caching system files');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // ✅ Forces the waiting Service Worker to become active
  self.skipWaiting();
});

// 2. Activate Phase: Remove old versions and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('IBK App: Clearing old version:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // ✅ Ensures that updates happen immediately across all open tabs/windows
  return self.clients.claim();
});

// 3. Fetch Phase: Serve files from cache if network is slow
self.addEventListener('fetch', (event) => {
  // ✅ CRITICAL: Never cache POST/PUT/DELETE (Money transfers must be real-time)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});