const Joi = require('joi');

/**
 * Validate Delivery creation
 */
const validateDelivery = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    order_id: Joi.number().integer().required().messages({
      'number.base': 'Order ID must be a number',
      'any.required': 'Order ID is required'
    }),
   status: Joi.boolean().required().messages({
         'boolean.base': 'Status must be a boolean',
         'any.required': 'Status is required'
       }),
    
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
 * Validate Delivery update
 */
const validateDeliveryUpdate = (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': 'Delivery ID must be a number',
      'any.required': 'Delivery ID is required'
    })
  });

  const bodySchema = Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled')
      .required()
      .messages({
        'any.only': 'Invalid status',
        'any.required': 'Status is required'
      }),
    delivery_time: Joi.date().optional().messages({
      'date.base': 'Delivery time must be a valid date',
      'any.required': 'Delivery time is required'
    }),

    address: Joi.string().max(255).optional().messages({
      'string.max': 'Address must not exceed 255 characters'
    })
  });

  const paramResult = paramSchema.validate(req.params);
  if (paramResult.error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: paramResult.error.details[0].message,
      details: paramResult.error.details
    });
  }

  const bodyResult = bodySchema.validate(req.body);
  if (bodyResult.error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: bodyResult.error.details[0].message,
      details: bodyResult.error.details
    });
  }

  req.body = bodyResult.value;
  next();
};

module.exports = {
  validateDelivery,
  validateDeliveryUpdate
};
