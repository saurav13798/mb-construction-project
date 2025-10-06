const BaseError = require('./BaseError');

/**
 * Authentication and Authorization Error
 */
class AuthError extends BaseError {
  constructor(message, statusCode = 401, errorCode = 'AUTH_ERROR', authType = 'authentication') {
    super(message, statusCode, errorCode, true);
    
    this.authType = authType; // 'authentication' or 'authorization'
  }

  /**
   * Create authentication failure error
   */
  static authenticationFailed(reason = 'Invalid credentials') {
    return new AuthError(
      `Authentication failed: ${reason}`,
      401,
      'AUTHENTICATION_FAILED',
      'authentication'
    );
  }

  /**
   * Create authorization failure error
   */
  static authorizationFailed(resource = 'resource', action = 'access') {
    return new AuthError(
      `Authorization failed: Insufficient permissions to ${action} ${resource}`,
      403,
      'AUTHORIZATION_FAILED',
      'authorization'
    );
  }

  /**
   * Create token expired error
   */
  static tokenExpired() {
    return new AuthError(
      'Authentication token has expired',
      401,
      'TOKEN_EXPIRED',
      'authentication'
    );
  }

  /**
   * Create invalid token error
   */
  static invalidToken() {
    return new AuthError(
      'Invalid authentication token',
      401,
      'INVALID_TOKEN',
      'authentication'
    );
  }

  /**
   * Create missing token error
   */
  static missingToken() {
    return new AuthError(
      'Authentication token is required',
      401,
      'MISSING_TOKEN',
      'authentication'
    );
  }

  /**
   * Create account locked error
   */
  static accountLocked(unlockTime = null) {
    const message = unlockTime 
      ? `Account is locked until ${unlockTime}`
      : 'Account is locked due to multiple failed login attempts';
      
    return new AuthError(
      message,
      423,
      'ACCOUNT_LOCKED',
      'authentication'
    );
  }

  /**
   * Create insufficient permissions error
   */
  static insufficientPermissions(requiredRole = null) {
    const message = requiredRole
      ? `Insufficient permissions. Required role: ${requiredRole}`
      : 'Insufficient permissions to perform this action';
      
    return new AuthError(
      message,
      403,
      'INSUFFICIENT_PERMISSIONS',
      'authorization'
    );
  }

  /**
   * Create session expired error
   */
  static sessionExpired() {
    return new AuthError(
      'Session has expired. Please log in again',
      401,
      'SESSION_EXPIRED',
      'authentication'
    );
  }

  getUserMessage() {
    switch (this.errorCode) {
      case 'AUTHENTICATION_FAILED':
        return 'Invalid username or password. Please try again.';
      case 'AUTHORIZATION_FAILED':
        return 'You do not have permission to perform this action.';
      case 'TOKEN_EXPIRED':
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please log in again.';
      case 'INVALID_TOKEN':
      case 'MISSING_TOKEN':
        return 'Please log in to continue.';
      case 'ACCOUNT_LOCKED':
        return 'Your account has been temporarily locked. Please try again later.';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You do not have sufficient permissions for this action.';
      default:
        return 'Authentication error. Please log in and try again.';
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      authType: this.authType
    };
  }
}

module.exports = AuthError;