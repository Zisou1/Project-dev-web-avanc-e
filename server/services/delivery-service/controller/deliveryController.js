const axios = require('axios');
const Delivery = require('../models/Delivery');

// ✅ Create Delivery
const createDelivery = async (req, res) => {
  try {
    const { user_id, order_id, status} = req.body;

    // Cheack the if delivery already exist
    const findDelivery = await Delivery.findOne({ where: { order_id } } );

    if (findDelivery) {
      return res.status(409).json({
        error: 'Alredy exist',
        message: 'Delivery for this order already exist'
      });
    }

    const delivery = await Delivery.create({
      user_id,
      order_id,
      status
    });

    res.status(201).json({
      message: 'Delivery created successfully',
      delivery
    });
  } catch (error) {
    console.error('❌ Create Delivery Error:', error);
    res.status(500).json({
      error: 'Creation Failed',
      message: error.message
    });
  }
};

// ✅ Get All Deliveries (with user + order info)
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();

    const enriched = await Promise.all(
      deliveries.map(async (delivery) => {
        try {
          const [userRes, orderRes] = await Promise.all([
            axios.get(`http://localhost:3001/api/auth/user/getUser/${delivery.user_id}`),
            axios.get(`http://localhost:3003/api/orders/getOrder/${delivery.order_id}`)
          ]);

          return {
            ...delivery.toJSON(),
            user: userRes.data.user,
            order: orderRes.data.order
          };
        } catch (err) {
          console.error(`❌ Failed to enrich delivery ${delivery.id}:`, err.message);
          return {
            ...delivery.toJSON(),
            user: null,
            order: null
          };
        }
      })
    );

    res.json({ deliveries: enriched });
  } catch (error) {
    console.error('❌ Fetch Deliveries Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
};

// ✅ Get Delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Delivery not found'
      });
    }

    let user = null;
    let order = null;

    try {
      const userRes = await axios.get(`http://localhost:3001/api/auth/user/getUser/${delivery.user_id}`);
      user = userRes.data.user;
    } catch (err) {
      console.warn(`⚠️ Could not fetch user:`, err.message);
    }

    try {
      const orderRes = await axios.get(`http://localhost:3003/api/orders/getOrder/${delivery.order_id}`);
      order = orderRes.data.order;
    } catch (err) {
      console.warn(`⚠️ Could not fetch order:`, err.message);
    }

    res.json({
      ...delivery.toJSON(),
      user,
      order
    });
  } catch (error) {
    console.error('❌ Get Delivery Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
};

// ✅ Update Delivery
const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Delivery not found'
      });
    }

    await delivery.update(req.body);

    res.json({
      message: 'Delivery updated successfully',
      delivery
    });
  } catch (error) {
    console.error('❌ Update Delivery Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
};

// ✅ Delete (soft delete)
const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Delivery not found'
      });
    }

    await delivery.destroy();

    res.json({
      message: 'Delivery deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Delivery Error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message
    });
  }
};

const getDeliveryByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const delivery = await Delivery.findOne({ where: { user_id, status: true } });

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Delivery not found'
      });
    }

    let user = null;
    let order = null;

    try {
      const userRes = await axios.get(`http://localhost:3001/api/auth/user/getUser/${delivery.user_id}`);
      user = userRes.data.user;
    } catch (err) {
      console.warn(`⚠️ Could not fetch user:`, err.message);
    }

    try {
      const orderRes = await axios.get(`http://localhost:3003/api/orders/getOrder/${delivery.order_id}`);
      order = orderRes.data.order;
    } catch (err) {
      console.warn(`⚠️ Could not fetch order:`, err);
    }

    res.json({
      ...delivery.toJSON(),
      user,
      order
    });
    } catch (error) {
    console.error('❌ Get Delivery Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message
    });
  }
}

const updateDeliveryStatus = async (req, res)=> {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOne({ where: { id, status: true } });

    if (!delivery) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Delivery not found'
      });
    }

    await delivery.update(req.body);

    res.json({
      message: 'Delivery updated successfully',
      delivery
    });
  } catch (error) {
    console.error('❌ Update Delivery Error:', error);
    res.status(500).json({
      error: 'Update Failed',
      message: error.message
    });
  }
}

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
  getDeliveryByUser,
  updateDeliveryStatus
};
