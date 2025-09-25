const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth_middleware');
const { sanitizeInput } = require('../middleware/validation_middleware');

// Public routes (no authentication required)

// Enhanced validation rules for contact form
const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\.\-\']+$/)
    .withMessage('Name can only contain letters, spaces, dots, hyphens, and apostrophes'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),

  body('service')
    .notEmpty()
    .withMessage('Service selection is required')
    .isIn(['redevelopment', 'government-contract', 'manpower', 'consultation', 'other'])
    .withMessage('Please select a valid service'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('projectBudget')
    .optional()
    .isIn(['under-1-lakh', '1-5-lakh', '5-10-lakh', '10-50-lakh', '50-lakh-plus', 'not-specified'])
    .withMessage('Invalid budget selection'),

  body('projectTimeline')
    .optional()
    .isIn(['immediate', '1-month', '3-months', '6-months', '1-year', 'flexible'])
    .withMessage('Invalid timeline selection'),

  body('projectLocation')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
];

// Public routes
router.post('/', sanitizeInput, contactValidation, contactController.submitContact);

// Admin routes (protected)
router.get('/', auth, contactController.getAllContacts);
router.get('/stats', auth, contactController.getContactStats);
router.put('/:id/status', auth, contactController.updateContactStatus);
router.post('/:id/notes', auth, contactController.addInternalNote);
router.put('/:id/follow-up', auth, contactController.setFollowUpDate);
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;