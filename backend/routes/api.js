const express = require('express');
const router = express.Router();
const Project = require('../models/Project_model');
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth_middleware');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const featuredProjects = await Project.countDocuments({ featured: true });
    const newContacts = await Contact.countDocuments({ status: 'new' });

    // Project categories breakdown
    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Contacts by service
    const contactsByService = await Contact.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent contacts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProjects,
          totalContacts,
          featuredProjects,
          newContacts,
          recentContacts
        },
        projectsByCategory,
        contactsByService
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Search functionality
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const results = {};

    if (type === 'all' || type === 'projects') {
      results.projects = await Project.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { clientName: searchRegex }
        ]
      }).limit(10);
    }

    if (type === 'all' || type === 'contacts') {
      results.contacts = await Contact.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { company: searchRegex },
          { message: searchRegex }
        ]
      }).limit(10);
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email service createdAt');

    // Get recent projects
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title category createdAt');

    res.json({
      success: true,
      data: {
        recentContacts,
        recentProjects
      }
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
});

module.exports = router;

// Admin dashboard: get all requests (contacts & projects)
router.get('/admin/requests', auth, async (req, res) => {
  try {
    // Fetch all contacts and projects
    const contacts = await Contact.find().sort({ createdAt: -1 });
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        contacts,
        projects
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin requests'
    });
  }
});