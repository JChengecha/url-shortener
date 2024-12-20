import winston from 'winston'
import path from 'path'
import os from 'os'
import * as Types from './types'

// Custom log format with colorization and detailed information
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ 
    level, 
    message, 
    timestamp, 
    stack, 
    ...metadata 
  }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message} `
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += `\n  Metadata: ${JSON.stringify(metadata, null, 2)}`
    }
    
    // Add stack trace for errors
    if (stack) {
      msg += `\n  Stack: ${stack}`
    }
    
    return msg
  })
)

// Console transport with colors
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    logFormat
  ),
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
})

// Create logger instance
const logger = winston.createLogger({
  transports: [consoleTransport],
  format: logFormat
})

export class ContextLogger {
  private context: Types.PerformanceMetrics & Record<string, any>

  constructor(context: Record<string, any> = {}) {
    this.context = {
      ...context,
      hostname: typeof os !== 'undefined' ? os.hostname() : 'client',
      pid: typeof process !== 'undefined' ? process.pid : 0,
      startTime: Date.now(),
      endTime: 0,
      duration: 0
    }
  }

  private log(level: string, message: string, metadata?: Record<string, any>) {
    logger.log(level, message, {
      ...this.context,
      ...metadata
    })
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata)
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata)
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata)
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata)
  }

  time(label: string) {
    this.context[`timer_${label}`] = Date.now()
  }

  timeEnd(label: string, metadata?: Record<string, any>) {
    const startTime = this.context[`timer_${label}`]
    if (!startTime) {
      this.warn(`Timer '${label}' does not exist`)
      return
    }

    const duration = Date.now() - startTime
    delete this.context[`timer_${label}`]

    this.info(`${label} completed`, {
      ...metadata,
      duration,
      label
    })
  }

  audit(action: string, details: Record<string, any>) {
    this.info(`AUDIT: ${action}`, {
      audit: true,
      action,
      ...details
    })
  }
}

// Create a default logger with no specific context
export const defaultLogger = new ContextLogger()

// Middleware for request logging
export function requestLogger(req: any, res: any, next: Function) {
  const startTime = Date.now()
  const logger = new ContextLogger({
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent']
  })

  logger.info('Request started')

  // Log response when finished
  res.on('finish', () => {
    logger.info('Request completed', {
      statusCode: res.statusCode,
      duration: Date.now() - startTime
    })
  })

  next()
}

// Export a function to create a logger with a specific context
export function createContextLogger(context: Record<string, any>) {
  return new ContextLogger(context)
}
