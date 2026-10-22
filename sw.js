const CACHE = "agenda-v2";
const ASSETS = [
  "/agenda-eletronica/",
  "/agenda-eletronica/index.html",
  "/agenda-eletronica/manifest.json",
  "/agenda-eletronica/style/style.css",
  "/agenda-eletronica/style/responsivo.css",
  "/agenda-eletronica/js/index.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});