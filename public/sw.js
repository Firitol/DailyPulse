// Minimal Service Worker for ReliefZone PWA Installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler to satisfy PWA criteria
  // In a production app, this would handle caching for offline use
});