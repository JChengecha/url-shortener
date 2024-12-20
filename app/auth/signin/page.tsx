'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (result?.error) {
        toast.error('Sign In Failed', {
          description: 'Invalid email or password'
        })
      } else {
        toast.success('Signed in successfully')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const handleSocialLogin = async (provider: string) => {
    await signIn(provider, { 
      callbackUrl: '/dashboard',
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="container max-w-md mx-auto p-4 md:p-6 xl:p-8 bg-white rounded-lg shadow-md">
        <div className="text-2xl font-bold text-center mb-6">Sign In</div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            placeholder="E-mail"
            id="email"
            name="email"
            type="email"
            className="block w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            id="password"
            name="password"
            type="password"
            className="block w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div className="text-right">
            <Link href="/auth/reset-password" className="text-blue-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <span>Or Sign in with</span>
          
          <div className="flex justify-center space-x-4 mt-4">
            <button 
              className="bg-red-500 text-white p-2 rounded-full"
              onClick={() => handleSocialLogin('google')}
            >
              <svg
                viewBox="0 0 488 512"
                height="1.5em"
                xmlns="http://www.w3.org/2000/svg"
                className="inline-block"
                fill="white"
              >
                <path
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <span>Don't have an account? </span>
            <Link href="/auth/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
