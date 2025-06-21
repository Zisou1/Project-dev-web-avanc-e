/**
 * Logging Middleware
 * Logs all incoming requests to the API Gateway
 */
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📥 ${req.method} ${req.url} - ${req.ip} - ${new Date().toISOString()}`);
  
  // Log user info if available
  if (req.headers['x-user-email']) {
    console.log(`👤 User: ${req.headers['x-user-email']} (${req.headers['x-user-role']})`);
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = logger;
