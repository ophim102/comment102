import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Types
export interface User {
  id: string
  external_id: string
  username: string
  avatar_url?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  external_id: string
  title?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  topic_id: string
  user_id: string
  parent_id?: string
  content: string
  likes_count: number
  dislikes_count: number
  replies_count: number
  is_edited: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  username?: string
  avatar_url?: string
  user_external_id?: string
  replies?: Comment[]
  user_reaction?: 'like' | 'dislike'
}

export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string
  reaction_type: 'like' | 'dislike'
  created_at: string
}

// API Functions
export const commentApi = {
  // Get or create user
  async getOrCreateUser(externalId: string, username: string, avatarUrl?: string, email?: string): Promise<User> {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('external_id', externalId)
      .single()

    if (existingUser) {
      // Update user info if provided
      if (username || avatarUrl || email) {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({
            username: username || existingUser.username,
            avatar_url: avatarUrl || existingUser.avatar_url,
            email: email || existingUser.email,
          })
          .eq('id', existingUser.id)
          .select()
          .single()
        
        return updatedUser
      }
      return existingUser
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        external_id: externalId,
        username,
        avatar_url: avatarUrl,
        email,
      })
      .select()
      .single()

    if (error) throw error
    return newUser
  },

  // Get or create topic
  async getOrCreateTopic(externalId: string, title?: string, url?: string): Promise<Topic> {
    const { data: existingTopic } = await supabase
      .from('topics')
      .select('*')
      .eq('external_id', externalId)
      .single()

    if (existingTopic) {
      // Update topic info if provided
      if (title || url) {
        const { data: updatedTopic } = await supabase
          .from('topics')
          .update({
            title: title || existingTopic.title,
            url: url || existingTopic.url,
          })
          .eq('id', existingTopic.id)
          .select()
          .single()
        
        return updatedTopic
      }
      return existingTopic
    }

    // Create new topic
    const { data: newTopic, error } = await supabase
      .from('topics')
      .insert({
        external_id: externalId,
        title,
        url,
      })
      .select()
      .single()

    if (error) throw error
    return newTopic
  },

  // Get comments for a topic
  async getComments(topicId: string, userId?: string): Promise<Comment[]> {
    const { data: comments, error } = await supabase
      .from('comments_with_users')
      .select('*')
      .eq('topic_id', topicId)
      .is('parent_id', null)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get user reactions if userId provided
    if (userId && comments.length > 0) {
      const commentIds = comments.map(c => c.id)
      const { data: reactions } = await supabase
        .from('comment_reactions')
        .select('comment_id, reaction_type')
        .in('comment_id', commentIds)
        .eq('user_id', userId)

      // Map reactions to comments
      comments.forEach(comment => {
        const reaction = reactions?.find(r => r.comment_id === comment.id)
        if (reaction) {
          comment.user_reaction = reaction.reaction_type
        }
      })
    }

    return comments || []
  },

  // Get replies for a comment
  async getReplies(commentId: string, userId?: string): Promise<Comment[]> {
    const { data: replies, error } = await supabase
      .from('comments_with_users')
      .select('*')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get user reactions if userId provided
    if (userId && replies.length > 0) {
      const replyIds = replies.map(r => r.id)
      const { data: reactions } = await supabase
        .from('comment_reactions')
        .select('comment_id, reaction_type')
        .in('comment_id', replyIds)
        .eq('user_id', userId)

      // Map reactions to replies
      replies.forEach(reply => {
        const reaction = reactions?.find(r => r.comment_id === reply.id)
        if (reaction) {
          reply.user_reaction = reaction.reaction_type
        }
      })
    }

    return replies || []
  },

  // Create a comment
  async createComment(topicId: string, userId: string, content: string, parentId?: string): Promise<Comment> {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        topic_id: topicId,
        user_id: userId,
        content,
        parent_id: parentId,
      })
      .select(`
        *,
        username,
        avatar_url,
        user_external_id
      `)
      .single()

    if (error) throw error
    return comment
  },

  // Update a comment
  async updateComment(commentId: string, content: string): Promise<Comment> {
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content,
        is_edited: true,
      })
      .eq('id', commentId)
      .select(`
        *,
        username,
        avatar_url,
        user_external_id
      `)
      .single()

    if (error) throw error
    return comment
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  },

  // Toggle reaction
  async toggleReaction(commentId: string, userId: string, reactionType: 'like' | 'dislike'): Promise<void> {
    // Check if user already reacted
    const { data: existingReaction } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single()

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remove reaction
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id)
      } else {
        // Update reaction
        await supabase
          .from('comment_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id)
      }
    } else {
      // Add new reaction
      await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,
          user_id: userId,
          reaction_type: reactionType,
        })
    }
  },

  // Pin/unpin comment
  async togglePin(commentId: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .update({ is_pinned: isPinned })
      .eq('id', commentId)

    if (error) throw error
  }
}
