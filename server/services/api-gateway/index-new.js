require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Import custom middleware
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import service configuration
const services = require('./config/services');

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage()
  });
});

// Services health check endpoint
app.get('/health/services', async (req, res) => {
  const healthChecks = {};
  
  for (const [serviceName, config] of Object.entries(services)) {
    try {
      const response = await axios.get(`${config.url}/health`, { timeout: 5000 });
      healthChecks[serviceName] = {
        status: 'healthy',
        url: config.url,
        response: response.data
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unhealthy',
        url: config.url,
        error: error.message
      };
    }
  }
  
  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: healthChecks
  });
});

// Custom proxy function with comprehensive error handling
const proxyRequest = async (req, res, targetUrl, pathRewrite = {}) => {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 [${new Date().toISOString()}] Proxying ${req.method} ${req.originalUrl} -> ${targetUrl}`);
    
    // Apply path rewriting
    let targetPath = req.originalUrl;
    for (const [pattern, replacement] of Object.entries(pathRewrite)) {
      const regex = new RegExp(pattern);
      targetPath = targetPath.replace(regex, replacement);
    }
    
    const fullUrl = `${targetUrl}${targetPath}`;
    console.log(`📍 Target URL: ${fullUrl}`);
    
    // Prepare headers (exclude problematic headers)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];
    delete headers.connection;
    delete headers['transfer-encoding'];
    
    // Add correlation ID for tracing
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    headers['x-correlation-id'] = correlationId;
    
    // Make the request to the target service
    const axiosConfig = {
      method: req.method.toLowerCase(),
      url: fullUrl,
      headers,
      timeout: 30000, // 30 second timeout
      validateStatus: () => true, // Accept all status codes
      maxRedirects: 0, // Disable redirects in proxy
    };
    
    // Only add data for requests that can have a body
    if (['post', 'put', 'patch'].includes(req.method.toLowerCase()) && req.body) {
      axiosConfig.data = req.body;
    }
    
    const response = await axios(axiosConfig);
    const duration = Date.now() - startTime;
    
    console.log(`✅ [${correlationId}] Response from ${targetUrl}: ${response.status} (${duration}ms)`);
    
    // Set response headers (exclude problematic ones)
    Object.keys(response.headers).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(lowerKey)) {
        res.set(key, response.headers[key]);
      }
    });
    
    // Add custom headers
    res.set('X-Proxy-Duration', `${duration}ms`);
    res.set('X-Correlation-ID', correlationId);
    
    // Send response
    res.status(response.status).send(response.data);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${Date.now()}] Proxy error for ${req.originalUrl} (${duration}ms):`, {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      target: targetUrl
    });
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `Target service at ${targetUrl} is not available`,
        code: 'SERVICE_UNAVAILABLE',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: `Target service at ${targetUrl} did not respond within 30 seconds`,
        code: 'GATEWAY_TIMEOUT',
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(502).json({
        error: 'Bad Gateway',
        message: `Cannot resolve target service at ${targetUrl}`,
        code: 'DNS_RESOLUTION_FAILED',
        timestamp: new Date().toISOString()
      });
    }
    
    // If the error has a response, it means the service responded with an error
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Generic error
    return res.status(502).json({
      error: 'Bad Gateway',
      message: 'Error communicating with target service',
      code: 'PROXY_ERROR',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Auth routes (public - no authentication required)
app.all('/api/auth/*', async (req, res) => {
  await proxyRequest(req, res, services.auth.url, {
    '^/api/auth': ''
  });
});

// Specific auth endpoints for better routing
app.post('/api/auth', async (req, res) => {
  await proxyRequest(req, res, services.auth.url, {
    '^/api/auth': ''
  });
});

// Protected routes with authentication
const createProtectedRoute = (path, serviceKey) => {
  app.all(path, authenticateToken, async (req, res) => {
    await proxyRequest(req, res, services[serviceKey].url, {
      [`^${path.replace('*', '')}`]: ''
    });
  });
};

// Register protected routes
createProtectedRoute('/api/users/*', 'user');
createProtectedRoute('/api/restaurants/*', 'restaurant');
createProtectedRoute('/api/orders/*', 'order');
createProtectedRoute('/api/payments/*', 'payment');
createProtectedRoute('/api/delivery/*', 'delivery');
createProtectedRoute('/api/location/*', 'location');
createProtectedRoute('/api/notifications/*', 'notification');
createProtectedRoute('/api/analytics/*', 'analytics');

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Food Delivery API Gateway',
    version: '1.0.0',
    description: 'API Gateway for microservices architecture',
    endpoints: {
      health: '/health',
      services_health: '/health/services',
      auth: '/api/auth/*',
      users: '/api/users/* (protected)',
      restaurants: '/api/restaurants/* (protected)',
      orders: '/api/orders/* (protected)',
      payments: '/api/payments/* (protected)',
      delivery: '/api/delivery/* (protected)',
      location: '/api/location/* (protected)',
      notifications: '/api/notifications/* (protected)',
      analytics: '/api/analytics/* (protected)'
    },
    services: Object.keys(services),
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  console.log(`❓ Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    suggestion: 'Check /api for available endpoints',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down API Gateway gracefully...`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway started successfully`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Services configuration:`);
  Object.entries(services).forEach(([name, config]) => {
    console.log(`   📍 ${name.padEnd(15)}: ${config.url}`);
  });
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});

module.exports = app;
