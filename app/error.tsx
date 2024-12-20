'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ServerCrash } from 'lucide-react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <ServerCrash 
            className="h-16 w-16 text-red-500" 
            strokeWidth={1.5} 
          />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We apologize, but an unexpected error occurred. 
          Our team has been notified and is working on a fix.
        </p>
        
        {error.digest && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-sm text-gray-700">
            <p>Error ID: {error.digest}</p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => reset()}
          >
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="default">
              Return to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-xs text-gray-500 mt-6">
          Error 500: Internal Server Error
        </div>
      </div>
    </div>
  )
}
