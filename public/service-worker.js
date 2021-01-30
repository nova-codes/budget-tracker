// the service worker
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// files to be cached
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/manifest.webmanifest'
]

// installation
self.addEventListener('install', function(evt){
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache successful.');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    // activate the service worker once install is complete
    self.skipWaiting();
});

// clear old cache
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key) 
            }
        })
        );
    })
);

self.ClientRectList.claim();
});

// fetch data from API
self.addEventListener("fetch", function(evt) {
  const {url} = evt.request;
  if (url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone and store in the cache.
            if (response.status === 200) {
              cache.put(evt.request, response.clone());
            }

            return response;
          })
          .catch(err => {
            // If the network request fails, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );
  } else {
    // respond from static cache, request is not for /api/*
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }
});