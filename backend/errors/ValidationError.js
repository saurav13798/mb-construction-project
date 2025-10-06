const BaseError = require('./BaseError');

/**
 * Validation Error for input validation failures
 */
class ValidationError extends BaseError {
  constructor(message, field = null, value = null, errors = []) {
    super(message, 400, 'VALIDATION_ERROR', true);
    
    this.field = field;
    this.value = value;
    this.errors = errors;
  }

  /**
   * Create from express-validator errors
   */
  static fromExpressValidator(validationResult) {
    const errors = validationResult.array();
    const message = `Validation failed: ${errors.map(e => e.msg).join(', ')}`;
    
    return new ValidationError(message, null, null, errors.map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    })));
  }

  /**
   * Create from Mongoose validation error
   */
  static fromMongooseError(mongooseError) {
    const errors = Object.values(mongooseError.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value,
      kind: error.kind
    }));

    const message = `Validation failed: ${errors.map(e => e.message).join(', ')}`;
    return new ValidationError(message, null, null, errors);
  }

  /**
   * Create for single field validation
   */
  static forField(field, message, value = null) {
    return new ValidationError(
      `Validation failed for field '${field}': ${message}`,
      field,
      value,
      [{ field, message, value }]
    );
  }

  /**
   * Create for required field missing
   */
  static requiredField(field) {
    return ValidationError.forField(field, 'This field is required');
  }

  /**
   * Create for invalid format
   */
  static invalidFormat(field, expectedFormat, value = null) {
    return ValidationError.forField(
      field, 
      `Invalid format. Expected: ${expectedFormat}`, 
      value
    );
  }

  /**
   * Create for value out of range
   */
  static outOfRange(field, min, max, value = null) {
    return ValidationError.forField(
      field,
      `Value must be between ${min} and ${max}`,
      value
    );
  }

  getUserMessage() {
    if (this.errors.length === 1) {
      return `${this.errors[0].field}: ${this.errors[0].message}`;
    }
    return `Please check the following fields: ${this.errors.map(e => e.field).join(', ')}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      errors: this.errors
    };
  }
}

module.exports = ValidationError;