// Export all custom error classes
const BaseError = require('./BaseError');
const ValidationError = require('./ValidationError');
const AuthError = require('./AuthError');
const DatabaseError = require('./DatabaseError');
const BusinessLogicError = require('./BusinessLogicError');
const ExternalServiceError = require('./ExternalServiceError');

module.exports = {
  BaseError,
  ValidationError,
  AuthError,
  DatabaseError,
  BusinessLogicError,
  ExternalServiceError
};

// Convenience functions for creating common errors
module.exports.createValidationError = (message, field = null, value = null) => {
  return new ValidationError(message, field, value);
};

module.exports.createAuthError = (message, statusCode = 401) => {
  return new AuthError(message, statusCode);
};

module.exports.createDatabaseError = (message, originalError = null) => {
  return new DatabaseError(message, originalError);
};

module.exports.createBusinessLogicError = (message, errorCode = 'BUSINESS_LOGIC_ERROR') => {
  return new BusinessLogicError(message, errorCode);
};

module.exports.createExternalServiceError = (service, message, operation = null) => {
  return new ExternalServiceError(message, service, operation);
};

// Error type checking utilities
module.exports.isOperationalError = (error) => {
  return error instanceof BaseError && error.isOperational;
};

module.exports.isRetryableError = (error) => {
  return (error instanceof DatabaseError && error.retryable) ||
         (error instanceof ExternalServiceError && error.retryable);
};

module.exports.shouldReportError = (error) => {
  return error instanceof BaseError ? error.shouldReport() : true;
};