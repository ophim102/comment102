import React, { useState, useRef, useEffect } from 'react'
import { Send, X } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string) => void
  initialValue?: string
  placeholder?: string
  buttonText?: string
  onCancel?: () => void
  autoFocus?: boolean
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  initialValue = '',
  placeholder = 'Viết comment...',
  buttonText = 'Bình luận',
  onCancel,
  autoFocus = false
}) => {
  const [content, setContent] = useState(initialValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="comment-input min-h-[80px] max-h-[200px]"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {content.length}/1000
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Nhấn Ctrl+Enter để gửi nhanh
        </div>
        
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Hủy</span>
            </button>
          )}
          
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || content.length > 1000}
            className="comment-submit flex items-center space-x-2"
          >
            {isSubmitting ? (
              <div className="loading-spinner"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </form>
  )
}

export default CommentForm
