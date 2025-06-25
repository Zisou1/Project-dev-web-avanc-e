const Menu = require('./Menu');
const Item = require('./Item');
const Restaurant = require('./Restaurant');
const ItemMenu = require('./ItemMenu');

// 🍽️ A Restaurant has many Menus and Items
Restaurant.hasMany(Menu, { foreignKey: 'restaurant_id' });
Menu.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

Restaurant.hasMany(Item, { foreignKey: 'restaurant_id' });
Item.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

// 🔁 Many-to-Many relationship between Menus and Items
Menu.belongsToMany(Item, {
  through: ItemMenu,
  foreignKey: 'menu_id',
  otherKey: 'item_id'
});

Item.belongsToMany(Menu, {
  through: ItemMenu,
  foreignKey: 'item_id',
  otherKey: 'menu_id'
});

// ✅ Export all models
module.exports = {
  Menu,
  Item,
  ItemMenu,
  Restaurant
};
