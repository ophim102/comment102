import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res)
      case 'POST':
        return await handlePost(req, res)
      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { period = '7d' } = req.query

  try {
    // Get analytics data from Supabase
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('created_at, topic_id')
      .gte('created_at', getDateFromPeriod(period as string))

    if (commentsError) {
      console.error('Comments error:', commentsError)
      return res.status(500).json({ error: 'Failed to fetch comments data' })
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', getDateFromPeriod(period as string))

    if (usersError) {
      console.error('Users error:', usersError)
      return res.status(500).json({ error: 'Failed to fetch users data' })
    }

    const analytics = {
      period,
      comments: {
        total: comments?.length || 0,
        daily: groupByDay(comments || [], 'created_at')
      },
      users: {
        total: users?.length || 0,
        daily: groupByDay(users || [], 'created_at')
      },
      topics: {
        total: new Set(comments?.map(c => c.topic_id)).size || 0
      }
    }

    res.json(analytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { event, data } = req.body

  if (!event || !data) {
    return res.status(400).json({ error: 'Missing event or data' })
  }

  try {
    // Log analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event,
        data,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Analytics insert error:', error)
      return res.status(500).json({ error: 'Failed to log event' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Analytics log error:', error)
    res.status(500).json({ error: 'Failed to log analytics event' })
  }
}

function getDateFromPeriod(period: string): string {
  const now = new Date()
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date.toISOString()
}

function groupByDay(data: any[], dateField: string): Record<string, number> {
  const grouped: Record<string, number> = {}
  
  data.forEach(item => {
    const date = new Date(item[dateField]).toISOString().split('T')[0]
    grouped[date] = (grouped[date] || 0) + 1
  })
  
  return grouped
}
