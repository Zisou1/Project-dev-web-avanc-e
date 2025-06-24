const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Define routes
router.post('/creat', restaurantController.createRestaurant);

module.exports = router; 
