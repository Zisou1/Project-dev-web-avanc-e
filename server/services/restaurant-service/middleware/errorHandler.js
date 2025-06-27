// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error caught by middleware:', err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: true,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // show stack trace in dev
  });
};

module.exports = errorHandler;
