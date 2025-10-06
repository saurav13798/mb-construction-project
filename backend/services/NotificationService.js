const EmailService = require('./EmailService');

class NotificationService {
  constructor(emailService = null) {
    this.emailService = emailService || new EmailService();
    this.webSocketClients = new Set(); // For real-time notifications
  }

  /**
   * Notify admin team of new contact
   */
  async notifyNewContact(contact) {
    try {
      // Send email notification
      await this.emailService.sendAdminNotification(contact);

      // Send real-time notification via WebSocket
      this.broadcastToAdmins({
        type: 'new_contact',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          service: contact.service,
          priority: contact.priority,
          timestamp: contact.createdAt
        }
      });

      console.log(`🔔 Admin notification sent for new contact: ${contact.name}`);
    } catch (error) {
      console.error('❌ NotificationService.notifyNewContact error:', error);
      throw error;
    }
  }

  /**
   * Notify relevant parties of status change
   */
  async notifyStatusChange(contact, oldStatus, newStatus) {
    try {
      // Send email notification if configured
      await this.emailService.sendStatusChangeNotification(contact, oldStatus, newStatus);

      // Send real-time notification
      this.broadcastToAdmins({
        type: 'status_change',
        data: {
          contactId: contact._id,
          contactName: contact.name,
          oldStatus,
          newStatus,
          timestamp: new Date()
        }
      });

      console.log(`🔔 Status change notification sent: ${contact.name} (${oldStatus} → ${newStatus})`);
    } catch (error) {
      console.error('❌ NotificationService.notifyStatusChange error:', error);
      throw error;
    }
  }

  /**
   * Notify assigned person of new assignment
   */
  async notifyAssignment(contact, assignedTo) {
    try {
      // Send real-time notification
      this.broadcastToAdmins({
        type: 'assignment',
        data: {
          contactId: contact._id,
          contactName: contact.name,
          assignedTo,
          timestamp: new Date()
        }
      });

      console.log(`🔔 Assignment notification sent: ${contact.name} assigned to ${assignedTo}`);
    } catch (error) {
      console.error('❌ NotificationService.notifyAssignment error:', error);
      throw error;
    }
  }

  /**
   * Notify admin of contact deletion
   */
  async notifyContactDeletion(contact, deletedBy) {
    try {
      // Send real-time notification
      this.broadcastToAdmins({
        type: 'contact_deleted',
        data: {
          contactName: contact.name,
          contactEmail: contact.email,
          deletedBy,
          timestamp: new Date()
        }
      });

      console.log(`🔔 Deletion notification sent: ${contact.name} deleted by ${deletedBy}`);
    } catch (error) {
      console.error('❌ NotificationService.notifyContactDeletion error:', error);
      throw error;
    }
  }

  /**
   * Send urgent inquiry notification (SMS/Push)
   */
  async sendUrgentNotification(contact) {
    try {
      // For urgent inquiries (high priority, large budget, etc.)
      if (contact.priority === 'urgent' || contact.projectBudget === '50-lakh-plus') {
        console.log(`🚨 URGENT: High priority inquiry from ${contact.name} for ${contact.service}`);
        
        // In real implementation, send SMS or push notification
        // await this.smsService.sendUrgentAlert(contact);
        // await this.pushService.sendUrgentAlert(contact);
      }
    } catch (error) {
      console.error('❌ NotificationService.sendUrgentNotification error:', error);
      throw error;
    }
  }

  /**
   * Register WebSocket client for real-time notifications
   */
  registerWebSocketClient(ws, adminId) {
    try {
      ws.adminId = adminId;
      this.webSocketClients.add(ws);

      ws.on('close', () => {
        this.webSocketClients.delete(ws);
      });

      console.log(`🔌 WebSocket client registered for admin: ${adminId}`);
    } catch (error) {
      console.error('❌ NotificationService.registerWebSocketClient error:', error);
    }
  }

  /**
   * Broadcast notification to all connected admin clients
   */
  broadcastToAdmins(notification) {
    try {
      const message = JSON.stringify(notification);
      
      this.webSocketClients.forEach(ws => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(message);
        } else {
          // Remove closed connections
          this.webSocketClients.delete(ws);
        }
      });

      console.log(`📡 Broadcast sent to ${this.webSocketClients.size} admin clients`);
    } catch (error) {
      console.error('❌ NotificationService.broadcastToAdmins error:', error);
    }
  }

  /**
   * Send notification to specific admin
   */
  sendToAdmin(adminId, notification) {
    try {
      const message = JSON.stringify(notification);
      
      this.webSocketClients.forEach(ws => {
        if (ws.adminId === adminId && ws.readyState === 1) {
          ws.send(message);
        }
      });

      console.log(`📤 Notification sent to admin: ${adminId}`);
    } catch (error) {
      console.error('❌ NotificationService.sendToAdmin error:', error);
    }
  }

  /**
   * Get notification preferences for admin
   */
  async getNotificationPreferences(adminId) {
    try {
      // In real implementation, fetch from database
      return {
        email: true,
        realTime: true,
        sms: false,
        push: true,
        urgentOnly: false
      };
    } catch (error) {
      console.error('❌ NotificationService.getNotificationPreferences error:', error);
      return {};
    }
  }

  /**
   * Update notification preferences for admin
   */
  async updateNotificationPreferences(adminId, preferences) {
    try {
      // In real implementation, save to database
      console.log(`⚙️ Notification preferences updated for admin: ${adminId}`, preferences);
      return preferences;
    } catch (error) {
      console.error('❌ NotificationService.updateNotificationPreferences error:', error);
      throw error;
    }
  }

  /**
   * Send daily summary notification
   */
  async sendDailySummary() {
    try {
      // This would be called by a cron job
      console.log('📊 Sending daily summary notifications...');
      
      // Get daily stats and send to admins
      // Implementation would depend on requirements
    } catch (error) {
      console.error('❌ NotificationService.sendDailySummary error:', error);
    }
  }
}

module.exports = NotificationService;