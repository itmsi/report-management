const { body, param, query } = require('express-validator');

const createUserValidation = [
  body('employee_id')
    .isUUID()
    .withMessage('Invalid employee ID format'),
  body('role_id')
    .isUUID()
    .withMessage('Invalid role ID format'),
  body('user_name')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters'),
  body('user_email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('user_password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const updateUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
  body('employee_id')
    .optional()
    .isUUID()
    .withMessage('Invalid employee ID format'),
  body('role_id')
    .optional()
    .isUUID()
    .withMessage('Invalid role ID format'),
  body('user_name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters'),
  body('user_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('user_password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const deleteUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

const getUserValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID format'),
];

const listUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

const loginValidation = [
  body('user_name')
    .notEmpty()
    .withMessage('Username is required'),
  body('user_password')
    .notEmpty()
    .withMessage('Password is required'),
];

const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  deleteUserValidation,
  getUserValidation,
  listUsersValidation,
  loginValidation,
  changePasswordValidation,
};
