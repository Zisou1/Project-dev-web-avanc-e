const { DataTypes } = require('sequelize');
const sequelize = require('../../../shared/database/connection');

const ItemMenu = sequelize.define('ItemMenu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menus',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'items',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'menuItems',
  timestamps: true
});

module.exports = ItemMenu;
