import { precacheAndRoute } from 'workbox-precaching';

declare const self: any;

// Force activate service worker immediately on install
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  event.waitUntil(self.clients.claim());
});

// Precache resources. The build tool will inject self.__WB_MANIFEST here.
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen for push events
self.addEventListener('push', (event: any) => {
  let title = 'Vinayak Tuition Classes';
  let body = '';
  let url = '/';

  if (event?.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      url = data.url || url;
    } catch (err) {
      try {
        body = event.data.text();
      } catch (e) {}
    }
  }

  let iconUrl = 'https://vinayak-tuition.vercel.app/logo.png';
  let badgeUrl = 'https://vinayak-tuition.vercel.app/badge.png';

  try {
    if (self.location?.origin) {
      iconUrl = new URL('/logo.png', self.location.origin).href;
      badgeUrl = new URL('/badge.png', self.location.origin).href;
    }
  } catch (e) {}

  const options: any = {
    body,
    icon: iconUrl,
    badge: badgeUrl,
    vibrate: [200, 100, 200],
    tag: 'vtc-notification',
    renotify: true,
    data: {
      url
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any[]) => {
      // 1. If exact matching tab is open, focus it
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Handle "app already open" case: navigate existing open tab to new deep link & focus
      const openClient = windowClients.find((client: any) => 'navigate' in client && 'focus' in client);
      if (openClient) {
        return openClient.navigate(urlToOpen).then((c: any) => c?.focus() || openClient.focus());
      }
      // 3. Fallback: Open a fresh window tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
