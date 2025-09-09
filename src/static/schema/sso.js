const ssoSchema = {
  // SSO Login Request Schema
  SSOLoginRequest: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 50,
        description: 'Username untuk login',
        example: 'admin'
      },
      password: {
        type: 'string',
        minLength: 6,
        maxLength: 100,
        description: 'Password untuk login',
        example: 'password'
      },
      client_id: {
        type: 'string',
        description: 'Client ID untuk OAuth2 flow (opsional)',
        example: 'test_client'
      },
      redirect_uri: {
        type: 'string',
        format: 'uri',
        description: 'Redirect URI untuk OAuth2 flow (opsional)',
        example: 'http://localhost:3001/callback'
      },
      scope: {
        type: 'string',
        description: 'Scope yang diminta (opsional)',
        example: 'read write',
        default: 'read'
      },
      state: {
        type: 'string',
        description: 'State parameter untuk OAuth2 flow (opsional)',
        example: 'random_state_string'
      }
    },
    required: ['username', 'password']
  },

  // SSO Login Response Schema
  SSOLoginResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'Login SSO berhasil'
      },
      data: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID unik user',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          user_name: {
            type: 'string',
            description: 'Username',
            example: 'admin'
          },
          user_email: {
            type: 'string',
            format: 'email',
            description: 'Email user',
            example: 'admin@example.com'
          },
          first_name: {
            type: 'string',
            description: 'Nama depan',
            example: 'Admin'
          },
          last_name: {
            type: 'string',
            description: 'Nama belakang',
            example: 'User'
          },
          roles: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Roles user',
            example: ['admin', 'user']
          },
          permissions: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Permissions user',
            example: ['read', 'write', 'delete', 'admin']
          },
          client_id: {
            type: 'string',
            description: 'Client ID yang digunakan',
            example: 'test_client'
          },
          session_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID session',
            example: '123e4567-e89b-12d3-a456-426614174001'
          },
          login_time: {
            type: 'string',
            format: 'date-time',
            description: 'Waktu login',
            example: '2025-09-09T01:00:00.000Z'
          },
          ip_address: {
            type: 'string',
            description: 'IP address user',
            example: '127.0.0.1'
          },
          authorization_code: {
            type: 'string',
            description: 'Authorization code untuk OAuth2 flow (jika redirect_uri disediakan)',
            example: 'auth_code_123456789'
          },
          redirect_uri: {
            type: 'string',
            format: 'uri',
            description: 'Redirect URI (jika disediakan)',
            example: 'http://localhost:3001/callback'
          },
          expires_in: {
            type: 'integer',
            description: 'Waktu expired authorization code dalam detik',
            example: 600
          }
        }
      }
    }
  },

  // SSO Token Request Schema
  SSOTokenRequest: {
    type: 'object',
    properties: {
      grant_type: {
        type: 'string',
        enum: ['authorization_code', 'refresh_token'],
        description: 'Tipe grant untuk OAuth2',
        example: 'authorization_code'
      },
      code: {
        type: 'string',
        description: 'Authorization code (untuk grant_type: authorization_code)',
        example: 'auth_code_123456789'
      },
      client_id: {
        type: 'string',
        description: 'Client ID',
        example: 'test_client'
      },
      client_secret: {
        type: 'string',
        description: 'Client secret',
        example: 'test_secret'
      },
      redirect_uri: {
        type: 'string',
        format: 'uri',
        description: 'Redirect URI (untuk grant_type: authorization_code)',
        example: 'http://localhost:3001/callback'
      },
      refresh_token: {
        type: 'string',
        description: 'Refresh token (untuk grant_type: refresh_token)',
        example: 'refresh_token_123456789'
      }
    },
    required: ['grant_type', 'client_id', 'client_secret']
  },

  // SSO Token Response Schema
  SSOTokenResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'Token berhasil dibuat'
      },
      data: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            description: 'JWT access token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          token_type: {
            type: 'string',
            description: 'Tipe token',
            example: 'Bearer'
          },
          expires_in: {
            type: 'integer',
            description: 'Waktu expired access token dalam detik',
            example: 3600
          },
          refresh_token: {
            type: 'string',
            description: 'JWT refresh token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          scope: {
            type: 'string',
            description: 'Scope yang diberikan',
            example: 'read write'
          },
          session_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID session',
            example: '123e4567-e89b-12d3-a456-426614174001'
          }
        }
      }
    }
  },

  // SSO User Info Response Schema
  SSOUserInfoResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'User info berhasil diambil'
      },
      data: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID unik user',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          user_name: {
            type: 'string',
            description: 'Username',
            example: 'admin'
          },
          user_email: {
            type: 'string',
            format: 'email',
            description: 'Email user',
            example: 'admin@example.com'
          },
          first_name: {
            type: 'string',
            description: 'Nama depan',
            example: 'Admin'
          },
          last_name: {
            type: 'string',
            description: 'Nama belakang',
            example: 'User'
          },
          roles: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Roles user',
            example: ['admin', 'user']
          },
          permissions: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Permissions user',
            example: ['read', 'write', 'delete', 'admin']
          },
          client_id: {
            type: 'string',
            description: 'Client ID yang digunakan',
            example: 'test_client'
          },
          session_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID session',
            example: '123e4567-e89b-12d3-a456-426614174001'
          },
          scope: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Scope yang diberikan',
            example: ['read', 'write']
          },
          login_time: {
            type: 'string',
            format: 'date-time',
            description: 'Waktu login',
            example: '2025-09-09T01:00:00.000Z'
          },
          last_activity: {
            type: 'string',
            format: 'date-time',
            description: 'Waktu aktivitas terakhir',
            example: '2025-09-09T01:05:00.000Z'
          }
        }
      }
    }
  },

  // SSO Logout Request Schema
  SSOLogoutRequest: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        description: 'Access token yang akan di-invalidate',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      refresh_token: {
        type: 'string',
        description: 'Refresh token yang akan di-invalidate (opsional)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      client_id: {
        type: 'string',
        description: 'Client ID untuk invalidate semua token client (opsional)',
        example: 'test_client'
      }
    },
    required: ['token']
  },

  // SSO Logout Response Schema
  SSOLogoutResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'Logout berhasil'
      },
      data: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Pesan logout',
            example: 'Logout berhasil'
          },
          tokens_invalidated: {
            type: 'integer',
            description: 'Jumlah token yang di-invalidate',
            example: 2
          }
        }
      }
    }
  },

  // SSO Authorization Request Schema
  SSOAuthorizationRequest: {
    type: 'object',
    properties: {
      client_id: {
        type: 'string',
        description: 'Client ID',
        example: 'test_client'
      },
      redirect_uri: {
        type: 'string',
        format: 'uri',
        description: 'Redirect URI',
        example: 'http://localhost:3001/callback'
      },
      response_type: {
        type: 'string',
        enum: ['code'],
        description: 'Response type (harus "code")',
        example: 'code'
      },
      scope: {
        type: 'string',
        description: 'Scope yang diminta',
        example: 'read write',
        default: 'read'
      },
      state: {
        type: 'string',
        description: 'State parameter untuk OAuth2 flow',
        example: 'random_state_string'
      }
    },
    required: ['client_id', 'redirect_uri', 'response_type']
  },

  // SSO Authorization Response Schema
  SSOAuthorizationResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'Authorization berhasil'
      },
      data: {
        type: 'object',
        properties: {
          authorization_url: {
            type: 'string',
            format: 'uri',
            description: 'URL callback dengan authorization code',
            example: 'http://localhost:3001/callback?code=auth_code_123&state=random_state'
          },
          code: {
            type: 'string',
            description: 'Authorization code',
            example: 'auth_code_123456789'
          },
          state: {
            type: 'string',
            description: 'State parameter',
            example: 'random_state_string'
          },
          expires_in: {
            type: 'integer',
            description: 'Waktu expired authorization code dalam detik',
            example: 600
          },
          scope: {
            type: 'string',
            description: 'Scope yang diberikan',
            example: 'read write'
          }
        }
      }
    }
  },

  // SSO Stats Response Schema
  SSOStatsResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Status keberhasilan request',
        example: true
      },
      message: {
        type: 'string',
        description: 'Pesan response',
        example: 'Statistik sistem berhasil diambil'
      },
      data: {
        type: 'object',
        properties: {
          active_tokens: {
            type: 'integer',
            description: 'Jumlah active tokens',
            example: 5
          },
          active_refresh_tokens: {
            type: 'integer',
            description: 'Jumlah active refresh tokens',
            example: 3
          },
          pending_authorization_codes: {
            type: 'integer',
            description: 'Jumlah pending authorization codes',
            example: 2
          },
          registered_clients: {
            type: 'integer',
            description: 'Jumlah registered clients',
            example: 1
          },
          registered_users: {
            type: 'integer',
            description: 'Jumlah registered users',
            example: 2
          },
          rate_limited_ips: {
            type: 'integer',
            description: 'Jumlah IP yang di-rate limit',
            example: 0
          },
          failed_attempts_tracked: {
            type: 'integer',
            description: 'Jumlah failed attempts yang di-track',
            example: 0
          },
          uptime: {
            type: 'number',
            description: 'Uptime server dalam detik',
            example: 3600.5
          },
          memory_usage: {
            type: 'object',
            description: 'Memory usage server',
            properties: {
              rss: { type: 'number', example: 50000000 },
              heapTotal: { type: 'number', example: 20000000 },
              heapUsed: { type: 'number', example: 15000000 },
              external: { type: 'number', example: 1000000 }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp response',
            example: '2025-09-09T01:00:00.000Z'
          }
        }
      }
    }
  },

  // Error Response Schema (reuse dari categories)
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Request success status',
        example: false
      },
      message: {
        type: 'string',
        description: 'Error message',
        example: 'Kredensial tidak valid'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Field name with error',
              example: 'username'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Username diperlukan'
            }
          }
        }
      }
    }
  }
};

module.exports = ssoSchema;
