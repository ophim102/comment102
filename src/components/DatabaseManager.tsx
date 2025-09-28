import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface DatabaseStats {
  users: number
  topics: number
  comments: number
  reactions: number
}

interface TableInfo {
  name: string
  count: number
  size: string
  lastUpdated: string
}

const DatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    topics: 0,
    comments: 0,
    reactions: 0
  })
  
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
    loadTables()
  }, [])

  const loadStats = async () => {
    try {
      const [usersResult, topicsResult, commentsResult, reactionsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('topics').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('comment_reactions').select('*', { count: 'exact', head: true })
      ])

      setStats({
        users: usersResult.count || 0,
        topics: topicsResult.count || 0,
        comments: commentsResult.count || 0,
        reactions: reactionsResult.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Lỗi khi tải thống kê')
    }
  }

  const loadTables = async () => {
    try {
      // Get table information
      const { data, error } = await supabase
        .rpc('get_table_info')
        .select('*')

      if (error) {
        // Fallback to manual table info
        setTables([
          { name: 'users', count: stats.users, size: 'N/A', lastUpdated: 'N/A' },
          { name: 'topics', count: stats.topics, size: 'N/A', lastUpdated: 'N/A' },
          { name: 'comments', count: stats.comments, size: 'N/A', lastUpdated: 'N/A' },
          { name: 'comment_reactions', count: stats.reactions, size: 'N/A', lastUpdated: 'N/A' }
        ])
      } else {
        setTables(data || [])
      }
    } catch (error) {
      console.error('Error loading tables:', error)
    }
  }

  const exportTable = async (tableName: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')

      if (error) throw error

      const exportData = {
        table: tableName,
        data: data,
        exported_at: new Date().toISOString(),
        count: data.length
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${tableName}-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success(`Đã export bảng ${tableName}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(`Lỗi khi export bảng ${tableName}`)
    } finally {
      setLoading(false)
    }
  }

  const exportAllData = async () => {
    setLoading(true)
    try {
      const [users, topics, comments, reactions] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('topics').select('*'),
        supabase.from('comments').select('*'),
        supabase.from('comment_reactions').select('*')
      ])

      const exportData = {
        users: users.data,
        topics: topics.data,
        comments: comments.data,
        reactions: reactions.data,
        exported_at: new Date().toISOString(),
        summary: {
          users: users.data?.length || 0,
          topics: topics.data?.length || 0,
          comments: comments.data?.length || 0,
          reactions: reactions.data?.length || 0
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `supabase-full-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Đã export toàn bộ dữ liệu')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Lỗi khi export dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const clearTable = async (tableName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ dữ liệu trong bảng ${tableName}?`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

      if (error) throw error

      toast.success(`Đã xóa dữ liệu bảng ${tableName}`)
      loadStats()
      loadTables()
    } catch (error) {
      console.error('Clear table error:', error)
      toast.error(`Lỗi khi xóa bảng ${tableName}`)
    } finally {
      setLoading(false)
    }
  }

  const resetDatabase = async () => {
    if (!confirm('Bạn có chắc chắn muốn reset toàn bộ database? Hành động này không thể hoàn tác!')) {
      return
    }

    setLoading(true)
    try {
      // Clear all tables in correct order (due to foreign keys)
      const tables = ['comment_reactions', 'comments', 'topics', 'users']
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
        
        if (error) throw error
      }

      toast.success('Database đã được reset')
      loadStats()
      loadTables()
    } catch (error) {
      console.error('Reset database error:', error)
      toast.error('Lỗi khi reset database')
    } finally {
      setLoading(false)
    }
  }

  const runMaintenance = async () => {
    setLoading(true)
    try {
      // Update statistics
      const { error } = await supabase.rpc('update_statistics')
      
      if (error) {
        console.warn('Statistics update failed:', error)
      }

      // Clean up orphaned records
      const { error: cleanupError } = await supabase.rpc('cleanup_orphaned_records')
      
      if (cleanupError) {
        console.warn('Cleanup failed:', cleanupError)
      }

      toast.success('Bảo trì database hoàn thành')
      loadStats()
      loadTables()
    } catch (error) {
      console.error('Maintenance error:', error)
      toast.error('Lỗi khi bảo trì database')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Quản lý Database
        </h3>
        <button
          onClick={() => {
            loadStats()
            loadTables()
          }}
          className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Users</p>
              <p className="text-2xl font-bold text-blue-900">{stats.users}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Topics</p>
              <p className="text-2xl font-bold text-green-900">{stats.topics}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Comments</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.comments}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Reactions</p>
              <p className="text-2xl font-bold text-purple-900">{stats.reactions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Management */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">
            Quản lý bảng dữ liệu
          </h4>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bảng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số bản ghi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cập nhật cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tables.map((table) => (
                  <tr key={table.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {table.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {table.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => exportTable(table.name)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => clearTable(table.name)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={exportAllData}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export tất cả
        </button>

        <button
          onClick={runMaintenance}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Bảo trì
        </button>

        <button
          onClick={resetDatabase}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Reset DB
        </button>

        <button
          onClick={() => {
            loadStats()
            loadTables()
          }}
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Cảnh báo
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Các thao tác xóa dữ liệu không thể hoàn tác. Hãy backup dữ liệu trước khi thực hiện.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseManager
