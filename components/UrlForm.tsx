'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check } from 'lucide-react'

export default function UrlForm() {
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShortUrl('')
    setShortCode('')
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl })
      })
      const data = await response.json()
      if (response.ok) {
        setShortUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/${data.shortCode}`)
        setShortCode(data.shortCode)
        setCopied(false)
      } else {
        setError(data.error || 'An error occurred while shortening the URL')
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-off-white dark:bg-charcoal p-6 rounded-lg shadow-md">
      <Input
        type="url"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="Enter long URL"
        required
        className="bg-light-gray dark:bg-dark-gray text-charcoal dark:text-off-white"
      />
      <Button type="submit" className="w-full bg-mint text-dark-gray hover:bg-teal">Shorten URL</Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {shortUrl && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Input 
              type="text" 
              value={shortUrl} 
              readOnly 
              className="flex-grow bg-light-gray dark:bg-dark-gray text-charcoal dark:text-off-white"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={handleCopy}
              className="text-charcoal dark:text-off-white border-charcoal dark:border-off-white"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Short code: {shortCode}
          </p>
          {copied && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              URL copied to clipboard!
            </p>
          )}
        </div>
      )}
    </form>
  )
}
