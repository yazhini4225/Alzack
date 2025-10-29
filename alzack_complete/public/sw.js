self.addEventListener('push', function(event){ let data = {}; try{ data = event.data.json() }catch(e){} const title = data.title || 'Alzack'; const options = { body: data.body || '', data }; event.waitUntil(self.registration.showNotification(title, options)); });
self.addEventListener('notificationclick', function(event){ event.notification.close(); event.waitUntil(clients.openWindow('/')); });
