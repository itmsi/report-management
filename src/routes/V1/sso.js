const express = require('express');
const router = express.Router();

// Import modules
const usersRoutes = require('../../modules/users');
const ssoRoutes = require('../../modules/sso');

// SSO Routes
router.post('/auth/sso/login', ssoRoutes.login);
router.get('/auth/sso/authorize', ssoRoutes.authorize);
router.post('/auth/sso/token', ssoRoutes.token);
router.get('/auth/sso/userinfo', ssoRoutes.userInfo);
router.get('/auth/sso/callback', ssoRoutes.callback);
router.post('/auth/sso/logout', ssoRoutes.logout);
router.get('/auth/sso/stats', ssoRoutes.getStats);

// Client Registration Routes
router.post('/auth/sso/clients', ssoRoutes.registerClient);
router.get('/auth/sso/clients', ssoRoutes.listClients);
router.get('/auth/sso/clients/:client_id', ssoRoutes.getClient);
router.put('/auth/sso/clients/:client_id', ssoRoutes.updateClient);
router.delete('/auth/sso/clients/:client_id', ssoRoutes.deleteClient);

// Session Management Routes
router.get('/auth/sso/sessions/:session_id', ssoRoutes.getSessionInfo);
router.get('/auth/sso/sessions/user/:user_id', ssoRoutes.getUserSessions);
router.get('/auth/sso/sessions/stats', ssoRoutes.getSessionStats);
router.post('/auth/sso/sessions/:session_id/end', ssoRoutes.endSession);

// Scope Management Routes
router.get('/auth/sso/scopes', ssoRoutes.getScopes);
router.get('/auth/sso/scopes/:scope', ssoRoutes.getScopeInfo);
router.post('/auth/sso/scopes/validate', ssoRoutes.validateScopes);
router.post('/auth/sso/scopes/check-permission', ssoRoutes.checkPermission);

// Users
router.post('/users', usersRoutes.createUser);
router.get('/users', usersRoutes.listUsers);
router.get('/users/:id', usersRoutes.getUser);
router.post('/users/login', usersRoutes.login);
router.put('/users/:id', usersRoutes.updateUser);
router.delete('/users/:id', usersRoutes.deleteUser);
router.post('/users/change-password', usersRoutes.changePassword);

module.exports = router;
