const Joi = require('joi');

/**
 * Validate Order creation
 */
const validateOrder = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    restaurant_id: Joi.number().integer().required().messages({
      'number.base': 'Restaurant ID must be a number',
      'any.required': 'Restaurant ID is required'
    }),
    status: Joi.string().valid('pending', 'confirmed', ' waiting for pickup','product pickedup', 'confirmed by delivery', 'confirmed by client', 'cancelled', 'completed')
      .default('pending')
      .messages({
        'any.only': 'Status must be one of: pending, confirmed,  waiting for pickup,product pickedup, confirmed by delivery, confirmed by client, cancelled, completed'
      }),
    total_price: Joi.number().min(0).required().messages({
      'number.base': 'Total price must be a number',
      'number.min': 'Total price must be at least 0',
      'any.required': 'Total price is required'
    }),
    timestamp: Joi.date().optional().messages({
      'date.base': 'Timestamp must be a valid date'
    }),
    address: Joi.string().max(255).optional().allow('').messages({
      'string.max': 'Address must not exceed 255 characters'
    }),
    items: Joi.array().items(Joi.number().integer()).min(1).required().messages({
      'array.base': 'Items must be an array of item IDs',
      'array.min': 'At least one item is required',
      'any.required': 'Items are required'
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
 * Validate Order update
 */
const validateOrderUpdate = (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': 'Order ID must be a number',
      'any.required': 'Order ID is required'
    })
  });

  const bodySchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'waiting for pickup','product pickedup', 'confirmed by delivery', 'confirmed by client', 'cancelled', 'completed')
      .default('pending')
      .messages({
        'any.only': 'Status must be one of: pending, confirmed,  waiting for pickup,product pickedup, confirmed by delivery, confirmed by client, cancelled, completed'
      }),
    total_price: Joi.number().min(0).optional().messages({
      'number.base': 'Total price must be a number',
      'number.min': 'Total price must be at least 0'
    }),
    address: Joi.string().max(255).optional().allow('').messages({
      'string.max': 'Address must not exceed 255 characters'
    }),
    deliveryUser_id: Joi.number().integer().optional().messages({
      'number.base': 'Restaurant ID must be a number',
      'any.required': 'Restaurant ID is required'
    }),
  });

  const paramResult = paramSchema.validate(req.params);
  if (paramResult.error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: paramResult.error.details[0].message,
      details: paramResult.error.details
    });
  }

  const { error, value } = bodySchema.validate(req.body);
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
  validateOrder,
  validateOrderUpdate
};
