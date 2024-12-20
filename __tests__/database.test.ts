import { kv } from '@vercel/kv'
import { nanoid } from 'nanoid'
import { hash, compare } from 'bcrypt'
import { kvDatabase } from '../lib/kvDatabase'
import * as Types from '../lib/types'
import { AppError, ErrorType } from '../lib/errors'

// Mock dependencies
jest.mock('@vercel/kv')
jest.mock('nanoid')
jest.mock('bcrypt')

describe('KV Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Management', () => {
    const mockUserData: Types.UserCredentials & { 
      firstName: string, 
      lastName: string 
    } = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    }

    it('should create a new user successfully', async () => {
      // Mock dependencies
      (nanoid as jest.Mock).mockReturnValue('mockUserId')
      ;(hash as jest.Mock).mockResolvedValue('hashedPassword')
      ;(kv.get as jest.Mock).mockResolvedValue(null)
      ;(kv.set as jest.Mock).mockResolvedValue(true)
      ;(kv.sadd as jest.Mock).mockResolvedValue(true)

      // Perform user creation
      const user = await kvDatabase.createUser(mockUserData)

      // Assertions
      expect(user).toMatchObject({
        id: 'user:mockUserId',
        email: mockUserData.email,
        name: `${mockUserData.firstName} ${mockUserData.lastName}`,
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        passwordHash: 'hashedPassword',
        subscriptionPlan: 'Free'
      })

      // Verify KV interactions
      expect(kv.set).toHaveBeenCalledWith(
        'user:mockUserId', 
        expect.any(String)
      )
      expect(kv.sadd).toHaveBeenCalledWith('users', 'user:mockUserId')
    })

    it('should throw an error when user already exists', async () => {
      // Mock existing user
      ;(kv.get as jest.Mock).mockResolvedValue(JSON.stringify({
        email: mockUserData.email
      }))

      // Attempt to create user
      await expect(kvDatabase.createUser(mockUserData)).rejects.toThrow(
        expect.objectContaining({
          type: ErrorType.USER_ALREADY_EXISTS
        })
      )
    })

    it('should authenticate user with correct credentials', async () => {
      // Mock user data
      const mockUser: Types.UserAccount = {
        id: 'user:mockUserId',
        email: mockUserData.email,
        name: `${mockUserData.firstName} ${mockUserData.lastName}`,
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        passwordHash: await hash(mockUserData.password, 10),
        subscriptionPlan: 'Free',
        createdAt: new Date(),
        notifications: {
          email: true,
          sms: false,
          marketing: false
        },
        twoFactorEnabled: false
      }

      // Mock KV and bcrypt
      ;(kv.srandmember as jest.Mock).mockResolvedValue('user:mockUserId')
      ;(kv.get as jest.Mock).mockResolvedValue(JSON.stringify(mockUser))
      ;(compare as jest.Mock).mockResolvedValue(true)

      // Authenticate user
      const authenticatedUser = await kvDatabase.authenticateUser(
        mockUserData.email, 
        mockUserData.password
      )

      // Assertions
      expect(authenticatedUser).toMatchObject({
        email: mockUserData.email,
        firstName: mockUserData.firstName
      })
    })
  })

  describe('URL Management', () => {
    const mockUrlData: Types.UrlCreationParams = {
      originalUrl: 'https://example.com',
      userId: 'user:mockUserId',
      customAlias: 'custom-alias'
    }

    it('should create a short URL successfully', async () => {
      // Mock dependencies
      (nanoid as jest.Mock).mockReturnValue('mockUrlId')
      ;(kv.get as jest.Mock).mockResolvedValue(null)
      ;(kv.set as jest.Mock).mockResolvedValue(true)
      ;(kv.sadd as jest.Mock).mockResolvedValue(true)

      // Create short URL
      const shortUrl = await kvDatabase.createShortUrl(mockUrlData)

      // Assertions
      expect(shortUrl).toMatchObject({
        id: 'url:mockUrlId',
        shortCode: mockUrlData.customAlias,
        originalUrl: mockUrlData.originalUrl,
        userId: mockUrlData.userId
      })

      // Verify KV interactions
      expect(kv.set).toHaveBeenCalledWith(
        mockUrlData.customAlias, 
        'url:mockUrlId'
      )
      expect(kv.set).toHaveBeenCalledWith(
        'url:mockUrlId', 
        expect.any(String)
      )
    })

    it('should track URL clicks', async () => {
      const mockUrl: Types.ShortUrl = {
        id: 'url:mockUrlId',
        shortCode: 'test-code',
        originalUrl: 'https://example.com',
        userId: 'user:mockUserId',
        createdAt: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        clickCount: 0
      }

      // Mock dependencies
      ;(kv.get as jest.Mock).mockResolvedValue(JSON.stringify(mockUrl))
      ;(kv.set as jest.Mock).mockResolvedValue(true)

      // Track URL click
      const updatedUrl = await kvDatabase.trackUrlClick('url:mockUrlId', {
        ipAddress: '192.168.1.1',
        country: 'US'
      })

      // Assertions
      expect(updatedUrl.clickCount).toBe(1)
      expect(updatedUrl.clickDetails).toHaveLength(1)
      expect(updatedUrl.clickDetails?.[0]).toMatchObject({
        ipAddress: '192.168.1.1',
        country: 'US'
      })
    })
  })
})
