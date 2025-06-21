/**
 * Error Handler Middleware
 * Centralized error handling for the API Gateway
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 API Gateway Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }

  if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.message = 'Unauthorized Access';
  }

  if (err.code === 'ECONNREFUSED') {
    error.status = 503;
    error.message = 'Service Unavailable';
    error.details = 'Downstream service is not available';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Something went wrong';
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

module.exports = errorHandler;
