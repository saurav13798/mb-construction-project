const Contact = require('../models/Contact');
const EmailService = require('./EmailService');
const NotificationService = require('./NotificationService');

class ContactService {
  constructor(contactRepository = null, emailService = null, notificationService = null) {
    this.contactRepository = contactRepository || Contact;
    this.emailService = emailService || new EmailService();
    this.notificationService = notificationService || new NotificationService();
  }

  /**
   * Create a new contact inquiry with business logic
   */
  async createContact(contactData, metadata = {}) {
    try {
      // Enhance contact data with metadata
      const enhancedData = {
        ...contactData,
        ...metadata,
        // Auto-assign priority based on business rules
        priority: this.calculatePriority(contactData),
        source: metadata.source || 'website'
      };

      // Create contact record
      const contact = new this.contactRepository(enhancedData);
      await contact.save();

      // Send confirmation email to customer
      await this.emailService.sendContactConfirmation(contact);

      // Notify admin team
      await this.notificationService.notifyNewContact(contact);

      // Log successful creation
      console.log(`✅ New contact created: ${contact.name} (${contact.email}) for ${contact.service}`);

      return contact;
    } catch (error) {
      console.error('❌ ContactService.createContact error:', error);
      throw error;
    }
  }

  /**
   * Get contacts with advanced filtering and pagination
   */
  async getContacts(filters = {}, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        service,
        priority,
        dateFrom,
        dateTo,
        search,
        assignedTo
      } = { ...filters, ...pagination };

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (service) filter.service = service;
      if (priority) filter.priority = priority;
      if (assignedTo) filter.assignedTo = assignedTo;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const [contacts, total] = await Promise.all([
        this.contactRepository.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.contactRepository.countDocuments(filter)
      ]);

      return {
        contacts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ ContactService.getContacts error:', error);
      throw error;
    }
  }

  /**
   * Update contact status with audit trail
   */
  async updateContactStatus(contactId, status, updatedBy) {
    try {
      const validStatuses = ['new', 'contacted', 'in-progress', 'quoted', 'closed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const contact = await this.contactRepository.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      const oldStatus = contact.status;
      contact.status = status;

      // Add audit trail entry
      if (!contact.auditTrail) contact.auditTrail = [];
      contact.auditTrail.push({
        action: 'status_change',
        performedBy: updatedBy,
        timestamp: new Date(),
        details: {
          oldStatus,
          newStatus: status
        }
      });

      await contact.save();

      // Notify relevant parties of status change
      await this.notificationService.notifyStatusChange(contact, oldStatus, status);

      console.log(`📝 Contact status updated: ${contact.name} (${oldStatus} → ${status})`);

      return contact;
    } catch (error) {
      console.error('❌ ContactService.updateContactStatus error:', error);
      throw error;
    }
  }

  /**
   * Add internal note to contact
   */
  async addInternalNote(contactId, note, addedBy) {
    try {
      const contact = await this.contactRepository.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      if (!contact.internalNotes) contact.internalNotes = [];
      contact.internalNotes.push({
        note,
        addedBy,
        addedAt: new Date()
      });

      // Add audit trail entry
      if (!contact.auditTrail) contact.auditTrail = [];
      contact.auditTrail.push({
        action: 'note_added',
        performedBy: addedBy,
        timestamp: new Date(),
        details: { notePreview: note.substring(0, 50) + '...' }
      });

      await contact.save();

      console.log(`📝 Internal note added to contact: ${contact.name}`);

      return contact;
    } catch (error) {
      console.error('❌ ContactService.addInternalNote error:', error);
      throw error;
    }
  }

  /**
   * Set follow-up date and assignment
   */
  async setFollowUp(contactId, followUpDate, assignedTo, setBy) {
    try {
      const contact = await this.contactRepository.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      const oldAssignedTo = contact.assignedTo;
      const oldFollowUpDate = contact.followUpDate;

      if (followUpDate) contact.followUpDate = new Date(followUpDate);
      if (assignedTo) contact.assignedTo = assignedTo;

      // Add audit trail entry
      if (!contact.auditTrail) contact.auditTrail = [];
      contact.auditTrail.push({
        action: 'follow_up_set',
        performedBy: setBy,
        timestamp: new Date(),
        details: {
          oldAssignedTo,
          newAssignedTo: assignedTo,
          oldFollowUpDate,
          newFollowUpDate: followUpDate
        }
      });

      await contact.save();

      // Notify assigned person
      if (assignedTo && assignedTo !== oldAssignedTo) {
        await this.notificationService.notifyAssignment(contact, assignedTo);
      }

      console.log(`📅 Follow-up set for contact: ${contact.name}`);

      return contact;
    } catch (error) {
      console.error('❌ ContactService.setFollowUp error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive contact statistics
   */
  async getContactStatistics(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const filter = {};

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const [
        totalContacts,
        statusBreakdown,
        serviceBreakdown,
        priorityBreakdown,
        monthlyTrend,
        budgetDistribution,
        responseTimeStats
      ] = await Promise.all([
        this.contactRepository.countDocuments(filter),
        this.getStatusBreakdown(filter),
        this.getServiceBreakdown(filter),
        this.getPriorityBreakdown(filter),
        this.getMonthlyTrend(filter),
        this.getBudgetDistribution(filter),
        this.getResponseTimeStats(filter)
      ]);

      return {
        overview: {
          totalContacts,
          newContacts: statusBreakdown.find(s => s._id === 'new')?.count || 0,
          inProgressContacts: statusBreakdown.find(s => s._id === 'in-progress')?.count || 0,
          closedContacts: statusBreakdown.find(s => s._id === 'closed')?.count || 0
        },
        breakdowns: {
          status: statusBreakdown,
          service: serviceBreakdown,
          priority: priorityBreakdown,
          budget: budgetDistribution
        },
        trends: {
          monthly: monthlyTrend
        },
        performance: responseTimeStats
      };
    } catch (error) {
      console.error('❌ ContactService.getContactStatistics error:', error);
      throw error;
    }
  }

  /**
   * Delete contact with audit logging
   */
  async deleteContact(contactId, deletedBy) {
    try {
      const contact = await this.contactRepository.findById(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Log deletion for audit purposes
      console.log(`🗑️ Contact deleted: ${contact.name} (${contact.email}) by ${deletedBy}`);

      await this.contactRepository.findByIdAndDelete(contactId);

      // Notify admin of deletion
      await this.notificationService.notifyContactDeletion(contact, deletedBy);

      return { success: true, deletedContact: contact };
    } catch (error) {
      console.error('❌ ContactService.deleteContact error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Calculate priority based on business rules
   */
  calculatePriority(contactData) {
    const { service, projectBudget, projectTimeline } = contactData;

    // High priority conditions
    if (service === 'government-contract') return 'high';
    if (projectBudget === '50-lakh-plus') return 'high';
    if (projectTimeline === 'immediate') return 'urgent';

    // Medium priority conditions
    if (service === 'redevelopment') return 'medium';
    if (projectBudget === '10-50-lakh') return 'medium';

    // Default to medium
    return 'medium';
  }

  async getStatusBreakdown(filter) {
    return this.contactRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getServiceBreakdown(filter) {
    return this.contactRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  async getPriorityBreakdown(filter) {
    return this.contactRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getMonthlyTrend(filter) {
    return this.contactRepository.aggregate([
      { $match: filter },
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
  }

  async getBudgetDistribution(filter) {
    return this.contactRepository.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$projectBudget',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getResponseTimeStats(filter) {
    // This would calculate average response times
    // Implementation depends on how you track response times
    return {
      averageResponseTime: 0, // placeholder
      medianResponseTime: 0   // placeholder
    };
  }
}

module.exports = ContactService;