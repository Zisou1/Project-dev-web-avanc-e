/**
 * Error Handler Middleware for Auth Service
 */
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Auth Service Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error'
  };

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.message = 'Resource already exists';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Handle Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    error.status = 500;
    error.message = 'Database Error';
  }

  // Handle bcrypt errors
  if (err.message && err.message.includes('bcrypt')) {
    error.status = 500;
    error.message = 'Authentication processing error';
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 400;
    error.message = 'File too large. Maximum size is 5MB';
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.status = 400;
    error.message = 'Too many files uploaded';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.status = 400;
    error.message = 'Unexpected file field';
  }

  if (err.message && err.message.includes('Only image files')) {
    error.status = 400;
    error.message = err.message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Something went wrong';
    delete error.details;
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

module.exports = errorHandler;