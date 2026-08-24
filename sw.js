const CACHE_NAME = 'busflix-v1';
const APP_FILES = ['./', './index.html', './style.css', './app.js', './horarios.json', './img/logoanimado.mp4', './img/iconebusapp.png', './img/iconepequeno.png'];

self.addEventListener('install', evento => {
    evento.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
    self.skipWaiting();
});

self.addEventListener('activate', evento => {
    evento.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evento => {
    evento.respondWith(
        caches.match(evento.request).then(resposta => resposta || fetch(evento.request))
    );
});
