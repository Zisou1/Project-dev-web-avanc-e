const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    console.log('🔄 Registration request received:', req.body);
    const { name, email, password, role = 'customer', phone, kitchen_type, restaurantName } = req.body;

    console.log('🔍 Checking if user exists...');
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email already exists'
      });
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const saltRounds = 10; // Reduced from 12 to prevent timeout
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('💾 Creating user...');
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      isActive: true
    });

    console.log('🎫 Generating tokens...');

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user
    await user.update({ refreshToken });

    // If user is a restaurant, create restaurant record
    if (role === 'restaurant' && kitchen_type) {
      try {
        console.log('🏭 Creating restaurant record...');
        const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3005';
        
        const restaurantData = {
          user_id: user.id,
          name: restaurantName || name, // Use restaurantName if provided, otherwise user name
          kitchen_type: kitchen_type
        };

        console.log('📤 Sending restaurant data:', restaurantData);
        
        const restaurantResponse = await axios.post(
          `${restaurantServiceUrl}/api/restaurants/createForUser`,
          restaurantData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 5000 // 5 second timeout
          }
        );

        console.log('✅ Restaurant created successfully:', restaurantResponse.data);
      } catch (restaurantError) {
        console.error('❌ Failed to create restaurant record:', restaurantError.message);
        // We don't fail the user registration if restaurant creation fails
        // This prevents data inconsistency
        console.log('⚠️ User created but restaurant creation failed. Restaurant can be created manually later.');
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      error: 'Registration Failed',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account Disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user
    await user.update({ 
      refreshToken,
      lastLoginAt: new Date()
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      error: 'Login Failed',
      message: 'An error occurred during login'
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh Token Required',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({
        error: 'Invalid Refresh Token',
        message: 'Refresh token is invalid'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token
    await user.update({ refreshToken: newRefreshToken });

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Token Refresh Error:', error);
    res.status(403).json({
      error: 'Token Refresh Failed',
      message: 'Unable to refresh token'
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Find user and clear refresh token
      const user = await User.findOne({ where: { refreshToken } });
      if (user) {
        await user.update({ refreshToken: null });
      }
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      error: 'Logout Failed',
      message: 'An error occurred during logout'
    });
  }
};

/**
 * Verify token (internal use)
 */
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token Required',
        message: 'Token is required for verification'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      valid: true,
      user: decoded
    });

  } catch (error) {
    res.json({
      valid: false,
      error: error.message
    });
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res) => {
  // TODO: Implement password reset functionality
  res.status(501).json({
    message: 'Forgot password functionality not yet implemented'
  });
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  // TODO: Implement password reset functionality
  res.status(501).json({
    message: 'Reset password functionality not yet implemented'
  });
};

const getAllUsers = async (req, res) => {
  try {
    const user = await User.findAll();
    res.json({ user });
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve users'
    });
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('❌ Get by ID Error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'Unable to retrieve restaurant',
      dettails : error.message
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById
};
