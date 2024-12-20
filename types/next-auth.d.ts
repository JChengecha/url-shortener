import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    subscriptionPlan: 'Free' | 'Pro'
  }

  interface Session {
    user: {
      id: string
      email: string
      subscriptionPlan: 'Free' | 'Pro'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    subscriptionPlan: 'Free' | 'Pro'
  }
}
