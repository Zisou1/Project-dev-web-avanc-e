const Joi = require('joi');

/**
 * Validation middleware for user registration
 */
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    phone: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    role: Joi.string()
      .valid('customer', 'restaurant', 'delivery', 'admin')
      .optional()
      .default('customer'),
    // Restaurant-specific fields (optional, only used when role is 'restaurant')
    kitchen_type: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Kitchen type must be at least 2 characters long',
        'string.max': 'Kitchen type must not exceed 100 characters'
      }),
    restaurantName: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Restaurant name must be at least 2 characters long',
        'string.max': 'Restaurant name must not exceed 100 characters'
      })
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      details: error.details
    });
  }

  req.body = value;
  next();
};

/**
 * Validation middleware for user login
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      details: error.details
    });
  }

  req.body = value;
  next();
};

/**
 * Validation middleware for password reset
 */
const validatePasswordReset = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message,
      details: error.details
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordReset
};
