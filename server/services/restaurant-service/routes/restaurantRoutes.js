const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const menuController = require('../controllers/menuController');
const menuItemController = require('../controllers/menuItemController');
const itemController = require('../controllers/itemController');

const upload = require('../middleware/upload'); 

const {
  validateRestaurant,
  validateMenu,
  validateItem,
  validateItemMenu,
  validateItemMenuUpdate,
  validateItemUpdate,
  validateMenuUpdate,
  validateRestaurantUpdate
} = require('../middleware/restaurantValidation');


// Define routes
//restaurant routes
router.post('/creat', validateRestaurant, restaurantController.createRestaurant);
router.post('/createForUser', validateRestaurant, restaurantController.createOrGetRestaurantForUser);
router.get('/getAll', restaurantController.getAllRestaurants);
router.get('/getRestaurent/:id', restaurantController.getRestaurantById);
router.put('/update/:id', validateRestaurantUpdate, restaurantController.updateRestaurant);
router.delete('/delete/:id', restaurantController.deleteRestaurant);
//menu routes
router.post('/menu/create', upload.single('image'), validateMenu, menuController.createMenu);
router.get('/menu/getAll', menuController.getAllMenus);
router.get('/menu/getMenu/:id', menuController.getMenuById);
router.get('/menu/getRestaurentMenu/:restaurant_id', menuController.getRestaurentMenu);
router.put('/menu/update/:id', validateMenuUpdate, upload.single('image'), menuController.updateMenu);
router.delete('/menu/delete/:id', menuController.deleteMenu);
//item routes
router.post('/item/create', upload.single('image'), validateItem, itemController.createItem);
router.get('/item/getAll', itemController.getAllItems);
router.get('/item/getItem/:id', itemController.getItemById);
router.get('/item/getRestaurentItem/:restaurant_id', itemController.getRestaurentItem);
router.put('/item/update/:id', validateItemUpdate, upload.single('image'), itemController.updateItem);
router.delete('/item/delete/:id', itemController.deleteItem);
router.get('/item/byIds', itemController.getItemsByIds);

//menuItem routes
router.post('/menuItem/add', validateItemMenu, menuItemController.addItemToMenu);
router.get('/menuItem/getItemMenu/:menu_id', menuItemController.getItemsForMenu);
router.put('/menuItem/update/:id', validateItemMenuUpdate, menuItemController.updateItemInMenu);
router.delete('/menuItem/delete/:id', menuItemController.removeItemFromMenu);



module.exports = router;
