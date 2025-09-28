// Service Worker for ultra-aggressive caching
// Target: 300k+ daily traffic with free plans

const CACHE_NAME = 'comment-system-ultra-v1'
const STATIC_CACHE = 'static-ultra-v1'
const API_CACHE = 'api-ultra-v1'
const DYNAMIC_CACHE = 'dynamic-ultra-v1'

// Cache TTL (in milliseconds)
const CACHE_TTL = {
  STATIC: 365 * 24 * 60 * 60 * 1000, // 1 year
  API: 24 * 60 * 60 * 1000, // 24 hours
  DYNAMIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  COMMENTS: 24 * 60 * 60 * 1000, // 24 hours
  USERS: 7 * 24 * 60 * 60 * 1000, // 7 days
  TOPICS: 30 * 24 * 60 * 60 * 1000 // 30 days
}

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: ['/embed/', '/static/', '/assets/'],
  NETWORK_FIRST: ['/api/comments-ultra/'],
  STALE_WHILE_REVALIDATE: ['/api/users/', '/api/topics/'],
  NETWORK_ONLY: ['/api/comments/create', '/api/comments/update', '/api/comments/delete']
}

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/embed/comment-widget.js',
        '/static/comments/popular.json',
        '/static/users/active.json',
        '/static/topics/popular.json'
      ])
    }).then(() => {
      console.log('Static assets cached')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Determine cache strategy
  const strategy = getCacheStrategy(url.pathname)
  
  switch (strategy) {
    case 'CACHE_FIRST':
      event.respondWith(cacheFirst(request))
      break
    case 'NETWORK_FIRST':
      event.respondWith(networkFirst(request))
      break
    case 'STALE_WHILE_REVALIDATE':
      event.respondWith(staleWhileRevalidate(request))
      break
    case 'NETWORK_ONLY':
      event.respondWith(fetch(request))
      break
    default:
      event.respondWith(staleWhileRevalidate(request))
  }
})

// Get cache strategy for a path
function getCacheStrategy(pathname) {
  for (const [strategy, paths] of Object.entries(CACHE_STRATEGIES)) {
    if (paths.some(path => pathname.startsWith(path))) {
      return strategy
    }
  }
  return 'STALE_WHILE_REVALIDATE'
}

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache first strategy failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Offline', { status: 503 })
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(error => {
    console.log('Network request failed:', error)
    return cachedResponse || new Response('Offline', { status: 503 })
  })
  
  return cachedResponse || fetchPromise
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Sync offline comments
    const offlineComments = await getOfflineComments()
    for (const comment of offlineComments) {
      await syncComment(comment)
    }
    
    // Sync offline reactions
    const offlineReactions = await getOfflineReactions()
    for (const reaction of offlineReactions) {
      await syncReaction(reaction)
    }
    
    console.log('Background sync completed')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Get offline comments from IndexedDB
async function getOfflineComments() {
  return new Promise((resolve) => {
    const request = indexedDB.open('CommentCache', 1)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['comments'], 'readonly')
      const store = transaction.objectStore('comments')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result.filter(comment => comment.offline))
      }
    }
    request.onerror = () => resolve([])
  })
}

// Get offline reactions from IndexedDB
async function getOfflineReactions() {
  return new Promise((resolve) => {
    const request = indexedDB.open('CommentCache', 1)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['reactions'], 'readonly')
      const store = transaction.objectStore('reactions')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result.filter(reaction => reaction.offline))
      }
    }
    request.onerror = () => resolve([])
  })
}

// Sync comment to server
async function syncComment(comment) {
  try {
    const response = await fetch('/api/comments-ultra/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    })
    
    if (response.ok) {
      // Remove from offline storage
      await removeOfflineComment(comment.id)
      console.log('Comment synced:', comment.id)
    }
  } catch (error) {
    console.error('Failed to sync comment:', error)
  }
}

// Sync reaction to server
async function syncReaction(reaction) {
  try {
    const response = await fetch('/api/comments-ultra/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reaction)
    })
    
    if (response.ok) {
      // Remove from offline storage
      await removeOfflineReaction(reaction.id)
      console.log('Reaction synced:', reaction.id)
    }
  } catch (error) {
    console.error('Failed to sync reaction:', error)
  }
}

// Remove offline comment from IndexedDB
async function removeOfflineComment(commentId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('CommentCache', 1)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['comments'], 'readwrite')
      const store = transaction.objectStore('comments')
      store.delete(commentId)
      transaction.oncomplete = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

// Remove offline reaction from IndexedDB
async function removeOfflineReaction(reactionId) {
  return new Promise((resolve) => {
    const request = indexedDB.open('CommentCache', 1)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['reactions'], 'readwrite')
      const store = transaction.objectStore('reactions')
      store.delete(reactionId)
      transaction.oncomplete = () => resolve()
    }
    request.onerror = () => resolve()
  })
}

// Message handling for cache management
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches())
  }
  
  if (event.data && event.data.type === 'WARM_CACHE') {
    event.waitUntil(warmCache())
  }
})

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
  console.log('All caches cleared')
}

// Warm cache with popular content
async function warmCache() {
  try {
    const cache = await caches.open(API_CACHE)
    
    // Warm popular topics
    const popularTopics = await fetch('/api/comments-ultra/popular-topics')
    if (popularTopics.ok) {
      cache.put('/api/comments-ultra/popular-topics', popularTopics.clone())
    }
    
    // Warm active users
    const activeUsers = await fetch('/api/comments-ultra/active-users')
    if (activeUsers.ok) {
      cache.put('/api/comments-ultra/active-users', activeUsers.clone())
    }
    
    console.log('Cache warmed successfully')
  } catch (error) {
    console.error('Cache warming failed:', error)
  }
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    const cacheNames = await caches.keys()
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          const dateHeader = response.headers.get('date')
          if (dateHeader) {
            const responseDate = new Date(dateHeader)
            const age = Date.now() - responseDate.getTime()
            
            // Remove old entries
            if (age > CACHE_TTL.API) {
              await cache.delete(request)
            }
          }
        }
      }
    }
    console.log('Cache cleanup completed')
  } catch (error) {
    console.error('Cache cleanup failed:', error)
  }
}, 60 * 60 * 1000) // Run every hour

console.log('Service Worker loaded successfully')
