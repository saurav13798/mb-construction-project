const express = require('express');
const router = express.Router();
const { verifyAdminToken, adminLogin } = require('../middleware/adminAuth');
const Visit = require('../models/Visit');
const Contact = require('../models/Contact');

// Admin login route (no auth required)
router.post('/login', adminLogin);

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

module.exports = router;
