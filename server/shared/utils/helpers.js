/**
 * Shared utility functions for all microservices
 */

/**
 * Standard API response format
 */
const sendResponse = (res, status, data, message = null) => {
  const response = {
    success: status < 400,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  if (!response.success) {
    response.error = data;
    delete response.data;
  }

  return res.status(status).json(response);
};

/**
 * Success response helper
 */
const sendSuccess = (res, data, message = 'Operation successful', status = 200) => {
  return sendResponse(res, status, data, message);
};

/**
 * Error response helper
 */
const sendError = (res, error, message = 'Operation failed', status = 500) => {
  return sendResponse(res, status, error, message);
};

/**
 * Validation error response
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  return sendResponse(res, 400, { errors }, message);
};

/**
 * Extract user info from headers (set by API Gateway)
 */
const getUserFromHeaders = (req) => {
  return {
    id: req.headers['x-user-id'],
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role'],
    name: req.headers['x-user-name'],
    phone: req.headers['x-user-phone']
  };
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format phone number
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
};

/**
 * Capitalize first letter
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Slugify string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Calculate distance between two points (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string for database
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str.toString().trim().replace(/[<>]/g, '');
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendValidationError,
  getUserFromHeaders,
  generateRandomString,
  formatPhoneNumber,
  capitalize,
  slugify,
  calculateDistance,
  isValidEmail,
  sanitizeString
};
