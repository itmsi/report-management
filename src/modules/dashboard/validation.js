const { body, query } = require('express-validator');
const { validationResult } = require('express-validator');

const validateGetDashboardData = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  body('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search term must not exceed 255 characters')
    .trim(),
  body('sort_by')
    .optional()
    .isIn(['category_name', 'title', 'status', 'created_at', 'updated_at'])
    .withMessage('Invalid sort field'),
  body('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  body('category_id')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Invalid category ID format'),
  body('category_name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category name must not exceed 100 characters')
    .trim(),
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'draft'])
    .withMessage('Status must be active, inactive, or draft'),
];

const validateGetRecentActivities = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

const validateGetRecentActivitiesPost = [
  body('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
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
  validateGetDashboardData,
  validateGetRecentActivities,
  validateGetRecentActivitiesPost,
  handleValidationErrors
};
