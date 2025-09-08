const axios = require('axios');
const ssoConfig = require('../../config/sso');
const { CustomException } = require('../../utils/exception');
const { logger } = require('../../utils/logger');

class SSOClientHandler {
  constructor() {
    this.clientConfig = ssoConfig.sso.client;
  }

  // Generate authorization URL
  generateAuthorizationUrl(state = null) {
    const params = new URLSearchParams({
      client_id: this.clientConfig.id,
      redirect_uri: this.clientConfig.redirectUri,
      response_type: 'code',
      scope: 'read write',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.clientConfig.authorizationUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code, state = null) {
    try {
      const response = await axios.post(this.clientConfig.tokenUrl, {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientConfig.id,
        client_secret: this.clientConfig.secret,
        redirect_uri: this.clientConfig.redirectUri,
      });

      return response.data;
    } catch (error) {
      logger.error('Error exchanging code for token:', error);
      throw new CustomException('Failed to exchange authorization code for token', 400);
    }
  }

  // Get user info from SSO server
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(this.clientConfig.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error getting user info:', error);
      throw new CustomException('Failed to get user info from SSO server', 400);
    }
  }

  // Validate token with SSO server
  async validateToken(token) {
    try {
      const response = await axios.get(this.clientConfig.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Error validating token:', error);
      throw new CustomException('Invalid token', 401);
    }
  }

  // SSO callback handler
  async handleCallback(req, res) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        throw new CustomException(`SSO authorization error: ${error}`, 400);
      }

      if (!code) {
        throw new CustomException('Authorization code not provided', 400);
      }

      // Exchange code for token
      const tokenData = await this.exchangeCodeForToken(code, state);

      // Get user info
      const userInfo = await this.getUserInfo(tokenData.access_token);

      // Store token in session or return to client
      req.session.ssoToken = tokenData.access_token;
      req.session.user = userInfo;

      logger.info('SSO callback handled successfully', { user_id: userInfo.user_id });

      return res.status(200).json({
        success: true,
        message: 'SSO authentication successful',
        data: {
          user: userInfo,
          token: tokenData.access_token,
        },
      });
    } catch (error) {
      logger.error('Error handling SSO callback:', error);
      throw error;
    }
  }

  // Redirect to SSO login
  async redirectToSSO(req, res) {
    try {
      const state = crypto.randomBytes(32).toString('hex');
      req.session.ssoState = state;

      const authUrl = this.generateAuthorizationUrl(state);

      return res.redirect(authUrl);
    } catch (error) {
      logger.error('Error redirecting to SSO:', error);
      throw error;
    }
  }

  // Middleware to check SSO authentication
  async requireSSOAuth(req, res, next) {
    try {
      const token = req.session.ssoToken || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return this.redirectToSSO(req, res);
      }

      // Validate token
      const userInfo = await this.validateToken(token);
      req.user = userInfo;
      req.ssoToken = token;

      next();
    } catch (error) {
      logger.error('SSO authentication failed:', error);
      return this.redirectToSSO(req, res);
    }
  }

  // Logout from SSO
  async logout(req, res) {
    try {
      // Clear session
      req.session.destroy();

      // Redirect to SSO logout endpoint
      const logoutUrl = `${ssoConfig.sso.server.url}/auth/sso/logout`;
      return res.redirect(logoutUrl);
    } catch (error) {
      logger.error('Error during SSO logout:', error);
      throw error;
    }
  }
}

module.exports = SSOClientHandler;
