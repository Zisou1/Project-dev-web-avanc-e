const Restaurant = require('../models/Restaurant');

/**
 * Create a new restaurant
 */
const createRestaurant = async (req, res) => {
  try {
    const { name, user_id, kitchen_type } = req.body;

    console.log('📥 Creating restaurant:', name);

    // Check if a restaurant with this name already exists
    const existing = await Restaurant.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({
        error: 'Restaurant Exists',
        message: 'A restaurant with this name already exists'
      });
    }

    const restaurant = await Restaurant.create({ name, user_id, kitchen_type });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });

  } catch (error) {
    console.error('❌ Create Restaurant Error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'An error occurred while creating the restaurant'
    });
  }
};

/**
 * Get all restaurants
 */
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json({ restaurants });
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve restaurants'
    });
  }
};

/**
 * Get restaurant by ID
 */
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    res.json({ restaurant });

  } catch (error) {
    console.error('❌ Get by ID Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve restaurant'
    });
  }
};

/**
 * Update restaurant by ID
 */
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, kitchen_type } = req.body;


    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    await restaurant.update({ name, kitchen_type });

    res.json({
      message: 'Restaurant updated successfully',
      restaurant
    });

  } catch (error) {
    console.error('❌ Update Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating'
    });
  }
};

/**
 * Delete restaurant by ID (soft delete)
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    await restaurant.destroy(); // soft delete (paranoid: true)

    res.json({
      message: 'Restaurant deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting'
    });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
};
