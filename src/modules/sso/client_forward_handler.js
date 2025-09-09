const axios = require('axios');
const { successResponse, errorResponse } = require('../../utils/response');
const { Logger } = require('../../utils/enhanced_logger');

class SSOClientForwardHandler {
  constructor() {
    this.ssoServerUrl = process.env.SSO_SERVER_URL || 'http://localhost:9588';
    this.clientId = process.env.SSO_CLIENT_ID || 'report-management-client';
    this.clientSecret = process.env.SSO_CLIENT_SECRET || 'report-management-client-secret-change-in-production';
    this.redirectUri = process.env.SSO_CLIENT_REDIRECT_URI || 'http://localhost:9581/api/v1/auth/sso/callback';
  }

  // Forward login request to SSO Server
  async login(req, res) {
    try {
      const { username, password, client_id, redirect_uri, scope, state } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      Logger.info('SSO Client login attempt', { 
        username, 
        client_id: client_id || this.clientId,
        ip: clientIP 
      });

      // Prepare request to SSO Server
      const ssoServerRequest = {
        user_name: username,
        user_password: password,
        client_id: client_id || this.clientId,
        redirect_uri: redirect_uri || this.redirectUri
      };

      // Forward request to SSO Server
      const response = await axios.post(
        `${this.ssoServerUrl}/api/v1/auth/sso/login`,
        ssoServerRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      if (response.data.success) {
        Logger.info('SSO Client login successful', { 
          username, 
          user_id: response.data.data.user_id,
          client_id: client_id || this.clientId,
          ip: clientIP 
        });

        // Transform response to match client format
        const clientResponse = {
          success: true,
          message: 'Login SSO berhasil',
          data: {
            user_id: response.data.data.user_id,
            user_name: username,
            user_email: `${username}@example.com`, // Default email
            first_name: username.charAt(0).toUpperCase() + username.slice(1),
            last_name: 'User',
            roles: ['user'],
            permissions: ['read'],
            client_id: client_id || this.clientId,
            session_id: response.data.data.user_id, // Use user_id as session_id
            login_time: new Date().toISOString(),
            ip_address: clientIP,
            authorization_code: response.data.data.authorization_code,
            redirect_uri: redirect_uri || this.redirectUri,
            expires_in: 600,
            sso_token: response.data.data.token // Include SSO server token
          }
        };

        return successResponse(res, clientResponse.data, clientResponse.message);
      } else {
        Logger.warn('SSO Server login failed', { 
          username, 
          message: response.data.message,
          ip: clientIP 
        });
        return errorResponse(res, response.data.message || 'Login gagal', 401);
      }

    } catch (error) {
      Logger.error('SSO Client login error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });

      if (error.response) {
        // SSO Server returned an error
        const serverError = error.response.data;
        Logger.warn('SSO Server error response', { 
          status: error.response.status,
          message: serverError.message,
          ip: req.ip 
        });
        return errorResponse(res, serverError.message || 'Login gagal', error.response.status);
      } else if (error.code === 'ECONNREFUSED') {
        // SSO Server is not available
        Logger.error('SSO Server connection refused', { ip: req.ip });
        return errorResponse(res, 'SSO Server tidak tersedia', 503);
      } else if (error.code === 'ETIMEDOUT') {
        // Request timeout
        Logger.error('SSO Server request timeout', { ip: req.ip });
        return errorResponse(res, 'Timeout menghubungi SSO Server', 504);
      } else {
        // Other errors
        return errorResponse(res, 'Terjadi kesalahan pada server', 500);
      }
    }
  }

  // Forward authorization request to SSO Server
  async authorize(req, res) {
    try {
      const { client_id, redirect_uri, response_type, state, scope } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      Logger.info('SSO Client authorization request', { 
        client_id, 
        redirect_uri,
        ip: clientIP 
      });

      // Forward request to SSO Server
      const response = await axios.get(
        `${this.ssoServerUrl}/api/v1/auth/sso/authorize`,
        {
          params: {
            client_id: client_id || this.clientId,
            redirect_uri: redirect_uri || this.redirectUri,
            response_type: response_type || 'code',
            state: state,
            scope: scope || 'read write'
          },
          timeout: 10000
        }
      );

      return res.status(response.status).json(response.data);

    } catch (error) {
      Logger.error('SSO Client authorization error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        return errorResponse(res, 'Terjadi kesalahan pada server', 500);
      }
    }
  }

  // Forward token exchange request to SSO Server
  async token(req, res) {
    try {
      const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      Logger.info('SSO Client token exchange', { 
        grant_type, 
        client_id: client_id || this.clientId,
        ip: clientIP 
      });

      // Prepare request to SSO Server
      const ssoServerRequest = {
        grant_type,
        code,
        client_id: client_id || this.clientId,
        client_secret: client_secret || this.clientSecret,
        redirect_uri: redirect_uri || this.redirectUri,
        refresh_token
      };

      // Forward request to SSO Server
      const response = await axios.post(
        `${this.ssoServerUrl}/api/v1/auth/sso/token`,
        ssoServerRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      return res.status(response.status).json(response.data);

    } catch (error) {
      Logger.error('SSO Client token exchange error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        return errorResponse(res, 'Terjadi kesalahan pada server', 500);
      }
    }
  }

  // Forward user info request to SSO Server
  async userInfo(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const clientIP = req.ip || req.connection.remoteAddress;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'Bearer token diperlukan', 401);
      }

      Logger.info('SSO Client user info request', { ip: clientIP });

      // Forward request to SSO Server
      const response = await axios.get(
        `${this.ssoServerUrl}/api/v1/auth/sso/userinfo`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      return res.status(response.status).json(response.data);

    } catch (error) {
      Logger.error('SSO Client user info error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        return errorResponse(res, 'Terjadi kesalahan pada server', 500);
      }
    }
  }

  // Forward logout request to SSO Server
  async logout(req, res) {
    try {
      const { token, refresh_token, client_id } = req.body;
      const clientIP = req.ip || req.connection.remoteAddress;

      Logger.info('SSO Client logout request', { 
        client_id: client_id || this.clientId,
        ip: clientIP 
      });

      // Prepare request to SSO Server
      const ssoServerRequest = {
        token,
        refresh_token,
        client_id: client_id || this.clientId
      };

      // Forward request to SSO Server
      const response = await axios.post(
        `${this.ssoServerUrl}/api/v1/auth/sso/logout`,
        ssoServerRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      return res.status(response.status).json(response.data);

    } catch (error) {
      Logger.error('SSO Client logout error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        return errorResponse(res, 'Terjadi kesalahan pada server', 500);
      }
    }
  }

  // Handle callback from SSO Server
  async callback(req, res) {
    try {
      const { code, state, error, error_description } = req.query;
      const clientIP = req.ip || req.connection.remoteAddress;

      Logger.info('SSO Client callback received', { 
        code: code ? code.substring(0, 8) + '...' : null,
        state,
        error,
        ip: clientIP 
      });

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

      // Process callback (you can add additional logic here)
      return successResponse(res, { 
        message: 'SSO callback berhasil',
        code,
        state: state || null,
        redirect_uri: this.redirectUri,
        client_id: this.clientId
      }, 'Callback berhasil diproses');

    } catch (error) {
      Logger.error('SSO Client callback error', { 
        error: error.message, 
        stack: error.stack,
        ip: req.ip 
      });
      return errorResponse(res, 'Gagal memproses callback', 500);
    }
  }

  // Get system statistics
  async getStats(req, res) {
    try {
      const stats = {
        sso_mode: 'client',
        sso_server_url: this.ssoServerUrl,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      Logger.info('SSO Client stats requested', { ip: req.ip });
      return successResponse(res, stats, 'Statistik SSO Client berhasil diambil');
    } catch (error) {
      Logger.error('Error getting SSO Client stats', { error: error.message, stack: error.stack });
      return errorResponse(res, 'Gagal mengambil statistik', 500);
    }
  }
}

module.exports = new SSOClientForwardHandler();
