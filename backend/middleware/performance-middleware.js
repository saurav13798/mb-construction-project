/**
 * Performance Optimization Middleware
 * Implements caching, compression, and response optimization
 */

const compression = require('compression');

class PerformanceMiddleware {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    // Enhanced compression middleware
    getCompressionMiddleware() {
        return compression({
            level: parseInt(process.env.COMPRESSION_LEVEL) || 6,
            threshold: 1024, // Only compress responses > 1KB
            filter: (req, res) => {
                // Don't compress if client doesn't support it
                if (req.headers['x-no-compression']) {
                    return false;
                }
                
                // Compress all text-based responses
                return compression.filter(req, res);
            }
        });
    }

    // Cache control middleware
    setCacheHeaders() {
        return (req, res, next) => {
            // Set cache headers based on content type
            if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
                // Static assets - cache for 1 year
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else if (req.path.startsWith('/api/')) {
                // API responses - no cache by default
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            } else {
                // HTML pages - cache for 1 hour
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
            
            next();
        };
    }

    // Response time tracking
    trackResponseTime() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                
                // Log slow responses in production
                if (this.isProduction && responseTime > 1000) {
                    console.warn(`Slow response: ${req.method} ${req.path} - ${responseTime}ms`);
                }
                
                // Add response time header in development
                if (!this.isProduction) {
                    res.setHeader('X-Response-Time', `${responseTime}ms`);
                }
            });
            
            next();
        };
    }

    // Memory usage monitoring
    monitorMemoryUsage() {
        return (req, res, next) => {
            if (!this.isProduction) {
                const memUsage = process.memoryUsage();
                const memUsageMB = {
                    rss: Math.round(memUsage.rss / 1024 / 1024),
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                    external: Math.round(memUsage.external / 1024 / 1024)
                };
                
                // Warn if memory usage is high
                if (memUsageMB.heapUsed > 100) {
                    console.warn(`High memory usage: ${memUsageMB.heapUsed}MB heap used`);
                }
                
                res.setHeader('X-Memory-Usage', JSON.stringify(memUsageMB));
            }
            
            next();
        };
    }

    // Request size limiting
    limitRequestSize() {
        return (req, res, next) => {
            const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 1048576; // 1MB default
            
            if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
                return res.status(413).json({
                    success: false,
                    message: 'Request entity too large',
                    maxSize: `${Math.round(maxSize / 1024)}KB`
                });
            }
            
            next();
        };
    }

    // Security headers for performance
    setSecurityHeaders() {
        return (req, res, next) => {
            // Prevent DNS prefetching for better privacy
            res.setHeader('X-DNS-Prefetch-Control', 'off');
            
            // Disable X-Powered-By header
            res.removeHeader('X-Powered-By');
            
            // Set referrer policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            next();
        };
    }

    // API response optimization
    optimizeApiResponse() {
        return (req, res, next) => {
            const originalJson = res.json;
            
            res.json = function(data) {
                // Add performance metadata in development
                if (!this.isProduction && req.path.startsWith('/api/')) {
                    data._meta = {
                        timestamp: new Date().toISOString(),
                        responseTime: res.getHeader('X-Response-Time'),
                        memoryUsage: res.getHeader('X-Memory-Usage')
                    };
                }
                
                return originalJson.call(this, data);
            };
            
            next();
        };
    }

    // Get all middleware in correct order
    getAllMiddleware() {
        return [
            this.trackResponseTime(),
            this.monitorMemoryUsage(),
            this.limitRequestSize(),
            this.setCacheHeaders(),
            this.setSecurityHeaders(),
            this.getCompressionMiddleware(),
            this.optimizeApiResponse()
        ];
    }
}

module.exports = new PerformanceMiddleware();