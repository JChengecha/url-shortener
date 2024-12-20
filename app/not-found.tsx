'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle 
            className="h-16 w-16 text-yellow-500" 
            strokeWidth={1.5} 
          />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          Oops! The page you are looking for seems to have gone on an unexpected journey.
          It might have been moved, deleted, or never existed in the first place.
        </p>
        
        <div className="flex justify-center">
          <Link href="/">
            <Button variant="default" size="lg">
              Return to Home
            </Button>
          </Link>
        </div>
        
        <div className="text-xs text-gray-500 mt-6">
          Error 404: The requested URL could not be found on this server.
        </div>
      </div>
    </div>
  )
}
