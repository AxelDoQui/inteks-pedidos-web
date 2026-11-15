// Service worker de InTeks Pedidos (PWA). El constructor sustituye los marcadores de las dos
// líneas siguientes (versión y lista de archivos a precachear).
var VERSION = "PWA-2026.11.15.5-a6e8545a";
var ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "icono-maskable-512.png"];
var PREFIJO = 'inteks-pwa-';
var CACHE = PREFIJO + VERSION;

function absoluta(ruta) { return new URL(ruta, self.registration.scope).href; }

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(nombres.filter(function (n) {
        return n.indexOf(PREFIJO) === 0 && n !== CACHE;
      }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                        // POST a la hoja, etc.: sin tocar
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // otros orígenes: sin tocar
  var destino = req.mode === 'navigate' ? absoluta('./index.html') : null;
  if (!destino) {
    var propios = ARCHIVOS.map(absoluta);
    var limpia = url.origin + url.pathname;
    if (propios.indexOf(limpia) === -1 && propios.indexOf(req.url) === -1) return;
    destino = limpia;
  }
  e.respondWith(
    caches.open(CACHE).then(function (c) { return c.match(destino); }).then(function (hit) {
      return hit || fetch(req);
    })
  );
});
