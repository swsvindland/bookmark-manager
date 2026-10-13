// Serves the app shell from cache so the page opens without waiting on the network. Built by the
// `serviceWorker` plugin in vite.config.ts, which fills in the placeholders below.
// Each build gets its own cache, holding the page plus every file it can load (lazy chunks
// included), so a cached page never asks for a file a newer deploy has since removed.
const CACHE = "app-__VERSION__";
const PRECACHE = __PRECACHE__;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(
          PRECACHE.map((url) => (url === "/" ? new Request(url, { cache: "no-cache" }) : url)),
        ),
      )
      // New deploys apply on the next page load instead of after every tab is closed
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Keep the previous build's cache too: a page already open on it may still lazy-load chunks
  event.waitUntil(
    caches.keys().then((keys) => {
      const old = keys.filter((key) => key !== CACHE);
      return Promise.all(old.slice(0, -1).map((key) => caches.delete(key)));
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && (url.pathname === "/" || url.pathname === "/index.html")) {
    // This build's page, not whichever cache happens to hold "/" first
    event.respondWith(
      caches
        .open(CACHE)
        .then((cache) => cache.match("/"))
        .then((cached) => cached ?? fetch(request)),
    );
  } else if (url.pathname.startsWith("/assets/")) {
    // Hashed file names never change content, so any build's copy will do
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
  }
});
