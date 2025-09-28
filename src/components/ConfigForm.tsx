import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Save, TestTube, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

interface ConfigFormProps {
  initialConfig?: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  onSave?: (config: any) => void
  onTest?: (config: any) => void
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  initialConfig = {
    url: '',
    anonKey: '',
    serviceRoleKey: ''
  },
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState(initialConfig)
  const [showKeys, setShowKeys] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSave = async () => {
    setLoading(true)
    try {
      if (onSave) {
        await onSave(config)
      }
      toast.success('Cấu hình đã được lưu!')
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình')
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      if (onTest) {
        await onTest(config)
        setTestResult({ success: true, message: 'Kết nối thành công!' })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Lỗi khi test kết nối'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateConfig = () => {
    if (!config.url || !config.anonKey) {
      return false
    }
    return true
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Cấu hình Supabase
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-project.supabase.co"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              URL của Supabase project
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anon Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.anonKey}
                onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                required
              />
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Public key để truy cập Supabase API
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Role Key
            </label>
            <div className="relative">
              <input
                type={showKeys ? 'text' : 'password'}
                value={config.serviceRoleKey}
                onChange={(e) => setConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Private key để thực hiện các thao tác admin
            </p>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-md ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`ml-2 text-sm font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          disabled={loading || !validateConfig()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
        
        <button
          onClick={handleTest}
          disabled={loading || !validateConfig()}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TestTube className="w-4 h-4 mr-2" />
          {loading ? 'Đang test...' : 'Test kết nối'}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Hướng dẫn lấy thông tin:
        </h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Truy cập <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
          <li>2. Chọn project của bạn</li>
          <li>3. Vào Settings → API</li>
          <li>4. Copy Project URL và API keys</li>
        </ol>
      </div>
    </div>
  )
}

export default ConfigForm
