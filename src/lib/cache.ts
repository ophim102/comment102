// Cache utility for client-side caching
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private maxSize = 100 // Maximum number of items in cache

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) return null
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Clear cache for a specific pattern
  clearPattern(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const clientCache = new ClientCache()

// Cache keys
export const CACHE_KEYS = {
  COMMENTS: (topicId: string, userId?: string) => `comments_${topicId}_${userId || 'anonymous'}`,
  USER: (userId: string) => `user_${userId}`,
  TOPIC: (topicId: string) => `topic_${topicId}`,
} as const

// Cache TTL constants
export const CACHE_TTL = {
  COMMENTS: 5 * 60 * 1000, // 5 minutes
  USER: 30 * 60 * 1000, // 30 minutes
  TOPIC: 60 * 60 * 1000, // 1 hour
} as const
