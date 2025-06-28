const Joi = require('joi');

/**
 * Validate Restaurant creation
 */
const validateRestaurant = (req, res, next) => {
 const schema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    kitchen_type: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Kitchen type must be a string',
      'string.min': 'Kitchen type must be at least 2 characters long',
      'string.max': 'Kitchen type must not exceed 100 characters',
      'any.required': 'Kitchen type is required'
    }),
    description: Joi.string().allow('').required().messages({
      'string.base': 'Description must be a string'
    }),
    timeStart: Joi.string()
      .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        'string.pattern.base': 'timeStart must be in HH:MM format'
      }),
    timeEnd: Joi.string()
      .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .required()
      .messages({
        'string.pattern.base': 'timeEnd must be in HH:MM format'
      }),
    address: Joi.string().max(255).required().messages({
      'string.max': 'Address must not exceed 255 characters'
    })
  });

  const { error, value } = schema.validate(req.body);
  // Check if image file is attached
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
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
 * Validate Menu creation
 */
const validateMenu = (req, res, next) => {
  const schema = Joi.object({
    restaurant_id: Joi.number().integer().required().messages({
      'number.base': 'Restaurant ID must be a number',
      'any.required': 'Restaurant ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    price: Joi.number().required().messages({
      'number.base': 'Price must be a number',
      'any.required': 'Price is required'
    }),
    status: Joi.alternatives().try(
      Joi.boolean(),
      Joi.number().integer().valid(0, 1).custom((value) => Boolean(value)),
      Joi.string().valid('true', 'false').custom((value) => value === 'true')
    ).required().messages({
      'any.required': 'Status is required',
      'alternatives.match': 'Status must be a boolean, 0/1, or "true"/"false" string'
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
 * Validate Item creation
 */
const validateItem = (req, res, next) => {
  const schema = Joi.object({
    restaurant_id: Joi.alternatives().try(
      Joi.number().integer(),
      Joi.string().pattern(/^\d+$/).custom((value) => parseInt(value, 10))
    ).required().messages({
      'number.base': 'Restaurant ID must be a number',
      'string.pattern.base': 'Restaurant ID must be a valid number string',
      'any.required': 'Restaurant ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    price: Joi.alternatives().try(
      Joi.number(),
      Joi.string().pattern(/^\d+(\.\d+)?$/).custom((value) => parseFloat(value))
    ).required().messages({
      'number.base': 'Price must be a number',
      'string.pattern.base': 'Price must be a valid number string',
      'any.required': 'Price is required'
    }),
    status: Joi.alternatives().try(
      Joi.boolean(),
      Joi.number().integer().valid(0, 1).custom((value) => Boolean(value)),
      Joi.string().valid('true', 'false').custom((value) => value === 'true')
    ).required().messages({
      'any.required': 'Status is required',
      'alternatives.match': 'Status must be a boolean, 0/1, or "true"/"false" string'
    }),
    description: Joi.string().optional().allow('').messages({
      'string.base': 'Description must be a string'
    })
  });

  const { error, value } = schema.validate(req.body, { allowUnknown: true });
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
 * Validate Menu-Item link (ItemMenu)
 */
const validateItemMenu = (req, res, next) => {
  const schema = Joi.object({
    menu_id: Joi.number().integer().required().messages({
      'any.required': 'menu_id is required',
      'number.base': 'menu_id must be a number'
    }),
    item_id: Joi.number().integer().required().messages({
      'any.required': 'item_id is required',
      'number.base': 'item_id must be a number'
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
 * Validate restaurant update 
 */
const validateRestaurantUpdate = (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': ' ID must be a number',
      'any.required': ' ID is required'
    })
  });
  const schema = Joi.object({

    user_id: Joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    kitchen_type: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Kitchen type must be a string',
      'string.min': 'Kitchen type must be at least 2 characters long',
      'string.max': 'Kitchen type must not exceed 100 characters',
      'any.required': 'Kitchen type is required'
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
 * Validate Menu update 
 */
const validateMenuUpdate = (req, res, next) => {

  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': ' ID must be a number',
      'any.required': ' ID is required'
    })
  });
  const schema = Joi.object({

    restaurant_id: Joi.number().integer().required().messages({
      'number.base': 'Restaurant ID must be a number',
      'any.required': 'Restaurant ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    price: Joi.number().required().messages({
      'number.base': 'Price must be a number',
      'any.required': 'Price is required'
    }),
    status: Joi.alternatives().try(
      Joi.boolean(),
      Joi.number().integer().valid(0, 1).custom((value) => Boolean(value)),
      Joi.string().valid('true', 'false').custom((value) => value === 'true')
    ).required().messages({
      'any.required': 'Status is required',
      'alternatives.match': 'Status must be a boolean, 0/1, or "true"/"false" string'
    }),
    imageUrl: Joi.string().required().messages({
      'any.required': 'Image URL is required'
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
 * Validate Item update 
 */
const validateItemUpdate = (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': ' ID must be a number',
      'any.required': ' ID is required'
    })
  });
  const schema = Joi.object({

    restaurant_id: Joi.number().integer().required().messages({
      'number.base': 'Restaurant ID must be a number',
      'any.required': 'Restaurant ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    price: Joi.number().required().messages({
      'number.base': 'Price must be a number',
      'any.required': 'Price is required'
    }),
    status: Joi.alternatives().try(
      Joi.boolean(),
      Joi.number().integer().valid(0, 1).custom((value) => Boolean(value)),
      Joi.string().valid('true', 'false').custom((value) => value === 'true')
    ).required().messages({
      'any.required': 'Status is required',
      'alternatives.match': 'Status must be a boolean, 0/1, or "true"/"false" string'
    }),
    image: Joi.string().required().messages({
      'any.required': 'Image URL is required'
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
 * Validate Menu-Item update 
 */
const validateItemMenuUpdate = (req, res, next) => {
  const paramSchema = Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': ' ID must be a number',
      'any.required': ' ID is required'
    })
  });
  const schema = Joi.object({

    menu_id: Joi.number().integer().required().messages({
      'any.required': 'menu_id is required',
      'number.base': 'menu_id must be a number'
    }),
    item_id: Joi.number().integer().required().messages({
      'any.required': 'item_id is required',
      'number.base': 'item_id must be a number'
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
 * Validate Restaurant creation for user (more flexible, image optional)
 */
const validateRestaurantForUser = (req, res, next) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
    kitchen_type: Joi.string().min(2).max(100).required().messages({
      'string.base': 'Kitchen type must be a string',
      'string.min': 'Kitchen type must be at least 2 characters long',
      'string.max': 'Kitchen type must not exceed 100 characters',
      'any.required': 'Kitchen type is required'
    }),
    description: Joi.string().allow('').optional().messages({
      'string.base': 'Description must be a string'
    }),
    timeStart: Joi.string()
      .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .optional()
      .messages({
        'string.pattern.base': 'timeStart must be in HH:MM format'
      }),
    timeEnd: Joi.string()
      .pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .optional()
      .messages({
        'string.pattern.base': 'timeEnd must be in HH:MM format'
      }),
    address: Joi.string().max(255).optional().messages({
      'string.max': 'Address must not exceed 255 characters'
    })
  });

  const { error, value } = schema.validate(req.body);
  // Image is optional for createForUser route
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
  validateRestaurant,
  validateRestaurantForUser,
  validateMenu,
  validateItem,
  validateItemMenu,
  validateItemMenuUpdate,
  validateItemUpdate,
  validateMenuUpdate,
  validateRestaurantUpdate
};
