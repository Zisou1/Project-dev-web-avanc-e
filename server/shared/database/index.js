const { sequelize, testConnection, initializeDatabase } = require('./config');

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  connection: sequelize
};
