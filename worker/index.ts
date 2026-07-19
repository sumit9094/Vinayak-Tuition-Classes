// Custom Service Worker logic for Web Push notifications
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
      (self as any).registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', (self as any).location.origin).href;

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any[]) => {
      // Focus existing window tab if matches
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window tab
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(urlToOpen);
      }
    })
  );
});
