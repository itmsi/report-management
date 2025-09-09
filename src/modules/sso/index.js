const SecureSSOHandler = require('./security_handler');
const SSOClientForwardHandler = require('./client_forward_handler');
const ClientRegistration = require('./client_registration');
const SessionManager = require('./session_manager');
const ScopeManager = require('./scope_manager');

// Use SSO Client Forward Handler for forwarding to SSO Server
module.exports = {
  // Core SSO endpoints - Forward to SSO Server
  login: SSOClientForwardHandler.login.bind(SSOClientForwardHandler),
  authorize: SSOClientForwardHandler.authorize.bind(SSOClientForwardHandler),
  token: SSOClientForwardHandler.token.bind(SSOClientForwardHandler),
  userInfo: SSOClientForwardHandler.userInfo.bind(SSOClientForwardHandler),
  callback: SSOClientForwardHandler.callback.bind(SSOClientForwardHandler),
  logout: SSOClientForwardHandler.logout.bind(SSOClientForwardHandler),
  getStats: SSOClientForwardHandler.getStats.bind(SSOClientForwardHandler),

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