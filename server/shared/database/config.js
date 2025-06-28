const { Sequelize } = require('sequelize');

/**
 * Shared Database Configuration
 * This configuration is used by all microservices that need database access
 */
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_DATABASE || 'yumzo',
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    return false;
  }
};

// Initialize database connection
const initializeDatabase = async () => {
  const isConnected = await testConnection();
  
  if (isConnected && process.env.NODE_ENV === 'development') {
    try {
      // Use 'force: false' and 'alter: false' to prevent duplicate index creation
      // Only sync if tables don't exist
      await sequelize.sync({ force: false, alter: false });
      console.log('✅ Database models synchronized');
    } catch (error) {
      console.error('❌ Error synchronizing database models:', error);
      
      // If sync fails due to table structure issues, try with alter: true as a fallback
      // but only once to prevent continuous index duplication
      if (error.name === 'SequelizeDatabaseError' && 
          !error.message.includes('Too many keys specified')) {
        try {
          console.log('🔄 Attempting table structure update...');
          await sequelize.sync({ alter: true });
          console.log('✅ Database models synchronized with alter');
        } catch (alterError) {
          console.error('❌ Failed to sync with alter:', alterError);
        }
      }
    }
  }
  
  return isConnected;
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};
