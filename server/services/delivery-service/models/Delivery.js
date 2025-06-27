const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  pickup_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  delivery_time: {
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
  tableName: 'Deliverys',
  timestamps: true,
  paranoid: true, // Soft deletes
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['order_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Delivery;