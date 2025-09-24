const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const validateCreatePowerBi = [
  body('category_id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('link')
    .notEmpty()
    .withMessage('Link is required')
    .isURL()
    .withMessage('Link must be a valid URL')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  // File validation will be handled by multer middleware
];

const validateUpdatePowerBi = [
  param('id')
    .isUUID()
    .withMessage('Invalid PowerBI ID format'),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters')
    .trim(),
  body('link')
    .optional()
    .isURL()
    .withMessage('Link must be a valid URL')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  // File validation will be handled by multer middleware
];

const validateGetPowerBi = [
  param('id')
    .isUUID()
    .withMessage('Invalid PowerBI ID format'),
];

const validateDeletePowerBi = [
  param('id')
    .isUUID()
    .withMessage('Invalid PowerBI ID format'),
];

const validateListPowerBi = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
    .trim(),
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  query('category_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters')
    .trim(),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft'),
  query('created_by')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID'),
  query('updated_by')
    .optional()
    .isUUID()
    .withMessage('Updated by must be a valid UUID'),
  query('title_filter')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title filter must not exceed 200 characters')
    .trim(),
  query('description_filter')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description filter must not exceed 500 characters')
    .trim(),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('sort_by')
    .optional()
    .isIn(['title', 'status', 'created_at', 'updated_at', 'powerbi_id', 'category_id'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const validateListPowerBiPost = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
  body('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
    .trim(),
  body('category_id')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('category_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft'),
  body('created_by')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID'),
  body('updated_by')
    .optional()
    .isUUID()
    .withMessage('Updated by must be a valid UUID'),
  body('title_filter')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title filter must not exceed 200 characters')
    .trim(),
  body('description_filter')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description filter must not exceed 500 characters')
    .trim(),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('sort_by')
    .optional()
    .isIn(['title', 'status', 'created_at', 'updated_at', 'powerbi_id', 'category_id'])
    .withMessage('Invalid sort field'),
  body('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateCreatePowerBi,
  validateUpdatePowerBi,
  validateGetPowerBi,
  validateDeletePowerBi,
  validateListPowerBi,
  validateListPowerBiPost,
  handleValidationErrors
};
