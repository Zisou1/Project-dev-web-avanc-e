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
    unique: true, 
    validate: {
      notEmpty: true,
      len: [2, 100]
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
    },
    {
      unique: true,
      fields: ['name'] 
    }
  ]
});

module.exports = Restaurant;
