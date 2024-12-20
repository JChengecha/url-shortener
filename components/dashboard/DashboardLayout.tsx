'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Link2, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const NavLinks = [
    { 
      href: '/dashboard', 
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />, 
      label: 'Dashboard' 
    },
    { 
      href: '/create', 
      icon: <Link2 className="mr-2 h-4 w-4" />, 
      label: 'Create Link' 
    },
    { 
      href: '/settings', 
      icon: <Settings className="mr-2 h-4 w-4" />, 
      label: 'Account Settings' 
    }
  ]

  return (
    <div className="flex h-screen bg-light-gray dark:bg-charcoal">
      {/* Mobile Sidebar Toggle */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-gray 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
          <Link href="/dashboard" className="text-2xl font-bold text-charcoal dark:text-off-white">
            ShortLink
          </Link>
        </div>
        
        <nav className="mt-10 space-y-2 px-4">
          {NavLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-dark-gray shadow-sm">
          <div className="flex items-center justify-end h-16 px-6">
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-off-white dark:bg-charcoal">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
