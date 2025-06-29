const Menu = require('../models/Menu.js');
const Item = require('../models/Item.js');


/**
 * Create a new menu (with image)
 */
const createMenu = async (req, res) => {
  try {
    const { restaurant_id, name, price, status } = req.body ?? {};
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        error: 'Image Required',
        message: 'Please upload an image for the menu'
      });
    }

    // Check if a menu with this name already exists for the same restaurant
    const existing = await Menu.findOne({ where: { name, restaurant_id } });
    if (existing) {
      return res.status(409).json({
        error: 'Menu Exists',
        message: 'A menu with this name already exists for this restaurant'
      });
    }

    const imagePath = `/uploads/menus/${image.filename}`;

    const menu = await Menu.create({
      name,
      restaurant_id,
      price,
      status,
      imageUrl: imagePath
    });

    res.status(201).json({
      message: 'Menu created successfully',
      menu: {
        id: menu.id,
        name: menu.name,
        restaurant_id: menu.restaurant_id,
        price: menu.price,
        status: menu.status,
        imageUrl: `${req.protocol}://${req.get('host')}${imagePath}`
      }
    });

  } catch (error) {
    console.error('❌ Create Menu Error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'An error occurred while creating the menu'
    });
  }
};

/**
 * Get all menus
 */
const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      include: {
        model: Item,
        through: { attributes: [] }, 
      }
    });
    const menusWithFullUrl = menus.map(menu => {
      let imageUrl = menu.imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      return { ...menu.toJSON(), imageUrl };
    });
    res.json({ menus: menusWithFullUrl });
  } catch (error) {
    console.error('❌ Fetch Menus Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve menus'
    });
  }
};

/**
 * Get menu by ID
 */
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Menu not found'
      });
    }


    let imageUrl = menu.imageUrl;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
    }


    res.json({ menu: { ...menu.toJSON(), imageUrl } });

  } catch (error) {
    console.error('❌ Get Menu Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve the menu'
    });
  }
};

/**
 * Update menu by ID (name and/or image)
 */
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { restaurant_id, name, price, status } = req.body ?? {};
    const image = req.file;

    const menu = await Menu.findByPk(id);
    if (!menu) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Menu not found'
      });
    }

    // Optional update image
    let imagePath = menu.imageUrl;
    if (image) {
      imagePath = `/uploads/menus/${image.filename}`;
    }

    await menu.update({
      restaurant_id, 
      name, 
      price, 
      status, 
      imageUrl: imagePath
    });

    // Return full image URL
    let fullImageUrl = imagePath;
    if (fullImageUrl && !fullImageUrl.startsWith('http')) {
      fullImageUrl = `${req.protocol}://${req.get('host')}${fullImageUrl}`;
    }

    res.json({
      message: 'Menu updated successfully',
      menu: {
        id: menu.id,
        name: menu.name,
        restaurant_id: menu.restaurant_id,
        price: menu.price,
        status: menu.status,
        imageUrl: fullImageUrl
      }
    });

  } catch (error) {
    console.error('❌ Update Menu Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating the menu'
    });
  }
};

/**
 * Delete menu by ID (soft delete)
 */
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findByPk(id);

    if (!menu) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Menu not found'
      });
    }

    await menu.destroy(); // Soft delete (paranoid: true)

    res.json({
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Menu Error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting the menu'
    });
  }
};


/**
 * Get restaurent menu by ID
 */
const getRestaurentMenu = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const menu = await Menu.findAll({ where: { restaurant_id } });

    if (!menu) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Menu not found'
      });
    }

    // Add full imageUrl to each menu
    const menuWithFullUrl = menu.map(menuItem => {
      let imageUrl = menuItem.imageUrl;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      return { ...menuItem.toJSON(), imageUrl };
    });

    res.json({ menu: menuWithFullUrl });

  } catch (error) {
    console.error('❌ Get Menu Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve the menu',
      details: error.message
    });
  }
};


module.exports = {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  getRestaurentMenu
};