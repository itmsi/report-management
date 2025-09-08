const { check } = require('express-validator')
const { validateMiddleware } = require('../../middlewares')
const { lang } = require('../../lang')
/* RULE
  ** More Documentation in here https://express-validator.github.io/docs/
*/
const siginValidation = [
  check('username')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  (req, res, next) => { validateMiddleware(req, res, next) }
]

const siginCustomerValidation = [
  check('username')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  check('captcha_key')
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Captcha' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const siginConductorValidation = [
  check('username')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Username' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Username' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

const registerCustomerValidation = [
  check('first_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'First Name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'First Name' })),
  check('last_name')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Last Name' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Last Name' })),
  check('email')
    .isEmail()
    .withMessage(lang.__('validator.email', { field: 'Email' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Email' })),
  check('password')
    .isString()
    .withMessage(lang.__('validator.string', { field: 'Password' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Password' })),
  check('mobile_phone')
    .isMobilePhone()
    .withMessage(lang.__('validator.mobile_phone', { field: 'Mobile Phone' }))
    .notEmpty()
    .withMessage(lang.__('validator.required', { field: 'Mobile Phone' })),
  (req, res, next) => {
    validateMiddleware(req, res, next);
  },
];

module.exports = {
  siginValidation,
  siginCustomerValidation,
  siginConductorValidation,
  registerCustomerValidation
}
