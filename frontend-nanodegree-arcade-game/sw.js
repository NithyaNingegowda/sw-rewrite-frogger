var staticCacheName = 'frogger-static-v3';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      fetch('js/assets.json').then(function(response) {
        return response.json();
      }).catch(function(err) {
        console.log('Error fetching assets.json', err);
      }).then(function(assetManifest) {
        let cacheFiles = assetManifest.cache;
        cache.addAll(cacheFiles);
      }).catch(function(err) {
        console.log('Error adding cache files', err);
      })
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('frogger-') && cacheName !== staticCacheName;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  if(event.data.activate == 'true');
    self.skipWaiting();
});