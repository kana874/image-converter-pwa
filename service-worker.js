const CACHE_NAME = "image-converter-pwa-v1.0.2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/app-loader.js",
  "./js/app-part-01.txt",
  "./js/app-part-02.txt",
  "./js/app-part-03.txt",
  "./js/app-part-04.txt",
  "./js/app-part-05.txt",
  "./js/app-part-06.txt",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/libheif-js@1.19.8/libheif-wasm/libheif-bundle.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);
  const appIndexUrl = new URL("./index.html", self.registration.scope);
  const isAppShellNavigation = event.request.mode === "navigate" &&
    url.origin === self.location.origin &&
    (url.pathname === scopeUrl.pathname || url.pathname === appIndexUrl.pathname);

  if (isAppShellNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response && (response.status === 200 || response.type === "opaque")) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
