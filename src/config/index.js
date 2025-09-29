const database = require('./database')
const aws = require('./aws')
const rabbitmq = require('./rabbitmq')
const recaptcha = require('./recaptcha')
const sso = require('./sso')
const prometheus = require('./prometheus')

module.exports = {
  ...database,
  ...aws,
  ...rabbitmq,
  ...recaptcha,
  ...sso,
  ...prometheus
}
