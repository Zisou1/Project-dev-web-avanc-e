const { getConnection } = require('../../../shared/database');

/**
 * Create a new restaurant
 */
const createRestaurant = async (req, res) => {
  try {
    console.log('🧾 Create restaurant request received:', req.body);

    const { user_id, name } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'user_id and name are required'
      });
    }

    const db = getConnection();
    const [result] = await db.execute(
      'INSERT INTO Restaurant (user_id, name) VALUES (?, ?)',
      [user_id, name]
    );

    console.log('✅ Restaurant created with ID:', result.insertId);

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: {
        restaurant_id: result.insertId,
        user_id,
        name
      }
    });

  } catch (error) {
    console.error('❌ Error creating restaurant:', error);
    res.status(500).json({
      error: 'Create Failed',
      message: 'An error occurred while creating the restaurant'
    });
  }
};

/**
 * Get a restaurant by ID
 */
const getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching restaurant with ID: ${id}`);

    const db = getConnection();
    const [rows] = await db.execute(
      'SELECT * FROM Restaurant WHERE restaurant_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    res.json({ restaurant: rows[0] });

  } catch (error) {
    console.error('❌ Error fetching restaurant:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching the restaurant'
    });
  }
};

/**
 * Update a restaurant by ID
 */
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    console.log(`🔧 Updating restaurant ${id} with data:`, req.body);

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'name is required'
      });
    }

    const db = getConnection();
    const [result] = await db.execute(
      'UPDATE Restaurant SET name = ? WHERE restaurant_id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found or not updated'
      });
    }

    res.json({ message: 'Restaurant updated successfully' });

  } catch (error) {
    console.error('❌ Error updating restaurant:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating the restaurant'
    });
  }
};

/**
 * Delete a restaurant by ID
 */
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting restaurant with ID: ${id}`);

    const db = getConnection();
    const [result] = await db.execute(
      'DELETE FROM Restaurant WHERE restaurant_id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    res.json({ message: 'Restaurant deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting restaurant:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting the restaurant'
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
};
