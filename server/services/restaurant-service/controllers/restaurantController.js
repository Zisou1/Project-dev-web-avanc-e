const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu.js');


/**
 * Create a new restaurant
 */
const createRestaurant = async (req, res) => {
  try {
    const { name, user_id, kitchen_type, description, timeStart, timeEnd, address} = req.body ?? {};
    const image = req.file;

    console.log('📥 Creating restaurant:', name);

    if (!image) {
      return res.status(400).json({
        error: 'Image Required',
        message: 'Please upload an image for the menu'
      });
    }

    // Check if a restaurant with this name already exists
    const existing = await Restaurant.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({
        error: 'Restaurant Exists',
        message: 'A restaurant with this name already exists'
      });
    }

        const imagePath = `/uploads/menus/${image.filename}`;

    const restaurant = await Restaurant.create({
       name,
        user_id,
        kitchen_type,
        imageUrl: imagePath,
        description,
        timeStart, 
        timeEnd, 
        address
        });

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
      message: 'Unable to retrieve restaurant',
      dettails : error.message
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

/**
 * Create or get restaurant for a user (used by auth service)
 */
const createOrGetRestaurantForUser = async (req, res) => {
  try {
    const { user_id, name, kitchen_type } = req.body ?? {};

    console.log('🔍 Checking for existing restaurant for user:', user_id);

    // Check if restaurant already exists for this user
    const existingRestaurant = await Restaurant.findOne({ where: { user_id } });
    if (existingRestaurant) {
      console.log('✅ Restaurant already exists for user');
      return res.status(200).json({
        message: 'Restaurant already exists for this user',
        restaurant: existingRestaurant
      });
    }

    console.log('📥 Creating new restaurant for user:', user_id);

    // Check if a restaurant with this name already exists (if name is provided)
    if (name) {
      const existing = await Restaurant.findOne({ where: { name } });
      if (existing) {
        // If name conflicts, append user ID to make it unique
        const uniqueName = `${name} (${user_id})`;
        console.log(`⚠️ Restaurant name "${name}" exists, using "${uniqueName}"`);
        
        const restaurant = await Restaurant.create({ 
          name: uniqueName, 
          user_id, 
          kitchen_type 
        });

        return res.status(201).json({
          message: 'Restaurant created successfully with unique name',
          restaurant
        });
      }
    }

    const restaurant = await Restaurant.create({ name, user_id, kitchen_type });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant
    });

  } catch (error) {
    console.error('❌ Create/Get Restaurant Error:', error);
    res.status(500).json({
      error: 'Operation Failed',
      message: 'An error occurred while creating/getting the restaurant'
    });
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  createOrGetRestaurantForUser
};
