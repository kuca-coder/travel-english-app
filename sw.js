const CACHE_NAME = "travel-english-cache-v1";

// アプリ本体と6つの英語音声を、通信できるうちに保存します。
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./audio/hello.mp3",
  "./audio/thank_you.mp3",
  "./audio/excuse_me.mp3",
  "./audio/this_one_please.mp3",
  "./audio/how_much_is_it.mp3",
  "./audio/where_is_the_restroom.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("travel-english-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 保存済みのページ・音声を優先し、なければネットから取得します。
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
