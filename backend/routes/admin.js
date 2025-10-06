const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/adminAuth');
const Visit = require('../models/Visit');
const Contact = require('../models/Contact');
const adminController = require('../controllers/adminController');
const { body } = require('express-validator');

// Admin registration (guarded by registration code)
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('registrationCode').isString()
], adminController.register);

// Admin login route (no auth required)
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').isLength({ min: 6 })
], adminController.login);

// Get total visits grouped by day (last 30 days)
router.get('/visits', verifyAdminToken, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const visits = await Visit.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    res.json({ success: true, visits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get contact counts grouped by service
router.get('/contacts', verifyAdminToken, async (req, res) => {
  try {
    const contactsByService = await Contact.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      }
    ]);
    res.json({ success: true, contactsByService });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get contact counts for dashboard
router.get('/contacts/count', verifyAdminToken, async (req, res) => {
  try {
    // Get total contacts
    const total = await Contact.countDocuments();
    
    // Get today's contacts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Contact.countDocuments({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.json({ 
      success: true, 
      total: total,
      today: todayCount
    });
  } catch (err) {
    console.error('Error getting contact counts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all contacts for admin view
router.get('/contacts/all', verifyAdminToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Contact.countDocuments();
    
    res.json({ 
      success: true, 
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error getting contacts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark contact as read
router.patch('/contacts/:id/read', verifyAdminToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, contact });
  } catch (err) {
    console.error('Error marking contact as read:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete contact
router.delete('/contacts/:id', verifyAdminToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify admin token
router.get('/verify', verifyAdminToken, async (req, res) => {
  try {
    res.json({ 
      success: true, 
      admin: {
        id: req.admin.sub,
        role: req.admin.role
      }
    });
  } catch (err) {
    console.error('Error verifying token:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
