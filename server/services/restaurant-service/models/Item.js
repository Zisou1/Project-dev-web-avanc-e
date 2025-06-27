const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Restaurant = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurants', 
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false, 
    validate: {
      notEmpty: true,
      min: 0,
      max: 999999
    }
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
},
{
  tableName: 'items',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['restaurant_id']
    },
   
  ]
});

module.exports = Restaurant;
