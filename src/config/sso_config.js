const path = require('path');

// Load environment variables with error handling
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch (error) {
  console.warn('dotenv not available, using process.env directly');
}

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 9588,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // SSO Configuration
  sso: {
    jwt: {
      secret: process.env.SSO_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      algorithm: process.env.SSO_JWT_ALGORITHM || 'HS256',
      issuer: process.env.SSO_JWT_ISSUER || 'gate-sso',
      audience: process.env.SSO_JWT_AUDIENCE || 'gate-clients'
    },
    
    // Token Configuration
    tokens: {
      accessTokenExpiry: parseInt(process.env.SSO_ACCESS_TOKEN_EXPIRY) || 3600, // 1 hour
      refreshTokenExpiry: parseInt(process.env.SSO_REFRESH_TOKEN_EXPIRY) || 604800, // 7 days
      authorizationCodeExpiry: parseInt(process.env.SSO_AUTH_CODE_EXPIRY) || 600, // 10 minutes
      sessionExpiry: parseInt(process.env.SSO_SESSION_EXPIRY) || 86400 // 24 hours
    },

    // Rate Limiting Configuration
    rateLimit: {
      defaultPerMinute: parseInt(process.env.SSO_RATE_LIMIT_PER_MINUTE) || 60,
      defaultPerHour: parseInt(process.env.SSO_RATE_LIMIT_PER_HOUR) || 1000,
      loginAttemptsPerMinute: parseInt(process.env.SSO_LOGIN_RATE_LIMIT) || 10,
      loginAttemptsPerHour: parseInt(process.env.SSO_LOGIN_RATE_LIMIT_HOUR) || 50
    },

    // Security Configuration
    security: {
      maxFailedAttempts: parseInt(process.env.SSO_MAX_FAILED_ATTEMPTS) || 5,
      lockoutDuration: parseInt(process.env.SSO_LOCKOUT_DURATION) || 1800, // 30 minutes
      maxConcurrentSessions: parseInt(process.env.SSO_MAX_CONCURRENT_SESSIONS) || 5,
      passwordMinLength: parseInt(process.env.SSO_PASSWORD_MIN_LENGTH) || 8,
      requireStrongPassword: process.env.SSO_REQUIRE_STRONG_PASSWORD === 'true',
      enableMFA: process.env.SSO_ENABLE_MFA === 'true'
    },

    // Client Configuration
    clients: {
      defaultTokenExpiry: parseInt(process.env.SSO_DEFAULT_TOKEN_EXPIRY) || 3600,
      defaultRefreshTokenExpiry: parseInt(process.env.SSO_DEFAULT_REFRESH_EXPIRY) || 604800,
      defaultMaxSessions: parseInt(process.env.SSO_DEFAULT_MAX_SESSIONS) || 5,
      defaultRateLimit: parseInt(process.env.SSO_DEFAULT_RATE_LIMIT) || 60,
      requireApproval: process.env.SSO_REQUIRE_CLIENT_APPROVAL === 'true'
    },

    // Database Configuration (for future use)
    database: {
      type: process.env.SSO_DB_TYPE || 'memory', // memory, redis, postgresql
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || null,
        db: parseInt(process.env.REDIS_DB) || 0
      },
      postgresql: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        database: process.env.POSTGRES_DB || 'gate_sso',
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password'
      }
    },

    // Logging Configuration
    logging: {
      level: process.env.SSO_LOG_LEVEL || 'info',
      enableFileLogging: process.env.SSO_ENABLE_FILE_LOGGING === 'true',
      logDirectory: process.env.SSO_LOG_DIRECTORY || './logs',
      maxLogFiles: parseInt(process.env.SSO_MAX_LOG_FILES) || 10,
      maxLogSize: process.env.SSO_MAX_LOG_SIZE || '10MB',
      enableAuditLog: process.env.SSO_ENABLE_AUDIT_LOG === 'true'
    },

    // Monitoring Configuration
    monitoring: {
      enableMetrics: process.env.SSO_ENABLE_METRICS === 'true',
      metricsPort: parseInt(process.env.SSO_METRICS_PORT) || 9090,
      enableHealthCheck: process.env.SSO_ENABLE_HEALTH_CHECK === 'true',
      healthCheckInterval: parseInt(process.env.SSO_HEALTH_CHECK_INTERVAL) || 30000
    },

    // Email Configuration (for notifications)
    email: {
      enabled: process.env.SSO_EMAIL_ENABLED === 'true',
      provider: process.env.SSO_EMAIL_PROVIDER || 'smtp',
      smtp: {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      from: process.env.SSO_EMAIL_FROM || 'noreply@gate-sso.com'
    }
  },

  // Default Users (for development/testing)
  defaultUsers: {
    admin: {
      username: process.env.SSO_ADMIN_USERNAME || 'admin',
      password: process.env.SSO_ADMIN_PASSWORD || 'password',
      email: process.env.SSO_ADMIN_EMAIL || 'admin@example.com',
      firstName: process.env.SSO_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.SSO_ADMIN_LAST_NAME || 'User',
      roles: ['admin', 'user'],
      permissions: ['read', 'write', 'delete', 'admin']
    },
    user: {
      username: process.env.SSO_USER_USERNAME || 'user',
      password: process.env.SSO_USER_PASSWORD || 'password',
      email: process.env.SSO_USER_EMAIL || 'user@example.com',
      firstName: process.env.SSO_USER_FIRST_NAME || 'Regular',
      lastName: process.env.SSO_USER_LAST_NAME || 'User',
      roles: ['user'],
      permissions: ['read']
    }
  },

  // Default Clients (for development/testing)
  defaultClients: {
    testClient: {
      id: process.env.SSO_TEST_CLIENT_ID || 'test_client',
      secret: process.env.SSO_TEST_CLIENT_SECRET || 'test_secret',
      name: process.env.SSO_TEST_CLIENT_NAME || 'Test Client Application',
      description: process.env.SSO_TEST_CLIENT_DESCRIPTION || 'Default test client for development',
      redirectUris: process.env.SSO_TEST_CLIENT_REDIRECT_URIS ? 
        process.env.SSO_TEST_CLIENT_REDIRECT_URIS.split(',') : 
        ['http://localhost:3001/callback', 'http://localhost:3002/callback'],
      scopes: process.env.SSO_TEST_CLIENT_SCOPES ? 
        process.env.SSO_TEST_CLIENT_SCOPES.split(',') : 
        ['read', 'write'],
      contactEmail: process.env.SSO_TEST_CLIENT_CONTACT_EMAIL || 'admin@example.com',
      website: process.env.SSO_TEST_CLIENT_WEBSITE || 'http://localhost:3001'
    }
  },

  // CORS Configuration
  cors: {
    enabled: process.env.SSO_CORS_ENABLED === 'true',
    origins: process.env.SSO_CORS_ORIGINS ? 
      process.env.SSO_CORS_ORIGINS.split(',') : 
      ['http://localhost:3001', 'http://localhost:3002'],
    credentials: process.env.SSO_CORS_CREDENTIALS === 'true',
    methods: process.env.SSO_CORS_METHODS ? 
      process.env.SSO_CORS_METHODS.split(',') : 
      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: process.env.SSO_CORS_HEADERS ? 
      process.env.SSO_CORS_HEADERS.split(',') : 
      ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Validation
  validate() {
    const errors = [];

    // Validate required environment variables
    if (this.server.environment === 'production' && 
        (!process.env.SSO_JWT_SECRET || process.env.SSO_JWT_SECRET === 'your-super-secret-jwt-key-change-in-production')) {
      errors.push('SSO_JWT_SECRET must be set to a secure value in production');
    }

    if (this.server.environment === 'production') {
      if (this.sso.security.requireStrongPassword && !this.sso.security.passwordMinLength) {
        errors.push('Password minimum length must be set when requiring strong passwords');
      }

      if (this.sso.clients.requireApproval && !this.sso.email.enabled) {
        errors.push('Email must be enabled when requiring client approval');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  },

  // Get configuration for specific environment
  getEnvironmentConfig() {
    const env = this.server.environment;
    
    switch (env) {
      case 'production':
        return {
          ...this,
          sso: {
            ...this.sso,
            logging: {
              ...this.sso.logging,
              level: 'warn',
              enableFileLogging: true,
              enableAuditLog: true
            },
            security: {
              ...this.sso.security,
              requireStrongPassword: true,
              enableMFA: true
            },
            clients: {
              ...this.sso.clients,
              requireApproval: true
            }
          }
        };
      
      case 'staging':
        return {
          ...this,
          sso: {
            ...this.sso,
            logging: {
              ...this.sso.logging,
              level: 'info',
              enableFileLogging: true
            }
          }
        };
      
      case 'development':
      default:
        return this;
    }
  }
};

// Validate configuration on load
try {
  config.validate();
} catch (error) {
  console.warn(`Configuration warning: ${error.message}`);
}

module.exports = config.getEnvironmentConfig();
