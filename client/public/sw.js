const CACHE_NAME = 'ibk-bank-v4'; // ✅ Bumped to v4
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png' 
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// 3. Fetch Phase: THE FIX IS HERE
self.addEventListener('fetch', (event) => {
  // ✅ 1. IF IT'S AN API CALL (Login, Transfer, etc.), IGNORE THE CACHE COMPLETELY
  if (event.request.url.includes('/api')) {
    return; // Tells the Service Worker: "Don't touch this, let it go to the server"
  }

  // ✅ 2. For images/HTML, try the Network first, fall back to Cache if offline
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});