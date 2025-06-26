const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('card', 'cash', 'paypal'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  paranoid: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Payment;
