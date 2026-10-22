
const CACHE = "agenda-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./style/style.css",
  "./style/responsivo.css",
  "./js/index.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.ok) {
          const copia = response.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, copia));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
