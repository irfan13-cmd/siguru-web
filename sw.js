const CACHE_NAME = 'siguru-cache-v2'; // Versi dinaikkan agar cache lama dibuang
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

// Instalasi & Memaksa Satpam Baru Langsung Aktif
self.addEventListener('install', event => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Pembersihan: Hapus ingatan/cache versi lama yang bikin error
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Menghapus cache lama:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// STRATEGI NETWORK-FIRST (Ambil dari Internet dulu, kalau putus baru pakai Memori)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(networkResponse => {
            // Jika internet ada, simpan salinan terbarunya ke memori, lalu tampilkan
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        }).catch(() => {
            // Jika internet mati total, baru ambil dari memori (Offline Mode)
            return caches.match(event.request);
        })
    );
});