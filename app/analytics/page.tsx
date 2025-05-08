'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useSession, signIn } from 'next-auth/react'

interface YouTubeData {
  channel: {
    title: string
    description: string
    statistics: {
      subscriberCount: string
      viewCount: string
      videoCount: string
    }
  }
  videos: Array<{
    id: string
    statistics: {
      viewCount: string
      likeCount: string
      commentCount: string
    }
  }>
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<YouTubeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/youtube/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const data = await response.json()
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your YouTube Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Sign in with your Google account to access your YouTube analytics.
              </p>
              <Button onClick={() => signIn('google')}>Sign in with Google</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchData} className="mt-4">Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            Analytics Dashboard
          </h1>
          {data?.channel.title && (
            <p className="mt-2 text-sm text-gray-600">{data.channel.title}</p>
          )}
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Subscribers</p>
                      <p className="text-2xl font-semibold">
                        {data?.channel.statistics.subscriberCount || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl font-semibold">
                        {data?.channel.statistics.viewCount || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Videos</p>
                      <p className="text-2xl font-semibold">
                        {data?.channel.statistics.videoCount || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Last 30 Days Views</p>
                      <p className="text-2xl font-semibold">
                        {data?.videos.reduce((acc, video) => acc + parseInt(video.statistics.viewCount), 0) || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Likes</p>
                      <p className="text-2xl font-semibold">
                        {data?.videos.reduce((acc, video) => acc + parseInt(video.statistics.likeCount), 0) || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Comments</p>
                      <p className="text-2xl font-semibold">
                        {data?.videos.reduce((acc, video) => acc + parseInt(video.statistics.commentCount), 0) || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Video Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.videos.slice(0, 3).map((video) => (
                      <div key={video.id} className="border-b pb-2 last:border-0">
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="text-sm font-semibold">{video.statistics.viewCount}</p>
                        <p className="text-sm text-gray-500">Likes</p>
                        <p className="text-sm font-semibold">{video.statistics.likeCount}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 