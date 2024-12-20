'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { toast } from 'sonner'
import { kvDatabase } from '@/lib/kvDatabase'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subscriptionPlan: 'Free' as 'Free' | 'Pro',
    notifications: {
      email: false,
      sms: false,
      marketing: false
    },
    twoFactorEnabled: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (session?.user) {
      setUserData(prev => ({
        ...prev,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email,
        subscriptionPlan: session.user.subscriptionPlan,
        notifications: session.user.notifications || {
          email: false,
          sms: false,
          marketing: false
        },
        twoFactorEnabled: session.user.twoFactorEnabled || false
      }))
    }
  }, [session])

  const handleProfileUpdate = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword, ...profileData } = userData
      
      // Basic validation
      if (newPassword && newPassword !== confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      // Update profile
      const updatedUser = await kvDatabase.updateUserProfile(session?.user.id!, {
        firstName: profileData.firstName,
        lastName: profileData.lastName
      })

      // Update settings
      await kvDatabase.updateUserSettings(session?.user.id!, {
        notifications: profileData.notifications,
        twoFactorEnabled: profileData.twoFactorEnabled
      })

      // Change password if provided
      if (newPassword) {
        await kvDatabase.changePassword(
          session?.user.id!, 
          currentPassword, 
          newPassword
        )
      }

      // Update session
      await update({
        ...updatedUser,
        notifications: profileData.notifications,
        twoFactorEnabled: profileData.twoFactorEnabled
      })

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Profile update failed', {
        description: (error as Error).message
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6" /> User Profile
          </CardTitle>
          <LogoutButton />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={userData.firstName}
                    onChange={(e) => setUserData(prev => ({
                      ...prev, 
                      firstName: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={userData.lastName}
                    onChange={(e) => setUserData(prev => ({
                      ...prev, 
                      lastName: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={userData.email}
                    disabled
                    className="mt-2 bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Subscription Plan</Label>
                  <Input
                    value={userData.subscriptionPlan}
                    disabled
                    className="mt-2 bg-gray-100"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Notifications</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={userData.notifications.email}
                        onCheckedChange={(checked) => setUserData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: checked
                          }
                        }))}
                      />
                      <Label>Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={userData.notifications.sms}
                        onCheckedChange={(checked) => setUserData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            sms: checked
                          }
                        }))}
                      />
                      <Label>SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={userData.notifications.marketing}
                        onCheckedChange={(checked) => setUserData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            marketing: checked
                          }
                        }))}
                      />
                      <Label>Marketing Notifications</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Security</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={userData.twoFactorEnabled}
                      onCheckedChange={(checked) => setUserData(prev => ({
                        ...prev,
                        twoFactorEnabled: checked
                      }))}
                    />
                    <Label>Enable Two-Factor Authentication</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={userData.currentPassword}
                    onChange={(e) => setUserData(prev => ({
                      ...prev, 
                      currentPassword: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={userData.newPassword}
                    onChange={(e) => setUserData(prev => ({
                      ...prev, 
                      newPassword: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={userData.confirmPassword}
                    onChange={(e) => setUserData(prev => ({
                      ...prev, 
                      confirmPassword: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-6 text-right">
            <Button 
              onClick={handleProfileUpdate}
              className="w-full md:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
