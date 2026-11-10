/* Esports Hub service worker: keeps the gate scanner and card tool working with a poor or missing connection.
 * - pages: network first (always fresh when online), last good copy when offline
 * - /_next/static, fonts, images: cache first (their file names change when they change)
 * - never touches another origin (the API, jsDelivr) or non-GET requests */
const VERSION = "eh-v1";
const PAGES = `${VERSION}-pages`, ASSETS = `${VERSION}-assets`;

self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!k.startsWith(VERSION)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(PAGES)).put(req, res.clone());
        return res;
      } catch {
        return (await caches.match(req)) || (await caches.match("/tools/check-in/")) || new Response("You are offline and this page has not been opened before.", { status: 503, headers: { "content-type": "text/plain" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(woff2|webp|png|svg|jpg|wasm|mjs)$/.test(url.pathname) || url.pathname === "/manifest.webmanifest") {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) (await caches.open(ASSETS)).put(req, res.clone());
      return res;
    })());
  }
});
