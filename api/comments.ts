import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { action, topicId, commentId, userId } = req.query

  try {
    switch (action) {
      case 'list':
        return await handleGet(req, res)
      case 'create':
        return await handlePost(req, res)
      case 'update':
        return await handlePut(req, res)
      case 'delete':
        return await handleDelete(req, res)
      default:
        res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { topicId, page = 1, limit = 50 } = req.query

  if (!topicId) {
    return res.status(400).json({ error: 'Topic ID is required' })
  }

  const offset = (Number(page) - 1) * Number(limit)

  const { data: comments, error } = await supabase
    .from('comments_with_users')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1)

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to fetch comments' })
  }

  res.json({ comments: comments || [] })
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { topicId, userId, content, parentId } = req.body

  if (!topicId || !userId || !content) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      topic_id: topicId,
      user_id: userId,
      content,
      parent_id: parentId || null
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to create comment' })
  }

  // Get the comment with user data
  const { data: commentWithUser, error: fetchError } = await supabase
    .from('comments_with_users')
    .select('*')
    .eq('id', comment.id)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    return res.status(500).json({ error: 'Failed to fetch comment' })
  }

  res.json({ comment: commentWithUser })
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const { commentId, content, userId } = req.body

  if (!commentId || !content || !userId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to update comment' })
  }

  res.json({ comment })
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const { commentId, userId } = req.body

  if (!commentId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)

  if (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: 'Failed to delete comment' })
  }

  res.json({ success: true })
}
