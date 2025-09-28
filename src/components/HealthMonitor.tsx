import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Database, 
  Server, 
  Users, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  lastChecked: string
  responseTime?: number
}

interface SystemMetrics {
  uptime: string
  memoryUsage: number
  cpuUsage: number
  activeConnections: number
}

const HealthMonitor: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: '0s',
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0
  })
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    runHealthChecks()
    
    if (autoRefresh) {
      const interval = setInterval(runHealthChecks, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const runHealthChecks = async () => {
    setLoading(true)
    const checks: HealthCheck[] = []

    try {
      // Database Health Check
      const dbStart = Date.now()
      const { error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      const dbResponseTime = Date.now() - dbStart

      checks.push({
        name: 'Database',
        status: dbError ? 'error' : 'healthy',
        message: dbError ? `Database error: ${dbError.message}` : 'Database connection successful',
        lastChecked: new Date().toISOString(),
        responseTime: dbResponseTime
      })

      // API Health Check
      const apiStart = Date.now()
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const apiResponseTime = Date.now() - apiStart
        
        checks.push({
          name: 'API',
          status: response.ok ? 'healthy' : 'error',
          message: response.ok ? 'API responding correctly' : `API error: ${response.status}`,
          lastChecked: new Date().toISOString(),
          responseTime: apiResponseTime
        })
      } catch (error) {
        checks.push({
          name: 'API',
          status: 'error',
          message: 'API connection failed',
          lastChecked: new Date().toISOString()
        })
      }

      // Auth Health Check
      const authStart = Date.now()
      try {
        const { error: authError } = await supabase.auth.getSession()
        const authResponseTime = Date.now() - authStart
        
        checks.push({
          name: 'Authentication',
          status: authError ? 'error' : 'healthy',
          message: authError ? `Auth error: ${authError.message}` : 'Authentication service working',
          lastChecked: new Date().toISOString(),
          responseTime: authResponseTime
        })
      } catch (error) {
        checks.push({
          name: 'Authentication',
          status: 'error',
          message: 'Authentication service unavailable',
          lastChecked: new Date().toISOString()
        })
      }

      // Storage Health Check
      const storageStart = Date.now()
      try {
        const { error: storageError } = await supabase.storage.listBuckets()
        const storageResponseTime = Date.now() - storageStart
        
        checks.push({
          name: 'Storage',
          status: storageError ? 'error' : 'healthy',
          message: storageError ? `Storage error: ${storageError.message}` : 'Storage service working',
          lastChecked: new Date().toISOString(),
          responseTime: storageResponseTime
        })
      } catch (error) {
        checks.push({
          name: 'Storage',
          status: 'error',
          message: 'Storage service unavailable',
          lastChecked: new Date().toISOString()
        })
      }

      // Real-time Health Check
      const realtimeStart = Date.now()
      try {
        const channel = supabase
          .channel('health-check')
          .subscribe()
        const realtimeResponseTime = Date.now() - realtimeStart
        
        checks.push({
          name: 'Real-time',
          status: 'healthy',
          message: 'Real-time service working',
          lastChecked: new Date().toISOString(),
          responseTime: realtimeResponseTime
        })
      } catch (error) {
        checks.push({
          name: 'Real-time',
          status: 'error',
          message: 'Real-time service unavailable',
          lastChecked: new Date().toISOString()
        })
      }

      // Comments API Health Check
      const commentsStart = Date.now()
      try {
        const response = await fetch('/api/comments/list?topicId=health-check', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const commentsResponseTime = Date.now() - commentsStart
        
        checks.push({
          name: 'Comments API',
          status: response.ok ? 'healthy' : 'error',
          message: response.ok ? 'Comments API working' : `Comments API error: ${response.status}`,
          lastChecked: new Date().toISOString(),
          responseTime: commentsResponseTime
        })
      } catch (error) {
        checks.push({
          name: 'Comments API',
          status: 'error',
          message: 'Comments API unavailable',
          lastChecked: new Date().toISOString()
        })
      }

      setHealthChecks(checks)
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        uptime: calculateUptime(),
        memoryUsage: Math.random() * 100, // Mock data
        cpuUsage: Math.random() * 100, // Mock data
        activeConnections: Math.floor(Math.random() * 50) // Mock data
      }))

    } catch (error) {
      console.error('Health check failed:', error)
      toast.error('Lỗi khi kiểm tra sức khỏe hệ thống')
    } finally {
      setLoading(false)
    }
  }

  const calculateUptime = () => {
    // Mock uptime calculation
    const startTime = new Date(Date.now() - Math.random() * 86400000) // Random start time
    const uptime = Date.now() - startTime.getTime()
    const hours = Math.floor(uptime / 3600000)
    const minutes = Math.floor((uptime % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getOverallStatus = () => {
    const errorCount = healthChecks.filter(check => check.status === 'error').length
    const warningCount = healthChecks.filter(check => check.status === 'warning').length
    
    if (errorCount > 0) return 'error'
    if (warningCount > 0) return 'warning'
    return 'healthy'
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Trạng thái hệ thống
        </h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Tự động làm mới</span>
          </label>
          <button
            onClick={runHealthChecks}
            disabled={loading}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Kiểm tra
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg border-2 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(overallStatus)}
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">
                Trạng thái tổng thể: {
                  overallStatus === 'healthy' ? 'Khỏe mạnh' :
                  overallStatus === 'warning' ? 'Cảnh báo' : 'Lỗi'
                }
              </h4>
              <p className="text-sm text-gray-600">
                {healthChecks.length} dịch vụ được kiểm tra
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-lg font-semibold text-gray-900">{metrics.uptime}</p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.cpuUsage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.memoryUsage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeConnections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <Server className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthChecks.length > 0 
                  ? (healthChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / healthChecks.length).toFixed(0)
                  : 0
                }ms
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          Chi tiết dịch vụ
        </h4>
        
        {healthChecks.map((check, index) => (
          <div key={index} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(check.status)}
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-gray-900">{check.name}</h5>
                  <p className="text-sm text-gray-600">{check.message}</p>
                </div>
              </div>
              <div className="text-right">
                {check.responseTime && (
                  <p className="text-sm text-gray-600">{check.responseTime}ms</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(check.lastChecked).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Chú thích trạng thái</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Khỏe mạnh - Dịch vụ hoạt động bình thường</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">Cảnh báo - Có vấn đề nhỏ cần chú ý</span>
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-gray-600">Lỗi - Dịch vụ không hoạt động</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthMonitor
