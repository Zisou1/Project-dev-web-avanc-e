const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');

// Authentication routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/user/getAll', authController.getAllUsers);
router.get('/user/getUser/:id', authController.getUserById);
router.put('/user/update/:id', authController.updateUser);
router.delete('/user/delete/:id', authController.deleteUser);



// Token verification (internal use by other services)
router.post('/verify-token', authController.verifyToken);

module.exports = router;
