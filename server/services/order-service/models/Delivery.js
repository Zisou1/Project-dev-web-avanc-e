const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  pickup_time: {
    type: DataTypes.DATE,   
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'deliveries',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Delivery;
