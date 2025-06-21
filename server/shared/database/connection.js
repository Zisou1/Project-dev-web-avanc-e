const { sequelize } = require('./config');

/**
 * Database connection instance
 * Import this in your models and services
 */
module.exports = sequelize;
