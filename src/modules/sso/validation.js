const { body, query } = require('express-validator');

const loginValidation = [
  body('user_name')
    .notEmpty()
    .withMessage('Username is required'),
  body('user_password')
    .notEmpty()
    .withMessage('Password is required'),
  body('client_id')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client ID must be between 1 and 100 characters'),
  body('redirect_uri')
    .optional()
    .isURL()
    .withMessage('Invalid redirect URI format'),
];

const authorizeValidation = [
  query('client_id')
    .notEmpty()
    .withMessage('Client ID is required'),
  query('redirect_uri')
    .notEmpty()
    .isURL()
    .withMessage('Invalid redirect URI format'),
  query('response_type')
    .equals('code')
    .withMessage('Response type must be "code"'),
  query('state')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
];

const tokenValidation = [
  body('grant_type')
    .equals('authorization_code')
    .withMessage('Grant type must be "authorization_code"'),
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('client_id')
    .notEmpty()
    .withMessage('Client ID is required'),
  body('client_secret')
    .notEmpty()
    .withMessage('Client secret is required'),
  body('redirect_uri')
    .notEmpty()
    .isURL()
    .withMessage('Invalid redirect URI format'),
];

const callbackValidation = [
  query('code')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Invalid authorization code format'),
  query('state')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  query('error')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Error must be between 1 and 100 characters'),
];

module.exports = {
  loginValidation,
  authorizeValidation,
  tokenValidation,
  callbackValidation,
};
