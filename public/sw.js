// MESMER İSG360 — el yazımı, minimal service worker.
//
// @ducanh2912/next-pwa (workbox tabanlı) denendi ve elendi: bu proje Next.js
// 16'nın varsayılan derleyicisi olan Turbopack ile build alıyor, next-pwa ise
// service worker'ı next.config'in `webpack()` fonksiyonuna eklenen bir
// webpack plugin'i ile üretiyor — Turbopack bu fonksiyonu hiç çalıştırmıyor,
// dolayısıyla service worker sessizce üretilmeyecekti (bkz. CLAUDE.md → PWA
// bölümü). Bu yüzden kapsam kasıtlı olarak dar tutuldu: statik varlıkların
// (ikon, script, css) önbelleklenmesi + zaten ziyaret edilmiş sayfaların
// çevrimdışı yeniden yüklenebilmesi. Asıl "çevrimdışı taslak" özelliği
// (denetim madde cevaplarının kuyruğa alınması) bu service worker'a bağımlı
// DEĞİLDİR — src/lib/offline/ altında saf IndexedDB ile çalışır.

const CACHE_VERSION = "v1";
const SHELL_CACHE = `mesmer-isg360-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `mesmer-isg360-runtime-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Yalnızca GET istekleri işlenir. Server action'lar (POST) hiç
  // dokunulmadan doğrudan ağa gider — çevrimdışıyken doğal olarak
  // başarısız olur, bu da src/lib/offline/ kuyruk mekanizmasını tetikler.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html"))),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/brand/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
            return response;
          }),
      ),
    );
  }
});
