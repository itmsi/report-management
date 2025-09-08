const SecureSSOHandler = require('./security_handler');
const ClientRegistration = require('./client_registration');
const SessionManager = require('./session_manager');
const ScopeManager = require('./scope_manager');

module.exports = {
  // Core SSO endpoints
  login: SecureSSOHandler.login.bind(SecureSSOHandler),
  authorize: SecureSSOHandler.authorize.bind(SecureSSOHandler),
  token: SecureSSOHandler.token.bind(SecureSSOHandler),
  userInfo: SecureSSOHandler.userInfo.bind(SecureSSOHandler),
  callback: SecureSSOHandler.callback.bind(SecureSSOHandler),
  logout: SecureSSOHandler.logout.bind(SecureSSOHandler),
  getStats: SecureSSOHandler.getStats.bind(SecureSSOHandler),

  // Client Registration endpoints
  registerClient: ClientRegistration.registerClient.bind(ClientRegistration),
  getClient: ClientRegistration.getClient.bind(ClientRegistration),
  listClients: ClientRegistration.listClients.bind(ClientRegistration),
  updateClient: ClientRegistration.updateClient.bind(ClientRegistration),
  deleteClient: ClientRegistration.deleteClient.bind(ClientRegistration),

  // Session Management endpoints
  getSessionInfo: SessionManager.getSessionInfo.bind(SessionManager),
  getUserSessions: SessionManager.getUserSessions.bind(SessionManager),
  getSessionStats: SessionManager.getSessionStats.bind(SessionManager),
  endSession: SessionManager.endSessionEndpoint.bind(SessionManager),

  // Scope Management endpoints
  getScopes: ScopeManager.getScopes.bind(ScopeManager),
  getScopeInfo: ScopeManager.getScopeInfo.bind(ScopeManager),
  validateScopes: ScopeManager.validateScopesEndpoint.bind(ScopeManager),
  checkPermission: ScopeManager.checkPermission.bind(ScopeManager),
};