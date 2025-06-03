// Bump the cache version to invalidate old caches on new deployments
const CACHE_NAME = 'financely-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
  // Add other important assets here
];

// Install a service worker
self.addEventListener('install', event => {
  // Activate the new Service Worker as soon as it finishes installing
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('Opened cache');
    for (const url of urlsToCache) {
      try {
        await cache.add(url);
      } catch (e) {
        console.error('Failed to cache', url, e);
      }
    }
  })());
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Ignore non-HTTP requests such as chrome-extension:// URLs
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Successful response - update the cache in the background
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (!event.request.url.includes('/api/')) {
            cache.put(event.request, responseClone);
          }
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
      // Take control of uncontrolled clients after activation
      await self.clients.claim();
    })()
  );
});

// Handle background sync for offline capabilities
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Example function to sync pending transactions
async function syncTransactions() {
  try {
    const db = await openIndexedDB();
    const pendingTransactions = await getPendingTransactions(db);
    
    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });
        
        if (response.ok) {
          await markTransactionAsSynced(db, transaction.id);
        }
      } catch (error) {
        console.error('Error syncing transaction:', error);
      }
    }
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// Helper functions for IndexedDB operations
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('financely-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        db.createObjectStore('pendingTransactions', { keyPath: 'id' });
      }
    };
  });
}

function getPendingTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTransactions'], 'readonly');
    const store = transaction.objectStore('pendingTransactions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markTransactionAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTransactions'], 'readwrite');
    const store = transaction.objectStore('pendingTransactions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}