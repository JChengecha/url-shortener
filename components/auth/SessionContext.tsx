'use client'

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react'
import { useSession } from 'next-auth/react'
import { User } from '@/types/user'

interface SessionContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false
})

export function CustomSessionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image,
        subscriptionPlan: session.user.subscriptionPlan || 'Free'
      })
      setIsAuthenticated(true)
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }

    setIsLoading(false)
  }, [session, status])

  return (
    <SessionContext.Provider value={{ user, isLoading, isAuthenticated }}>
      {children}
    </SessionContext.Provider>
  )
}

// Custom hook for accessing session context
export function useSessionContext() {
  const context = useContext(SessionContext)
  
  if (!context) {
    throw new Error('useSessionContext must be used within a CustomSessionProvider')
  }
  
  return context
}
