import { precacheAndRoute } from 'workbox-precaching';

declare const self: any;

// Precache resources. The build tool will inject self.__WB_MANIFEST here.
precacheAndRoute(self.__WB_MANIFEST || []);

// Listen for push events
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Vinayak Tuition Classes';
    const options = {
      body: data.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

// Handle notification click events
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any[]) => {
      // Focus existing window tab if matches
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
