'use client';

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  LinkIcon, 
  BarChartIcon, 
  ShieldCheckIcon 
} from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-primary tracking-tight">
          Simplify Your Links
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform long, complex URLs into concise, shareable links with powerful analytics and tracking.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex justify-center gap-4 pt-6">
          <Link 
            href="/auth/signin" 
            className={cn(
              buttonVariants({ variant: 'default', size: 'lg' }), 
              'px-8 py-3 text-base font-semibold'
            )}
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup" 
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }), 
              'px-8 py-3 text-base font-semibold'
            )}
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all space-y-4 text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Shorten URLs
          </h2>
          <p className="text-muted-foreground">
            Create compact, memorable links in seconds with our intuitive URL shortener.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all space-y-4 text-center">
          <BarChartIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Track Performance
          </h2>
          <p className="text-muted-foreground">
            Gain deep insights with comprehensive click analytics and location tracking.
          </p>
        </div>
        
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-all space-y-4 text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Secure & Fast
          </h2>
          <p className="text-muted-foreground">
            Enjoy lightning-quick redirects with enterprise-grade security and reliability.
          </p>
        </div>
      </div>
    </div>
  )
}
