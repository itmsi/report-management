const config = {
  sso: {
    mode: process.env.SSO_MODE || 'client', // 'server' or 'client'
    
    // SSO Server Configuration
    server: {
      url: process.env.SSO_SERVER_URL || 'http://localhost:9588',
      authorizationUrl: process.env.SSO_SERVER_AUTHORIZATION_URL || 'http://localhost:9588/api/v1/auth/sso/authorize',
      tokenUrl: process.env.SSO_SERVER_TOKEN_URL || 'http://localhost:9588/api/v1/auth/sso/token',
      userInfoUrl: process.env.SSO_SERVER_USERINFO_URL || 'http://localhost:9588/api/v1/auth/sso/userinfo',
      logoutUrl: process.env.SSO_SERVER_LOGOUT_URL || 'http://localhost:9588/api/v1/auth/sso/logout',
    },
    
    // SSO Client Configuration
    client: {
      id: process.env.SSO_CLIENT_ID || 'report-management-client',
      secret: process.env.SSO_CLIENT_SECRET || 'report-management-client-secret',
      redirectUri: process.env.SSO_CLIENT_REDIRECT_URI || 'http://localhost:9581/api/v1/auth/sso/callback',
      scopes: process.env.SSO_CLIENT_SCOPES || 'read,write,profile,email',
      responseType: process.env.SSO_CLIENT_RESPONSE_TYPE || 'code',
      grantType: process.env.SSO_CLIENT_GRANT_TYPE || 'authorization_code',
    },
    
    // JWT Configuration for SSO Client
    jwt: {
      secret: process.env.JWT_SECRET || 'report-management-sso-client-secret-key',
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.SSO_SERVER_URL || 'http://localhost:9588',
      audience: process.env.SSO_CLIENT_ID || 'report-management-client',
    },
    
    // Session Configuration
    session: {
      secret: process.env.SESSION_SECRET || 'report-management-session-secret',
      cookieName: process.env.SESSION_COOKIE_NAME || 'report-management-session',
      maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE) || 86400000,
      secure: process.env.SESSION_COOKIE_SECURE === 'true',
      httpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== 'false',
      sameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax',
    },
  },
};

module.exports = config;
