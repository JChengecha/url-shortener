'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { CustomSessionProvider } from '@/components/auth/SessionContext'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from 'sonner'

interface ClientProvidersProps {
  children: ReactNode
  session: any
}

export function ClientProviders({ children, session }: ClientProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CustomSessionProvider>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </CustomSessionProvider>
    </SessionProvider>
  )
}
