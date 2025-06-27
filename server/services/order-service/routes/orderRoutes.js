const express = require('express');
const router = express.Router();
const { validateOrder, validateOrderUpdate } = require('../middleware/orderValidation');

const orderController = require('../controllers/orderController');

// You can add validation middlewares later if needed

// Create a new order
router.post('/create', validateOrder, orderController.createOrder);
    
// Get all orders
router.get('/getAll', orderController.getAllOrders);

// Get order by ID
router.get('/getOrder/:id', orderController.getOrderById);

// Update an order
router.put('/update/:id', validateOrderUpdate, orderController.updateOrder);

// Delete an order 
router.delete('/delete/:id', orderController.deleteOrder);

router.get('/getOrderByRestaurant/:restaurant_id', orderController.getOrderByRestaurant);

router.get('/getOrderByUser/:user_id', orderController.getOrderByUser);



module.exports = router;
