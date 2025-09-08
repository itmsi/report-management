const UsersHandler = require('./handler');

module.exports = {
  createUser: UsersHandler.createUser.bind(UsersHandler),
  getUser: UsersHandler.getUser.bind(UsersHandler),
  listUsers: UsersHandler.listUsers.bind(UsersHandler),
  getUserPermissions: UsersHandler.getUserPermissions.bind(UsersHandler),
  login: UsersHandler.login.bind(UsersHandler),
  updateUser: UsersHandler.updateUser.bind(UsersHandler),
  deleteUser: UsersHandler.deleteUser.bind(UsersHandler),
  changePassword: UsersHandler.changePassword.bind(UsersHandler),
};