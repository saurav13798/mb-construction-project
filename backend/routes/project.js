const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const { auth } = require('../middleware/auth_middleware');
const { upload } = require('../middleware/upload_middleware');

// Validation rules for project
const projectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Project category is required')
    .isIn(['redevelopment', 'maintenance', 'manpower', 'infrastructure'])
    .withMessage('Invalid category selection'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),

  body('clientName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Client name cannot exceed 100 characters'),

  body('projectValue')
    .optional()
    .isNumeric()
    .withMessage('Project value must be a number'),

  body('teamSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Team size must be at least 1')
];

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/featured', projectController.getFeaturedProjects);
router.get('/:id', projectController.getProject);

// Admin routes (protected)
router.post('/', auth, upload.array('images', 10), projectValidation, projectController.createProject);
router.put('/:id', auth, upload.array('images', 10), projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);

module.exports = router;