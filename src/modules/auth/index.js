const { Router } = require('express')
const {
  signin, refreshToken, me, customerSignin, conductorSignin, refreshTokenCustomer, meCustomer,
  clientSignin, meClient, refreshTokenClient, signinInspection, registerCustomer
} = require('./handler')
const {
  siginValidation,
  siginCustomerValidation,
  siginConductorValidation,
  registerCustomerValidation
} = require('./validation')
const {
  verifyToken,
  verifyTokenCustomer,
  verifyTokenClient,
  validateRecaptcha,
  adminSigninLimiter,
  conductorSigninLimiter,
  customerSigninLimiter,
  clientSigninLimiter,
} = require('../../middlewares')

const router = Router()

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/signin', adminSigninLimiter, siginValidation, signin)
router.post('/inspection/signin', siginValidation, signinInspection)
router.post('/conductor/signin', conductorSigninLimiter, siginConductorValidation, conductorSignin)
router.get('/refresh-token', verifyToken, refreshToken)
router.get('/me', verifyToken, me)
// router.post('/customer/signin', customerSigninLimiter, siginCustomerValidation, customerSignin)
/**
 * @description Customer Signin untuk member
 * @route POST /customer/signin
 * @access Public
 * @param {string} username
 * @param {string} password
 * @param {string} captcha_key
 * @returns {Object}
 */
router.post('/customer/signin', customerSigninLimiter, siginCustomerValidation, validateRecaptcha, customerSignin)
router.get('/customer/me', verifyTokenCustomer, meCustomer)
router.get('/customer/refresh-token', verifyTokenCustomer, refreshTokenCustomer)
router.post('/customer/register', registerCustomerValidation, validateRecaptcha, registerCustomer)

/**
 * @description Client Signin
 * @route POST /client/signin
 * @access Public
 * @param {string} username
 * @param {string} password
 * @param {string} captcha_key
 * @returns {Object}
 */
router.post('/client/signin', clientSigninLimiter, siginCustomerValidation, validateRecaptcha, clientSignin)
router.get('/client/me', verifyTokenClient, meClient)
router.get('/client/refresh-token', verifyTokenClient, refreshTokenClient)

module.exports = router
