require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Basic middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Services configuration
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    name: 'Authentication Service'
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3004',
    name: 'User Management Service'
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway'
  });
});

// Simple proxy function
const proxyRequest = async (req, res, targetUrl, pathPrefix) => {
  try {
    const targetPath = req.originalUrl.replace(pathPrefix, '');
    const fullUrl = `${targetUrl}${targetPath}`;
    
    console.log(`Proxying ${req.method} ${req.originalUrl} -> ${fullUrl}`);
    
    const config = {
      method: req.method.toLowerCase(),
      url: fullUrl,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Authorization': req.headers.authorization
      },
      timeout: 10000,
      validateStatus: () => true
    };
    
    if (['post', 'put', 'patch'].includes(req.method.toLowerCase())) {
      config.data = req.body;
    }
    
    const response = await axios(config);
    
    console.log(`Response: ${response.status}`);
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(`Proxy error:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Target service is not available'
      });
    }
    
    res.status(502).json({
      error: 'Bad Gateway',
      message: error.message
    });
  }
};

// Auth routes (public)
app.all('/api/auth/*', async (req, res) => {
  await proxyRequest(req, res, services.auth.url, '/api/auth');
});

// For routes without trailing path
app.all('/api/auth', async (req, res) => {
  await proxyRequest(req, res, services.auth.url, '/api/auth');
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple API Gateway running on port ${PORT}`);
  console.log(`🔗 Auth Service: ${services.auth.url}`);
});

module.exports = app;
