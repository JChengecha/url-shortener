'use client'

import { useState, useEffect } from 'react'
import { 
  Link2, 
  Zap, 
  MousePointer 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { UrlListTable } from '@/components/dashboard/UrlListTable'
import { UrlService } from '@/lib/urlService'
import { UrlShortenerForm } from '@/components/url-shortener/UrlShortenerForm'
import { Skeleton } from '@/components/ui/skeleton'
import { redirect } from 'next/navigation'

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    }
  })

  const [urlStats, setUrlStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0
  })
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUrlStats() {
      try {
        if (session?.user?.id) {
          const userUrls = await UrlService.listUrlsForUser(session.user.id)
          
          setUrlStats({
            totalUrls: userUrls.length,
            totalClicks: userUrls.reduce((sum, url) => sum + (url.clickCount || 0), 0),
            activeUrls: userUrls.filter(url => !url.expiryDate || url.expiryDate > Date.now()).length
          })
        }
      } catch (error) {
        console.error('Failed to fetch URL stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUrlStats()
    }
  }, [session, status])

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(item => (
            <Skeleton key={item} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Redirect if no session (additional safety)
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urlStats.totalUrls}</div>
            <p className="text-xs text-muted-foreground">
              Total number of shortened URLs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urlStats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              Clicks across all your URLs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urlStats.activeUrls}</div>
            <p className="text-xs text-muted-foreground">
              URLs currently active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Shorten a New URL</h2>
          <Button 
            variant="default" 
            onClick={() => setShowUrlForm(!showUrlForm)}
          >
            {showUrlForm ? 'Cancel' : 'Create New URL'}
          </Button>
        </div>
        
        {showUrlForm && (
          <div className="mt-4">
            <UrlShortenerForm />
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your URLs</h2>
        </div>
        
        {session.user?.id && (
          <UrlListTable userId={session.user.id} />
        )}
      </div>
    </div>
  )
}
