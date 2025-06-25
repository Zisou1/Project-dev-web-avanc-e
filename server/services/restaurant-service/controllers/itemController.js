const Item = require('../models/Item.js');

/**
 * Create a new item (with image)
 */
const createItem = async (req, res) => {
  try {
    const { restaurant_id, name, price, status } = req.body ?? {};
    const image = req.file ;

    console.log('📥 Creating item:', name);

    if (!image) {
      return res.status(400).json({
        error: 'Image Required',
        message: 'Please upload an image for the item'
      });
    }

    // Check if a item with this name already exists for the same restaurant
    const existing = await Item.findOne({ where: { name, restaurant_id } });
    if (existing) {
      return res.status(409).json({
        error: 'Item Exists',
        message: 'A item with this name already exists for this restaurant'
      });
    }

    const imagePath = `/uploads/items/${image.filename}`;

    const item = await Item.create({
      name,
      restaurant_id,
      price,
      status,
      imageUrl: imagePath
    });

    res.status(201).json({
      message: 'item created successfully',
      item: {
        id: item.id,
        name: item.name,
        restaurant_id: item.restaurant_id,
        price: item.price,
        status: item.status,
        imageUrl: `${req.protocol}://${req.get('host')}${imagePath}`
      }
    });

  } catch (error) {
    console.error('❌ Create item Error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'An error occurred while creating the item'
    });
  }
};

/**
 * Get all items
 */
const getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json({ items });
  } catch (error) {
    console.error('❌ Fetch items Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve items'
    });
  }
};

/**
 * Get item by ID
 */
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'item not found'
      });
    }

    res.json({ item });

  } catch (error) {
    console.error('❌ Get item Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve the item'
    });
  }
};

/**
 * Update item by ID (name and/or image)
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {  restaurant_id, name, price, status, imageUrl } = req.body;



    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'item not found'
      });
    }

    // Optional update image
    let imagePath = item.imageUrl;
    if (imageUrl) {
      imagePath = `/uploads/items/${image.filename}`;
    }

    await item.update({restaurant_id, name, price, status, imageUrl: imagePath });

    res.json({
      message: 'item updated successfully',
      item: {
        id: item.id,
        name: item.name,
        restaurant_id: item.restaurant_id,
        price: item.price,
        status: item.status,
        imageUrl: `${req.protocol}://${req.get('host')}${imagePath}`
      }
    });

  } catch (error) {
    console.error('❌ Update item Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating the item'
    });
  }
};

/**
 * Delete item by ID (soft delete)
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'item not found'
      });
    }

    await item.destroy(); // Soft delete (paranoid: true)

    res.json({
      message: 'item deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete item Error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting the item'
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
};
