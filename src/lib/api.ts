import axios from 'axios'
import { clientCache, CACHE_KEYS, CACHE_TTL } from './cache'
import { type Comment, type User, type Topic } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for caching
api.interceptors.request.use((config) => {
  // Add timestamp to prevent caching of POST/PUT/DELETE requests
  if (config.method !== 'get') {
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
  }
  return config
})

// Response interceptor for caching
api.interceptors.response.use(
  (response) => {
    // Cache GET requests
    if (response.config.method === 'get') {
      const cacheKey = response.config.url || ''
      clientCache.set(cacheKey, response.data, CACHE_TTL.COMMENTS)
    }
    return response
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const apiClient = {
  // Comments API
  comments: {
    async getComments(topicId: string, userId?: string): Promise<{ comments: Comment[] }> {
      const cacheKey = CACHE_KEYS.COMMENTS(topicId, userId)
      const cached = clientCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      const response = await api.get(`/comments?action=list&topicId=${topicId}&userId=${userId || ''}`)
      return response.data
    },

    async createComment(data: {
      topicId: string
      userId: string
      content: string
      parentId?: string
      username?: string
      userImg?: string
      userEmail?: string
      title?: string
      url?: string
    }): Promise<{ comment: Comment }> {
      const response = await api.post('/comments?action=create', data)
      
      // Clear cache for this topic
      clientCache.clearPattern(data.topicId)
      
      return response.data
    },

    async updateComment(commentId: string, content: string): Promise<{ comment: Comment }> {
      const response = await api.put('/comments?action=update', { commentId, content })
      
      // Clear all comment caches
      clientCache.clearPattern('comments_')
      
      return response.data
    },

    async deleteComment(commentId: string): Promise<{ success: boolean }> {
      const response = await api.delete(`/comments?action=delete&commentId=${commentId}`)
      
      // Clear all comment caches
      clientCache.clearPattern('comments_')
      
      return response.data
    },

    async toggleReaction(commentId: string, userId: string, reactionType: 'like' | 'dislike'): Promise<{ success: boolean }> {
      const response = await api.post('/comments?action=reaction', {
        commentId,
        userId,
        reactionType,
      })
      
      // Clear all comment caches
      clientCache.clearPattern('comments_')
      
      return response.data
    },
  },

  // Users API
  users: {
    async getOrCreateUser(externalId: string, username: string, avatarUrl?: string, email?: string): Promise<User> {
      const cacheKey = CACHE_KEYS.USER(externalId)
      const cached = clientCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      // This would typically be handled by the comments API
      // For now, we'll create a mock user
      const user: User = {
        id: `user_${externalId}`,
        external_id: externalId,
        username,
        avatar_url: avatarUrl,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      clientCache.set(cacheKey, user, CACHE_TTL.USER)
      return user
    },
  },

  // Topics API
  topics: {
    async getOrCreateTopic(externalId: string, title?: string, url?: string): Promise<Topic> {
      const cacheKey = CACHE_KEYS.TOPIC(externalId)
      const cached = clientCache.get(cacheKey)
      
      if (cached) {
        return cached
      }

      // This would typically be handled by the comments API
      // For now, we'll create a mock topic
      const topic: Topic = {
        id: `topic_${externalId}`,
        external_id: externalId,
        title,
        url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      clientCache.set(cacheKey, topic, CACHE_TTL.TOPIC)
      return topic
    },
  },
}

export default api
