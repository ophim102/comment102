import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Settings, 
  Database, 
  Shield, 
  MessageSquare,
  Code
} from 'lucide-react'

const AdminNavigation: React.FC = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Comment System', href: '/embed', icon: MessageSquare },
    { name: 'Cài đặt Supabase', href: '/setup', icon: Settings },
    { name: 'Cấu hình', href: '/admin', icon: Settings },
    { name: 'Tạo code embed', href: '/admin?tab=embed', icon: Code },
    { name: 'Database', href: '/admin?tab=stats', icon: Database },
    { name: 'Trạng thái', href: '/admin?tab=health', icon: Shield },
    { name: 'Công cụ', href: '/admin?tab=tools', icon: Database },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    if (href === '/admin') {
      return location.pathname === '/admin' && !location.search
    }
    if (href.startsWith('/admin?')) {
      const tab = href.split('tab=')[1]
      return location.pathname === '/admin' && location.search.includes(`tab=${tab}`)
    }
    return location.pathname === href
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive(item.href)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default AdminNavigation
