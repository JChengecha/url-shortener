import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Comprehensive route protection configuration
const ROUTE_PROTECTION = {
  // Fully protected routes (require authentication)
  protected: [
    '/dashboard',
    '/links/create',
    '/links/edit',
    '/links/analytics',
    '/settings',
    '/profile',
    '/api/urls',
    '/api/analytics'
  ],

  // Public routes (always accessible)
  public: [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/api/auth/signin',
    '/api/auth/signup',
    '/r'
  ],

  // Routes with conditional access
  conditional: [
    '/links',
    '/analytics'
  ]
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Handle short URL redirects
  if (path.match(/^\/[A-Za-z0-9_-]+$/)) {
    // Exclude specific routes from redirection
    const excludedRoutes = ['/dashboard', '/profile', '/settings']
    if (!excludedRoutes.includes(path)) {
      const shortCode = path.slice(1) // Remove leading slash
      return NextResponse.redirect(new URL(`/r/${shortCode}`, req.url))
    }
  }

  // Helper function to check route protection
  const isProtectedRoute = (routePath: string) => 
    ROUTE_PROTECTION.protected.some(route => 
      routePath.startsWith(route)
    )

  const isPublicRoute = (routePath: string) => 
    ROUTE_PROTECTION.public.some(route => 
      routePath === route || routePath.startsWith(route)
    )

  const isConditionalRoute = (routePath: string) => 
    ROUTE_PROTECTION.conditional.some(route => 
      routePath.startsWith(route)
    )

  // Logging for debugging (can be removed in production)
  console.log(`[Middleware] Path: ${path}, Authenticated: ${!!token}`)

  // Redirect logic for authentication
  if (isProtectedRoute(path)) {
    if (!token) {
      const signinUrl = new URL('/auth/signin', req.url)
      signinUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signinUrl)
    }
  }

  // Prevent logged-in users from accessing auth pages
  if ((path === '/auth/signin' || path === '/auth/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Conditional route handling
  if (isConditionalRoute(path)) {
    if (!token) {
      const signinUrl = new URL('/auth/signin', req.url)
      signinUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(signinUrl)
    }
  }

  // Additional security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

// Configure middleware to run on specific routes
export const config = {
  matcher: [
    // Match root-level shortcodes
    '/:shortcode',
    // Middleware for protected and conditional routes
    '/dashboard/:path*',
    '/links/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/api/urls/:path*',
    '/api/analytics/:path*'
  ]
}
