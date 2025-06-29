const Order = require('../models/Order');
const axios = require('axios');

const OrderItem = require('../models/OrderItem');

/**
 * Create a new order
 */
const createOrder = async (req, res) => {
  try {
    const { user_id, restaurant_id, status, total_price, items, address } = req.body ?? {};

    console.log('📥 Creating order for user:', user_id);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Items must be a non-empty array of item IDs'
      });
    }

    // Create the order
    const order = await Order.create({
      user_id,
      restaurant_id,
      status,
      total_price,
      timestamp: new Date(),
      address
    });

    // Insert into order_items table manually
    const orderItems = items.map(item_id => ({ order_id: order.id, item_id }));
    await OrderItem.bulkCreate(orderItems);

    // Fetch restaurant to get the owner user_id
    let restaurantOwnerId = null;
    try {
      const restRes = await axios.get(`http://localhost:3005/api/restaurants/getRestaurent/${restaurant_id}`);
      console.log('🏪 Restaurant response:', restRes.data);
      
      restaurantOwnerId = restRes.data.restaurant?.user_id;
      console.log('👤 Restaurant owner ID:', restaurantOwnerId);
      console.log('🏪 Restaurant ID:', restaurant_id);

    } catch (err) {
      console.warn('⚠️ Could not fetch restaurant owner for notification:', err.message);
    }

    // Send notification to the restaurant owner
    if (restaurantOwnerId) {
      try {
        await axios.post('http://localhost:3008/notify/restaurant', {
          restaurant_id: restaurantOwnerId,
          message: `📦 New order received (Order ID: ${order.id})`
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log(`🔔 Notification sent to restaurant owner ${restaurantOwnerId}`);
      } catch (notifyErr) {
        console.warn('⚠️ Failed to send notification to restaurant:', notifyErr.message);
      }
    }

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
    const orders = await Order.findAll();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          // 1. Get item IDs from order_items
          const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
          const itemIds = orderItems.map((oi) => oi.item_id);

          // 2. Get items from restaurant service (bulk)
          let items = [];
          if (itemIds.length > 0) {
            const itemRes = await axios.get('http://localhost:3005/api/restaurants/item/byIds', {
              params: { ids: itemIds.join(',') }
            });
            items = itemRes.data.items;
          }

          // 3. Get restaurant by ID
          const restaurantRes = await axios.get(`http://localhost:3005/api/restaurants/getRestaurent/${order.restaurant_id}`);
          const restaurant = restaurantRes.data.restaurant;

          // 4. Get user by ID
          const userRes = await axios.get(`http://localhost:3001/api/auth/user/getUser/${order.user_id}`);
          const user = userRes.data.user;

          return {
            ...order.toJSON(),
            restaurant,
            items,
            user
          };

        } catch (err) {
          console.error(`❌ Failed to enrich order ID ${order.id}:`, err.message);
          return {
            ...order.toJSON(),
            restaurant: null,
            items: [],
            user: null
          };
        }
      })
    );

    res.json({ orders: enrichedOrders });

  } catch (error) {
    console.error('❌ Error fetching enriched orders:', error.message);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve enriched orders'
    });
  }
};
/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // 1. Get item IDs from order_items
    const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
    const itemIds = orderItems.map((oi) => oi.item_id);

    // 2. Get items from restaurant service
    let items = [];
    if (itemIds.length > 0) {
      const itemRes = await axios.get('http://localhost:3005/api/restaurants/item/byIds', {
        params: { ids: itemIds.join(',') }
      });
      items = itemRes.data.items;
    }

    // 3. Get restaurant info
    const restaurantRes = await axios.get(`http://localhost:3005/api/restaurants/getRestaurent/${order.restaurant_id}`);
    const restaurant = restaurantRes.data.restaurant;

    // 4. Get user info
    const userRes = await axios.get(`http://localhost:3001/api/auth/user/getUser/${order.user_id}`);
    const user = userRes.data.user;

    // ✅ Return the enriched order
    const enrichedOrder = {
      ...order.toJSON(),
      restaurant,
      items,
      user
    };

    res.json({ order: enrichedOrder });

  } catch (error) {
    console.error('❌ Get by ID Error:', error.message);
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
    const {deliveryUser_id} = req.body;

    console.log(`🔧 Updating order with ID: ${id}`);

    // Find the order
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Update fields
    if (status !== undefined) order.status = status;
    if (total_price !== undefined) order.total_price = total_price;

    await order.save();

    // If status is 'waiting for pickup', create a delivery
    if (status === 'waiting for pickup' && deliveryUser_id) {
      console.log(order.id);
      try {
        await axios.post(
          'http://localhost:3006/api/delivery/create',
          {
            user_id: deliveryUser_id ,
            order_id: order.id,
            status: true
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('📦 Delivery created for order:', order.id);
      } catch (deliveryErr) {
        console.error('❌ Failed to create delivery:', deliveryErr.response.data);
        return res.status(500).json({
          error: 'Delivery Creation Failed',
          message: 'Order updated, but delivery creation failed',
          detail: deliveryErr.response.data
        });
      }
    }
    if (status === 'cancelled' && deliveryUser_id) {
      console.log('🚫 Cancelling order:', order.id);
      try {
        // First, find the delivery by user_id to get the delivery ID
        const deliveryRes = await axios.get(`http://localhost:3006/api/delivery/getDeliveryByUser/${deliveryUser_id}`);
        const delivery = deliveryRes.data;
        
        if (delivery && delivery.id) {
          // Update the delivery status to false (inactive)
          await axios.put(
            `http://localhost:3006/api/delivery/updateStatus/${delivery.id}`,
            {
              status: false
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          console.log('📦 Delivery status updated to false for order:', order.id);
        } else {
          console.warn('⚠️ No active delivery found for user:', deliveryUser_id);
        }
      } catch (deliveryErr) {
        console.error('❌ Failed to update delivery status:', deliveryErr.response?.data || deliveryErr.message);
        return res.status(500).json({
          error: 'Delivery Update Failed',
          message: 'Order updated, but delivery status update failed',
          detail: deliveryErr.response?.data || deliveryErr.message
        });
      }
    }
    

    res.json({
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('❌ Update Order Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: 'An error occurred while updating the order',
      detail: error.message
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

const getOrderByRestaurant = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const orders = await Order.findAll({ where: { restaurant_id } });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No orders found for this restaurant'
      });
    }

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          // 1. Get item IDs for this order
          const orderItems = await OrderItem.findAll({
            where: { order_id: order.id }
          });
          const itemIds = orderItems.map((oi) => oi.item_id);


          

          // 2. Fetch items from restaurant service
          let items = [];
          if (itemIds.length > 0) {
            const itemRes = await axios.get('http://localhost:3005/api/restaurants/item/byIds', {
              params: { ids: itemIds.join(',') }
            });
            items = itemRes.data.items;
          }

          // 3. Get user info
          const userRes = await axios.get(`http://localhost:3001/api/auth/user/getUser/${order.user_id}`);
          const user = userRes.data.user;

          return {
            ...order.toJSON(),
            items,
            user
          };
        } catch (err) {
          console.error(`❌ Failed to enrich order ID ${order.id}:`, err.message);
          return {
            ...order.toJSON(),
            items: [],
            user: null
          };
        }
      })
    );

    res.json({ orders: enrichedOrders });

  } catch (error) {
    console.error('❌ Get Orders by Restaurant Error:', error.message);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve orders',
      details: error.message
    });
  }
};




const getOrderByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await Order.findAll({ where: { user_id } });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No orders found for this user'
      });
    }

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          // 1. Get item IDs for this order
          const orderItems = await OrderItem.findAll({
            where: { order_id: order.id }
          });
          const itemIds = orderItems.map((oi) => oi.item_id);

          // 2. Fetch items from restaurant service
          let items = [];
          if (itemIds.length > 0) {
            const itemRes = await axios.get('http://localhost:3005/api/restaurants/item/byIds', {
              params: { ids: itemIds.join(',') }
            });
            items = itemRes.data.items;
          }

          // 3. Get restaurant info
          const restaurantRes = await axios.get(
            `http://localhost:3005/api/restaurants/getRestaurent/${order.restaurant_id}`
          );
          const restaurant = restaurantRes.data.restaurant;

          

          return {
            ...order.toJSON(),
            restaurant,
            items,
          };
        } catch (err) {
          console.error(`❌ Failed to enrich order ID ${order.id}:`, err.message);
          return {
            ...order.toJSON(),
            restaurant: null,
            items: [],
            user: null
          };
        }
      })
    );

    res.json({ orders: enrichedOrders });

  } catch (error) {
    console.error('❌ Get Orders by User Error:', error.message);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve orders for this user',
      details: error.message
    });
  }
};


module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderByRestaurant,
  getOrderByUser
};
