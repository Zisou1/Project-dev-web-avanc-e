const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      isFloat: true,
      min: 0
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  }
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true, // Soft deletes
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['restaurant_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Order;