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