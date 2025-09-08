const { successResponse, errorResponse } = require('../../utils/response');
const { generateUUID, generateJWT, generateAuthorizationCode, hashPassword, verifyPassword } = require('../../utils/sso');
const ssoConfig = require('../../config/sso_config');
const { Logger } = require('../../utils/enhanced_logger');
const SessionManager = require('./session_manager');
const ScopeManager = require('./scope_manager');
const ClientRegistration = require('./client_registration');
const { errorHandler, ValidationError, AuthenticationError, RateLimitError } = require('../../utils/error_handler');
const { monitoringSystem } = require('../../utils/monitoring_system');

class SecureSSOHandler {
  constructor() {
    // In production, these should be stored in Redis or database
    this.authorizationCodes = new Map();
    this.activeTokens = new Map();
    this.refreshTokens = new Map();
    this.tokenBlacklist = new Set(); // Token blacklist for logout
    this.failedAttempts = new Map();
    this.rateLimitTracker = new Map();
    this.clientCredentials = new Map(); // Enhanced client validation
    
    // Initialize cleanup interval
    this.startCleanupInterval();
    
    // Initialize data (will be called asynchronously)
    this.initializeData();
  }

  async initializeData() {
    try {
      // Enhanced user database with security features
      this.users = new Map([
        ['admin', {
          id: generateUUID(),
          username: ssoConfig.defaultUsers.admin.username,
          password: await hashPassword(ssoConfig.defaultUsers.admin.password),
          email: ssoConfig.defaultUsers.admin.email,
          firstName: ssoConfig.defaultUsers.admin.firstName,
          lastName: ssoConfig.defaultUsers.admin.lastName,
          roles: ssoConfig.defaultUsers.admin.roles,
          permissions: ssoConfig.defaultUsers.admin.permissions,
          isActive: true,
          lastLogin: null,
          failedAttempts: 0,
          lockedUntil: null,
          mfaEnabled: ssoConfig.sso.security.enableMFA,
          lastPasswordChange: new Date(),
          passwordHistory: []
        }],
        ['user', {
          id: generateUUID(),
          username: ssoConfig.defaultUsers.user.username,
          password: await hashPassword(ssoConfig.defaultUsers.user.password),
          email: ssoConfig.defaultUsers.user.email,
          firstName: ssoConfig.defaultUsers.user.firstName,
          lastName: ssoConfig.defaultUsers.user.lastName,
          roles: ssoConfig.defaultUsers.user.roles,
          permissions: ssoConfig.defaultUsers.user.permissions,
          isActive: true,
          lastLogin: null,
          failedAttempts: 0,
          lockedUntil: null,
          mfaEnabled: ssoConfig.sso.security.enableMFA,
          lastPasswordChange: new Date(),
          passwordHistory: []
        }]
      ]);

      // Enhanced clients database with better validation
      this.clients = new Map([
        ['test_client', {
          id: ssoConfig.defaultClients.testClient.id,
          secret: await hashPassword(ssoConfig.defaultClients.testClient.secret),
          name: ssoConfig.defaultClients.testClient.name,
          redirectUris: ssoConfig.defaultClients.testClient.redirectUris,
          scopes: ssoConfig.defaultClients.testClient.scopes,
          isActive: true,
          createdAt: new Date(),
          lastUsed: null,
          allowedOrigins: ssoConfig.defaultClients.testClient.redirectUris.map(uri => {
            try {
              const url = new URL(uri);
              return `${url.protocol}//${url.host}`;
            } catch {
              return uri;
            }
          }),
          tokenExpiry: ssoConfig.sso.clients.defaultTokenExpiry,
          refreshTokenExpiry: ssoConfig.sso.clients.defaultRefreshTokenExpiry,
          maxConcurrentSessions: ssoConfig.sso.clients.defaultMaxSessions,
          rateLimitPerMinute: ssoConfig.sso.clients.defaultRateLimit,
          securityLevel: 'standard',
          contactEmail: ssoConfig.defaultClients.testClient.contactEmail,
          website: ssoConfig.defaultClients.testClient.website
        }]
      ]);

      // Initialize client credentials for enhanced validation
      this.initializeClientCredentials();

      Logger.info('SSO Handler initialized successfully', {
        usersCount: this.users.size,
        clientsCount: this.clients.size
      });

    } catch (error) {
      Logger.error('Failed to initialize SSO Handler', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Initialize client credentials with additional security
  initializeClientCredentials() {
    for (const [clientId, client] of this.clients.entries()) {
      this.clientCredentials.set(clientId, {
        ...client,
        currentSessions: new Set(),
        rateLimitTracker: new Map(),
        lastActivity: new Date(),
        securityViolations: 0
      });
    }
  }

  // Enhanced rate limiting with different limits per client
  isRateLimited(ip, clientId = null) {
    const now = Date.now();
    const key = clientId ? `${ip}:${clientId}` : ip;
    
    // Get client-specific rate limits
    let maxAttempts = 10; // Default
    let windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (clientId && this.clientCredentials.has(clientId)) {
      const client = this.clientCredentials.get(clientId);
      maxAttempts = client.rateLimitPerMinute || 60;
      windowMs = 60 * 1000; // 1 minute for client-specific limits
    }

    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, { attempts: 1, firstAttempt: now });
      return false;
    }

    const tracker = this.rateLimitTracker.get(key);
    
    // Reset if window has passed
    if (now - tracker.firstAttempt > windowMs) {
      this.rateLimitTracker.set(key, { attempts: 1, firstAttempt: now });
      return false;
    }

    // Check if limit exceeded
    if (tracker.attempts >= maxAttempts) {
      return true;
    }

    // Increment attempts
    tracker.attempts++;
    return false;
  }

  // Enhanced client validation
  async validateClient(clientId, clientSecret, redirectUri = null) {
    const client = this.clientCredentials.get(clientId);
    
    if (!client || !client.isActive) {
      Logger.warn('Client validation failed: client not found or inactive', { clientId });
      return { valid: false, error: 'Client tidak valid atau tidak aktif' };
    }

    // Verify client secret
    const isValidSecret = await verifyPassword(clientSecret, client.secret);
    if (!isValidSecret) {
      Logger.warn('Client validation failed: invalid secret', { clientId });
      return { valid: false, error: 'Client secret tidak valid' };
    }

    // Validate redirect URI if provided
    if (redirectUri && !client.redirectUris.includes(redirectUri)) {
      Logger.warn('Client validation failed: invalid redirect URI', { 
        clientId, 
        redirectUri, 
        allowedUris: client.redirectUris 
      });
      return { valid: false, error: 'Redirect URI tidak terdaftar untuk client ini' };
    }

    // Check security violations
    if (client.securityViolations >= 5) {
      Logger.warn('Client validation failed: too many security violations', { clientId });
      return { valid: false, error: 'Client diblokir karena pelanggaran keamanan' };
    }

    // Update client activity
    client.lastActivity = new Date();
    
    return { valid: true, client };
  }

  // Enhanced login with better security
  async login(req, res) {
    try {
      const { username, password, client_id, redirect_uri, scope, state } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Enhanced rate limiting
      if (this.isRateLimited(clientIP, client_id)) {
        Logger.warn('Rate limit exceeded for IP', { ip: clientIP, username, client_id });
        return errorResponse(res, 'Terlalu banyak percobaan login. Coba lagi nanti.', 429);
      }

      // Validation
      if (!username || !password) {
        return errorResponse(res, 'Username dan password diperlukan', 400);
      }

      // Check if user exists
      const user = this.users.get(username);
      if (!user) {
        this.recordFailedAttempt(clientIP, username);
        Logger.warn('Login attempt with non-existent user', { username, ip: clientIP });
        return errorResponse(res, 'Kredensial tidak valid', 401);
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > Date.now()) {
        const lockTimeRemaining = Math.ceil((user.lockedUntil - Date.now()) / 60000);
        Logger.warn('Login attempt on locked account', { username, ip: clientIP, lockTimeRemaining });
        return errorResponse(res, `Akun terkunci. Coba lagi dalam ${lockTimeRemaining} menit.`, 423);
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        this.recordFailedAttempt(clientIP, username);
        user.failedAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.failedAttempts >= 5) {
          user.lockedUntil = Date.now() + (30 * 60 * 1000); // 30 minutes
          Logger.warn('Account locked due to failed attempts', { username, ip: clientIP });
        }
        
        Logger.warn('Invalid password attempt', { username, ip: clientIP, failedAttempts: user.failedAttempts });
        return errorResponse(res, 'Kredensial tidak valid', 401);
      }

      // Enhanced client validation
      if (client_id) {
        const clientValidation = await this.validateClient(client_id, req.body.client_secret, redirect_uri);
        if (!clientValidation.valid) {
          Logger.warn('Login attempt with invalid client', { username, client_id, ip: clientIP });
          return errorResponse(res, clientValidation.error, 400);
        }
      }

      // Reset failed attempts on successful login
      user.failedAttempts = 0;
      user.lockedUntil = null;
      user.lastLogin = new Date();

      // Generate user session data
      const sessionId = generateUUID();
      const userData = {
        user_id: user.id,
        user_name: user.username,
        user_email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        roles: user.roles,
        permissions: user.permissions,
        client_id: client_id || 'default_client',
        session_id: sessionId,
        login_time: new Date().toISOString(),
        ip_address: clientIP
      };

      // Generate authorization code if redirect_uri provided
      if (redirect_uri) {
        const authCode = generateAuthorizationCode();
        this.authorizationCodes.set(authCode, {
          user: userData,
          client_id,
          redirect_uri,
          scope: scope || 'read',
          state,
          expires_at: Date.now() + (10 * 60 * 1000), // 10 minutes
          created_at: Date.now(),
          ip_address: clientIP
        });

        Logger.info('SSO login successful with authorization code', { 
          username, 
          client_id, 
          ip: clientIP,
          authCode: authCode.substring(0, 8) + '...'
        });

        return successResponse(res, {
          ...userData,
          authorization_code: authCode,
          redirect_uri,
          expires_in: 600 // 10 minutes
        }, 'Login SSO berhasil');
      }

      Logger.info('SSO login successful', { username, client_id, ip: clientIP });
      return successResponse(res, userData, 'Login SSO berhasil');
    } catch (error) {
      Logger.error('Error during SSO login', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Terjadi kesalahan pada server', 500);
    }
  }

  // Enhanced logout with token blacklist
  async logout(req, res) {
    try {
      const { token, refresh_token, client_id } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!token) {
        return errorResponse(res, 'Token diperlukan', 400);
      }

      let logoutCount = 0;

      // Add token to blacklist
      this.tokenBlacklist.add(token);
      logoutCount++;

      // Invalidate access token
      if (this.activeTokens.has(token)) {
        this.activeTokens.delete(token);
      }

      // Invalidate refresh token if provided
      if (refresh_token) {
        this.tokenBlacklist.add(refresh_token);
        if (this.refreshTokens.has(refresh_token)) {
          this.refreshTokens.delete(refresh_token);
        }
        logoutCount++;
      }

      // If client_id provided, invalidate all tokens for that client
      if (client_id) {
        const client = this.clientCredentials.get(client_id);
        if (client) {
          // Remove from current sessions
          client.currentSessions.delete(token);
          
          // Invalidate all tokens for this client
          for (const [accessToken, tokenData] of this.activeTokens.entries()) {
            if (tokenData.client_id === client_id) {
              this.tokenBlacklist.add(accessToken);
              this.activeTokens.delete(accessToken);
              logoutCount++;
            }
          }
          
          for (const [refreshToken, tokenData] of this.refreshTokens.entries()) {
            if (tokenData.client_id === client_id) {
              this.tokenBlacklist.add(refreshToken);
              this.refreshTokens.delete(refreshToken);
              logoutCount++;
            }
          }
        }
      }

      Logger.info('Logout successful', { 
        tokens_invalidated: logoutCount,
        client_id,
        ip: clientIP 
      });

      return successResponse(res, { 
        message: 'Logout berhasil',
        tokens_invalidated: logoutCount
      }, 'Logout berhasil');
    } catch (error) {
      Logger.error('Error during logout', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal melakukan logout', 500);
    }
  }

  // Check if token is blacklisted
  isTokenBlacklisted(token) {
    return this.tokenBlacklist.has(token);
  }

  // Enhanced user info with blacklist check
  async userInfo(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Bearer token diperlukan', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Check if token is blacklisted
      if (this.isTokenBlacklisted(token)) {
        Logger.warn('User info request with blacklisted token', { ip: clientIP });
        return errorResponse(res, 'Token tidak valid', 401);
      }

      // Validate token
      const tokenData = this.activeTokens.get(token);
      if (!tokenData) {
        Logger.warn('User info request with invalid token', { ip: clientIP });
        return errorResponse(res, 'Token tidak valid', 401);
      }

      if (tokenData.expires_at < Date.now()) {
        this.activeTokens.delete(token);
        Logger.warn('User info request with expired token', { ip: clientIP });
        return errorResponse(res, 'Token sudah expired', 401);
      }

      // Decode JWT untuk mendapatkan user info
      try {
        const decoded = require('jsonwebtoken').verify(token, ssoConfig.sso.jwt.secret);
        
        // Get user from database (in production)
        const user = Array.from(this.users.values()).find(u => u.id === decoded.user_id);
        
        const userInfo = {
          user_id: decoded.user_id,
          user_name: decoded.user_name,
          user_email: user?.email || `${decoded.user_name}@example.com`,
          first_name: user?.firstName || 'User',
          last_name: user?.lastName || 'Name',
          roles: user?.roles || ['user'],
          permissions: user?.permissions || ['read'],
          client_id: decoded.client_id,
          session_id: decoded.session_id,
          scope: decoded.scope || ['read'],
          login_time: new Date(tokenData.created_at).toISOString(),
          last_activity: new Date().toISOString()
        };

        Logger.info('User info retrieved successfully', { 
          user_id: decoded.user_id, 
          client_id: decoded.client_id,
          session_id: decoded.session_id,
          ip: clientIP 
        });

        return successResponse(res, userInfo, 'User info berhasil diambil');
      } catch (jwtError) {
        Logger.warn('User info request with invalid JWT', { error: jwtError.message, ip: clientIP });
        return errorResponse(res, 'Token tidak valid', 401);
      }
    } catch (error) {
      Logger.error('Error getting user info', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil user info', 500);
    }
  }

  // Record failed attempt with enhanced tracking
  recordFailedAttempt(ip, username) {
    const now = Date.now();
    const key = `${ip}:${username}`;
    
    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, { attempts: 1, firstAttempt: now });
    } else {
      const tracker = this.failedAttempts.get(key);
      tracker.attempts++;
    }
  }

  // Enhanced cleanup with blacklist management
  cleanupExpired() {
    const now = Date.now();
    let cleanedCodes = 0;
    let cleanedTokens = 0;
    let cleanedRefreshTokens = 0;
    let cleanedBlacklist = 0;
    
    // Cleanup expired authorization codes
    for (const [code, data] of this.authorizationCodes.entries()) {
      if (data.expires_at < now) {
        this.authorizationCodes.delete(code);
        cleanedCodes++;
      }
    }
    
    // Cleanup expired access tokens
    for (const [token, data] of this.activeTokens.entries()) {
      if (data.expires_at < now) {
        this.activeTokens.delete(token);
        cleanedTokens++;
      }
    }
    
    // Cleanup expired refresh tokens
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expires_at < now) {
        this.refreshTokens.delete(token);
        cleanedRefreshTokens++;
      }
    }

    // Cleanup old blacklisted tokens (keep for 24 hours)
    const blacklistArray = Array.from(this.tokenBlacklist);
    for (const token of blacklistArray) {
      // In production, you would check token expiry here
      // For now, we'll keep blacklisted tokens for 24 hours
      // This should be implemented with proper token expiry checking
    }

    // Cleanup old rate limit entries
    for (const [ip, tracker] of this.rateLimitTracker.entries()) {
      if (now - tracker.firstAttempt > 15 * 60 * 1000) { // 15 minutes
        this.rateLimitTracker.delete(ip);
      }
    }

    // Cleanup old failed attempts
    for (const [key, tracker] of this.failedAttempts.entries()) {
      if (now - tracker.firstAttempt > 60 * 60 * 1000) { // 1 hour
        this.failedAttempts.delete(key);
      }
    }

    if (cleanedCodes > 0 || cleanedTokens > 0 || cleanedRefreshTokens > 0) {
      Logger.info('Cleanup completed', {
        expired_codes: cleanedCodes,
        expired_tokens: cleanedTokens,
        expired_refresh_tokens: cleanedRefreshTokens,
        blacklisted_tokens: this.tokenBlacklist.size
      });
    }
  }

  // Start cleanup interval
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Get enhanced system statistics
  async getStats(req, res) {
    try {
      const stats = {
        active_tokens: this.activeTokens.size,
        active_refresh_tokens: this.refreshTokens.size,
        pending_authorization_codes: this.authorizationCodes.size,
        blacklisted_tokens: this.tokenBlacklist.size,
        registered_clients: this.clients.size,
        registered_users: this.users.size,
        rate_limited_ips: this.rateLimitTracker.size,
        failed_attempts_tracked: this.failedAttempts.size,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      Logger.info('System stats requested', { ip: req.ip });
      return successResponse(res, stats, 'Statistik sistem berhasil diambil');
    } catch (error) {
      Logger.error('Error getting system stats', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil statistik sistem', 500);
    }
  }

  // Delegate other methods to the original handler
  async authorize(req, res) {
    // Implementation similar to original but with enhanced security
    return this.handleAuthorization(req, res);
  }

  async token(req, res) {
    // Implementation similar to original but with enhanced security
    return this.handleTokenExchange(req, res);
  }

  async callback(req, res) {
    // Implementation similar to original but with enhanced security
    return this.handleCallback(req, res);
  }

  // Enhanced authorization with client validation
  async handleAuthorization(req, res) {
    try {
      const { client_id, redirect_uri, response_type, state, scope } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Rate limiting
      if (this.isRateLimited(clientIP, client_id)) {
        Logger.warn('Rate limit exceeded for authorization', { ip: clientIP, client_id });
        return errorResponse(res, 'Terlalu banyak percobaan authorization. Coba lagi nanti.', 429);
      }

      // Validation
      if (!client_id || !redirect_uri) {
        return errorResponse(res, 'Client ID dan redirect URI diperlukan', 400);
      }

      if (response_type !== 'code') {
        return errorResponse(res, 'Response type harus "code"', 400);
      }

      // Enhanced client validation
      const clientValidation = await this.validateClient(client_id, null, redirect_uri);
      if (!clientValidation.valid) {
        Logger.warn('Authorization attempt with invalid client', { client_id, ip: clientIP });
        return errorResponse(res, clientValidation.error, 400);
      }

      const client = clientValidation.client;

      // Validate scope
      const requestedScopes = scope ? scope.split(' ') : ['read'];
      const invalidScopes = requestedScopes.filter(s => !client.scopes.includes(s));
      if (invalidScopes.length > 0) {
        Logger.warn('Authorization attempt with invalid scopes', { 
          client_id, 
          invalidScopes, 
          allowedScopes: client.scopes,
          ip: clientIP 
        });
        return errorResponse(res, `Scope tidak valid: ${invalidScopes.join(', ')}`, 400);
      }

      // Generate authorization code
      const authCode = generateAuthorizationCode();
      this.authorizationCodes.set(authCode, {
        client_id,
        redirect_uri,
        state,
        scope: requestedScopes,
        expires_at: Date.now() + (10 * 60 * 1000), // 10 minutes
        created_at: Date.now(),
        ip_address: clientIP
      });

      // Update client last used
      client.lastUsed = new Date();

      // Generate authorization URL
      const callbackUrl = `${redirect_uri}?code=${authCode}${state ? `&state=${state}` : ''}`;
      
      Logger.info('Authorization successful', { 
        client_id, 
        redirect_uri, 
        scopes: requestedScopes,
        ip: clientIP,
        authCode: authCode.substring(0, 8) + '...'
      });
      
      return successResponse(res, { 
        authorization_url: callbackUrl,
        code: authCode,
        state: state || null,
        expires_in: 600,
        scope: requestedScopes.join(' ')
      }, 'Authorization berhasil');
    } catch (error) {
      Logger.error('Error during authorization', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal melakukan authorization', 500);
    }
  }

  // Enhanced token exchange with refresh token support
  async handleTokenExchange(req, res) {
    try {
      const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Rate limiting
      if (this.isRateLimited(clientIP, client_id)) {
        Logger.warn('Rate limit exceeded for token exchange', { ip: clientIP, client_id });
        return errorResponse(res, 'Terlalu banyak percobaan token exchange. Coba lagi nanti.', 429);
      }

      // Validate grant type
      if (!grant_type || !['authorization_code', 'refresh_token'].includes(grant_type)) {
        return errorResponse(res, 'Grant type harus "authorization_code" atau "refresh_token"', 400);
      }

      if (grant_type === 'authorization_code') {
        return await this.handleAuthorizationCodeToken(req, res, clientIP);
      } else if (grant_type === 'refresh_token') {
        return await this.handleRefreshToken(req, res, clientIP);
      }
    } catch (error) {
      Logger.error('Error during token exchange', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal membuat token', 500);
    }
  }

  // Handle authorization code token exchange
  async handleAuthorizationCodeToken(req, res, clientIP) {
    const { code, client_id, client_secret, redirect_uri } = req.body;

    if (!code || !client_id || !client_secret) {
      return errorResponse(res, 'Code, client ID, dan client secret diperlukan', 400);
    }

    // Enhanced client validation
    const clientValidation = await this.validateClient(client_id, client_secret, redirect_uri);
    if (!clientValidation.valid) {
      Logger.warn('Token exchange with invalid client', { client_id, ip: clientIP });
      return errorResponse(res, clientValidation.error, 400);
    }

    const client = clientValidation.client;

    // Validate authorization code
    const authData = this.authorizationCodes.get(code);
    if (!authData) {
      Logger.warn('Token exchange with invalid authorization code', { code: code.substring(0, 8) + '...', ip: clientIP });
      return errorResponse(res, 'Authorization code tidak valid', 400);
    }

    if (authData.expires_at < Date.now()) {
      this.authorizationCodes.delete(code);
      Logger.warn('Token exchange with expired authorization code', { code: code.substring(0, 8) + '...', ip: clientIP });
      return errorResponse(res, 'Authorization code sudah expired', 400);
    }

    if (authData.client_id !== client_id) {
      Logger.warn('Token exchange with mismatched client ID', { 
        code: code.substring(0, 8) + '...', 
        expectedClient: authData.client_id, 
        providedClient: client_id,
        ip: clientIP 
      });
      return errorResponse(res, 'Client ID tidak sesuai', 400);
    }

    if (authData.redirect_uri !== redirect_uri) {
      Logger.warn('Token exchange with mismatched redirect URI', { 
        code: code.substring(0, 8) + '...', 
        expectedUri: authData.redirect_uri, 
        providedUri: redirect_uri,
        ip: clientIP 
      });
      return errorResponse(res, 'Redirect URI tidak sesuai', 400);
    }

    // Generate tokens
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = now + (client.tokenExpiry || 3600); // Use client-specific expiry
    const refreshTokenExpiry = now + (client.refreshTokenExpiry || 604800); // Use client-specific expiry

    const tokenPayload = {
      user_id: authData.user?.user_id || generateUUID(),
      user_name: authData.user?.user_name || 'user',
      client_id: client_id,
      scope: authData.scope || ['read'],
      session_id: authData.user?.session_id || generateUUID(),
      iat: now,
      exp: accessTokenExpiry,
      type: 'access_token'
    };

    const refreshTokenPayload = {
      user_id: tokenPayload.user_id,
      client_id: client_id,
      session_id: tokenPayload.session_id,
      iat: now,
      exp: refreshTokenExpiry,
      type: 'refresh_token'
    };

    const accessToken = generateJWT(tokenPayload, ssoConfig.sso.jwt.secret);
    const refreshToken = generateJWT(refreshTokenPayload, ssoConfig.sso.jwt.secret);

    // Store tokens
    this.activeTokens.set(accessToken, {
      user_id: tokenPayload.user_id,
      client_id: client_id,
      session_id: tokenPayload.session_id,
      scope: tokenPayload.scope,
      expires_at: accessTokenExpiry * 1000,
      created_at: Date.now(),
      ip_address: clientIP
    });

    this.refreshTokens.set(refreshToken, {
      user_id: tokenPayload.user_id,
      client_id: client_id,
      session_id: tokenPayload.session_id,
      expires_at: refreshTokenExpiry * 1000,
      created_at: Date.now(),
      ip_address: clientIP
    });

    // Track client session
    client.currentSessions.add(accessToken);

    // Remove used authorization code
    this.authorizationCodes.delete(code);

    // Update client last used
    client.lastUsed = new Date();

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: client.tokenExpiry || 3600,
      refresh_token: refreshToken,
      scope: tokenPayload.scope.join(' '),
      session_id: tokenPayload.session_id
    };

    Logger.info('Token exchange successful', { 
      client_id, 
      user_id: tokenPayload.user_id,
      session_id: tokenPayload.session_id,
      ip: clientIP 
    });

    return successResponse(res, tokenResponse, 'Token berhasil dibuat');
  }

  // Handle refresh token exchange
  async handleRefreshToken(req, res, clientIP) {
    const { refresh_token, client_id, client_secret } = req.body;

    if (!refresh_token || !client_id || !client_secret) {
      return errorResponse(res, 'Refresh token, client ID, dan client secret diperlukan', 400);
    }

    // Enhanced client validation
    const clientValidation = await this.validateClient(client_id, client_secret);
    if (!clientValidation.valid) {
      Logger.warn('Refresh token exchange with invalid client', { client_id, ip: clientIP });
      return errorResponse(res, clientValidation.error, 400);
    }

    const client = clientValidation.client;

    // Validate refresh token
    const refreshData = this.refreshTokens.get(refresh_token);
    if (!refreshData) {
      Logger.warn('Refresh token exchange with invalid refresh token', { ip: clientIP });
      return errorResponse(res, 'Refresh token tidak valid', 400);
    }

    if (refreshData.expires_at < Date.now()) {
      this.refreshTokens.delete(refresh_token);
      Logger.warn('Refresh token exchange with expired refresh token', { ip: clientIP });
      return errorResponse(res, 'Refresh token sudah expired', 400);
    }

    if (refreshData.client_id !== client_id) {
      Logger.warn('Refresh token exchange with mismatched client ID', { 
        expectedClient: refreshData.client_id, 
        providedClient: client_id,
        ip: clientIP 
      });
      return errorResponse(res, 'Client ID tidak sesuai', 400);
    }

    // Generate new tokens
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = now + (client.tokenExpiry || 3600);
    const newRefreshTokenExpiry = now + (client.refreshTokenExpiry || 604800);

    const tokenPayload = {
      user_id: refreshData.user_id,
      user_name: 'user', // In production, get from database
      client_id: client_id,
      scope: ['read', 'write'], // In production, get from database
      session_id: refreshData.session_id,
      iat: now,
      exp: accessTokenExpiry,
      type: 'access_token'
    };

    const newRefreshTokenPayload = {
      user_id: refreshData.user_id,
      client_id: client_id,
      session_id: refreshData.session_id,
      iat: now,
      exp: newRefreshTokenExpiry,
      type: 'refresh_token'
    };

    const accessToken = generateJWT(tokenPayload, ssoConfig.sso.jwt.secret);
    const newRefreshToken = generateJWT(newRefreshTokenPayload, ssoConfig.sso.jwt.secret);

    // Store new tokens
    this.activeTokens.set(accessToken, {
      user_id: tokenPayload.user_id,
      client_id: client_id,
      session_id: tokenPayload.session_id,
      scope: tokenPayload.scope,
      expires_at: accessTokenExpiry * 1000,
      created_at: Date.now(),
      ip_address: clientIP
    });

    this.refreshTokens.set(newRefreshToken, {
      user_id: tokenPayload.user_id,
      client_id: client_id,
      session_id: tokenPayload.session_id,
      expires_at: newRefreshTokenExpiry * 1000,
      created_at: Date.now(),
      ip_address: clientIP
    });

    // Track client session
    client.currentSessions.add(accessToken);

    // Remove old refresh token
    this.refreshTokens.delete(refresh_token);

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: client.tokenExpiry || 3600,
      refresh_token: newRefreshToken,
      scope: tokenPayload.scope.join(' '),
      session_id: tokenPayload.session_id
    };

    Logger.info('Refresh token exchange successful', { 
      client_id, 
      user_id: tokenPayload.user_id,
      session_id: tokenPayload.session_id,
      ip: clientIP 
    });

    return successResponse(res, tokenResponse, 'Token berhasil diperbarui');
  }

  // Enhanced callback with validation
  async handleCallback(req, res) {
    try {
      const { code, state, error, error_description } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (error) {
        Logger.warn('SSO callback with error', { 
          error, 
          error_description, 
          ip: clientIP 
        });
        return errorResponse(res, `Error dari SSO: ${error_description || error}`, 400);
      }

      if (!code) {
        return errorResponse(res, 'Authorization code diperlukan', 400);
      }

      // Validate authorization code
      const authData = this.authorizationCodes.get(code);
      if (!authData) {
        Logger.warn('Callback with invalid authorization code', { 
          code: code.substring(0, 8) + '...', 
          ip: clientIP 
        });
        return errorResponse(res, 'Authorization code tidak valid', 400);
      }

      if (authData.expires_at < Date.now()) {
        this.authorizationCodes.delete(code);
        Logger.warn('Callback with expired authorization code', { 
          code: code.substring(0, 8) + '...', 
          ip: clientIP 
        });
        return errorResponse(res, 'Authorization code sudah expired', 400);
      }

      // Remove authorization code
      this.authorizationCodes.delete(code);

      Logger.info('SSO callback processed successfully', { 
        code: code.substring(0, 8) + '...', 
        state, 
        client_id: authData.client_id,
        ip: clientIP 
      });

      return successResponse(res, { 
        message: 'SSO callback berhasil',
        code,
        state: state || null,
        redirect_uri: authData.redirect_uri,
        client_id: authData.client_id,
        scope: authData.scope,
        expires_in: 0 // Code already used
      }, 'Callback berhasil diproses');
    } catch (error) {
      Logger.error('Error processing callback', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal memproses callback', 500);
    }
  }
}

module.exports = new SecureSSOHandler();
