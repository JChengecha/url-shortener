import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { kvDatabase } from './kvDatabase'
import { z } from 'zod'
import { NextRequest } from 'next/server'

// Enhanced validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials)

          // Authenticate user
          const user = await kvDatabase.authenticateUser(email, password)
          
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.profileImage,
              subscriptionPlan: user.subscriptionPlan
            }
          }
          
          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Optional: Add additional sign-in validation
      if (account?.provider === 'google') {
        // Verify Google user
        if (!profile?.email_verified) {
          return false
        }
        
        // Optional: Create user in your database if not exists
        const existingUser = await kvDatabase.findUserByEmail(profile.email!)
        if (!existingUser) {
          await kvDatabase.createUserFromOAuth({
            email: profile.email!,
            name: profile.name!,
            image: profile.picture,
            provider: 'google'
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.subscriptionPlan = token.subscriptionPlan as 'Free' | 'Pro'
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.subscriptionPlan = user.subscriptionPlan || 'Free'
        token.name = user.name
        token.picture = user.image
      }

      // Add provider-specific information
      if (account?.provider === 'google') {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      return token
    }
  },
  events: {
    async signOut(message) {
      // Optional: Add logout tracking or cleanup
      console.log('User signed out:', message.session?.user?.email)
    },
    async createUser(message) {
      // Track new user creation
      console.log('New user created:', message.user?.email)
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/onboarding'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  debug: process.env.NODE_ENV === 'development'
}

// Manually create handlers
export const handlers = {
  GET: async (req: NextRequest) => {
    const { handler } = await import('next-auth/next')
    return handler(req, authOptions)
  },
  POST: async (req: NextRequest) => {
    const { handler } = await import('next-auth/next')
    return handler(req, authOptions)
  }
}

export const { 
  auth, 
  signIn, 
  signOut 
} = NextAuth(authOptions)

export { authOptions }
