/**
 * Services Configuration
 * Defines the URLs and settings for all microservices
 */
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    name: 'Authentication Service'
  },
  user: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3004',
    name: 'User Management Service'
  },
  restaurant: {
    url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3005',
    name: 'Restaurant Service'
  },
  order: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    name: 'Order Management Service'
  },
  payment: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002',
    name: 'Payment Processing Service'
  },
  delivery: {
    url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3006',
    name: 'Delivery Management Service'
  },
  location: {
    url: process.env.LOCATION_SERVICE_URL || 'http://localhost:3007',
    name: 'Location Service'
  },
  notification: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    name: 'Notification Service'
  },
  analytics: {
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3009',
    name: 'Analytics Service'
  }
};

module.exports = services;
