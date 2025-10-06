const ContactService = require('./ContactService');
const ProjectService = require('./ProjectService');
const AdminService = require('./AdminService');
const EmailService = require('./EmailService');
const NotificationService = require('./NotificationService');
const ImageOptimizationService = require('./ImageOptimizationService');
const SEOService = require('./SEOService');
const AnalyticsService = require('./AnalyticsService');

/**
 * Service Container for Dependency Injection
 * Manages service instances and their dependencies
 */
class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
    this.initialized = false;
  }

  /**
   * Initialize all services with their dependencies
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize utility services first (no dependencies)
      this.registerSingleton('emailService', () => new EmailService());
      this.registerSingleton('imageOptimizationService', () => new ImageOptimizationService());
      this.registerSingleton('seoService', () => new SEOService());
      this.registerSingleton('analyticsService', () => new AnalyticsService());

      // Initialize notification service (depends on email service)
      this.registerSingleton('notificationService', () => 
        new NotificationService(this.get('emailService'))
      );

      // Initialize main business services
      this.registerSingleton('contactService', () => 
        new ContactService(
          null, // Use default repository
          this.get('emailService'),
          this.get('notificationService')
        )
      );

      this.registerSingleton('projectService', () => 
        new ProjectService(
          null, // Use default repository
          this.get('imageOptimizationService'),
          this.get('seoService')
        )
      );

      this.registerSingleton('adminService', () => 
        new AdminService(
          null, // Use default repository
          this.get('contactService'),
          this.get('projectService'),
          this.get('analyticsService')
        )
      );

      this.initialized = true;
      console.log('✅ Service container initialized successfully');
    } catch (error) {
      console.error('❌ Service container initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register a singleton service
   */
  registerSingleton(name, factory) {
    this.services.set(name, {
      type: 'singleton',
      factory,
      instance: null
    });
  }

  /**
   * Register a transient service (new instance each time)
   */
  registerTransient(name, factory) {
    this.services.set(name, {
      type: 'transient',
      factory,
      instance: null
    });
  }

  /**
   * Get service instance
   */
  get(name) {
    const service = this.services.get(name);
    
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (service.type === 'singleton') {
      if (!service.instance) {
        service.instance = service.factory();
      }
      return service.instance;
    } else {
      // Transient - create new instance each time
      return service.factory();
    }
  }

  /**
   * Check if service is registered
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all services (useful for testing)
   */
  clear() {
    this.services.clear();
    this.singletons.clear();
    this.initialized = false;
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    const status = {
      initialized: this.initialized,
      services: {},
      totalServices: this.services.size
    };

    for (const [name, service] of this.services.entries()) {
      status.services[name] = {
        type: service.type,
        instantiated: service.instance !== null,
        healthy: true // Could add health checks here
      };
    }

    return status;
  }

  /**
   * Create a scoped container for testing
   */
  createScope() {
    const scopedContainer = new ServiceContainer();
    
    // Copy service registrations
    for (const [name, service] of this.services.entries()) {
      scopedContainer.services.set(name, {
        ...service,
        instance: null // Don't copy instances
      });
    }

    return scopedContainer;
  }
}

// Create and export singleton instance
const serviceContainer = new ServiceContainer();

module.exports = serviceContainer;