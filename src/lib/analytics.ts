// Analytics and monitoring utilities

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
}

interface CommentAnalytics {
  commentId: string
  topicId: string
  action: 'create' | 'update' | 'delete' | 'like' | 'dislike' | 'reply'
  duration?: number
  metadata?: Record<string, any>
}

class Analytics {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private userId?: string
  private isEnabled: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = (import.meta as any).env?.VITE_ENABLE_ANALYTICS === 'true'
    
    // Track page load
    this.track('page_load', {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    }

    this.events.push(analyticsEvent)
    
    // Send to analytics service (implement based on your needs)
    this.sendToAnalytics(analyticsEvent)
  }

  private async sendToAnalytics(event: AnalyticsEvent) {
    try {
      // Send to your analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // Comment-specific analytics
  trackCommentAction(analytics: CommentAnalytics) {
    this.track('comment_action', {
      commentId: analytics.commentId,
      topicId: analytics.topicId,
      action: analytics.action,
      duration: analytics.duration,
      ...analytics.metadata
    })
  }

  // Performance tracking
  trackPerformance(label: string, fn: () => Promise<any> | any) {
    const endTiming = this.performanceMonitor.startTiming(label)
    
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(endTiming)
    } else {
      endTiming()
      return result
    }
  }

  // User engagement tracking
  trackEngagement(action: string, target: string, value?: any) {
    this.track('user_engagement', {
      action,
      target,
      value,
      page: window.location.pathname
    })
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      page: window.location.pathname
    })
  }

  // Get analytics data
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics()
  }

  // Clear analytics data
  clear() {
    this.events = []
    this.performanceMonitor.clear()
  }
}

// Real-time monitoring
class RealTimeMonitor {
  private metrics: Map<string, number> = new Map()
  private observers: Set<(metrics: Record<string, number>) => void> = new Set()

  updateMetric(key: string, value: number) {
    this.metrics.set(key, value)
    this.notifyObservers()
  }

  incrementMetric(key: string, amount: number = 1) {
    const current = this.metrics.get(key) || 0
    this.metrics.set(key, current + amount)
    this.notifyObservers()
  }

  getMetric(key: string): number {
    return this.metrics.get(key) || 0
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  subscribe(callback: (metrics: Record<string, number>) => void) {
    this.observers.add(callback)
    return () => this.observers.delete(callback)
  }

  private notifyObservers() {
    const metrics = this.getAllMetrics()
    this.observers.forEach(callback => callback(metrics))
  }
}

// Health check monitoring
class HealthMonitor {
  private checks: Map<string, () => Promise<boolean>> = new Map()
  private status: Map<string, boolean> = new Map()
  private lastCheck: Map<string, number> = new Map()

  addCheck(name: string, checkFn: () => Promise<boolean>) {
    this.checks.set(name, checkFn)
  }

  async runCheck(name: string): Promise<boolean> {
    const checkFn = this.checks.get(name)
    if (!checkFn) return false

    try {
      const result = await checkFn()
      this.status.set(name, result)
      this.lastCheck.set(name, Date.now())
      return result
    } catch (error) {
      console.error(`Health check failed for ${name}:`, error)
      this.status.set(name, false)
      this.lastCheck.set(name, Date.now())
      return false
    }
  }

  async runAllChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const [name] of this.checks) {
      results[name] = await this.runCheck(name)
    }
    
    return results
  }

  getStatus(name: string): boolean | undefined {
    return this.status.get(name)
  }

  getLastCheck(name: string): number | undefined {
    return this.lastCheck.get(name)
  }

  getAllStatus(): Record<string, { status: boolean; lastCheck: number }> {
    const result: Record<string, { status: boolean; lastCheck: number }> = {}
    
    for (const [name] of this.checks) {
      result[name] = {
        status: this.status.get(name) || false,
        lastCheck: this.lastCheck.get(name) || 0
      }
    }
    
    return result
  }
}

// Create global instances
export const analytics = new Analytics()
export const realTimeMonitor = new RealTimeMonitor()
export const healthMonitor = new HealthMonitor()

// Add health checks
healthMonitor.addCheck('api', async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch {
    return false
  }
})

healthMonitor.addCheck('database', async () => {
  try {
    const response = await fetch('/api/comments/list?topicId=health-check')
    return response.status !== 500
  } catch {
    return false
  }
})

// Track comment system metrics
export const commentMetrics = {
  trackCommentCreated: (commentId: string, topicId: string, duration: number) => {
    analytics.trackCommentAction({
      commentId,
      topicId,
      action: 'create',
      duration
    })
    realTimeMonitor.incrementMetric('comments_created')
  },

  trackCommentUpdated: (commentId: string, topicId: string) => {
    analytics.trackCommentAction({
      commentId,
      topicId,
      action: 'update'
    })
    realTimeMonitor.incrementMetric('comments_updated')
  },

  trackCommentDeleted: (commentId: string, topicId: string) => {
    analytics.trackCommentAction({
      commentId,
      topicId,
      action: 'delete'
    })
    realTimeMonitor.incrementMetric('comments_deleted')
  },

  trackReaction: (commentId: string, topicId: string, reactionType: 'like' | 'dislike') => {
    analytics.trackCommentAction({
      commentId,
      topicId,
      action: reactionType
    })
    realTimeMonitor.incrementMetric(`reactions_${reactionType}`)
  },

  trackReply: (commentId: string, topicId: string, parentId: string) => {
    analytics.trackCommentAction({
      commentId,
      topicId,
      action: 'reply',
      metadata: { parentId }
    })
    realTimeMonitor.incrementMetric('replies_created')
  },

  trackPageView: (topicId: string) => {
    analytics.track('page_view', { topicId })
    realTimeMonitor.incrementMetric('page_views')
  },

  trackUserEngagement: (action: string, target: string, value?: any) => {
    analytics.trackEngagement(action, target, value)
    realTimeMonitor.incrementMetric('user_engagements')
  }
}

// Export analytics utilities
export const analyticsUtils = {
  analytics,
  realTimeMonitor,
  healthMonitor,
  commentMetrics
}
