const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

/**
 * Create a new order
 */
const createOrder = async (req, res) => {
  try {
    const { user_id, restaurant_id, status, total_price, items } = req.body ?? {};

    console.log('📥 Creating order for user:', user_id);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Items must be a non-empty array of item IDs'
      });
    }

    // (Optional) Validate items using restaurant-service
    /*
    const response = await axios.post('http://restaurant-service/api/items/validate', { itemIds: items });
    if (!response.data.valid) {
      return res.status(400).json({ error: 'Invalid Items', message: 'Some items do not exist' });
    }
    */

    // Create the order
    const order = await Order.create({
      user_id,
      restaurant_id,
      status,
      total_price,
      timestamp: new Date()
    });

    // Insert into order_items table manually
    const orderItems = items.map(item_id => ({ order_id: order.id, item_id }));
    await OrderItem.bulkCreate(orderItems);

    res.status(201).json({
      message: 'Order created successfully',
      order_id: order.id
    });

  } catch (error) {
    console.error('❌ Create Order Error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: 'An error occurred while creating the order'
    });
  }
};


/**
 * Get all orders
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [User, Restaurant, Item]
    });
    res.json({ orders });
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve orders'
    });
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [User, Restaurant, Item]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    res.json({ order });

  } catch (error) {
    console.error('❌ Get by ID Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve order',
      details: error.message
    });
  }
};

/**
 * Update order by ID
 */
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, total_price } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    await order.update({ status, total_price });

    res.json({
      message: 'Order updated successfully',
      order
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
 * Delete order by ID (soft delete)
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    await order.destroy(); // Soft delete (paranoid: true)

    res.json({
      message: 'Order deleted successfully'
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
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
