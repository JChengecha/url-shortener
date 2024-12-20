import { z } from 'zod'
import { defaultLogger } from './logger'
import * as Types from './types'

/**
 * Enumeration of error types used throughout the application
 * @description Provides a standardized set of error types for consistent error handling
 */
export enum ErrorType {
  // Authentication Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  CURRENT_PASSWORD_INCORRECT = 'CURRENT_PASSWORD_INCORRECT',
  
  // URL Management Errors
  URL_NOT_FOUND = 'URL_NOT_FOUND',
  INVALID_URL = 'INVALID_URL',
  CUSTOM_ALIAS_TAKEN = 'CUSTOM_ALIAS_TAKEN',
  SHORT_CODE_ALREADY_IN_USE = 'SHORT_CODE_ALREADY_IN_USE',
  
  // Database Errors
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // General Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * Custom error class for handling application-specific errors
 * @description Provides a structured way to create and manage errors with additional context
 */
export class AppError extends Error {
  /**
   * The type of error from the ErrorType enum
   */
  public type: ErrorType

  /**
   * HTTP status code associated with the error
   */
  public statusCode: number

  /**
   * Indicates whether the error is an operational (expected) error
   */
  public isOperational: boolean

  /**
   * Optional detailed error information
   */
  public details?: Types.DetailedError

  /**
   * Create a new AppError instance
   * @param message Human-readable error message
   * @param type Error type from ErrorType enum
   * @param statusCode HTTP status code (default: 500)
   * @param isOperational Whether the error is operational (default: true)
   * @param details Optional detailed error information
   */
  constructor(
    message: string, 
    type: ErrorType, 
    statusCode: number = 500, 
    isOperational: boolean = true,
    details?: Types.DetailedError
  ) {
    super(message)
    
    this.name = 'AppError'
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    // Ensures that the error can be properly traced
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Converts the error to a standardized API response
   * @returns A structured error response object
   */
  toJSON(): Types.ApiResponse<null> {
    return {
      success: false,
      error: {
        type: this.type,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    }
  }
}

/**
 * Error logging and handling service
 * @description Provides centralized error logging and processing capabilities
 */
export class ErrorLogger {
  /**
   * Log an error with different severity levels
   * @param error The error to log
   * @param severity Logging severity (default: 'error')
   */
  static log(error: Error | AppError, severity: 'info' | 'warn' | 'error' = 'error') {
    const errorDetails: Types.DetailedError = {
      type: error instanceof AppError ? error.type : 'UNKNOWN',
      message: error.message,
      code: error instanceof AppError ? error.statusCode : 500,
      details: error instanceof AppError ? error.details : undefined,
      timestamp: new Date()
    }

    // Log using the default logger
    switch (severity) {
      case 'info':
        defaultLogger.info('Error logged', errorDetails)
        break
      case 'warn':
        defaultLogger.warn('Error logged', errorDetails)
        break
      case 'error':
      default:
        defaultLogger.error('Error logged', errorDetails)
    }
  }

  /**
   * Handle and process errors with optional custom handling
   * @param error The error to handle
   * @param customHandler Optional custom error handling function
   * @returns Processed AppError instance
   */
  static handle(
    error: Error | AppError, 
    customHandler?: (error: Error | AppError) => void
  ): AppError {
    // Convert to AppError if not already
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error.message, 
          ErrorType.INTERNAL_SERVER, 
          500, 
          false,
          {
            type: 'UNKNOWN',
            message: error.message,
            details: error instanceof Error ? { originalError: error.name } : undefined,
            timestamp: new Date()
          }
        )

    // Log the error
    this.log(appError)

    // Optional custom error handling
    if (customHandler) {
      customHandler(appError)
    }

    return appError
  }
}

/**
 * Utility function for handling async errors in routes and middleware
 * @param fn The async function to wrap
 * @returns A middleware-compatible error-handling function
 */
export const catchAsync = (fn: Function) => {
  return async (req: any, res: any, next: Function) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      const processedError = ErrorLogger.handle(error as Error)
      
      // For API routes
      if (res.status) {
        res.status(processedError.statusCode).json(processedError.toJSON())
      }
      
      // For middleware or other contexts
      next(processedError)
    }
  }
}

/**
 * Handles Zod validation errors and converts them to AppError
 * @param error The validation error to process
 * @returns An AppError representing the validation failure
 */
export const handleValidationError = (error: any) => {
  if (error.name === 'ZodError') {
    const validationErrors: Types.ValidationError[] = error.errors.map((err: any) => ({
      path: err.path.join('.'),
      message: err.message
    }))

    return new AppError(
      'Validation failed', 
      ErrorType.VALIDATION_ERROR, 
      400, 
      true, 
      {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { validationErrors },
        timestamp: new Date()
      }
    )
  }
  return error
}
