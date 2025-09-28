import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const startTime = Date.now()
    
    // Test Supabase connection
    const { data, error } = await supabase
      .from('comments')
      .select('count')
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        responseTime
      })
    }

    res.json({
      status: 'healthy',
      message: 'All systems operational',
      responseTime,
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        api: 'healthy'
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
