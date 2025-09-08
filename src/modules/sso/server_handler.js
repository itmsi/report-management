const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ssoConfig = require('../../config/sso');
const UsersRepository = require('../users/postgre_repository');
const { CustomException } = require('../../utils/exception');
const { logger } = require('../../utils/logger');

class SSOServerHandler {
  constructor() {
    this.usersRepository = new UsersRepository();
    this.authorizationCodes = new Map(); // In production, use Redis or database
  }

  // Generate authorization code
  generateAuthorizationCode(clientId, redirectUri, userId) {
    const code = crypto.randomBytes(32).toString('hex');
    this.authorizationCodes.set(code, {
      clientId,
      redirectUri,
      userId,
      expiresAt: Date.now() + 600000, // 10 minutes
    });
    return code;
  }

  // Validate authorization code
  validateAuthorizationCode(code) {
    const authCode = this.authorizationCodes.get(code);
    if (!authCode || authCode.expiresAt < Date.now()) {
      this.authorizationCodes.delete(code);
      return null;
    }
    return authCode;
  }

  // SSO Login endpoint
  async login(req, res) {
    try {
      const { user_name, user_password, client_id, redirect_uri } = req.body;

      // Find user by username or email
      let user = await this.usersRepository.findByUsername(user_name);
      if (!user) {
        user = await this.usersRepository.findByEmail(user_name);
      }

      if (!user) {
        throw new CustomException('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await this.usersRepository.verifyPassword(user_password, user.user_password);
      if (!isValidPassword) {
        throw new CustomException('Invalid credentials', 401);
      }

      // Get user details with permissions
      const userDetails = await this.usersRepository.getUserWithDetails(user.user_id);
      const permissions = await this.usersRepository.getUserPermissions(user.user_id);

      // Generate authorization code if client_id and redirect_uri provided
      let authorizationCode = null;
      if (client_id && redirect_uri) {
        authorizationCode = this.generateAuthorizationCode(client_id, redirect_uri, user.user_id);
      }

      // Generate JWT token
      const tokenPayload = {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        role_id: user.role_id,
        employee_id: user.employee_id,
        permissions: permissions.map(p => ({
          permission_id: p.permission_id,
          permission_name: p.permission_name,
          menu_id: p.menu_id,
          menu_name: p.menu_name,
          menu_url: p.menu_url,
        })),
      };

      const token = jwt.sign(tokenPayload, ssoConfig.sso.jwt.secret, {
        expiresIn: ssoConfig.sso.jwt.expiresIn,
        issuer: ssoConfig.sso.jwt.issuer,
        audience: client_id || ssoConfig.sso.jwt.audience,
      });

      logger.info('SSO login successful', { user_id: user.user_id, client_id });

      return res.status(200).json({
        success: true,
        message: 'SSO login successful',
        data: {
          user: {
            ...userDetails,
            user_password: undefined, // Remove password from response
          },
          permissions,
          token,
          authorization_code: authorizationCode,
        },
      });
    } catch (error) {
      logger.error('Error during SSO login:', error);
      throw error;
    }
  }

  // Authorization endpoint (OAuth2 flow)
  async authorize(req, res) {
    try {
      const { client_id, redirect_uri, response_type, state } = req.query;

      if (response_type !== 'code') {
        throw new CustomException('Unsupported response type', 400);
      }

      // In a real implementation, you would validate client_id and redirect_uri
      // against registered clients

      // Check if user is already authenticated
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        // Redirect to login page
        return res.redirect(`/auth/sso/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`);
      }

      try {
        const decoded = jwt.verify(token, ssoConfig.sso.jwt.secret);
        const user = await this.usersRepository.findById(decoded.user_id);

        if (!user || user.is_delete) {
          throw new CustomException('User not found', 401);
        }

        // Generate authorization code
        const authorizationCode = this.generateAuthorizationCode(client_id, redirect_uri, user.user_id);

        // Redirect back to client with authorization code
        const redirectUrl = `${redirect_uri}?code=${authorizationCode}&state=${state}`;
        return res.redirect(redirectUrl);

      } catch (jwtError) {
        // Token is invalid, redirect to login
        return res.redirect(`/auth/sso/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}`);
      }
    } catch (error) {
      logger.error('Error during SSO authorization:', error);
      throw error;
    }
  }

  // Token endpoint (OAuth2 flow)
  async token(req, res) {
    try {
      const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

      if (grant_type !== 'authorization_code') {
        throw new CustomException('Unsupported grant type', 400);
      }

      // Validate authorization code
      const authCode = this.validateAuthorizationCode(code);
      if (!authCode) {
        throw new CustomException('Invalid or expired authorization code', 400);
      }

      // Validate client credentials
      if (authCode.clientId !== client_id) {
        throw new CustomException('Invalid client ID', 400);
      }

      // In a real implementation, you would validate client_secret
      // and redirect_uri against registered clients

      // Get user details
      const user = await this.usersRepository.getUserWithDetails(authCode.userId);
      const permissions = await this.usersRepository.getUserPermissions(authCode.userId);

      if (!user) {
        throw new CustomException('User not found', 404);
      }

      // Generate access token
      const tokenPayload = {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        role_id: user.role_id,
        employee_id: user.employee_id,
        permissions: permissions.map(p => ({
          permission_id: p.permission_id,
          permission_name: p.permission_name,
          menu_id: p.menu_id,
          menu_name: p.menu_name,
          menu_url: p.menu_url,
        })),
      };

      const accessToken = jwt.sign(tokenPayload, ssoConfig.sso.jwt.secret, {
        expiresIn: ssoConfig.sso.jwt.expiresIn,
        issuer: ssoConfig.sso.jwt.issuer,
        audience: client_id,
      });

      // Clean up authorization code
      this.authorizationCodes.delete(code);

      logger.info('SSO token generated successfully', { user_id: user.user_id, client_id });

      return res.status(200).json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 86400, // 24 hours
        scope: 'read write',
      });
    } catch (error) {
      logger.error('Error generating SSO token:', error);
      throw error;
    }
  }

  // User info endpoint (OAuth2 flow)
  async userInfo(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new CustomException('Access token required', 401);
      }

      const decoded = jwt.verify(token, ssoConfig.sso.jwt.secret);
      const user = await this.usersRepository.getUserWithDetails(decoded.user_id);
      const permissions = await this.usersRepository.getUserPermissions(decoded.user_id);

      if (!user) {
        throw new CustomException('User not found', 404);
      }

      return res.status(200).json({
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        employee_name: user.employee_name,
        role_name: user.role_name,
        title_name: user.title_name,
        department_name: user.department_name,
        company_name: user.company_name,
        permissions: permissions.map(p => ({
          permission_id: p.permission_id,
          permission_name: p.permission_name,
          menu_id: p.menu_id,
          menu_name: p.menu_name,
          menu_url: p.menu_url,
        })),
      });
    } catch (error) {
      logger.error('Error getting user info:', error);
      throw error;
    }
  }

  // Logout endpoint
  async logout(req, res) {
    try {
      // In a real implementation, you would invalidate the token
      // by adding it to a blacklist or using token revocation

      logger.info('SSO logout successful', { user_id: req.user?.user_id });

      return res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Error during SSO logout:', error);
      throw error;
    }
  }
}

module.exports = SSOServerHandler;
