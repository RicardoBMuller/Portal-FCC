const CACHE_VERSION = "fcc-portal-v18.0.0";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=18.0",
  "./kanban.css?v=18.0",
  "./app.js?v=18.0",
  "./kanban-module.js?v=18.0",
  "./pwa.js?v=18.0",
  "./manifest.webmanifest",
  "./offline.html",
  "./logo-fcc.jpg",
  "./logo-fcc-avatar.png",
  "./google-g.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/badge-96.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_BADGE" && self.navigator?.clearAppBadge) self.navigator.clearAppBadge().catch(() => {});
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith("/config.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("./index.html")) || caches.match("./offline.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch { payload = { body: event.data?.text() || "Há uma nova atualização no Portal FCC." }; }

  const title = payload.title || "Portal FCC";
  const data = payload.data || {};
  const options = {
    body: payload.body || "Há uma nova atualização em um projeto do qual você participa.",
    icon: payload.icon || "./icons/icon-192.png",
    badge: payload.badge || "./icons/badge-96.png",
    image: payload.image || undefined,
    tag: payload.tag || data.event_id || `fcc-${Date.now()}`,
    renotify: payload.renotify !== false,
    requireInteraction: Boolean(payload.requireInteraction),
    vibrate: [180, 80, 180],
    timestamp: payload.timestamp || Date.now(),
    data: {
      url: data.url || "./",
      event_id: data.event_id || null,
      project_id: data.project_id || null,
      card_id: data.card_id || null,
      event_type: data.event_type || null
    },
    actions: [{ action: "open", title: "Abrir Portal" }, { action: "dismiss", title: "Agora não" }]
  };

  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    if (self.navigator?.setAppBadge) await self.navigator.setAppBadge().catch(() => {});
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: "FCC_PUSH_RECEIVED", payload: { title, ...options } }));
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const target = new URL(event.notification.data?.url || "./", self.registration.scope);
  if (event.notification.data?.event_id) target.searchParams.set("push_event", event.notification.data.event_id);

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      const clientUrl = new URL(client.url);
      if (clientUrl.origin === target.origin && "focus" in client) {
        await client.focus();
        client.postMessage({ type: "FCC_NOTIFICATION_CLICK", data: event.notification.data });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target.href);
  })());
});
