importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'busflix-v3';
const APP_FILES = ['./', './index.html', './style.css', './app.js', './horarios.json', './img/logoanimado.mp4', './img/iconebusapp.png', './img/iconepequeno.png'];
// Imagens dos banners e da galeria: guardadas na instalação para aparecerem sem internet.
const IMAGENS_OFFLINE = [
    './img/banners/avisos.png',
    './img/banners/avisos 2.png',
    './img/banners/pesquisa.png',
    './img/banners/pat.png',
    './img/galeria/1.png',
    './img/galeria/2.png',
    './img/galeria/3.png',
    './img/galeria/4.png',
    './img/galeria/5.png',
    './img/galeria/6.png',
    './img/galeria/7.png',
    './img/galeria/pesquisa.png'
];
const APP_SHELL_FILES = new Set(['index.html', 'style.css', 'app.js', 'horarios.json']);

self.addEventListener('install', evento => {
    evento.waitUntil(
        caches.open(CACHE_NAME).then(cache => Promise.all([
            cache.addAll(APP_FILES),
            // Uma imagem que falhar não deve impedir a instalação do app.
            ...IMAGENS_OFFLINE.map(imagem => cache.add(imagem).catch(() => {}))
        ]))
    );
    self.skipWaiting();
});

self.addEventListener('activate', evento => {
    evento.waitUntil(
        caches.keys()
            .then(nomes => Promise.all(nomes.filter(nome => nome !== CACHE_NAME).map(nome => caches.delete(nome))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', evento => {
    if (evento.request.method !== 'GET') return;

    const url = new URL(evento.request.url);
    const eNavegacao = evento.request.mode === 'navigate';
    const nomeArquivo = url.pathname.split('/').pop();
    const eArquivoDoApp = eNavegacao || url.origin === self.location.origin && APP_SHELL_FILES.has(nomeArquivo);

    if (eArquivoDoApp) {
        evento.respondWith(
            fetch(evento.request, { cache: 'no-store' })
                .then(resposta => {
                    if (resposta.ok) {
                        const copia = resposta.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(evento.request, copia));
                    }
                    return resposta;
                })
                .catch(() => caches.match(evento.request).then(resposta => resposta || caches.match('./index.html')))
        );
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then(resposta => resposta || fetch(evento.request).then(nova => {
            // Guarda também imagens/recursos novos acessados online para uso offline.
            if (nova.ok && url.origin === self.location.origin) {
                const copia = nova.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(evento.request, copia));
            }
            return nova;
        }))
    );
});
