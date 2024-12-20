import { z } from 'zod'

/**
 * Utility type for creating nullable types
 * @template T The base type to make nullable
 */
export type Nullable<T> = T | null

/**
 * Utility type for creating optional types
 * @template T The base type to make optional
 */
export type Optional<T> = T | undefined

/**
 * Comprehensive documentation for the application's type system
 * @module Types
 * @description Defines all type schemas and interfaces for the URL Shortener application
 */

/**
 * User Credentials Validation Schema
 * @description Validates user login and registration credentials
 */
export const UserCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be less than 64 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'Password must include uppercase, lowercase, number, and special character')
})

/**
 * User Profile Validation Schema
 * @description Defines the structure and validation rules for user profiles
 */
export const UserProfileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email format'),
  name: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  profileImage: z.string().url('Invalid profile image URL').optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    marketing: z.boolean().default(false)
  }).optional()
})

/**
 * User Settings Validation Schema
 * @description Defines the structure and validation rules for user settings
 */
export const UserSettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  subscriptionPlan: z.enum(['Free', 'Pro', 'Enterprise']).default('Free')
})

/**
 * User Account Validation Schema
 * @description Comprehensive schema for user accounts
 */
export const UserAccountSchema = UserProfileSchema.merge(UserSettingsSchema).extend({
  passwordHash: z.string()
})

/**
 * URL Creation Parameters Validation Schema
 * @description Validates parameters for creating a shortened URL
 */
export const UrlCreationParamsSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  userId: z.string(),
  customAlias: z.string().optional(),
  expiryDays: z.number().int().min(1).max(365).optional().default(30)
})

/**
 * Click Details Validation Schema
 * @description Tracks detailed information about URL clicks
 */
export const ClickDetailSchema = z.object({
  timestamp: z.date(),
  ipAddress: z.string().ip().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  referrer: z.string().url().optional()
})

/**
 * Short URL Validation Schema
 * @description Defines the structure of a shortened URL
 */
export const ShortUrlSchema = z.object({
  id: z.string(),
  shortCode: z.string(),
  originalUrl: z.string().url('Invalid URL format'),
  userId: z.string(),
  createdAt: z.date(),
  expiryDate: z.date(),
  clickCount: z.number().int().min(0).default(0),
  clickDetails: z.array(ClickDetailSchema).optional()
})

/**
 * URL Analytics Validation Schema
 * @description Tracks and validates URL performance metrics
 */
export const UrlAnalyticsSchema = z.object({
  totalClicks: z.number().int().min(0),
  clicksByCountry: z.record(z.string(), z.number()),
  clicksByReferrer: z.record(z.string(), z.number())
})

/**
 * API Response Schema
 * @description Standardized API response structure
 * @template T The type of data returned in the response
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional()
})

/**
 * Validation Error Schema
 * @description Tracks validation errors with path and message
 */
export const ValidationErrorSchema = z.object({
  path: z.string(),
  message: z.string()
})

/**
 * Authentication Token Schema
 * @description Defines the structure of authentication tokens
 */
export const AuthTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.date()
})

/**
 * Geolocation Schema
 * @description Tracks geographical information
 */
export const GeoLocationSchema = z.object({
  ip: z.string().ip(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional()
})

/**
 * Performance Metrics Schema
 * @description Tracks application and request performance
 */
export const PerformanceMetricsSchema = z.object({
  startTime: z.number(),
  endTime: z.number(),
  duration: z.number(),
  memoryUsed: z.number().optional()
})

// Infer TypeScript types from Zod schemas
export type UserCredentials = z.infer<typeof UserCredentialsSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type UserSettings = z.infer<typeof UserSettingsSchema>
export type UserAccount = z.infer<typeof UserAccountSchema>
export type UrlCreationParams = z.infer<typeof UrlCreationParamsSchema>
export type ClickDetail = z.infer<typeof ClickDetailSchema>
export type ShortUrl = z.infer<typeof ShortUrlSchema>
export type UrlAnalytics = z.infer<typeof UrlAnalyticsSchema>
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    type: string
    message: string
    details?: any
  }
}
export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type AuthToken = z.infer<typeof AuthTokenSchema>
export type GeoLocation = z.infer<typeof GeoLocationSchema>
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>

/**
 * Utility function to check if a value is null or undefined
 * @param value The value to check
 * @returns True if the value is null or undefined, false otherwise
 */
export function isNullOrUndefined<T>(value: T | null | undefined): value is null | undefined {
  return value === null || value === undefined
}

/**
 * Utility function to assert that a value is not null or undefined
 * @param value The value to assert
 * @param message The error message to throw if the value is null or undefined
 * @returns The value if it is not null or undefined
 */
export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (isNullOrUndefined(value)) {
    throw new Error(message || 'Value cannot be null or undefined')
  }
  return value
}

/**
 * Type guard to check if an object is a UserAccount
 * @param obj The object to check
 * @returns True if the object is a UserAccount, false otherwise
 */
export function isUserAccount(obj: any): obj is UserAccount {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.passwordHash === 'string'
  )
}

/**
 * Type guard to check if an object is a ShortUrl
 * @param obj The object to check
 * @returns True if the object is a ShortUrl, false otherwise
 */
export function isShortUrl(obj: any): obj is ShortUrl {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.shortCode === 'string' &&
    typeof obj.originalUrl === 'string'
  )
}

/**
 * Enum for user roles
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

/**
 * Type for partial updates
 * @template T The type of the object being updated
 */
export type PartialUpdate<T> = {
  [P in keyof T]?: T[P]
}

/**
 * Interface for detailed errors
 */
export interface DetailedError {
  type: string
  message: string
  code?: number
  details?: Record<string, any>
  timestamp?: Date
}
