const { validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful HTML/JS from text fields
  const fieldsToSanitize = ['name', 'email', 'message', 'title', 'description', 'company', 'location'];

  fieldsToSanitize.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      // Basic XSS prevention
      req.body[field] = req.body[field]
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    }
  });

  next();
};

// Check required fields
const requireFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    fields.forEach(field => {
      if (!req.body[field] || req.body[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
        missingFields
      });
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  requireFields
};