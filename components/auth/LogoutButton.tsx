'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true, 
        callbackUrl: '/auth/signin' 
      })
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed', {
        description: 'An unexpected error occurred'
      })
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  )
}
