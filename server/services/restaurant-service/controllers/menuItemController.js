const { ItemMenu, Menu, Item } = require('../models');

// Add an item to a menu
const addItemToMenu = async (req, res) => {
  try {
    const { menu_id, item_id } = req.body ?? {};

    
    //Check if this relation already exists
    const existing = await ItemMenu.findOne({ where: { menu_id, item_id } });
    if (existing) {
      return res.status(409).json({ message: 'Item already in the menu' });
    }

    // Create the relation
    const link = await ItemMenu.create({ menu_id, item_id });

    res.status(201).json({
      message: 'Item added to menu successfully',
      data: link
    });

  } catch (error) {
    console.error('❌ Error adding item to menu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Remove an item from a menu
const removeItemFromMenu = async (req, res) => {
  try {
    const { menu_id, item_id } = req.params;

    const deleted = await ItemMenu.destroy({
      where: { menu_id, item_id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Relation not found' });
    }

    res.json({ message: 'Item removed from menu' });
  } catch (error) {
    console.error('❌ Error removing item from menu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all items in a menu
const getItemsForMenu = async (req, res) => {
  try {
    const { menu_id } = req.params;
    const menu = await Menu.findByPk(menu_id, {
      include: {
        model: Item,
        through: { attributes: [] } // exclude junction table data
      }
    });

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found', menu: menu_id });
    }

    // Fix: Always return full image URL for each item
    const items = (menu.Items || []).map(item => {
      let imageUrl = item.imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      return { ...item.toJSON(), imageUrl };
    });

    res.json({ items });
  } catch (error) {
    console.error('❌ Error fetching items for menu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update item in menu by ItemMenu id
const updateItemInMenu = async (req, res) => {
  try {

    const { id } = req.params ?? {};
    const { menu_id, item_id } = req.body ?? {};



    const link = await ItemMenu.findByPk(id);
    if (!link) {
      return res.status(404).json({ message: 'ItemMenu relation not found' });
    }

    const menu = await Menu.findByPk(menu_id);
    const item = await Item.findByPk(item_id);

    if (!menu || !item) {
      return res.status(404).json({ message: 'Menu or Item does not exist' });
    }

    await link.update({
      menu_id: menu_id,
      item_id: item_id
    });

    res.json({
      message: 'ItemMenu relation updated successfully',
      data: link
    });

  } catch (error) {
    console.error('❌ Error updating ItemMenu:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};  



module.exports = {
  addItemToMenu,
  removeItemFromMenu,
  getItemsForMenu,
  updateItemInMenu
};
