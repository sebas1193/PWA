/* CACHE FIRST Cuando se usa esta estrategia es porque 
queremos primero consultar datos que estén almacenados en el dispositivo que en la red. 
Entiendo que es cuando algo no cambia recurrentemente. En este caso, como es para algo de gestión de usuarios, 
pues algo que no es crítico en el sistema de salud a menos que sea para laboratorios u otras cosas como cirugias. */

const CACHE_NAME = "medicare-pwa-v1";

// Archivos del "app shell": los recursos mínimos para que la app se vea y funcione
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
];

// El evento "install" se dispara cuando el service worker se instala por primera vez
self.addEventListener("install", (event) => {
  event.waitUntil(
    // crear cahe
    caches.open(CACHE_NAME).then((cache) => {
      // guardar cache
      return cache.addAll(APP_SHELL);
    })
  );
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  // peticiones
  if (event.request.method !== "GET") return;

  event.respondWith(
    // Primero buscamos en el caché
    caches.match(event.request).then((respuestaEnCache) => {
      if (respuestaEnCache) {
        return respuestaEnCache;
      }

      // Si no está en caché, entonces red
      return fetch(event.request).then((respuestaDeRed) => {
        const copiaParaCache = respuestaDeRed.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copiaParaCache);
        });
        // retorna lo encontrado
        return respuestaDeRed;
      });
    })
  );
});