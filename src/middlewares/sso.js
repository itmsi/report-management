const ssoConfig = require('../config/sso');
const { logger } = require('./logger');

class SSOMiddleware {
  constructor() {
    this.mode = ssoConfig.sso.mode;
  }

  // Middleware untuk memvalidasi SSO mode
  validateSSOMode(req, res, next) {
    if (!this.mode || !['server', 'client'].includes(this.mode)) {
      logger.error('Invalid SSO mode configuration');
      return res.status(500).json({
        success: false,
        message: 'SSO mode not configured properly',
      });
    }
    next();
  }

  // Middleware untuk server mode only
  serverModeOnly(req, res, next) {
    if (this.mode !== 'server') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in server mode',
      });
    }
    next();
  }

  // Middleware untuk client mode only
  clientModeOnly(req, res, next) {
    if (this.mode !== 'client') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in client mode',
      });
    }
    next();
  }

  // Middleware untuk memvalidasi client credentials
  validateClientCredentials(req, res, next) {
    if (this.mode === 'server') {
      const { client_id, client_secret } = req.body;
      
      // In production, validate against database
      if (!client_id || !client_secret) {
        return res.status(400).json({
          success: false,
          message: 'Client credentials required',
        });
      }
    }
    next();
  }

  // Middleware untuk memvalidasi redirect URI
  validateRedirectUri(req, res, next) {
    if (this.mode === 'server') {
      const { redirect_uri } = req.query;
      
      // In production, validate against registered clients
      if (!redirect_uri) {
        return res.status(400).json({
          success: false,
          message: 'Redirect URI required',
        });
      }
    }
    next();
  }

  // Middleware untuk rate limiting SSO endpoints
  rateLimitSSO(req, res, next) {
    // Implement rate limiting logic here
    // For now, just pass through
    next();
  }

  // Middleware untuk logging SSO activities
  logSSOActivity(req, res, next) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('SSO Activity', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    });
    
    next();
  }

  // Middleware untuk CORS SSO
  corsSSO(req, res, next) {
    // Set CORS headers for SSO endpoints
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  }
}

module.exports = SSOMiddleware;
