import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { saveUrl } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { longUrl } = await req.json()
    if (!longUrl) {
      return NextResponse.json({ error: 'Long URL is required' }, { status: 400 })
    }
    const shortCode = nanoid(7) // Generate a 7-character short code
    await saveUrl(longUrl, shortCode)
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`
    return NextResponse.json({ shortUrl })
  } catch (error) {
    console.error('Error in /api/shorten:', error)
    // Check if error is an instance of Error
    if (error instanceof Error) {
      return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

