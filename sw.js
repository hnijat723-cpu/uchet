// Service worker: делает приложение доступным офлайн.
// Стратегия: страницу (навигацию) берём из сети, если есть — так видны обновления;
// офлайн и для иконок отдаём из кэша. Данные тут ни при чём — они в localStorage.
// Обновил файлы на хостинге — подними версию кэша, старый удалится сам.
const CACHE = "uchet-v7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./fonts/montserrat-latin.woff2",
  "./fonts/montserrat-latin-ext.woff2",
  "./fonts/montserrat-cyrillic.woff2",
  "./fonts/montserrat-cyrillic-ext.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    // Свежая страница из сети, при офлайне — из кэша.
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    // Иконки/манифест: сначала кэш.
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
  }
});
