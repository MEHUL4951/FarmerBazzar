// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDpb2LZG4K9SwBtLcjPgUIVMgu9T-9Q3Ss",
  authDomain: "farmer-bazzar.firebaseapp.com",
  projectId: "farmer-bazzar",
  storageBucket: "farmer-bazzar.firebasestorage.app",
  messagingSenderId: "947822862899",
  appId: "1:947822862899:web:e3cbc377c4a604d0313946",
  measurementId: "G-K189DEZCWV",
  vapidKey: "BPNOgx9ilCHbbNmVXMumVjycclyUpK0Xeex4QDBIs8TMCKImzfakcI2sU3QOGC77n7XXLsZ7w5qCpm6xe14dKUI",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'Farmer Bazaar Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update!',
    icon: '/assets/icons/icon-96x96.png',           // larger icon
    badge: '/assets/icons/badge-icon.png',          // small monochrome icon
    vibrate: [200, 100, 200],                        // vibration pattern
    image: payload.notification?.image || undefined, // big image if provided
    data: {
      url: payload.data?.click_action || '/',       // default action
      ...payload.data                                // preserve other data
    },
    actions: [
      {
        action: 'open_app',
        title: 'Open App',
        icon: '/assets/icons/open-icon.png'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Make notification clickable
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const clickAction = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if app is already open
      for (let client of windowClients) {
        if (client.url.includes(clickAction) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
