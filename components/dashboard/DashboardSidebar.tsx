import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Session } from 'next-auth'

export default function DashboardSidebar() {
  return (
    <nav className="w-64 bg-white border-r shadow-lg h-full fixed left-0 top-0 pt-16 z-20">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">User</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
      <ul className="space-y-2 p-4">
        <li>
          <Link 
            href="/dashboard" 
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="ml-3">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/links/create" 
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="ml-3">Create Link</span>
          </Link>
        </li>
        <li>
          <Link 
            href="/settings" 
            className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="ml-3">Account Settings</span>
          </Link>
        </li>
        <li>
          <LogoutButton className="w-full text-left p-3 hover:bg-gray-100 rounded-lg transition-colors">
            Logout
          </LogoutButton>
        </li>
      </ul>
    </nav>
  )
}
