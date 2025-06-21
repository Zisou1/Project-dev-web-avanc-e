/**
 * Shared logger utility for all microservices
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor(serviceName = 'Unknown Service') {
    this.serviceName = serviceName;
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.RESET;
    
    let logEntry = {
      timestamp,
      service: this.serviceName,
      level,
      message
    };

    if (Object.keys(meta).length > 0) {
      logEntry.meta = meta;
    }

    // Console output with colors
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `${color}[${timestamp}] ${this.serviceName} ${level}:${reset} ${message}`,
        Object.keys(meta).length > 0 ? meta : ''
      );
    } else {
      // Production: JSON format for log aggregation
      console.log(JSON.stringify(logEntry));
    }

    return logEntry;
  }

  shouldLog(level) {
    const currentLevel = LOG_LEVELS[this.logLevel.toUpperCase()] || LOG_LEVELS.INFO;
    const messageLevel = LOG_LEVELS[level];
    return messageLevel <= currentLevel;
  }

  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      return this.formatMessage('ERROR', message, meta);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      return this.formatMessage('WARN', message, meta);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      return this.formatMessage('INFO', message, meta);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      return this.formatMessage('DEBUG', message, meta);
    }
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      this.info(`📥 ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.headers['x-user-id'] || null
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = (chunk, encoding) => {
        const duration = Date.now() - start;
        
        this.info(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
          duration: `${duration}ms`,
          statusCode: res.statusCode,
          userId: req.headers['x-user-id'] || null
        });

        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  // Error logging
  logError(error, context = {}) {
    this.error(error.message, {
      stack: error.stack,
      name: error.name,
      ...context
    });
  }

  // Database query logging
  logQuery(query, duration, params = {}) {
    this.debug(`🗄️  Database Query`, {
      query,
      duration: `${duration}ms`,
      params
    });
  }

  // Service communication logging
  logServiceCall(serviceName, endpoint, method, duration, status) {
    this.info(`🔗 Service Call: ${serviceName}`, {
      endpoint,
      method,
      duration: `${duration}ms`,
      status
    });
  }
}

// Create logger instances for each service
const createLogger = (serviceName) => {
  return new Logger(serviceName);
};

module.exports = {
  Logger,
  createLogger,
  LOG_LEVELS
};
