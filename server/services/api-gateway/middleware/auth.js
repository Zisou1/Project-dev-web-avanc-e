const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and extracts user information
 * Forwards user data to downstream services via headers
 */
const authenticateToken = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Access token is required'
      });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT Verification Error:', err.message);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token Expired',
            message: 'Access token has expired. Please login again.'
          });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            error: 'Invalid Token',
            message: 'Access token is invalid'
          });
        }
        
        return res.status(403).json({
          error: 'Authentication Failed',
          message: 'Unable to verify access token'
        });
      }

      // Add user information to request headers for downstream services
      req.headers['x-user-id'] = decoded.id || decoded.userId;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-name'] = decoded.name;
      
      // Optional: Add decoded user to req object for logging
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      };

      console.log(`🔐 Authenticated user: ${decoded.email} (${decoded.role})`);
      next();
    });

  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during authentication'
    });
  }
};

/**
 * Role-based authorization middleware
 * Use this after authenticateToken to check specific roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient Permissions',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Extracts user info if token is present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.headers['x-user-id'] = decoded.id || decoded.userId;
      req.headers['x-user-email'] = decoded.email;
      req.headers['x-user-role'] = decoded.role;
      req.headers['x-user-name'] = decoded.name;
      req.user = decoded;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth
};
