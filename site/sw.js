/* Projeto Delta · service worker: abre offline e carrega rápido. Nunca guarda dados do Supabase. */
const V = "delta-v8";
const CORE = [
  "/app/", "/app/app.css", "/app/app.js", "/app/core.js", "/app/auth.js", "/app/learn.js", "/app/pages.js",
  "/app/ui.js", "/app/cutscene.js", "/app/gen.js", "/app/plan.js", "/app/mascot.js", "/app/icons.js", "/app/sfx.js", "/app/content.js", "/app/bank.js", "/app/config.js",
  "/vendor/supabase-2.117.2.js", "/fonts/fonts.css?v=3", "/fonts/inter-latin-wght-normal.woff2", "/fonts/orbitron-latin-wght-normal.woff2",
  "/manifest.webmanifest", "/brand/app-192.png"
];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/frames/")) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(k => k.put(r, c)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match(u.pathname.startsWith("/app") ? "/app/" : "/"))));
    return;
  }
  const imut = /^\/(fonts|vendor|brand)\//.test(u.pathname);
  const save = res => { if (res.ok) { const c = res.clone(); caches.open(V).then(k => k.put(r, c)); } return res; };
  e.respondWith(imut ? caches.match(r).then(m => m || fetch(r).then(save)) : fetch(r).then(save).catch(() => caches.match(r)));
});
