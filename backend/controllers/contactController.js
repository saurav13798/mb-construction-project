const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg
        }))
      });
    }

    const { name, email, phone, company, service, message, projectBudget, projectTimeline, projectLocation } = req.body;

    // Extract client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');

    const contact = new Contact({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      service,
      message,
      projectBudget: projectBudget || 'not-specified',
      projectTimeline: projectTimeline || 'flexible',
      projectLocation: projectLocation || undefined,
      ipAddress,
      userAgent,
      referrer
    });

    await contact.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully! Our team will contact you within 24 hours.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        service: contact.service,
        status: contact.status,
        priority: contact.priority,
        submittedAt: contact.createdAt
      }
    });

    // Log successful submission
    console.log(`✅ New inquiry received from ${name} (${email}) for ${service}`);

  } catch (error) {
    console.error('❌ Contact submission error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: validationErrors
      });
    }

    // Handle duplicate email (if we add unique constraint later)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An inquiry with this email already exists. Please contact us directly if you need immediate assistance.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit your inquiry. Please try again or contact us directly.'
    });
  }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const service = req.query.service;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;

    const skip = (page - 1) * limit;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
};

// Get enhanced contact statistics
exports.getContactStats = async (req, res) => {
  try {
    // Basic counts
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const closedContacts = await Contact.countDocuments({ status: 'closed' });
    const quotedContacts = await Contact.countDocuments({ status: 'quoted' });

    // Priority breakdown
    const priorityBreakdown = await Contact.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Service breakdown with average response time
    const serviceBreakdown = await Contact.getServiceBreakdown();

    // Recent contacts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Contact.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Budget distribution
    const budgetDistribution = await Contact.aggregate([
      {
        $group: {
          _id: '$projectBudget',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalContacts,
          newContacts,
          inProgressContacts,
          quotedContacts,
          closedContacts,
          recentContacts
        },
        breakdowns: {
          priority: priorityBreakdown,
          service: serviceBreakdown,
          budget: budgetDistribution
        },
        trends: {
          monthly: monthlyTrend
        }
      }
    });
  } catch (error) {
    console.error('❌ Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
};

// Update contact status
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'in-progress', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
};

// Add internal note to contact
exports.addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, addedBy } = req.body;

    if (!note || !addedBy) {
      return res.status(400).json({
        success: false,
        message: 'Note and addedBy are required'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      {
        $push: {
          internalNotes: {
            note,
            addedBy,
            addedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Internal note added successfully',
      data: contact
    });
  } catch (error) {
    console.error('❌ Add internal note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add internal note'
    });
  }
};

// Set follow-up date
exports.setFollowUpDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate, assignedTo } = req.body;

    const updateData = {};
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);
    if (assignedTo) updateData.assignedTo = assignedTo;

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Follow-up information updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('❌ Set follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update follow-up information'
    });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    console.log(`🗑️ Contact deleted: ${contact.name} (${contact.email})`);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact'
    });
  }
};
