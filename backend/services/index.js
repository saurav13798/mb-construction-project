const serviceContainer = require('./ServiceContainer');

// Initialize the service container
serviceContainer.initialize();

// Export individual services for direct access
const ContactService = require('./ContactService');
const ProjectService = require('./ProjectService');
const AdminService = require('./AdminService');
const EmailService = require('./EmailService');
const NotificationService = require('./NotificationService');
const ImageOptimizationService = require('./ImageOptimizationService');
const SEOService = require('./SEOService');
const AnalyticsService = require('./AnalyticsService');

// Export service container and individual services
module.exports = {
  // Service container for dependency injection
  serviceContainer,
  
  // Individual service classes
  ContactService,
  ProjectService,
  AdminService,
  EmailService,
  NotificationService,
  ImageOptimizationService,
  SEOService,
  AnalyticsService,
  
  // Convenience methods to get configured service instances
  getContactService: () => serviceContainer.get('contactService'),
  getProjectService: () => serviceContainer.get('projectService'),
  getAdminService: () => serviceContainer.get('adminService'),
  getEmailService: () => serviceContainer.get('emailService'),
  getNotificationService: () => serviceContainer.get('notificationService'),
  getImageOptimizationService: () => serviceContainer.get('imageOptimizationService'),
  getSEOService: () => serviceContainer.get('seoService'),
  getAnalyticsService: () => serviceContainer.get('analyticsService')
};

// Log successful initialization
console.log('📦 Service layer initialized with dependency injection');
console.log('🔧 Available services:', serviceContainer.getServiceNames().join(', '));