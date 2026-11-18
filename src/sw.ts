/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST?: Array<{ url: string; revision?: string | null } | string>;
};

const CACHE_NAME = 'pregmamas-offline-v3';

// Core offline pages requested for mothers without internet:
// Homepage (/), Danger Signs (/emergency, /danger-signs), Nutrition (/learn, /nutrition), Week-by-Week (/dashboard, /week-by-week)
const OFFLINE_CORE_URLS = [
  '/',
  '/index.html',
  '/emergency',
  '/danger-signs',
  '/learn',
  '/nutrition',
  '/dashboard',
  '/week-by-week',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

const BUILT_MANIFEST = self.__WB_MANIFEST;
const MANIFEST_URLS = Array.isArray(BUILT_MANIFEST)
  ? BUILT_MANIFEST.map((entry) => {
      const raw = typeof entry === 'string' ? entry : entry.url;
      return raw.startsWith('/') ? raw : `/${raw}`;
    })
  : [];

const PRECACHE_URLS = Array.from(new Set([...OFFLINE_CORE_URLS, ...MANIFEST_URLS]));

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve(false)))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept dynamic AI/API endpoints or cross-origin requests except Google Fonts
  const isGoogleFonts =
    url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isGoogleFonts) {
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname === '/googlecb4461bac1f9ee46.html') {
    return;
  }

  // Never serve stale cached Vite dev modules or service worker scripts
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/@fs/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname === '/dev-sw.js' ||
    url.pathname === '/sw.js'
  ) {
    return;
  }

  // Navigation requests (Homepage, Danger Signs, Nutrition, Week-by-Week, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const exact = await cache.match(request);
          if (exact) return exact;
          const rootFallback = (await cache.match('/')) || (await cache.match('/index.html'));
          if (rootFallback) return rootFallback;
          return new Response(
            '<!doctype html><html><body style="font-family:sans-serif;background:#fff0f6;color:#3f0d24;padding:24px;"><h1>PregMamas Offline</h1><p>You are offline, but you can still read Danger Signs and Nutrition.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Network-first for JS/CSS bundles so code updates take effect immediately, cache-first for static images & fonts
  const isCodeAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if (isCodeAsset) {
    event.respondWith(
      fetch(request)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || Response.error();
        })
    );
    return;
  }

  // Static images, icons & fonts: Cache-first with background refresh
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, res)).catch(() => {});
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(request).then((networkRes) => {
        if (networkRes && (networkRes.ok || networkRes.type === 'opaque')) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return networkRes;
      });
    })
  );
});

// Preserve PregMamas Supplement Alarm Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
      return undefined;
    })
  );
});
