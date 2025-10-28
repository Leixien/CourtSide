/**
 * Service Worker for Push Notifications
 * Handles background push notification events
 */

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();

    const title = data.title || 'CourtSide';
    const options = {
      body: data.body || 'New activity',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      image: data.image,
      tag: data.tag || 'notification',
      data: {
        url: data.url || '/',
        matchId: data.matchId,
        playerId: data.playerId,
      },
      actions: data.actions || [
        { action: 'open', title: 'View Match' },
        { action: 'close', title: 'Dismiss' },
      ],
      vibrate: [200, 100, 200],
      requireInteraction: false,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/matches';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if window is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
