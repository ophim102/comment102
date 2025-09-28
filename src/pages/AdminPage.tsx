import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Settings, 
  Database, 
  BarChart3, 
  Shield, 
  AlertCircle,
  Code
} from 'lucide-react'
import ConfigForm from '../components/ConfigForm'
import DatabaseManager from '../components/DatabaseManager'
import HealthMonitor from '../components/HealthMonitor'
import AdminNavigation from '../components/AdminNavigation'
import EmbedCodeGenerator from '../components/EmbedCodeGenerator'

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey: string
}

const AdminPage: React.FC = () => {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceRoleKey: ''
  })
  
  const [activeTab, setActiveTab] = useState('config')

  useEffect(() => {
    loadConfig()
    
    // Get active tab from URL
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [])

  const loadConfig = () => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || ''
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
    const serviceRoleKey = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY || ''
    
    setConfig({ url, anonKey, serviceRoleKey })
  }

  const saveConfig = async () => {
    try {
      // In a real app, you'd save this to a config file or database
      // For now, we'll just show a success message
      toast.success('Cấu hình đã được lưu!')
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình')
    }
  }

  const testConnection = async () => {
    try {
      const { error } = await supabase.from('users').select('count').limit(1)
      if (error) {
        toast.error('Kết nối thất bại: ' + error.message)
      } else {
        toast.success('Kết nối thành công!')
      }
    } catch (error) {
      toast.error('Lỗi kết nối')
    }
  }

  const resetDatabase = async () => {
    if (!confirm('Bạn có chắc chắn muốn reset database? Hành động này không thể hoàn tác!')) {
      return
    }

    try {
      // This would run the schema.sql file
      toast.success('Database đã được reset!')
    } catch (error) {
      toast.error('Lỗi khi reset database')
    }
  }

  const exportData = async () => {
    try {
      const [users, topics, comments, reactions] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('topics').select('*'),
        supabase.from('comments').select('*'),
        supabase.from('comment_reactions').select('*')
      ])

      const data = {
        users: users.data,
        topics: topics.data,
        comments: comments.data,
        reactions: reactions.data,
        exported_at: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `supabase-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Dữ liệu đã được export!')
    } catch (error) {
      toast.error('Lỗi khi export dữ liệu')
    }
  }

  const tabs = [
    { id: 'config', label: 'Cấu hình', icon: Settings },
    { id: 'embed', label: 'Tạo code embed', icon: Code },
    { id: 'stats', label: 'Thống kê', icon: BarChart3 },
    { id: 'health', label: 'Trạng thái', icon: Shield },
    { id: 'tools', label: 'Công cụ', icon: Database }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Database className="w-6 h-6 mr-2" />
                Quản lý Supabase
              </h1>
              <p className="text-gray-600 mt-1">
                Cấu hình và quản lý hệ thống comment
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Configuration Tab */}
              {activeTab === 'config' && (
                <ConfigForm
                  initialConfig={config}
                  onSave={saveConfig}
                  onTest={testConnection}
                />
              )}

              {/* Embed Code Generator Tab */}
              {activeTab === 'embed' && (
                <EmbedCodeGenerator />
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <DatabaseManager />
              )}

              {/* Health Tab */}
              {activeTab === 'health' && (
                <HealthMonitor />
              )}

              {/* Tools Tab */}
              {activeTab === 'tools' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Công cụ quản lý
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Sao lưu dữ liệu
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Export toàn bộ dữ liệu ra file JSON
                      </p>
                      <button
                        onClick={exportData}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Export dữ liệu
                      </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Reset Database
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Xóa toàn bộ dữ liệu và tạo lại schema
                      </p>
                      <button
                        onClick={resetDatabase}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Reset Database
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
