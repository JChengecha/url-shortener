'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UrlForm() {
  const [longUrl, setLongUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShortUrl('')
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl })
      })
      const data = await response.json()
      if (response.ok) {
        setShortUrl(data.shortUrl)
      } else {
        setError(data.error || 'An error occurred while shortening the URL')
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError('An unexpected error occurred. Please try again.')
    }
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
        <div className="mt-4 p-4 bg-light-gray dark:bg-dark-gray rounded-md">
          <p className="text-charcoal dark:text-off-white">Shortened URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline dark:text-mint">
            {shortUrl}
          </a>
        </div>
      )}
    </form>
  )
}

