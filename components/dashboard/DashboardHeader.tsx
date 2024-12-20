import Image from 'next/image'
import { User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { Session } from 'next-auth'

export default function DashboardHeader({ user }: { user?: Session['user'] }) {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-4" />
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="flex items-center space-x-2">
          {user?.image ? (
            <Image 
              src={user.image} 
              alt="Profile" 
              width={32} 
              height={32} 
              className="rounded-full" 
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-500" />
            </div>
          )}
          <span className="text-sm font-medium">{user?.name || 'User'}</span>
        </div>
      </div>
    </header>
  )
}
