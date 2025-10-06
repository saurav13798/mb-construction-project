const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const ContactService = require('./ContactService');
const ProjectService = require('./ProjectService');
const AnalyticsService = require('./AnalyticsService');

class AdminService {
  constructor(adminRepository = null, contactService = null, projectService = null, analyticsService = null) {
    this.adminRepository = adminRepository || Admin;
    this.contactService = contactService || new ContactService();
    this.projectService = projectService || new ProjectService();
    this.analyticsService = analyticsService || new AnalyticsService();
  }

  /**
   * Register new admin with validation
   */
  async registerAdmin(adminData) {
    try {
      const { username, email, password, registrationCode } = adminData;

      // Validate registration code
      if (!process.env.ADMIN_REGISTRATION_CODE || registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
        throw new Error('Invalid registration code');
      }

      // Check if username already exists
      const existingAdmin = await this.adminRepository.findOne({ username });
      if (existingAdmin) {
        throw new Error('Username already taken');
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmail = await this.adminRepository.findOne({ email });
        if (existingEmail) {
          throw new Error('Email already registered');
        }
      }

      // Hash password and create admin
      const passwordHash = await this.adminRepository.hashPassword(password);
      const admin = await this.adminRepository.create({
        username,
        email,
        passwordHash
      });

      console.log(`✅ New admin registered: ${username}`);

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.createdAt
      };
    } catch (error) {
      console.error('❌ AdminService.registerAdmin error:', error);
      throw error;
    }
  }

  /**
   * Authenticate admin and generate JWT token
   */
  async loginAdmin(credentials) {
    try {
      const { username, password } = credentials;

      // Find admin by username
      const admin = await this.adminRepository.findOne({ username });
      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await admin.verifyPassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          role: 'admin', 
          sub: admin._id,
          username: admin.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      );

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      console.log(`🔐 Admin logged in: ${username}`);

      return {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          lastLogin: admin.lastLogin
        }
      };
    } catch (error) {
      console.error('❌ AdminService.loginAdmin error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token and get admin info
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const admin = await this.adminRepository.findById(decoded.sub);
      if (!admin) {
        throw new Error('Admin not found');
      }

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      };
    } catch (error) {
      console.error('❌ AdminService.verifyToken error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;

      const [
        contactStats,
        projectStats,
        analyticsData,
        recentActivity,
        systemHealth
      ] = await Promise.all([
        this.contactService.getContactStatistics(dateRange),
        this.projectService.getProjectStatistics(),
        this.analyticsService.getAnalyticsData(dateRange),
        this.getRecentActivity(),
        this.getSystemHealth()
      ]);

      return {
        contacts: contactStats,
        projects: projectStats,
        analytics: analyticsData,
        activity: recentActivity,
        system: systemHealth,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('❌ AdminService.getDashboardData error:', error);
      throw error;
    }
  }

  /**
   * Get admin profile information
   */
  async getAdminProfile(adminId) {
    try {
      const admin = await this.adminRepository.findById(adminId)
        .select('-passwordHash');

      if (!admin) {
        throw new Error('Admin not found');
      }

      return admin;
    } catch (error) {
      console.error('❌ AdminService.getAdminProfile error:', error);
      throw error;
    }
  }

  /**
   * Update admin profile
   */
  async updateAdminProfile(adminId, updateData) {
    try {
      const { username, email, currentPassword, newPassword } = updateData;

      const admin = await this.adminRepository.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          throw new Error('Current password is required to set new password');
        }

        const isValidPassword = await admin.verifyPassword(currentPassword);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }

        admin.passwordHash = await this.adminRepository.hashPassword(newPassword);
      }

      // Update other fields
      if (username && username !== admin.username) {
        // Check if new username is available
        const existingAdmin = await this.adminRepository.findOne({ username });
        if (existingAdmin && existingAdmin._id.toString() !== adminId) {
          throw new Error('Username already taken');
        }
        admin.username = username;
      }

      if (email && email !== admin.email) {
        // Check if new email is available
        const existingEmail = await this.adminRepository.findOne({ email });
        if (existingEmail && existingEmail._id.toString() !== adminId) {
          throw new Error('Email already registered');
        }
        admin.email = email;
      }

      await admin.save();

      console.log(`📝 Admin profile updated: ${admin.username}`);

      return {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        updatedAt: admin.updatedAt
      };
    } catch (error) {
      console.error('❌ AdminService.updateAdminProfile error:', error);
      throw error;
    }
  }

  /**
   * Get all admin users (super admin only)
   */
  async getAllAdmins(requestingAdminId) {
    try {
      // In a real implementation, you might want to check if requesting admin has super admin privileges
      const admins = await this.adminRepository.find()
        .select('-passwordHash')
        .sort({ createdAt: -1 });

      return admins;
    } catch (error) {
      console.error('❌ AdminService.getAllAdmins error:', error);
      throw error;
    }
  }

  /**
   * Delete admin account (super admin only)
   */
  async deleteAdmin(adminId, requestingAdminId) {
    try {
      // Prevent self-deletion
      if (adminId === requestingAdminId) {
        throw new Error('Cannot delete your own account');
      }

      const admin = await this.adminRepository.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      await this.adminRepository.findByIdAndDelete(adminId);

      console.log(`🗑️ Admin deleted: ${admin.username} by ${requestingAdminId}`);

      return { success: true, deletedAdmin: admin };
    } catch (error) {
      console.error('❌ AdminService.deleteAdmin error:', error);
      throw error;
    }
  }

  /**
   * Change admin password (admin can change their own or super admin can change others)
   */
  async changePassword(adminId, passwordData, requestingAdminId) {
    try {
      const { currentPassword, newPassword } = passwordData;

      const admin = await this.adminRepository.findById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // If changing own password, verify current password
      if (adminId === requestingAdminId) {
        if (!currentPassword) {
          throw new Error('Current password is required');
        }

        const isValidPassword = await admin.verifyPassword(currentPassword);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }
      }

      // Hash and set new password
      admin.passwordHash = await this.adminRepository.hashPassword(newPassword);
      await admin.save();

      console.log(`🔐 Password changed for admin: ${admin.username}`);

      return { success: true };
    } catch (error) {
      console.error('❌ AdminService.changePassword error:', error);
      throw error;
    }
  }

  // Private helper methods

  /**
   * Get recent activity across the system
   */
  async getRecentActivity(limit = 10) {
    try {
      // This would aggregate recent activities from various sources
      // For now, return recent contacts and projects
      const [recentContacts, recentProjects] = await Promise.all([
        this.contactService.getContacts({}, { limit: 5 }),
        this.projectService.getProjects({}, { limit: 5 })
      ]);

      const activities = [];

      // Add recent contacts
      recentContacts.contacts.forEach(contact => {
        activities.push({
          type: 'contact',
          action: 'new_inquiry',
          description: `New inquiry from ${contact.name} for ${contact.service}`,
          timestamp: contact.createdAt,
          data: contact
        });
      });

      // Add recent projects
      recentProjects.projects.forEach(project => {
        activities.push({
          type: 'project',
          action: 'project_update',
          description: `Project "${project.title}" updated`,
          timestamp: project.updatedAt,
          data: project
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ AdminService.getRecentActivity error:', error);
      return [];
    }
  }

  /**
   * Get system health information
   */
  async getSystemHealth() {
    try {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      return {
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ AdminService.getSystemHealth error:', error);
      return {
        uptime: 0,
        memory: { used: 0, total: 0, external: 0 },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date()
      };
    }
  }
}

module.exports = AdminService;