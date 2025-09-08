/**
 *
 * @param {*} lang this is for consisent with other language message
 * @param {*} repository this is repository for postgres definition
 * @param {*} req express request you can see with console.log(req)
 * @param {*} res express response you can see with console.log(req)
 * @param {*} requestHttp if request condition is and operator, you can use this
 * @return {JSON}
*/

const repository = require('./postgre_repository')
const { baseResponse, decodeToken } = require('../../utils')
const { customerSigninLimiter } = require('../../middlewares')
const { TABLE } = require('./column')

const signin = async (req, res) => {
  const where = { username: req?.body?.username }
  const password = req?.body?.password
  const result = await repository.getByParam(where, password)
  return baseResponse(res, result)
}

const signinInspection = async (req, res) => {
  const where = { username: req?.body?.username }
  const password = req?.body?.password
  const result = await repository.getByParamInspection(where, password)
  return baseResponse(res, result)
}

const customerSignin = async (req, res) => {
  const email = req?.body?.username
  const password = req?.body?.password
  const result = await repository.customerSignin(email, password);
  if (result.status) {
    customerSigninLimiter.resetKey(req.headers.realip ? req.headers.realip : req.headers['x-forwarded-for']);
  }
  return baseResponse(res, result)
}

const clientSignin = async (req, res) => {
  const email = req?.body?.username
  const password = req?.body?.password
  const result = await repository.clientSignin(email, password)
  return baseResponse(res, result)
}

const conductorSignin = async (req, res) => {
  const where = { email: req?.body?.username }
  const password = req?.body?.password
  const result = await repository.conductorSignin(where, password)
  return baseResponse(res, result)
}

const refreshToken = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.refreshToken({ [`${TABLE}.user_id`]: users_id })
  return baseResponse(res, result)
}

const me = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.meNew(users_id)
  return baseResponse(res, result)
}

const refreshTokenCustomer = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.refreshTokenCustomer({ customer_id: users_id })
  return baseResponse(res, result)
}

const meCustomer = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.meCustomer({ customer_id: users_id })
  return baseResponse(res, result)
}

const refreshTokenClient = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.refreshTokenClient({ client_id: users_id })
  return baseResponse(res, result)
}

const meClient = async (req, res) => {
  const { users_id } = decodeToken('default', req)
  const result = await repository.meClient({ client_id: users_id })
  return baseResponse(res, result)
}

const registerCustomer = async (req, res) => {
  const result = await repository.registerCustomer(req.body)
  return baseResponse(res, result)
}

module.exports = {
  signin,
  customerSignin,
  conductorSignin,
  refreshToken,
  refreshTokenCustomer,
  meCustomer,
  clientSignin,
  refreshTokenClient,
  meClient,
  signinInspection,
  me,
  registerCustomer
}
