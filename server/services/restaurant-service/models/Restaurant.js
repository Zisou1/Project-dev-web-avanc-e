const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const Restaurant = sequelize.define('Restaurant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', 
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
  kitchen_type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
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
    allowNull: true
  },
  timeStart: {
    type: DataTypes.TIME,
    allowNull: true
  },
  timeEnd: {
    type: DataTypes.TIME,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 255]
    }
  }
},
{
  tableName: 'restaurants',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

module.exports = Restaurant;
