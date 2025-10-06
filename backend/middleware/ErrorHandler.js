const { v4: uuidv4 } = require('uuid');
const {
  BaseError,
  ValidationError,
  AuthError,
  DatabaseError,
  BusinessLogicError,
  ExternalServiceError,
  isOperationalError,
  shouldReportError
} = require('../errors');
const Logger = require('../utils/Logger');

/**
 * Enhanced Error Handler with structured logging and recovery mechanisms
 */
class ErrorHandler {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * Main error handling middleware
   */
  handleError = (err, req, res, next) => {
    const requestId = req.requestId || uuidv4();
    const timestamp = new Date().toISOString();

    // Convert known error types to custom errors
    const error = this.normalizeError(err);

    // Log the error with context
    this.logError(error, {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      timestamp
    });

    // Report error to monitoring services if needed
    if (shouldReportError(error)) {
      this.reportError(error, req);
    }

    // Format and send error response
    const errorResponse = this.formatErrorResponse(error, requestId, timestamp);
    res.status(errorResponse.statusCode).json(errorResponse.body);
  };

  /**
   * 404 Not Found handler
   */
  handleNotFound = (req, res, next) => {
    const error = new BaseError(
      `Resource not found: ${req.originalUrl}`,
      404,
      'NOT_FOUND'
    );
    next(error);
  };

  /**
   * Async wrapper for route handlers
   */
  asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Convert various error types to custom error classes
   */
  normalizeError(error) {
    // Already a custom error
    if (error instanceof BaseError) {
      return error;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError' && error.errors) {
      return ValidationError.fromMongooseError(error);
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
      return ValidationError.forField(
        error.path,
        `Invalid ${error.kind}: ${error.value}`
      );
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = this.extractDuplicateField(error);
      return DatabaseError.duplicateKey(field, 'existing value');
    }

    // MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return DatabaseError.fromMongoError(error);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return AuthError.invalidToken();
    }

    if (error.name === 'TokenExpiredError') {
      return AuthError.tokenExpired();
    }

    // Multer file upload errors
    if (error.name === 'MulterError') {
      return this.handleMulterError(error);
    }

    // HTTP errors with status codes
    if (error.statusCode || error.status) {
      const statusCode = error.statusCode || error.status;
      
      if (statusCode === 401) {
        return AuthError.authenticationFailed();
      }
      
      if (statusCode === 403) {
        return AuthError.authorizationFailed();
      }
      
      if (statusCode === 404) {
        return new BaseError(error.message, 404, 'NOT_FOUND');
      }
    }

    // Default to generic server error
    return new BaseError(
      this.isDevelopment ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR',
      false // Not operational since it's unexpected
    );
  }

  /**
   * Handle Multer file upload errors
   */
  handleMulterError(error) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return ValidationError.forField('file', 'File size too large');
      case 'LIMIT_FILE_COUNT':
        return ValidationError.forField('files', 'Too many files');
      case 'LIMIT_UNEXPECTED_FILE':
        return ValidationError.forField('file', 'Unexpected file field');
      default:
        return new BaseError('File upload error', 400, 'FILE_UPLOAD_ERROR');
    }
  }

  /**
   * Extract field name from MongoDB duplicate key error
   */
  extractDuplicateField(error) {
    const keyPattern = error.keyPattern || {};
    const fields = Object.keys(keyPattern);
    return fields.length > 0 ? fields[0] : 'unknown';
  }

  /**
   * Log error with structured format
   */
  logError(error, context = {}) {
    const logData = {
      timestamp: context.timestamp || new Date().toISOString(),
      requestId: context.requestId,
      level: error.getSeverity ? error.getSeverity() : 'error',
      error: {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode || 500,
        errorCode: error.errorCode || 'UNKNOWN_ERROR',
        stack: error.stack,
        isOperational: isOperationalError(error)
      },
      request: {
        method: context.method,
        url: context.url,
        userAgent: context.userAgent,
        ip: context.ip,
        userId: context.userId
      }
    };

    // Add error-specific context
    if (error.toJSON) {
      logData.error.context = error.toJSON();
    }

    this.logger.error('Request error occurred', logData);
  }

  /**
   * Format error response for API
   */
  formatErrorResponse(error, requestId, timestamp) {
    const statusCode = error.statusCode || 500;
    
    const baseResponse = {
      success: false,
      error: {
        message: error.getUserMessage ? error.getUserMessage() : error.message,
        code: error.errorCode || 'INTERNAL_ERROR',
        type: error.constructor.name
      },
      timestamp,
      requestId
    };

    // Add retry information for retryable errors
    if (error.retryable) {
      baseResponse.error.retryable = true;
      if (error.retryAfter) {
        baseResponse.error.retryAfter = error.retryAfter;
      }
    }

    // Add validation errors
    if (error instanceof ValidationError && error.errors.length > 0) {
      baseResponse.error.validation = error.errors;
    }

    // Add detailed error information in development
    if (this.isDevelopment) {
      baseResponse.error.details = {
        originalMessage: error.message,
        stack: error.stack
      };

      if (error.toJSON) {
        baseResponse.error.context = error.toJSON();
      }
    }

    return {
      statusCode,
      body: baseResponse
    };
  }

  /**
   * Report error to external monitoring services
   */
  reportError(error, req = null) {
    try {
      // In production, you would integrate with services like:
      // - Sentry
      // - Bugsnag
      // - Rollbar
      // - Custom logging service

      const errorReport = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          statusCode: error.statusCode
        },
        request: req ? {
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.body,
          user: req.user
        } : null,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      };

      // For now, just log to console in development
      if (this.isDevelopment) {
        console.error('🚨 Error Report:', JSON.stringify(errorReport, null, 2));
      }

      // TODO: Implement actual error reporting service integration
      // await errorReportingService.report(errorReport);
    } catch (reportingError) {
      this.logger.error('Failed to report error', { 
        originalError: error.message,
        reportingError: reportingError.message 
      });
    }
  }

  /**
   * Handle uncaught exceptions
   */
  handleUncaughtException = (error) => {
    this.logger.error('Uncaught Exception', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    // Report critical error
    this.reportError(error);

    // Graceful shutdown
    process.exit(1);
  };

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection = (reason, promise) => {
    this.logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? {
        name: reason.name,
        message: reason.message,
        stack: reason.stack
      } : reason,
      promise: promise.toString()
    });

    // Report critical error
    if (reason instanceof Error) {
      this.reportError(reason);
    }

    // Graceful shutdown
    process.exit(1);
  };

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    process.on('uncaughtException', this.handleUncaughtException);
    process.on('unhandledRejection', this.handleUnhandledRejection);
    
    this.logger.info('Global error handlers registered');
  }

  /**
   * Database operation retry wrapper
   */
  withRetry = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Only retry for retryable errors
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        this.logger.warn(`Operation failed, retrying (${attempt}/${maxRetries})`, {
          error: error.message,
          attempt,
          nextRetryIn: delay
        });

        // Exponential backoff
        await this.sleep(delay * Math.pow(2, attempt - 1));
      }
    }

    throw lastError;
  };

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    return (error instanceof DatabaseError && error.retryable) ||
           (error instanceof ExternalServiceError && error.retryable) ||
           (error.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code));
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ErrorHandler;