const fs = require('fs');
const path = require('path');

/**
 * Structured Logger with multiple output formats and levels
 */
class Logger {
  constructor(context = 'Application') {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logLevel = this.getLogLevel();
    this.logDir = path.join(process.cwd(), 'logs');
    
    // Ensure log directory exists
    this.ensureLogDirectory();
  }

  /**
   * Get configured log level
   */
  getLogLevel() {
    const level = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'info');
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level.toLowerCase()] || 2;
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error.message);
    }
  }

  /**
   * Log error level message
   */
  error(message, data = {}) {
    if (this.logLevel >= 0) {
      this.log('ERROR', message, data);
    }
  }

  /**
   * Log warning level message
   */
  warn(message, data = {}) {
    if (this.logLevel >= 1) {
      this.log('WARN', message, data);
    }
  }

  /**
   * Log info level message
   */
  info(message, data = {}) {
    if (this.logLevel >= 2) {
      this.log('INFO', message, data);
    }
  }

  /**
   * Log debug level message
   */
  debug(message, data = {}) {
    if (this.logLevel >= 3) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * Core logging method
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...data
    };

    // Console output
    this.logToConsole(level, logEntry);

    // File output (in production or if enabled)
    if (!this.isDevelopment || process.env.LOG_TO_FILE === 'true') {
      this.logToFile(level, logEntry);
    }
  }

  /**
   * Log to console with formatting
   */
  logToConsole(level, logEntry) {
    const { timestamp, context, message } = logEntry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    let colorCode = '';
    let resetCode = '\x1b[0m';

    // Color codes for different log levels
    switch (level) {
      case 'ERROR':
        colorCode = '\x1b[31m'; // Red
        break;
      case 'WARN':
        colorCode = '\x1b[33m'; // Yellow
        break;
      case 'INFO':
        colorCode = '\x1b[36m'; // Cyan
        break;
      case 'DEBUG':
        colorCode = '\x1b[90m'; // Gray
        break;
    }

    const prefix = `${colorCode}[${timeStr}] ${level} [${context}]${resetCode}`;
    
    if (this.isDevelopment) {
      // Pretty print in development
      console.log(`${prefix} ${message}`);
      
      // Print additional data if present
      const additionalData = { ...logEntry };
      delete additionalData.timestamp;
      delete additionalData.level;
      delete additionalData.context;
      delete additionalData.message;
      
      if (Object.keys(additionalData).length > 0) {
        console.log(`${colorCode}${JSON.stringify(additionalData, null, 2)}${resetCode}`);
      }
    } else {
      // Structured JSON in production
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Log to file
   */
  logToFile(level, logEntry) {
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}.log`;
      const filepath = path.join(this.logDir, filename);
      
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(filepath, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, duration) {
    const logData = {
      request: {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.requestId
      },
      response: {
        statusCode: res.statusCode,
        duration: `${duration}ms`
      }
    };

    if (res.statusCode >= 400) {
      this.warn(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
    } else {
      this.info(`HTTP ${res.statusCode} ${req.method} ${req.url}`, logData);
    }
  }
}

module.exports = Logger;