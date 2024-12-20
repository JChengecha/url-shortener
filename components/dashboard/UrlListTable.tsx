'use client'

import { useState, useEffect } from 'react'
import { UrlService } from '@/lib/urlService'
import { UrlEntry } from '@/lib/urlService'
import { Button } from '@/components/ui/button'
import { Copy, QrCode, BarChart2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'qrcode.react'
import Link from 'next/link'
import { formatDistance } from 'date-fns'

export function UrlListTable({ userId }: { userId: string }) {
  const [urls, setUrls] = useState<UrlEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showQrCodeFor, setShowQrCodeFor] = useState<string | null>(null)

  const itemsPerPage = 5

  useEffect(() => {
    async function fetchUrls() {
      try {
        setIsLoading(true)
        const fetchedUrls = await UrlService.listUrlsForUser(userId)
        
        // Sort URLs by creation date, most recent first
        const sortedUrls = fetchedUrls.sort((a, b) => 
          (b.createdAt || 0) - (a.createdAt || 0)
        )
        
        setUrls(sortedUrls)
      } catch (error) {
        toast.error('Failed to fetch URLs', {
          description: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUrls()
  }, [userId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUrls = urls.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(urls.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>You haven't created any short URLs yet.</p>
        <p>Start shortening your first URL!</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short URL</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original URL</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentUrls.map((url) => (
            <tr key={url.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-600">
                    {process.env.NEXT_PUBLIC_BASE_URL}/{url.shortUrl}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2"
                    onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortUrl}`)}
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </td>
              <td className="px-4 py-3 max-w-xs truncate">
                <a 
                  href={url.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-700 hover:text-blue-600 flex items-center"
                >
                  {url.originalUrl}
                  <ExternalLink size={14} className="ml-2 opacity-50" />
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatDistance(new Date(url.createdAt), new Date(), { addSuffix: true })}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-700">
                {url.clickCount || 0}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowQrCodeFor(showQrCodeFor === url.shortUrl ? null : url.shortUrl)}
                  >
                    <QrCode size={16} />
                  </Button>
                  <Link href={`/analytics/${url.shortUrl}`}>
                    <Button variant="outline" size="icon">
                      <BarChart2 size={16} />
                    </Button>
                  </Link>
                </div>
                {showQrCodeFor === url.shortUrl && (
                  <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg p-2">
                    <QRCode 
                      value={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortUrl}`} 
                      size={128} 
                    />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {indexOfFirstItem + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastItem, urls.length)}
          </span>{' '}
          of{' '}
          <span className="font-medium">
            {urls.length}
          </span>{' '}
          URLs
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
