
// Service Worker para notificaciones push y cache
const CACHE_NAME = 'hablando-caballos-v1';
const STATIC_CACHE = [
  '/',
  '/foros',
  '/hall',
  '/noticias',
  '/en-vivo',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalado');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache creado, agregando archivos estáticos');
        return cache.addAll(STATIC_CACHE);
      })
      .catch((error) => {
        console.error('❌ Error al crear cache:', error);
      })
  );
  
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar control inmediato de todas las páginas
  self.clients.claim();
});

// Estrategia de cache: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests de extensiones del navegador
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.startsWith('moz-extension://')) return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback para páginas HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html') || new Response(
                '<h1>Sin conexión</h1><p>No hay conexión a internet disponible.</p>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }
            
            return new Response('Recurso no disponible offline', { status: 404 });
          });
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('📱 Notificación push recibida');
  
  let notificationData = {
    title: 'Hablando de Caballos',
    body: 'Nueva actividad en el foro',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'general',
    data: {
      url: '/'
    }
  };
  
  // Parsear datos si están disponibles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('❌ Error parseando datos push:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Ver',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ],
      requireInteraction: false,
      silent: false
    })
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Obtener URL de destino
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana abierta con la URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Manejo de sincronización en background
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronización en background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos pendientes
      fetch('/api/sync')
        .then(response => {
          console.log('✅ Sincronización completada');
        })
        .catch(error => {
          console.error('❌ Error en sincronización:', error);
        })
    );
  }
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  console.log('💬 Mensaje recibido en SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
