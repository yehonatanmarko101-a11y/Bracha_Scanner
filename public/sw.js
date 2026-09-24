const CACHE_NAME = 'bracha-scan-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler is enough to trigger the PWA install prompt in most browsers.
  event.respondWith(fetch(event.request).catch(() => new Response("Network error.")));
});
