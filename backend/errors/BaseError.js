/**
 * Base Error class for all custom application errors
 */
class BaseError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      isOperational: this.isOperational
    };
  }

  /**
   * Get user-friendly message
   */
  getUserMessage() {
    return this.message;
  }

  /**
   * Get error severity level
   */
  getSeverity() {
    if (this.statusCode >= 500) return 'error';
    if (this.statusCode >= 400) return 'warn';
    return 'info';
  }

  /**
   * Check if error should be reported to monitoring services
   */
  shouldReport() {
    return this.isOperational && this.statusCode >= 500;
  }

  /**
   * Get error context for logging
   */
  getContext() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = BaseError;