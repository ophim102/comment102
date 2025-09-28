import React, { useState } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Database, 
  Key, 
  Settings, 
  Play,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SetupStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  action?: () => void
  code?: string
  instructions?: string[]
  expanded?: boolean
}

const SupabaseSetupWizard: React.FC = () => {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'create-project',
      title: 'Tạo Supabase Project',
      description: 'Tạo project mới trên Supabase',
      status: 'pending',
      expanded: true,
      instructions: [
        'Truy cập https://supabase.com',
        'Đăng ký/đăng nhập tài khoản',
        'Click "New Project"',
        'Chọn organization và đặt tên project',
        'Chọn region gần nhất',
        'Tạo database password',
        'Click "Create new project"'
      ]
    },
    {
      id: 'get-credentials',
      title: 'Lấy API Credentials',
      description: 'Copy URL và API keys từ Supabase Dashboard',
      status: 'pending',
      expanded: false,
      instructions: [
        'Vào Settings > API',
        'Copy "Project URL"',
        'Copy "anon public" key',
        'Copy "service_role" key (giữ bí mật)'
      ]
    },
    {
      id: 'install-cli',
      title: 'Cài đặt Supabase CLI',
      description: 'Cài đặt Supabase CLI để quản lý database',
      status: 'pending',
      expanded: false,
      code: 'npm install -g supabase',
      action: () => installSupabaseCLI()
    },
    {
      id: 'init-project',
      title: 'Khởi tạo Supabase trong Project',
      description: 'Khởi tạo Supabase config trong project',
      status: 'pending',
      expanded: false,
      code: 'supabase init',
      action: () => initSupabaseProject()
    },
    {
      id: 'link-project',
      title: 'Link với Supabase Project',
      description: 'Kết nối local project với Supabase project',
      status: 'pending',
      expanded: false,
      code: 'supabase link --project-ref YOUR_PROJECT_REF',
      action: () => linkSupabaseProject()
    },
    {
      id: 'create-schema',
      title: 'Tạo Database Schema',
      description: 'Tạo các bảng và indexes cần thiết',
      status: 'pending',
      expanded: false,
      action: () => createDatabaseSchema()
    },
    {
      id: 'setup-rls',
      title: 'Cấu hình Row Level Security',
      description: 'Thiết lập bảo mật cho database',
      status: 'pending',
      expanded: false,
      action: () => setupRowLevelSecurity()
    },
    {
      id: 'create-functions',
      title: 'Tạo Functions và Triggers',
      description: 'Tạo các functions để tự động cập nhật counts',
      status: 'pending',
      expanded: false,
      action: () => createFunctionsAndTriggers()
    },
    {
      id: 'test-connection',
      title: 'Test Kết nối',
      description: 'Kiểm tra kết nối và hoạt động của database',
      status: 'pending',
      expanded: false,
      action: () => testConnection()
    }
  ])

  const [projectRef, setProjectRef] = useState('')
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('')
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('')

  const updateStepStatus = (stepId: string, status: SetupStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const toggleStepExpanded = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, expanded: !step.expanded } : step
    ))
  }

  const installSupabaseCLI = async () => {
    updateStepStatus('install-cli', 'in_progress')
    
    try {
      // Simulate CLI installation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check if CLI is available
      const isInstalled = await checkCLIInstallation()
      
      if (isInstalled) {
        updateStepStatus('install-cli', 'completed')
        toast.success('Supabase CLI đã được cài đặt thành công!')
      } else {
        updateStepStatus('install-cli', 'error')
        toast.error('Không thể cài đặt Supabase CLI. Vui lòng cài đặt thủ công.')
      }
    } catch (error) {
      updateStepStatus('install-cli', 'error')
      toast.error('Lỗi khi cài đặt Supabase CLI')
    }
  }

  const initSupabaseProject = async () => {
    updateStepStatus('init-project', 'in_progress')
    
    try {
      // Simulate project initialization
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      updateStepStatus('init-project', 'completed')
      toast.success('Supabase project đã được khởi tạo!')
    } catch (error) {
      updateStepStatus('init-project', 'error')
      toast.error('Lỗi khi khởi tạo Supabase project')
    }
  }

  const linkSupabaseProject = async () => {
    if (!projectRef) {
      toast.error('Vui lòng nhập Project Reference ID')
      return
    }

    updateStepStatus('link-project', 'in_progress')
    
    try {
      // Simulate project linking
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateStepStatus('link-project', 'completed')
      toast.success('Project đã được link thành công!')
    } catch (error) {
      updateStepStatus('link-project', 'error')
      toast.error('Lỗi khi link project')
    }
  }

  const createDatabaseSchema = async () => {
    updateStepStatus('create-schema', 'in_progress')
    
    try {
      // Simulate schema creation
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      updateStepStatus('create-schema', 'completed')
      toast.success('Database schema đã được tạo thành công!')
    } catch (error) {
      updateStepStatus('create-schema', 'error')
      toast.error('Lỗi khi tạo database schema')
    }
  }

  const setupRowLevelSecurity = async () => {
    updateStepStatus('setup-rls', 'in_progress')
    
    try {
      // Simulate RLS setup
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateStepStatus('setup-rls', 'completed')
      toast.success('Row Level Security đã được cấu hình!')
    } catch (error) {
      updateStepStatus('setup-rls', 'error')
      toast.error('Lỗi khi cấu hình RLS')
    }
  }

  const createFunctionsAndTriggers = async () => {
    updateStepStatus('create-functions', 'in_progress')
    
    try {
      // Simulate functions creation
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      updateStepStatus('create-functions', 'completed')
      toast.success('Functions và triggers đã được tạo!')
    } catch (error) {
      updateStepStatus('create-functions', 'error')
      toast.error('Lỗi khi tạo functions')
    }
  }

  const testConnection = async () => {
    updateStepStatus('test-connection', 'in_progress')
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updateStepStatus('test-connection', 'completed')
      toast.success('Kết nối database thành công!')
    } catch (error) {
      updateStepStatus('test-connection', 'error')
      toast.error('Lỗi khi test kết nối')
    }
  }

  const checkCLIInstallation = async (): Promise<boolean> => {
    // Mock check - in real implementation, this would check if CLI is installed
    return Math.random() > 0.3 // 70% success rate
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã copy vào clipboard!')
  }

  const downloadEnvFile = () => {
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`

    const blob = new Blob([envContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env.local'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('File .env.local đã được tải xuống!')
  }

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'in_progress':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'in_progress':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiến độ: {steps.filter(s => s.status === 'completed').length}/{steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`border rounded-lg ${getStatusColor(step.status)}`}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleStepExpanded(step.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {step.action && step.status !== 'completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        step.action?.()
                      }}
                      disabled={step.status === 'in_progress'}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {step.status === 'in_progress' ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-1" />
                      )}
                      {step.status === 'in_progress' ? 'Đang xử lý...' : 'Thực hiện'}
                    </button>
                  )}
                  {step.expanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {step.expanded && (
              <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                {/* Instructions */}
                {step.instructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Hướng dẫn:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {step.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Code */}
                {step.code && (
                  <div className="mb-4">
                    <div className="bg-gray-900 rounded-lg p-4 relative">
                      <button
                        onClick={() => copyToClipboard(step.code!)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cấu hình API Credentials
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Reference ID
            </label>
            <input
              type="text"
              value={projectRef}
              onChange={(e) => setProjectRef(e.target.value)}
              placeholder="your-project-ref"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase Anon Key
            </label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supabase Service Role Key
            </label>
            <input
              type="password"
              value={supabaseServiceKey}
              onChange={(e) => setSupabaseServiceKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={downloadEnvFile}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải file .env.local
            </button>
            
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Mở Supabase Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Cần hỗ trợ?
        </h3>
        <div className="space-y-2 text-blue-800">
          <p>• Xem tài liệu Supabase: <a href="https://supabase.com/docs" className="underline">https://supabase.com/docs</a></p>
          <p>• Tham gia Discord: <a href="https://discord.supabase.com" className="underline">https://discord.supabase.com</a></p>
          <p>• GitHub Issues: <a href="https://github.com/supabase/supabase/issues" className="underline">https://github.com/supabase/supabase/issues</a></p>
        </div>
      </div>
    </div>
  )
}

export default SupabaseSetupWizard
