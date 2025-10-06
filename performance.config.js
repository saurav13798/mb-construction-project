/**
 * Performance Configuration
 * Central configuration for all performance optimizations
 */

module.exports = {
  // Core Web Vitals Thresholds
  thresholds: {
    lcp: 2500,    // Largest Contentful Paint (ms)
    fid: 100,     // First Input Delay (ms)
    cls: 0.1,     // Cumulative Layout Shift
    ttfb: 800,    // Time to First Byte (ms)
    fcp: 1800     // First Contentful Paint (ms)
  },

  // Bundle Size Limits
  bundleLimits: {
    javascript: 200,  // KB
    css: 100,         // KB
    images: 500,      // KB per image
    total: 1000       // KB total initial load
  },

  // Compression Settings
  compression: {
    level: 6,           // Compression level (1-9)
    threshold: 1024,    // Minimum size to compress (bytes)
    chunkSize: 16384    // Compression chunk size
  },

  // Cache Settings
  cache: {
    staticAssets: 31536000,  // 1 year (seconds)
    apiResponses: 0,         // No cache
    htmlPages: 3600          // 1 hour (seconds)
  },

  // Image Optimization
  images: {
    quality: 85,
    formats: ['webp', 'avif', 'jpg'],
    lazyLoadOffset: 50,      // Pixels before viewport
    placeholderQuality: 20   // Low quality placeholder
  },

  // Critical Resources
  critical: {
    css: [
      ':root',
      '*',
      'html',
      'body',
      '.navbar',
      '.hero',
      '.welcome-screen',
      '.container'
    ],
    fonts: [
      'Inter'
    ],
    images: [
      'hero-background',
      'logo'
    ]
  },

  // Performance Budget
  budget: {
    requests: 50,        // Maximum HTTP requests
    transferSize: 1000,  // KB
    resourceSize: 1500,  // KB
    domElements: 1500    // Maximum DOM nodes
  },

  // Monitoring
  monitoring: {
    enabled: true,
    sampleRate: 1.0,     // 100% sampling
    reportInterval: 30,   // seconds
    slowThreshold: 1000   // ms
  },

  // Development Settings
  development: {
    showPerformanceBadge: true,
    logSlowQueries: true,
    trackMemoryUsage: true,
    enableSourceMaps: true
  },

  // Production Settings
  production: {
    minifyAssets: true,
    removeConsole: true,
    enableGzip: true,
    enableBrotli: true,
    preloadCritical: true
  }
};