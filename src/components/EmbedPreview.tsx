import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react'

interface EmbedPreviewProps {
  embedCode: string
  config: {
    topicId: string
    userId: string
    username: string
    userImg: string
    title: string
    theme: 'light' | 'dark'
    language: 'vi' | 'en'
  }
}

const EmbedPreview: React.FC<EmbedPreviewProps> = ({ embedCode, config }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = () => {
    if (!embedCode) return

    setIsVisible(!isVisible)
    if (!isVisible) {
      setLoading(true)
      setError(null)
      
      // Simulate loading
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  const openInNewTab = () => {
    const blob = new Blob([`
      <!DOCTYPE html>
      <html lang="${config.language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comment System Preview</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: ${config.theme === 'dark' ? '#1a1a1a' : '#f9f9f9'};
            color: ${config.theme === 'dark' ? '#ffffff' : '#333333'};
          }
          .preview-container {
            max-width: 800px;
            margin: 0 auto;
            background: ${config.theme === 'dark' ? '#2a2a2a' : '#ffffff'};
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .preview-header {
            border-bottom: 1px solid ${config.theme === 'dark' ? '#444' : '#eee'};
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .preview-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 10px 0;
          }
          .preview-meta {
            color: ${config.theme === 'dark' ? '#aaa' : '#666'};
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-header">
            <h1 class="preview-title">${config.title || 'Article Title'}</h1>
            <div class="preview-meta">
              Topic ID: ${config.topicId} | User: ${config.username}
            </div>
          </div>
          ${embedCode}
        </div>
      </body>
      </html>
    `], { type: 'text/html' })
    
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">
          Preview
        </h4>
        <div className="flex space-x-2">
          <button
            onClick={handlePreview}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            {isVisible ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {isVisible ? 'Ẩn' : 'Hiện'} Preview
          </button>
          <button
            onClick={openInNewTab}
            className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Mở tab mới
          </button>
        </div>
      </div>

      {isVisible && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Preview: {config.title || 'Untitled'}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  Theme: {config.theme} | Lang: {config.language}
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Đang tải preview...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-red-600">
                  <p>Lỗi khi tải preview: {error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mock Article Content */}
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">
                    {config.title || 'Article Title'}
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Đây là nội dung bài viết mẫu. Hệ thống comment sẽ được hiển thị bên dưới.
                  </p>
                  <p className="text-gray-700">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>

                {/* Mock Comment System */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Comments (3)
                  </h3>
                  
                  {/* Mock Comment Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={config.userImg || 'https://via.placeholder.com/40'}
                        alt={config.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <textarea
                          placeholder="Viết comment..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                          rows={3}
                          disabled
                        />
                        <div className="mt-2 flex justify-end">
                          <button
                            disabled
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed"
                          >
                            Bình luận
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Comments */}
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <img
                        src="https://via.placeholder.com/40"
                        alt="User"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">John Doe</span>
                          <span className="text-xs text-gray-500">2 giờ trước</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Đây là comment mẫu để demo giao diện.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <button className="hover:text-gray-700">👍 5</button>
                          <button className="hover:text-gray-700">👎</button>
                          <button className="hover:text-gray-700">Trả lời</button>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <img
                        src="https://via.placeholder.com/40"
                        alt="User"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">Jane Smith</span>
                          <span className="text-xs text-gray-500">1 giờ trước</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Comment thứ hai để test giao diện.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <button className="hover:text-gray-700">👍 2</button>
                          <button className="hover:text-gray-700">👎</button>
                          <button className="hover:text-gray-700">Trả lời</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmbedPreview
