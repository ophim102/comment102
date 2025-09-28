import React, { useEffect, useState } from 'react'
import CommentSystem from '../components/CommentSystem'

interface EmbedParams {
  topicId?: string
  userId?: string
  userImg?: string
  username?: string
  userEmail?: string
  title?: string
  url?: string
}

const EmbedPage: React.FC = () => {
  const [params, setParams] = useState<EmbedParams>({})

  useEffect(() => {
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search)
    setParams({
      topicId: urlParams.get('topicId') || 'demo-topic-1',
      userId: urlParams.get('userId') || 'demo-user-1',
      userImg: urlParams.get('userImg') || 'https://via.placeholder.com/40',
      username: urlParams.get('username') || 'Demo User',
      userEmail: urlParams.get('userEmail') || undefined,
      title: urlParams.get('title') || 'Demo Topic',
      url: urlParams.get('url') || undefined
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <CommentSystem
        topicId={params.topicId}
        userId={params.userId}
        userImg={params.userImg}
        username={params.username}
        userEmail={params.userEmail}
        title={params.title}
        url={params.url}
      />
    </div>
  )
}

export default EmbedPage
