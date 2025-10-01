require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const { validateEnvironment } = require('./config/env-validation');
const trackVisit = require('./middleware/visitTracker');
const { notFound, errorHandler } = require('./middleware/error_middleware');

// Validate environment variables first
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// Hide technology stack header
app.disable('x-powered-by');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable gzip compression for responses
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Visit tracking middleware (track all page visits for admin dashboard)
app.use(trackVisit);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime(), environment: process.env.NODE_ENV, version: '1.0.0' });
});

// Serve frontend static files (prefer `dist/` when available)
const publicDir = path.join(__dirname, '..', 'frontend', 'dist');
const fallbackPublicDir = path.join(__dirname, '..', 'frontend', 'public');
const staticDirToUse = require('fs').existsSync(publicDir) ? publicDir : fallbackPublicDir;

app.use(express.static(staticDirToUse, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Always revalidate HTML pages
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.min\.(js|css)$/.test(filePath)) {
      // Long cache for fingerprinted/minified assets
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(js|css|svg|png|jpg|jpeg|gif|webp)$/.test(filePath)) {
      // Moderate caching for other static assets
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// Custom 404 handler for API routes
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

// Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/admin', require('./routes/admin')); // Admin routes for dashboard

// (duplicate health endpoint removed)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MB Construction API',
    version: '1.0.0',
    endpoints: {
      contact: '/api/contact',
      projects: '/api/projects',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server unless running tests
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 MB Construction API server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL}`);
    console.log(`🛡️ Security middleware enabled`);
    console.log(`📊 Admin dashboard available at: /api/admin`);
  });

  // Handle server startup errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please:`);
      console.error(`   1. Kill the process using: taskkill /F /IM node.exe`);
      console.error(`   2. Or change the PORT in .env file`);
      console.error(`   3. Or run: npx kill-port ${PORT}`);
      process.exit(1);
    } else {
      console.error('❌ Server startup error:', error);
      process.exit(1);
    }
  });
}

module.exports = app;
