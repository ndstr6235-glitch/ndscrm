const CACHE_NAME = "bf-crm-v2";
const OFFLINE_URL = "/offline";
const OFFLINE_FALLBACK = "/offline.html";

// Pre-cache the offline fallback page on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_FALLBACK))
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Network-first strategy with offline fallback
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches
        .match(OFFLINE_FALLBACK)
        .then((cached) => cached || Response.redirect(OFFLINE_URL, 302))
    )
  );
});
