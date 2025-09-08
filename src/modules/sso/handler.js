const { successResponse, errorResponse } = require('../../utils/response');
const { generateUUID, generateJWT, generateAuthorizationCode, hashPassword, verifyPassword } = require('../../utils/sso');
const ssoConfig = require('../../config/sso');
const { Logger } = require('../../utils/logger');

class SSOHandler {
  constructor() {
    this.authorizationCodes = new Map(); // In production, use Redis or database
    this.activeTokens = new Map(); // In production, use Redis or database
    this.refreshTokens = new Map(); // In production, use Redis or database
    this.failedAttempts = new Map(); // Track failed login attempts
    this.rateLimitTracker = new Map(); // Rate limiting per IP
    
    // Initialize cleanup interval
    this.startCleanupInterval();
    
    // Mock user database - in production, integrate with actual database
    this.users = new Map([
      ['admin', {
        id: generateUUID(),
        username: 'admin',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['admin', 'user'],
        permissions: ['read', 'write', 'delete', 'admin'],
        isActive: true,
        lastLogin: null,
        failedAttempts: 0,
        lockedUntil: null
      }],
      ['user', {
        id: generateUUID(),
        username: 'user',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        roles: ['user'],
        permissions: ['read'],
        isActive: true,
        lastLogin: null,
        failedAttempts: 0,
        lockedUntil: null
      }]
    ]);

    // Mock clients database
    this.clients = new Map([
      ['test_client', {
        id: 'test_client',
        secret: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // test_secret
        name: 'Test Client Application',
        redirectUris: ['http://localhost:3001/callback', 'http://localhost:3002/callback'],
        scopes: ['read', 'write'],
        isActive: true,
        createdAt: new Date(),
        lastUsed: null
      }]
    ]);
  }

  // Start cleanup interval for expired tokens and codes
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Enhanced login with security features
  async login(req, res) {
    try {
      const { username, password, client_id, redirect_uri, scope, state } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Rate limiting
      if (this.isRateLimited(clientIP)) {
        Logger.warn('Rate limit exceeded for IP', { ip: clientIP, username });
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

      // Reset failed attempts on successful login
      user.failedAttempts = 0;
      user.lockedUntil = null;
      user.lastLogin = new Date();

      // Validate client if provided
      if (client_id) {
        const client = this.clients.get(client_id);
        if (!client || !client.isActive) {
          Logger.warn('Login attempt with invalid client', { username, client_id, ip: clientIP });
          return errorResponse(res, 'Client tidak valid', 400);
        }
        client.lastUsed = new Date();
      }

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
          created_at: Date.now()
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

  // Enhanced authorization with client validation
  async authorize(req, res) {
    try {
      const { client_id, redirect_uri, response_type, state, scope } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Rate limiting
      if (this.isRateLimited(clientIP)) {
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

      // Validate client
      const client = this.clients.get(client_id);
      if (!client || !client.isActive) {
        Logger.warn('Authorization attempt with invalid client', { client_id, ip: clientIP });
        return errorResponse(res, 'Client tidak valid atau tidak aktif', 400);
      }

      // Validate redirect URI
      if (!client.redirectUris.includes(redirect_uri)) {
        Logger.warn('Authorization attempt with invalid redirect URI', { 
          client_id, 
          redirect_uri, 
          allowedUris: client.redirectUris,
          ip: clientIP 
        });
        return errorResponse(res, 'Redirect URI tidak terdaftar untuk client ini', 400);
      }

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
  async token(req, res) {
    try {
      const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      // Rate limiting
      if (this.isRateLimited(clientIP)) {
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

    // Validate client credentials
    const client = this.clients.get(client_id);
    if (!client || !client.isActive) {
      Logger.warn('Token exchange with invalid client', { client_id, ip: clientIP });
      return errorResponse(res, 'Client tidak valid', 400);
    }

    const isValidSecret = await verifyPassword(client_secret, client.secret);
    if (!isValidSecret) {
      Logger.warn('Token exchange with invalid client secret', { client_id, ip: clientIP });
      return errorResponse(res, 'Client secret tidak valid', 400);
    }

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
    const accessTokenExpiry = now + (60 * 60); // 1 hour
    const refreshTokenExpiry = now + (7 * 24 * 60 * 60); // 7 days

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

    // Remove used authorization code
    this.authorizationCodes.delete(code);

    // Update client last used
    client.lastUsed = new Date();

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
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

    // Validate client credentials
    const client = this.clients.get(client_id);
    if (!client || !client.isActive) {
      Logger.warn('Refresh token exchange with invalid client', { client_id, ip: clientIP });
      return errorResponse(res, 'Client tidak valid', 400);
    }

    const isValidSecret = await verifyPassword(client_secret, client.secret);
    if (!isValidSecret) {
      Logger.warn('Refresh token exchange with invalid client secret', { client_id, ip: clientIP });
      return errorResponse(res, 'Client secret tidak valid', 400);
    }

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
    const accessTokenExpiry = now + (60 * 60); // 1 hour
    const newRefreshTokenExpiry = now + (7 * 24 * 60 * 60); // 7 days

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

    // Remove old refresh token
    this.refreshTokens.delete(refresh_token);

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hour
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

  // Enhanced user info with detailed user data
  async userInfo(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Bearer token diperlukan', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

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

  // Enhanced callback with validation
  async callback(req, res) {
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

  // Enhanced logout with session management
  async logout(req, res) {
    try {
      const { token, refresh_token, client_id } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!token) {
        return errorResponse(res, 'Token diperlukan', 400);
      }

      let logoutCount = 0;

      // Invalidate access token
      if (this.activeTokens.has(token)) {
        this.activeTokens.delete(token);
        logoutCount++;
      }

      // Invalidate refresh token if provided
      if (refresh_token && this.refreshTokens.has(refresh_token)) {
        this.refreshTokens.delete(refresh_token);
        logoutCount++;
      }

      // If client_id provided, invalidate all tokens for that client
      if (client_id) {
        for (const [accessToken, tokenData] of this.activeTokens.entries()) {
          if (tokenData.client_id === client_id) {
            this.activeTokens.delete(accessToken);
            logoutCount++;
          }
        }
        
        for (const [refreshToken, tokenData] of this.refreshTokens.entries()) {
          if (tokenData.client_id === client_id) {
            this.refreshTokens.delete(refreshToken);
            logoutCount++;
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

  // Rate limiting helper
  isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 10; // Max 10 attempts per 15 minutes

    if (!this.rateLimitTracker.has(ip)) {
      this.rateLimitTracker.set(ip, { attempts: 1, firstAttempt: now });
      return false;
    }

    const tracker = this.rateLimitTracker.get(ip);
    
    // Reset if window has passed
    if (now - tracker.firstAttempt > windowMs) {
      this.rateLimitTracker.set(ip, { attempts: 1, firstAttempt: now });
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

  // Record failed attempt
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

  // Enhanced cleanup with logging
  cleanupExpired() {
    const now = Date.now();
    let cleanedCodes = 0;
    let cleanedTokens = 0;
    let cleanedRefreshTokens = 0;
    
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
        expired_refresh_tokens: cleanedRefreshTokens
      });
    }
  }

  // Get system statistics
  async getStats(req, res) {
    try {
      const stats = {
        active_tokens: this.activeTokens.size,
        active_refresh_tokens: this.refreshTokens.size,
        pending_authorization_codes: this.authorizationCodes.size,
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
}

module.exports = new SSOHandler();