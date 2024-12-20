import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ClientProviders session={session}>
          <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="w-full py-4 flex justify-between items-center border-b">
              <h1 className="text-2xl font-bold">URL Shortener</h1>
              <ThemeToggle />
            </header>
            <main className="w-full max-w-7xl mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster richColors position="top-right" />
        </ClientProviders>
      </body>
    </html>
  )
}
