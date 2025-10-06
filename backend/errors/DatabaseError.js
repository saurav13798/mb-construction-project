const BaseError = require('./BaseError');

/**
 * Database Operation Error
 */
class DatabaseError extends BaseError {
  constructor(message, originalError = null, operation = null, collection = null) {
    super(message, 500, 'DATABASE_ERROR', true);
    
    this.originalError = originalError;
    this.operation = operation; // 'create', 'read', 'update', 'delete'
    this.collection = collection;
    this.retryable = false;
  }

  /**
   * Create connection error
   */
  static connectionFailed(originalError = null) {
    const error = new DatabaseError(
      'Database connection failed',
      originalError,
      'connect'
    );
    error.errorCode = 'DB_CONNECTION_FAILED';
    error.retryable = true;
    return error;
  }

  /**
   * Create timeout error
   */
  static operationTimeout(operation = 'operation', collection = null) {
    const error = new DatabaseError(
      `Database ${operation} operation timed out`,
      null,
      operation,
      collection
    );
    error.errorCode = 'DB_OPERATION_TIMEOUT';
    error.retryable = true;
    return error;
  }

  /**
   * Create duplicate key error
   */
  static duplicateKey(field, value, collection = null) {
    const error = new DatabaseError(
      `Duplicate value for field '${field}': ${value}`,
      null,
      'create',
      collection
    );
    error.statusCode = 409;
    error.errorCode = 'DB_DUPLICATE_KEY';
    error.field = field;
    error.value = value;
    return error;
  }

  /**
   * Create document not found error
   */
  static documentNotFound(id, collection = null) {
    const error = new DatabaseError(
      `Document not found: ${id}`,
      null,
      'read',
      collection
    );
    error.statusCode = 404;
    error.errorCode = 'DB_DOCUMENT_NOT_FOUND';
    error.documentId = id;
    return error;
  }

  /**
   * Create constraint violation error
   */
  static constraintViolation(constraint, collection = null) {
    const error = new DatabaseError(
      `Database constraint violation: ${constraint}`,
      null,
      'write',
      collection
    );
    error.statusCode = 400;
    error.errorCode = 'DB_CONSTRAINT_VIOLATION';
    error.constraint = constraint;
    return error;
  }

  /**
   * Create transaction failed error
   */
  static transactionFailed(originalError = null) {
    const error = new DatabaseError(
      'Database transaction failed',
      originalError,
      'transaction'
    );
    error.errorCode = 'DB_TRANSACTION_FAILED';
    error.retryable = true;
    return error;
  }

  /**
   * Create from MongoDB error
   */
  static fromMongoError(mongoError, operation = null, collection = null) {
    let error;

    switch (mongoError.code) {
      case 11000: // Duplicate key
        const field = DatabaseError.extractDuplicateField(mongoError);
        error = DatabaseError.duplicateKey(field, 'existing value', collection);
        break;
      case 11600: // Interrupted operation
        error = DatabaseError.operationTimeout(operation, collection);
        break;
      default:
        error = new DatabaseError(
          mongoError.message,
          mongoError,
          operation,
          collection
        );
        error.errorCode = `DB_MONGO_${mongoError.code}`;
    }

    return error;
  }

  /**
   * Extract field name from duplicate key error
   */
  static extractDuplicateField(mongoError) {
    const match = mongoError.message.match(/index: (\w+)/);
    return match ? match[1] : 'unknown';
  }

  getUserMessage() {
    switch (this.errorCode) {
      case 'DB_CONNECTION_FAILED':
        return 'Unable to connect to the database. Please try again later.';
      case 'DB_OPERATION_TIMEOUT':
        return 'The operation took too long to complete. Please try again.';
      case 'DB_DUPLICATE_KEY':
        return `This ${this.field || 'value'} already exists. Please use a different value.`;
      case 'DB_DOCUMENT_NOT_FOUND':
        return 'The requested item was not found.';
      case 'DB_CONSTRAINT_VIOLATION':
        return 'The operation violates data integrity rules.';
      case 'DB_TRANSACTION_FAILED':
        return 'The operation could not be completed. Please try again.';
      default:
        return 'A database error occurred. Please try again later.';
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      collection: this.collection,
      retryable: this.retryable,
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        code: this.originalError.code
      } : null
    };
  }
}

module.exports = DatabaseError;