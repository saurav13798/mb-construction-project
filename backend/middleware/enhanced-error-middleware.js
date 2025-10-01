const { v4: uuidv4 } = require('uuid');

class ErrorHandler {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    // Enhanced error handling middleware
    errorHandler = (err, req, res, next) => {
        const requestId = uuidv4();
        const timestamp = new Date().toISOString();
        
        // Log error with context
        this.logError(err, {
            requestId,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            timestamp
        });

        // Determine error type and response
        const errorResponse = this.formatErrorResponse(err, requestId, timestamp);
        
        res.status(errorResponse.statusCode).json(errorResponse.body);
    };

    // 404 handler
    notFound = (req, res, next) => {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        error.statusCode = 404;
        next(error);
    };

    // Centralized error logging
    logError(error, context = {}) {
        const logEntry = {
            timestamp: context.timestamp || new Date().toISOString(),
            requestId: context.requestId,
            level: 'ERROR',
            message: error.message,
            stack: error.stack,
            context: {
                method: context.method,
                url: context.url,
                userAgent: context.userAgent,
                ip: context.ip
            }
        };

        if (this.isDevelopment) {
            console.error('🚨 Error Details:', JSON.stringify(logEntry, null, 2));
        } else {
            console.error(`[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message} (Request ID: ${logEntry.requestId})`);
        }
    }

    // Format error response based on environment and error type
    formatErrorResponse(error, requestId, timestamp) {
        const statusCode = error.statusCode || 500;
        const errorType = this.classifyError(error);
        
        const baseResponse = {
            success: false,
            message: this.getUserFriendlyMessage(error, errorType),
            error: {
                type: errorType,
                code: error.code || 'INTERNAL_ERROR'
            },
            timestamp,
            requestId
        };

        // Add detailed error information in development
        if (this.isDevelopment) {
            baseResponse.error.details = {
                message: error.message,
                stack: error.stack
            };
        }

        return {
            statusCode,
            body: baseResponse
        };
    }

    // Classify error types for better handling
    classifyError(error) {
        if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
        if (error.name === 'CastError') return 'INVALID_DATA';
        if (error.code === 11000) return 'DUPLICATE_ENTRY';
        if (error.name === 'MongoError') return 'DATABASE_ERROR';
        if (error.name === 'JsonWebTokenError') return 'AUTHENTICATION_ERROR';
        if (error.name === 'MulterError') return 'FILE_UPLOAD_ERROR';
        if (error.statusCode === 404) return 'NOT_FOUND';
        if (error.statusCode === 401) return 'UNAUTHORIZED';
        if (error.statusCode === 403) return 'FORBIDDEN';
        if (error.statusCode >= 400 && error.statusCode < 500) return 'CLIENT_ERROR';
        return 'SERVER_ERROR';
    }

    // Generate user-friendly error messages
    getUserFriendlyMessage(error, errorType) {
        switch (errorType) {
            case 'VALIDATION_ERROR':
                return 'The provided data is invalid. Please check your input and try again.';
            case 'INVALID_DATA':
                return 'The data format is incorrect. Please verify your input.';
            case 'DUPLICATE_ENTRY':
                return 'This entry already exists. Please use different values.';
            case 'DATABASE_ERROR':
                return 'A database error occurred. Please try again later.';
            case 'AUTHENTICATION_ERROR':
                return 'Authentication failed. Please check your credentials.';
            case 'FILE_UPLOAD_ERROR':
                return 'File upload failed. Please check the file size and format.';
            case 'NOT_FOUND':
                return 'The requested resource was not found.';
            case 'UNAUTHORIZED':
                return 'You are not authorized to access this resource.';
            case 'FORBIDDEN':
                return 'Access to this resource is forbidden.';
            case 'CLIENT_ERROR':
                return 'There was an error with your request. Please check and try again.';
            default:
                return 'An unexpected error occurred. Please try again later.';
        }
    }

    // Async error wrapper for route handlers
    asyncHandler = (fn) => {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    };

    // Validation error formatter
    formatValidationErrors(errors) {
        if (Array.isArray(errors)) {
            return errors.map(err => ({
                field: err.param || err.path,
                message: err.msg || err.message,
                value: err.value
            }));
        }
        
        if (errors.errors) {
            return Object.keys(errors.errors).map(key => ({
                field: key,
                message: errors.errors[key].message,
                value: errors.errors[key].value
            }));
        }
        
        return [{ message: errors.message || 'Validation failed' }];
    }
}

module.exports = new ErrorHandler();