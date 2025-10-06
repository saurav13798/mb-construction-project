const BaseError = require('./BaseError');

/**
 * External Service Error for third-party service failures
 */
class ExternalServiceError extends BaseError {
  constructor(message, service, operation = null, originalError = null) {
    super(message, 503, 'EXTERNAL_SERVICE_ERROR', true);
    
    this.service = service;
    this.operation = operation;
    this.originalError = originalError;
    this.retryable = true;
    this.retryAfter = 60; // seconds
  }

  /**
   * Create service unavailable error
   */
  static serviceUnavailable(service, operation = null) {
    const error = new ExternalServiceError(
      `${service} service is currently unavailable`,
      service,
      operation
    );
    error.errorCode = 'SERVICE_UNAVAILABLE';
    return error;
  }

  /**
   * Create service timeout error
   */
  static serviceTimeout(service, operation = null, timeout = 30) {
    const error = new ExternalServiceError(
      `${service} service request timed out after ${timeout} seconds`,
      service,
      operation
    );
    error.errorCode = 'SERVICE_TIMEOUT';
    error.timeout = timeout;
    return error;
  }

  /**
   * Create rate limit exceeded error
   */
  static rateLimitExceeded(service, retryAfter = 3600) {
    const error = new ExternalServiceError(
      `${service} rate limit exceeded`,
      service
    );
    error.errorCode = 'RATE_LIMIT_EXCEEDED';
    error.retryAfter = retryAfter;
    return error;
  }

  /**
   * Create API key invalid error
   */
  static invalidApiKey(service) {
    const error = new ExternalServiceError(
      `Invalid API key for ${service}`,
      service
    );
    error.errorCode = 'INVALID_API_KEY';
    error.retryable = false;
    return error;
  }

  /**
   * Create quota exceeded error
   */
  static quotaExceeded(service, quotaType = 'requests') {
    const error = new ExternalServiceError(
      `${service} ${quotaType} quota exceeded`,
      service
    );
    error.errorCode = 'QUOTA_EXCEEDED';
    error.quotaType = quotaType;
    return error;
  }

  /**
   * Email service specific errors
   */
  static emailDeliveryFailed(recipient, reason = null) {
    const error = new ExternalServiceError(
      `Email delivery failed to ${recipient}${reason ? `: ${reason}` : ''}`,
      'email',
      'send'
    );
    error.errorCode = 'EMAIL_DELIVERY_FAILED';
    error.recipient = recipient;
    error.reason = reason;
    return error;
  }

  static emailServiceDown() {
    return ExternalServiceError.serviceUnavailable('Email', 'send');
  }

  /**
   * SMS service specific errors
   */
  static smsDeliveryFailed(phoneNumber, reason = null) {
    const error = new ExternalServiceError(
      `SMS delivery failed to ${phoneNumber}${reason ? `: ${reason}` : ''}`,
      'sms',
      'send'
    );
    error.errorCode = 'SMS_DELIVERY_FAILED';
    error.phoneNumber = phoneNumber;
    error.reason = reason;
    return error;
  }

  /**
   * File storage service errors
   */
  static fileUploadFailed(filename, reason = null) {
    const error = new ExternalServiceError(
      `File upload failed: ${filename}${reason ? ` - ${reason}` : ''}`,
      'storage',
      'upload'
    );
    error.errorCode = 'FILE_UPLOAD_FAILED';
    error.filename = filename;
    error.reason = reason;
    return error;
  }

  static storageQuotaExceeded() {
    return ExternalServiceError.quotaExceeded('Storage', 'space');
  }

  /**
   * Payment service errors
   */
  static paymentProcessingFailed(transactionId, reason = null) {
    const error = new ExternalServiceError(
      `Payment processing failed for transaction ${transactionId}${reason ? `: ${reason}` : ''}`,
      'payment',
      'process'
    );
    error.errorCode = 'PAYMENT_PROCESSING_FAILED';
    error.transactionId = transactionId;
    error.reason = reason;
    error.retryable = false;
    return error;
  }

  /**
   * Analytics service errors
   */
  static analyticsTrackingFailed(event, reason = null) {
    const error = new ExternalServiceError(
      `Analytics tracking failed for event: ${event}${reason ? ` - ${reason}` : ''}`,
      'analytics',
      'track'
    );
    error.errorCode = 'ANALYTICS_TRACKING_FAILED';
    error.event = event;
    error.reason = reason;
    // Analytics failures shouldn't block the main operation
    error.statusCode = 200;
    return error;
  }

  /**
   * Create from HTTP response error
   */
  static fromHttpError(service, operation, httpError) {
    const error = new ExternalServiceError(
      `${service} service error: ${httpError.message}`,
      service,
      operation,
      httpError
    );

    // Map HTTP status codes to appropriate error codes
    if (httpError.status >= 500) {
      error.errorCode = 'SERVICE_UNAVAILABLE';
    } else if (httpError.status === 429) {
      error.errorCode = 'RATE_LIMIT_EXCEEDED';
      error.retryAfter = parseInt(httpError.headers?.['retry-after']) || 3600;
    } else if (httpError.status === 401 || httpError.status === 403) {
      error.errorCode = 'INVALID_API_KEY';
      error.retryable = false;
    } else {
      error.errorCode = 'SERVICE_ERROR';
      error.retryable = false;
    }

    return error;
  }

  getUserMessage() {
    switch (this.errorCode) {
      case 'SERVICE_UNAVAILABLE':
        return `${this.service} service is temporarily unavailable. Please try again later.`;
      case 'SERVICE_TIMEOUT':
        return `${this.service} service is taking longer than expected. Please try again.`;
      case 'RATE_LIMIT_EXCEEDED':
        return `Too many requests to ${this.service}. Please try again later.`;
      case 'INVALID_API_KEY':
        return `${this.service} service configuration error. Please contact support.`;
      case 'QUOTA_EXCEEDED':
        return `${this.service} service quota exceeded. Please try again later.`;
      case 'EMAIL_DELIVERY_FAILED':
        return 'Email could not be delivered. Please check the email address.';
      case 'SMS_DELIVERY_FAILED':
        return 'SMS could not be delivered. Please check the phone number.';
      case 'FILE_UPLOAD_FAILED':
        return 'File upload failed. Please try again or contact support.';
      case 'PAYMENT_PROCESSING_FAILED':
        return 'Payment could not be processed. Please try again or use a different payment method.';
      case 'ANALYTICS_TRACKING_FAILED':
        return null; // Don't show analytics errors to users
      default:
        return `${this.service} service is experiencing issues. Please try again later.`;
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      service: this.service,
      operation: this.operation,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        status: this.originalError.status
      } : null
    };
  }
}

module.exports = ExternalServiceError;