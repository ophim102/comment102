import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { type Comment, type User } from '../lib/supabase'
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal, Pin } from 'lucide-react'

interface CommentItemProps {
  comment: Comment
  currentUser: User | null
  isReply?: boolean
  isEditing?: boolean
  showReplies?: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleReaction: (commentId: string, reactionType: 'like' | 'dislike') => void
  onToggleReplies?: () => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  isReply = false,
  isEditing = false,
  showReplies = false,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  onToggleReplies
}) => {
  const isOwner = currentUser?.id === comment.user_id
  const hasReplies = comment.replies_count > 0

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi
      })
    } catch {
      return 'vừa xong'
    }
  }

  const handleLike = () => {
    onToggleReaction(comment.id, 'like')
  }

  const handleDislike = () => {
    onToggleReaction(comment.id, 'dislike')
  }

  return (
    <div className={`comment-container ${isReply ? 'ml-4' : ''}`}>
      <div className="flex">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={comment.avatar_url || 'https://via.placeholder.com/40'}
            alt={comment.username}
            className="comment-avatar"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/40'
            }}
          />
        </div>

        {/* Content */}
        <div className="comment-content">
          {/* Header */}
          <div className="comment-header">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-time">
              {formatTime(comment.created_at)}
              {comment.is_edited && ' (đã chỉnh sửa)'}
            </span>
            {comment.is_pinned && (
              <Pin className="w-4 h-4 text-blue-600" />
            )}
          </div>

          {/* Comment Text */}
          <div className="comment-text">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="comment-actions">
            {/* Like/Dislike */}
            <button
              onClick={handleLike}
              className={`reaction-button ${comment.user_reaction === 'like' ? 'liked' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.likes_count}</span>
            </button>

            <button
              onClick={handleDislike}
              className={`reaction-button ${comment.user_reaction === 'dislike' ? 'disliked' : ''}`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{comment.dislikes_count}</span>
            </button>

            {/* Reply */}
            <button
              onClick={onReply}
              className="comment-action"
            >
              <Reply className="w-4 h-4" />
              <span>Trả lời</span>
            </button>

            {/* Show Replies */}
            {hasReplies && onToggleReplies && (
              <button
                onClick={onToggleReplies}
                className="comment-action"
              >
                <span>
                  {showReplies ? 'Ẩn' : 'Hiện'} {comment.replies_count} trả lời
                </span>
              </button>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <div className="relative group">
                <button className="comment-action">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={onEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={onDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentItem
