import React, { useState, useEffect } from 'react'
import { commentApi, type Comment, type User, type Topic } from '../lib/supabase'
import CommentList from './CommentList'
import CommentForm from './CommentForm'
import { toast } from 'react-hot-toast'

interface CommentSystemProps {
  topicId?: string
  userId?: string
  userImg?: string
  username?: string
  userEmail?: string
  title?: string
  url?: string
}

const CommentSystem: React.FC<CommentSystemProps> = ({
  topicId = 'demo-topic-1',
  userId = 'demo-user-1',
  userImg = 'https://via.placeholder.com/40',
  username = 'Demo User',
  userEmail,
  title = 'Demo Topic',
  url
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)

  useEffect(() => {
    initializeSystem()
  }, [topicId, userId])

  const initializeSystem = async () => {
    try {
      setLoading(true)
      
      // Get or create user
      const user = await commentApi.getOrCreateUser(
        userId,
        username,
        userImg,
        userEmail
      )
      setCurrentUser(user)

      // Get or create topic
      const topic = await commentApi.getOrCreateTopic(topicId, title, url)
      setCurrentTopic(topic)

      // Load comments
      await loadComments(topic.id, user.id)
    } catch (error) {
      console.error('Error initializing comment system:', error)
      toast.error('Không thể tải hệ thống comment')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async (topicId: string, userId: string) => {
    try {
      const commentsData = await commentApi.getComments(topicId, userId)
      
      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        commentsData.map(async (comment) => {
          const replies = await commentApi.getReplies(comment.id, userId)
          return { ...comment, replies }
        })
      )
      
      setComments(commentsWithReplies)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Không thể tải comments')
    }
  }

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!currentUser || !currentTopic) return

    try {
      const newComment = await commentApi.createComment(
        currentTopic.id,
        currentUser.id,
        content,
        parentId
      )

      if (parentId) {
        // Add reply to parent comment
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
              replies_count: comment.replies_count + 1
            }
          }
          return comment
        }))
      } else {
        // Add new top-level comment
        setComments(prev => [newComment, ...prev])
      }

      toast.success('Comment đã được thêm thành công!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Không thể thêm comment')
    }
  }

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updatedComment = await commentApi.updateComment(commentId, content)
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, ...updatedComment }
        }
        // Update in replies
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => 
            reply.id === commentId ? { ...reply, ...updatedComment } : reply
          )
        }
        return comment
      }))

      toast.success('Comment đã được cập nhật!')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Không thể cập nhật comment')
    }
  }

  const handleDeleteComment = async (commentId: string, parentId?: string) => {
    try {
      await commentApi.deleteComment(commentId)

      if (parentId) {
        // Remove reply from parent comment
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter(reply => reply.id !== commentId),
              replies_count: Math.max(0, comment.replies_count - 1)
            }
          }
          return comment
        }))
      } else {
        // Remove top-level comment
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      }

      toast.success('Comment đã được xóa!')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Không thể xóa comment')
    }
  }

  const handleToggleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!currentUser) return

    try {
      await commentApi.toggleReaction(commentId, currentUser.id, reactionType)
      
      // Update local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return updateCommentReaction(comment, reactionType)
        }
        // Update in replies
        if (comment.replies) {
          comment.replies = comment.replies.map(reply => 
            reply.id === commentId ? updateCommentReaction(reply, reactionType) : reply
          )
        }
        return comment
      }))
    } catch (error) {
      console.error('Error toggling reaction:', error)
      toast.error('Không thể cập nhật reaction')
    }
  }

  const updateCommentReaction = (comment: Comment, reactionType: 'like' | 'dislike'): Comment => {
    const currentReaction = comment.user_reaction
    let newReaction: 'like' | 'dislike' | undefined
    let likesDelta = 0
    let dislikesDelta = 0

    if (currentReaction === reactionType) {
      // Remove reaction
      newReaction = undefined
      if (reactionType === 'like') {
        likesDelta = -1
      } else {
        dislikesDelta = -1
      }
    } else {
      // Add or change reaction
      newReaction = reactionType
      if (currentReaction === 'like') {
        likesDelta = -1
        dislikesDelta = 1
      } else if (currentReaction === 'dislike') {
        dislikesDelta = -1
        likesDelta = 1
      } else {
        if (reactionType === 'like') {
          likesDelta = 1
        } else {
          dislikesDelta = 1
        }
      }
    }

    return {
      ...comment,
      user_reaction: newReaction,
      likes_count: Math.max(0, comment.likes_count + likesDelta),
      dislikes_count: Math.max(0, comment.dislikes_count + dislikesDelta)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
          <span className="ml-2 text-gray-600">Đang tải comments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>
        
        {currentUser && (
          <CommentForm
            onSubmit={handleAddComment}
            placeholder="Viết comment..."
            buttonText="Bình luận"
          />
        )}
        
        <div className="mt-6">
          <CommentList
            comments={comments}
            currentUser={currentUser}
            onAddReply={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onToggleReaction={handleToggleReaction}
          />
        </div>
      </div>
    </div>
  )
}

export default CommentSystem
