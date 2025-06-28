const express = require('express');
const router = express.Router();

const deliveryController = require('../controller/deliveryController');
// Optional: add validation middleware when needed
const { validateDelivery, validateDeliveryUpdate } = require('../middleware/deliveryValidation');

// Create a new delivery
router.post('/create', validateDelivery, deliveryController.createDelivery);

// Get all deliveries with enriched user & order info
router.get('/getAll', deliveryController.getAllDeliveries);

// Get a specific delivery by ID with full info
router.get('/getDelivery/:id', deliveryController.getDeliveryById);

// Get a specific deliverywith user ID
router.get('/getDeliveryByUser/:user_id', deliveryController.getDeliveryByUser);

// Update a delivery
router.put('/update/:id', validateDeliveryUpdate, deliveryController.updateDelivery);

// Delete (soft) a delivery
router.delete('/delete/:id', deliveryController.deleteDelivery);

// updateStatus
router.put('/updateStatus/:id', deliveryController.updateDeliveryStatus);


module.exports = router;
