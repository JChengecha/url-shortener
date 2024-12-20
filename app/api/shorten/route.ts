import { NextResponse } from 'next/server'
import { z } from 'zod'
import { UrlService } from '@/lib/urlService'

// Input validation schema
const shortenInputSchema = z.object({
  longUrl: z.string().url('Invalid URL format'),
  customAlias: z.string().optional(),
  expiryDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
})

export async function POST(req: Request) {
  try {
    // Parse and validate input
    const body = await req.json()
    const { longUrl, customAlias, expiryDate } = shortenInputSchema.parse(body)

    // Shorten URL
    const urlEntry = await UrlService.shortenUrl({
      originalUrl: longUrl,
      customAlias,
      expiryDate
    })

    // Construct full short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${urlEntry.shortUrl}`

    return NextResponse.json({ 
      shortUrl, 
      shortCode: urlEntry.shortUrl,
      originalUrl: urlEntry.originalUrl,
      createdAt: urlEntry.createdAt
    })
  } catch (error) {
    console.error('Error in /api/shorten:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }

    // Handle other errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Internal server error: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 })
  }
}
