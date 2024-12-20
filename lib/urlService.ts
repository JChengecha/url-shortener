import { nanoid } from 'nanoid'
import { kvDatabase, Url } from './kvDatabase'
import { z } from 'zod'

// URL validation schema
const UrlSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  customAlias: z.string().optional(),
  expiryDays: z.number().min(1).max(365).optional()
})

export class UrlService {
  // Create a new shortened URL
  static async createShortUrl(
    originalUrl: string, 
    userId: string, 
    options?: {
      customAlias?: string, 
      expiryDays?: number
    }
  ): Promise<Url> {
    try {
      // Validate input
      const validatedData = UrlSchema.parse({
        originalUrl,
        customAlias: options?.customAlias,
        expiryDays: options?.expiryDays
      })

      // Create short URL via KV Database
      return await kvDatabase.createShortUrl({
        originalUrl,
        userId,
        customAlias: validatedData.customAlias,
        expiryDays: validatedData.expiryDays
      })
    } catch (error) {
      console.error('URL creation error:', error)
      throw error
    }
  }

  // Retrieve URL by short code
  static async getUrlByShortCode(shortCode: string): Promise<Url | null> {
    try {
      return await kvDatabase.getUrlByShortCode(shortCode)
    } catch (error) {
      console.error('URL retrieval error:', error)
      return null
    }
  }

  // Track URL click
  static async trackUrlClick(
    urlId: string, 
    clickDetails: {
      ipAddress?: string,
      country?: string,
      city?: string,
      referrer?: string
    }
  ): Promise<Url> {
    try {
      return await kvDatabase.trackUrlClick(urlId, clickDetails)
    } catch (error) {
      console.error('Click tracking error:', error)
      throw error
    }
  }

  // List URLs for a user
  static async listUrlsForUser(userId: string): Promise<Url[]> {
    try {
      return await kvDatabase.listUrlsForUser(userId)
    } catch (error) {
      console.error('URL listing error:', error)
      return []
    }
  }

  // Get URL analytics
  static async getUrlAnalytics(urlId: string) {
    try {
      return await kvDatabase.getUrlAnalytics(urlId)
    } catch (error) {
      console.error('Analytics retrieval error:', error)
      throw error
    }
  }

  // Validate URL
  static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Generate custom alias
  static generateCustomAlias(length: number = 8): string {
    return nanoid(length)
  }
}
