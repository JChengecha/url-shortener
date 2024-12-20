import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'
import { AppError, ErrorType, ErrorLogger } from './errors'
import * as Types from './types'

// Zod schemas for validation
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email('Invalid email format'),
  name: z.string(),
  passwordHash: z.string(),
  subscriptionPlan: z.enum(['Free', 'Pro']).default('Free'),
  createdAt: z.date(),
  profileImage: z.string().optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  twoFactorEnabled: z.boolean().optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    marketing: z.boolean().optional()
  }).optional()
})

const UrlSchema = z.object({
  id: z.string(),
  shortCode: z.string(),
  originalUrl: z.string().url('Invalid URL format'),
  userId: z.string(),
  createdAt: z.date(),
  expiryDate: z.date().optional(),
  clickCount: z.number().default(0),
  clickDetails: z.array(z.object({
    timestamp: z.date(),
    ipAddress: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    referrer: z.string().optional()
  })).optional()
})

const UserCredentialsSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
})

const UserProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
})

const UserAccountSchema = UserSchema.merge(UserProfileSchema)

const UrlCreationParamsSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  userId: z.string(),
  customAlias: z.string().optional(),
  expiryDays: z.number().optional()
})

const ShortUrlSchema = UrlSchema

const ClickDetailSchema = z.object({
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  referrer: z.string().optional()
})

const UrlAnalyticsSchema = z.object({
  totalClicks: z.number(),
  clicksByCountry: z.record(z.number()),
  clicksByReferrer: z.record(z.number())
})

export type User = z.infer<typeof UserSchema>
export type Url = z.infer<typeof UrlSchema>

export class KvDatabase {
  // User Management
  async createUser(userData: z.infer<typeof UserCredentialsSchema> & {
    firstName: string, 
    lastName: string 
  }): Promise<z.infer<typeof UserAccountSchema>> {
    try {
      // Validate input
      const validatedData = UserCredentialsSchema
        .merge(
          UserProfileSchema.pick({ 
            firstName: true, 
            lastName: true 
          })
        )
        .parse({
          ...userData,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`
        })

      // Check if user already exists
      const existingUser = await this.findUserByEmail(validatedData.email)
      if (existingUser) {
        throw new AppError(
          'User already exists', 
          ErrorType.USER_ALREADY_EXISTS, 
          409
        )
      }

      // Hash password
      const passwordHash = await hash(userData.password, 10)

      // Generate user ID
      const userId = `user:${nanoid()}`

      // Prepare user object
      const user: z.infer<typeof UserAccountSchema> = {
        id: userId,
        email: validatedData.email,
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        passwordHash,
        profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(validatedData.firstName)}+${encodeURIComponent(validatedData.lastName)}`,
        createdAt: new Date(),
        notifications: {
          email: true,
          sms: false,
          marketing: false
        },
        twoFactorEnabled: false,
        subscriptionPlan: 'Free'
      }

      // Validate final user object
      UserAccountSchema.parse(user)

      // Save user to KV store
      await kv.set(userId, JSON.stringify(user))
      await kv.sadd('users', userId)

      return user
    } catch (error) {
      return ErrorLogger.handle(error as Error) as never
    }
  }

  async authenticateUser(email: string, password: string): Promise<z.infer<typeof UserAccountSchema> | null> {
    try {
      // Validate credentials
      UserCredentialsSchema.parse({ email, password })

      // Find user by email
      const userId = await kv.srandmember(`users:${email}`)
      if (!userId) return null

      // Retrieve user details
      const userJson = await kv.get(`user:${userId}`)
      if (!userJson) return null

      const user = JSON.parse(userJson as string) as z.infer<typeof UserAccountSchema>

      // Compare passwords
      const isValid = await compare(password, user.passwordHash)
      if (!isValid) {
        throw new AppError(
          'Invalid credentials', 
          ErrorType.INVALID_CREDENTIALS, 
          401
        )
      }

      return user
    } catch (error) {
      return ErrorLogger.handle(error as Error) as never
    }
  }

  // URL Management
  async createShortUrl(urlData: z.infer<typeof UrlCreationParamsSchema>): Promise<z.infer<typeof ShortUrlSchema>> {
    try {
      // Validate input
      const validatedData = UrlCreationParamsSchema.parse(urlData)

      // Check if custom alias is already taken
      const existingUrlId = await kv.get(validatedData.customAlias || '')
      if (existingUrlId) {
        throw new AppError(
          'Custom alias is already taken', 
          ErrorType.CUSTOM_ALIAS_TAKEN, 
          409
        )
      }

      // Generate URL ID and short code
      const urlId = `url:${nanoid()}`
      const shortCode = validatedData.customAlias || nanoid(8)

      // Prepare URL object
      const url: z.infer<typeof ShortUrlSchema> = {
        id: urlId,
        shortCode,
        originalUrl: validatedData.originalUrl,
        userId: validatedData.userId,
        createdAt: new Date(),
        expiryDate: new Date(Date.now() + (validatedData.expiryDays || 30) * 24 * 60 * 60 * 1000),
        clickCount: 0
      }

      // Validate final URL object
      ShortUrlSchema.parse(url)

      // Save URL to KV store
      await kv.set(shortCode, urlId)
      await kv.set(urlId, JSON.stringify(url))
      await kv.sadd(`urls:${validatedData.userId}`, urlId)

      return url
    } catch (error) {
      return ErrorLogger.handle(error as Error) as never
    }
  }

  async trackUrlClick(urlId: string, clickDetails: Partial<z.infer<typeof ClickDetailSchema>>): Promise<z.infer<typeof ShortUrlSchema>> {
    try {
      const urlJson = await kv.get(urlId)
      if (!urlJson) {
        throw new AppError(
          'URL not found', 
          ErrorType.URL_NOT_FOUND, 
          404
        )
      }

      const url = JSON.parse(urlJson as string) as z.infer<typeof ShortUrlSchema>

      // Validate click details
      const validatedClickDetail = ClickDetailSchema.partial().parse({
        timestamp: new Date(),
        ...clickDetails
      })

      // Update click count and details
      const updatedUrl: z.infer<typeof ShortUrlSchema> = {
        ...url,
        clickCount: (url.clickCount || 0) + 1,
        clickDetails: [
          ...(url.clickDetails || []),
          validatedClickDetail
        ]
      }

      // Validate updated URL
      ShortUrlSchema.parse(updatedUrl)

      // Save updated URL
      await kv.set(urlId, JSON.stringify(updatedUrl))

      return updatedUrl
    } catch (error) {
      return ErrorLogger.handle(error as Error) as never
    }
  }

  // URL Analytics
  async getUrlAnalytics(urlId: string): Promise<z.infer<typeof UrlAnalyticsSchema>> {
    try {
      const urlJson = await kv.get(urlId)
      if (!urlJson) {
        throw new AppError(
          'URL not found for analytics', 
          ErrorType.URL_NOT_FOUND, 
          404
        )
      }

      const url = JSON.parse(urlJson as string) as z.infer<typeof ShortUrlSchema>
      const clickDetails = url.clickDetails || []

      // Compute analytics
      const analytics: z.infer<typeof UrlAnalyticsSchema> = {
        totalClicks: url.clickCount || 0,
        clicksByCountry: {},
        clicksByReferrer: {}
      }

      // Aggregate country clicks
      clickDetails.forEach(detail => {
        if (detail.country) {
          analytics.clicksByCountry[detail.country] = 
            (analytics.clicksByCountry[detail.country] || 0) + 1
        }

        // Aggregate referrer clicks
        if (detail.referrer) {
          analytics.clicksByReferrer[detail.referrer] = 
            (analytics.clicksByReferrer[detail.referrer] || 0) + 1
        }
      })

      // Validate analytics
      UrlAnalyticsSchema.parse(analytics)

      return analytics
    } catch (error) {
      return ErrorLogger.handle(error as Error) as never
    }
  }
}

export const kvDatabase = new KvDatabase()
