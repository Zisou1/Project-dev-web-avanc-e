const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

// You can add validation middlewares later if needed

// Create a new order
router.post('/create', orderController.createOrder);

// Get all orders
router.get('/getAll', orderController.getAllOrders);

// Get order by ID
router.get('/getOrder/:id', orderController.getOrderById);

// Update an order
router.put('/update/:id', orderController.updateOrder);

// Delete an order 
router.delete('/delete/:id', orderController.deleteOrder);

module.exports = router;
