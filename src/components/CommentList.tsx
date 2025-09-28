import React, { useState } from 'react'
import { type Comment, type User } from '../lib/supabase'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentListProps {
  comments: Comment[]
  currentUser: User | null
  onAddReply: (content: string, parentId: string) => void
  onUpdateComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string, parentId?: string) => void
  onToggleReaction: (commentId: string, reactionType: 'like' | 'dislike') => void
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  currentUser,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onToggleReaction
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set())

  const handleReply = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId)
  }

  const handleEdit = (commentId: string) => {
    setEditingComment(editingComment === commentId ? null : commentId)
  }

  const handleToggleReplies = (commentId: string) => {
    const newShowReplies = new Set(showReplies)
    if (newShowReplies.has(commentId)) {
      newShowReplies.delete(commentId)
    } else {
      newShowReplies.add(commentId)
    }
    setShowReplies(newShowReplies)
  }

  const handleSubmitReply = (content: string, parentId?: string) => {
    if (parentId) {
      onAddReply(content, parentId)
      setReplyingTo(null)
    }
  }

  const handleSubmitEdit = (content: string, commentId?: string) => {
    if (commentId) {
      onUpdateComment(commentId, content)
      setEditingComment(null)
    }
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chưa có comment nào. Hãy là người đầu tiên bình luận!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="fade-in">
          <CommentItem
            comment={comment}
            currentUser={currentUser}
            isEditing={editingComment === comment.id}
            onReply={() => handleReply(comment.id)}
            onEdit={() => handleEdit(comment.id)}
            onDelete={() => onDeleteComment(comment.id)}
            onToggleReaction={onToggleReaction}
            onToggleReplies={() => handleToggleReplies(comment.id)}
            showReplies={showReplies.has(comment.id)}
          />
          
          {/* Reply Form */}
          {replyingTo === comment.id && currentUser && (
            <div className="ml-12 mt-4 slide-up">
              <CommentForm
                onSubmit={(content) => handleSubmitReply(content, comment.id)}
                placeholder={`Trả lời ${comment.username}...`}
                buttonText="Trả lời"
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          )}
          
          {/* Edit Form */}
          {editingComment === comment.id && (
            <div className="ml-12 mt-4 slide-up">
              <CommentForm
                onSubmit={(content) => handleSubmitEdit(content, comment.id)}
                initialValue={comment.content}
                placeholder="Chỉnh sửa comment..."
                buttonText="Cập nhật"
                onCancel={() => setEditingComment(null)}
              />
            </div>
          )}
          
          {/* Replies */}
          {showReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
            <div className="ml-12 mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="fade-in">
                  <CommentItem
                    comment={reply}
                    currentUser={currentUser}
                    isReply={true}
                    onReply={() => handleReply(reply.id)}
                    onEdit={() => handleEdit(reply.id)}
                    onDelete={() => onDeleteComment(reply.id, comment.id)}
                    onToggleReaction={onToggleReaction}
                  />
                  
                  {/* Reply to Reply Form */}
                  {replyingTo === reply.id && currentUser && (
                    <div className="ml-12 mt-4 slide-up">
                      <CommentForm
                        onSubmit={(content) => handleSubmitReply(content, reply.id)}
                        placeholder={`Trả lời ${reply.username}...`}
                        buttonText="Trả lời"
                        onCancel={() => setReplyingTo(null)}
                      />
                    </div>
                  )}
                  
                  {/* Edit Reply Form */}
                  {editingComment === reply.id && (
                    <div className="ml-12 mt-4 slide-up">
                      <CommentForm
                        onSubmit={(content) => handleSubmitEdit(content, reply.id)}
                        initialValue={reply.content}
                        placeholder="Chỉnh sửa comment..."
                        buttonText="Cập nhật"
                        onCancel={() => setEditingComment(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CommentList
