import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Code, 
  Copy, 
  Eye, 
  Download, 
  Settings,
  User,
  FileText,
  CheckCircle
} from 'lucide-react'
import EmbedPreview from './EmbedPreview'

interface EmbedConfig {
  topicId: string
  userId: string
  username: string
  userImg: string
  userEmail?: string
  title: string
  url: string
  domain: string
  theme: 'light' | 'dark'
  language: 'vi' | 'en'
  showReplies: boolean
  allowReactions: boolean
  maxComments: number
  autoLoad: boolean
}

const EmbedCodeGenerator: React.FC = () => {
  const [config, setConfig] = useState<EmbedConfig>({
    topicId: '',
    userId: '',
    username: '',
    userImg: '',
    userEmail: '',
    title: '',
    url: '',
    domain: 'https://your-domain.netlify.app',
    theme: 'light',
    language: 'vi',
    showReplies: true,
    allowReactions: true,
    maxComments: 50,
    autoLoad: true
  })

  const [generatedCode, setGeneratedCode] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateEmbedCode = () => {
    if (!config.topicId || !config.userId || !config.username) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    const embedCode = `<!-- YouTube Comment System -->
<div id="comment-widget" 
     data-topic-id="${config.topicId}"
     data-user-id="${config.userId}"
     data-username="${config.username}"
     data-user-img="${config.userImg}"
     ${config.userEmail ? `data-user-email="${config.userEmail}"` : ''}
     data-title="${config.title}"
     data-url="${config.url}"
     data-theme="${config.theme}"
     data-language="${config.language}"
     data-show-replies="${config.showReplies}"
     data-allow-reactions="${config.allowReactions}"
     data-max-comments="${config.maxComments}"
     data-auto-load="${config.autoLoad}">
</div>
<script src="${config.domain}/embed/comment-widget.js"></script>`

    setGeneratedCode(embedCode)
    toast.success('Code embed đã được tạo!')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      toast.success('Đã copy code vào clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Lỗi khi copy code')
    }
  }

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comment-embed-${config.topicId}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Đã tải file code!')
  }

  const generatePHPExample = () => {
    const phpCode = `<?php
// Thông tin người dùng
$userId = '${config.userId}';
$username = '${config.username}';
$userImg = '${config.userImg}';
$userEmail = '${config.userEmail || ''}';

// Thông tin chủ đề
$topicId = '${config.topicId}';
$title = '${config.title}';
$url = '${config.url}';
?>

<!-- YouTube Comment System -->
<div id="comment-widget" 
     data-topic-id="<?php echo htmlspecialchars($topicId); ?>"
     data-user-id="<?php echo htmlspecialchars($userId); ?>"
     data-username="<?php echo htmlspecialchars($username); ?>"
     data-user-img="<?php echo htmlspecialchars($userImg); ?>"
     <?php if ($userEmail): ?>
     data-user-email="<?php echo htmlspecialchars($userEmail); ?>"
     <?php endif; ?>
     data-title="<?php echo htmlspecialchars($title); ?>"
     data-url="<?php echo htmlspecialchars($url); ?>"
     data-theme="${config.theme}"
     data-language="${config.language}"
     data-show-replies="${config.showReplies}"
     data-allow-reactions="${config.allowReactions}"
     data-max-comments="${config.maxComments}"
     data-auto-load="${config.autoLoad}">
</div>
<script src="${config.domain}/embed/comment-widget.js"></script>`

    return phpCode
  }

  const generateWordPressExample = () => {
    const wpCode = `<?php
// Thêm vào functions.php hoặc plugin
function add_comment_system_to_post($content) {
    if (is_single()) {
        $post_id = get_the_ID();
        $user_id = get_current_user_id();
        $username = wp_get_current_user()->display_name;
        $user_avatar = get_avatar_url(get_current_user_id());
        
        $comment_html = '
        <div id="comment-widget" 
             data-topic-id="post_' . $post_id . '"
             data-user-id="' . $user_id . '"
             data-username="' . esc_attr($username) . '"
             data-user-img="' . esc_url($user_avatar) . '"
             data-title="' . esc_attr(get_the_title()) . '"
             data-url="' . esc_url(get_permalink()) . '"
             data-theme="${config.theme}"
             data-language="${config.language}"
             data-show-replies="${config.showReplies}"
             data-allow-reactions="${config.allowReactions}"
             data-max-comments="${config.maxComments}"
             data-auto-load="${config.autoLoad}">
        </div>
        <script src="${config.domain}/embed/comment-widget.js"></script>';
        
        return $content . $comment_html;
    }
    return $content;
}
add_filter('the_content', 'add_comment_system_to_post');
?>`

    return wpCode
  }

  const generateLaravelExample = () => {
    const laravelCode = `{{-- Blade template --}}
<div id="comment-widget" 
     data-topic-id="article_{{ $article->id }}"
     data-user-id="{{ auth()->id() }}"
     data-username="{{ auth()->user()->name }}"
     data-user-img="{{ auth()->user()->avatar }}"
     data-user-email="{{ auth()->user()->email }}"
     data-title="{{ $article->title }}"
     data-url="{{ request()->url() }}"
     data-theme="${config.theme}"
     data-language="${config.language}"
     data-show-replies="${config.showReplies}"
     data-allow-reactions="${config.allowReactions}"
     data-max-comments="${config.maxComments}"
     data-auto-load="${config.autoLoad}">
</div>
<script src="${config.domain}/embed/comment-widget.js"></script>`

    return laravelCode
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Tạo code embed
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Nhập thông tin để tạo code nhúng comment system vào website của bạn
        </p>
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Thông tin cơ bản
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.topicId}
              onChange={(e) => setConfig(prev => ({ ...prev, topicId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="article_123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.userId}
              onChange={(e) => setConfig(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user_456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Avatar URL
            </label>
            <input
              type="url"
              value={config.userImg}
              onChange={(e) => setConfig(prev => ({ ...prev, userImg: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <input
              type="email"
              value={config.userEmail || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, userEmail: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>
        </div>

        {/* Content Information */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Thông tin nội dung
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Article Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/article"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              type="url"
              value={config.domain}
              onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://your-domain.netlify.app"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Cài đặt nâng cao
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={config.theme}
              onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={config.language}
              onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value as 'vi' | 'en' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Comments
            </label>
            <input
              type="number"
              value={config.maxComments}
              onChange={(e) => setConfig(prev => ({ ...prev, maxComments: parseInt(e.target.value) || 50 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="1000"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.showReplies}
                onChange={(e) => setConfig(prev => ({ ...prev, showReplies: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show Replies</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.allowReactions}
                onChange={(e) => setConfig(prev => ({ ...prev, allowReactions: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow Reactions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoLoad}
                onChange={(e) => setConfig(prev => ({ ...prev, autoLoad: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto Load</span>
            </label>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateEmbedCode}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Code className="w-4 h-4 mr-2" />
          Tạo code embed
        </button>
      </div>

      {/* Generated Code */}
      {generatedCode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">
              Code embed đã tạo
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                {previewMode ? 'Hide' : 'Preview'}
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadCode}
                className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>{generatedCode}</code>
            </pre>
          </div>

          {/* Preview */}
          {previewMode && (
            <EmbedPreview 
              embedCode={generatedCode}
              config={config}
            />
          )}
        </div>
      )}

      {/* Framework Examples */}
      {generatedCode && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">
            Ví dụ cho các framework
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PHP Example */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">PHP</h5>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <pre>{generatePHPExample().substring(0, 200)}...</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatePHPExample())
                  toast.success('PHP code copied!')
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Copy PHP code
              </button>
            </div>

            {/* WordPress Example */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">WordPress</h5>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <pre>{generateWordPressExample().substring(0, 200)}...</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateWordPressExample())
                  toast.success('WordPress code copied!')
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Copy WordPress code
              </button>
            </div>

            {/* Laravel Example */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Laravel</h5>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                <pre>{generateLaravelExample().substring(0, 200)}...</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateLaravelExample())
                  toast.success('Laravel code copied!')
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Copy Laravel code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmbedCodeGenerator
