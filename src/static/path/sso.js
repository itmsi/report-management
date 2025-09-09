const ssoPaths = {
  '/auth/sso/login': {
    post: {
      tags: ['SSO Authentication'],
      summary: 'SSO Login',
      description: 'Login menggunakan SSO dengan username dan password. Mendukung OAuth2 flow dengan authorization code.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SSOLoginRequest'
            },
            examples: {
              basic_login: {
                summary: 'Basic Login',
                description: 'Login sederhana tanpa OAuth2 flow',
                value: {
                  username: 'admin',
                  password: 'password'
                }
              },
              oauth2_login: {
                summary: 'OAuth2 Login',
                description: 'Login dengan OAuth2 flow untuk mendapatkan authorization code',
                value: {
                  username: 'admin',
                  password: 'password',
                  client_id: 'test_client',
                  redirect_uri: 'http://localhost:3001/callback',
                  scope: 'read write',
                  state: 'random_state_string'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login berhasil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOLoginResponse'
              },
              examples: {
                basic_login_success: {
                  summary: 'Basic Login Success',
                  value: {
                    success: true,
                    message: 'Login SSO berhasil',
                    data: {
                      user_id: '123e4567-e89b-12d3-a456-426614174000',
                      user_name: 'admin',
                      user_email: 'admin@example.com',
                      first_name: 'Admin',
                      last_name: 'User',
                      roles: ['admin', 'user'],
                      permissions: ['read', 'write', 'delete', 'admin'],
                      client_id: 'default_client',
                      session_id: '123e4567-e89b-12d3-a456-426614174001',
                      login_time: '2025-09-09T01:00:00.000Z',
                      ip_address: '127.0.0.1'
                    }
                  }
                },
                oauth2_login_success: {
                  summary: 'OAuth2 Login Success',
                  value: {
                    success: true,
                    message: 'Login SSO berhasil',
                    data: {
                      user_id: '123e4567-e89b-12d3-a456-426614174000',
                      user_name: 'admin',
                      user_email: 'admin@example.com',
                      first_name: 'Admin',
                      last_name: 'User',
                      roles: ['admin', 'user'],
                      permissions: ['read', 'write', 'delete', 'admin'],
                      client_id: 'test_client',
                      session_id: '123e4567-e89b-12d3-a456-426614174001',
                      login_time: '2025-09-09T01:00:00.000Z',
                      ip_address: '127.0.0.1',
                      authorization_code: 'auth_code_123456789',
                      redirect_uri: 'http://localhost:3001/callback',
                      expires_in: 600
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                missing_credentials: {
                  summary: 'Missing Credentials',
                  value: {
                    success: false,
                    message: 'Username dan password diperlukan'
                  }
                },
                invalid_client: {
                  summary: 'Invalid Client',
                  value: {
                    success: false,
                    message: 'Client tidak valid'
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                invalid_credentials: {
                  summary: 'Invalid Credentials',
                  value: {
                    success: false,
                    message: 'Kredensial tidak valid'
                  }
                }
              }
            }
          }
        },
        423: {
          description: 'Account locked',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                account_locked: {
                  summary: 'Account Locked',
                  value: {
                    success: false,
                    message: 'Akun terkunci. Coba lagi dalam 30 menit.'
                  }
                }
              }
            }
          }
        },
        429: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                rate_limit: {
                  summary: 'Rate Limit Exceeded',
                  value: {
                    success: false,
                    message: 'Terlalu banyak percobaan login. Coba lagi nanti.'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/authorize': {
    get: {
      tags: ['SSO Authentication'],
      summary: 'OAuth2 Authorization',
      description: 'Memulai OAuth2 authorization flow untuk mendapatkan authorization code',
      parameters: [
        {
          name: 'client_id',
          in: 'query',
          required: true,
          description: 'Client ID',
          schema: {
            type: 'string',
            example: 'test_client'
          }
        },
        {
          name: 'redirect_uri',
          in: 'query',
          required: true,
          description: 'Redirect URI',
          schema: {
            type: 'string',
            format: 'uri',
            example: 'http://localhost:3001/callback'
          }
        },
        {
          name: 'response_type',
          in: 'query',
          required: true,
          description: 'Response type (harus "code")',
          schema: {
            type: 'string',
            enum: ['code'],
            example: 'code'
          }
        },
        {
          name: 'scope',
          in: 'query',
          required: false,
          description: 'Scope yang diminta',
          schema: {
            type: 'string',
            example: 'read write',
            default: 'read'
          }
        },
        {
          name: 'state',
          in: 'query',
          required: false,
          description: 'State parameter untuk OAuth2 flow',
          schema: {
            type: 'string',
            example: 'random_state_string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Authorization berhasil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOAuthorizationResponse'
              },
              examples: {
                authorization_success: {
                  summary: 'Authorization Success',
                  value: {
                    success: true,
                    message: 'Authorization berhasil',
                    data: {
                      authorization_url: 'http://localhost:3001/callback?code=auth_code_123&state=random_state',
                      code: 'auth_code_123456789',
                      state: 'random_state_string',
                      expires_in: 600,
                      scope: 'read write'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                missing_params: {
                  summary: 'Missing Parameters',
                  value: {
                    success: false,
                    message: 'Client ID dan redirect URI diperlukan'
                  }
                },
                invalid_response_type: {
                  summary: 'Invalid Response Type',
                  value: {
                    success: false,
                    message: 'Response type harus "code"'
                  }
                },
                invalid_client: {
                  summary: 'Invalid Client',
                  value: {
                    success: false,
                    message: 'Client tidak valid atau tidak aktif'
                  }
                },
                invalid_redirect_uri: {
                  summary: 'Invalid Redirect URI',
                  value: {
                    success: false,
                    message: 'Redirect URI tidak terdaftar untuk client ini'
                  }
                },
                invalid_scope: {
                  summary: 'Invalid Scope',
                  value: {
                    success: false,
                    message: 'Scope tidak valid: admin'
                  }
                }
              }
            }
          }
        },
        429: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/token': {
    post: {
      tags: ['SSO Authentication'],
      summary: 'OAuth2 Token Exchange',
      description: 'Exchange authorization code untuk access token atau refresh access token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SSOTokenRequest'
            },
            examples: {
              authorization_code: {
                summary: 'Authorization Code Exchange',
                description: 'Exchange authorization code untuk access token',
                value: {
                  grant_type: 'authorization_code',
                  code: 'auth_code_123456789',
                  client_id: 'test_client',
                  client_secret: 'test_secret',
                  redirect_uri: 'http://localhost:3001/callback'
                }
              },
              refresh_token: {
                summary: 'Refresh Token Exchange',
                description: 'Exchange refresh token untuk access token baru',
                value: {
                  grant_type: 'refresh_token',
                  refresh_token: 'refresh_token_123456789',
                  client_id: 'test_client',
                  client_secret: 'test_secret'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Token berhasil dibuat',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOTokenResponse'
              },
              examples: {
                token_success: {
                  summary: 'Token Success',
                  value: {
                    success: true,
                    message: 'Token berhasil dibuat',
                    data: {
                      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      token_type: 'Bearer',
                      expires_in: 3600,
                      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      scope: 'read write',
                      session_id: '123e4567-e89b-12d3-a456-426614174001'
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                invalid_grant_type: {
                  summary: 'Invalid Grant Type',
                  value: {
                    success: false,
                    message: 'Grant type harus "authorization_code" atau "refresh_token"'
                  }
                },
                missing_params: {
                  summary: 'Missing Parameters',
                  value: {
                    success: false,
                    message: 'Code, client ID, dan client secret diperlukan'
                  }
                },
                invalid_client: {
                  summary: 'Invalid Client',
                  value: {
                    success: false,
                    message: 'Client tidak valid'
                  }
                },
                invalid_client_secret: {
                  summary: 'Invalid Client Secret',
                  value: {
                    success: false,
                    message: 'Client secret tidak valid'
                  }
                },
                invalid_code: {
                  summary: 'Invalid Authorization Code',
                  value: {
                    success: false,
                    message: 'Authorization code tidak valid'
                  }
                },
                expired_code: {
                  summary: 'Expired Authorization Code',
                  value: {
                    success: false,
                    message: 'Authorization code sudah expired'
                  }
                },
                mismatched_client: {
                  summary: 'Mismatched Client ID',
                  value: {
                    success: false,
                    message: 'Client ID tidak sesuai'
                  }
                },
                mismatched_redirect_uri: {
                  summary: 'Mismatched Redirect URI',
                  value: {
                    success: false,
                    message: 'Redirect URI tidak sesuai'
                  }
                }
              }
            }
          }
        },
        429: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/userinfo': {
    get: {
      tags: ['SSO Authentication'],
      summary: 'Get User Info',
      description: 'Mendapatkan informasi user berdasarkan access token',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'User info berhasil diambil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOUserInfoResponse'
              },
              examples: {
                user_info_success: {
                  summary: 'User Info Success',
                  value: {
                    success: true,
                    message: 'User info berhasil diambil',
                    data: {
                      user_id: '123e4567-e89b-12d3-a456-426614174000',
                      user_name: 'admin',
                      user_email: 'admin@example.com',
                      first_name: 'Admin',
                      last_name: 'User',
                      roles: ['admin', 'user'],
                      permissions: ['read', 'write', 'delete', 'admin'],
                      client_id: 'test_client',
                      session_id: '123e4567-e89b-12d3-a456-426614174001',
                      scope: ['read', 'write'],
                      login_time: '2025-09-09T01:00:00.000Z',
                      last_activity: '2025-09-09T01:05:00.000Z'
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                missing_token: {
                  summary: 'Missing Token',
                  value: {
                    success: false,
                    message: 'Bearer token diperlukan'
                  }
                },
                invalid_token: {
                  summary: 'Invalid Token',
                  value: {
                    success: false,
                    message: 'Token tidak valid'
                  }
                },
                expired_token: {
                  summary: 'Expired Token',
                  value: {
                    success: false,
                    message: 'Token sudah expired'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/logout': {
    post: {
      tags: ['SSO Authentication'],
      summary: 'SSO Logout',
      description: 'Logout dan invalidate token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SSOLogoutRequest'
            },
            examples: {
              basic_logout: {
                summary: 'Basic Logout',
                description: 'Logout dengan invalidate access token',
                value: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              },
              complete_logout: {
                summary: 'Complete Logout',
                description: 'Logout dengan invalidate semua token',
                value: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  client_id: 'test_client'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Logout berhasil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOLogoutResponse'
              },
              examples: {
                logout_success: {
                  summary: 'Logout Success',
                  value: {
                    success: true,
                    message: 'Logout berhasil',
                    data: {
                      message: 'Logout berhasil',
                      tokens_invalidated: 2
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                missing_token: {
                  summary: 'Missing Token',
                  value: {
                    success: false,
                    message: 'Token diperlukan'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/callback': {
    get: {
      tags: ['SSO Authentication'],
      summary: 'OAuth2 Callback',
      description: 'Callback endpoint untuk OAuth2 flow',
      parameters: [
        {
          name: 'code',
          in: 'query',
          required: true,
          description: 'Authorization code',
          schema: {
            type: 'string',
            example: 'auth_code_123456789'
          }
        },
        {
          name: 'state',
          in: 'query',
          required: false,
          description: 'State parameter',
          schema: {
            type: 'string',
            example: 'random_state_string'
          }
        },
        {
          name: 'error',
          in: 'query',
          required: false,
          description: 'Error code (jika ada)',
          schema: {
            type: 'string',
            example: 'access_denied'
          }
        },
        {
          name: 'error_description',
          in: 'query',
          required: false,
          description: 'Error description (jika ada)',
          schema: {
            type: 'string',
            example: 'User denied access'
          }
        }
      ],
      responses: {
        200: {
          description: 'Callback berhasil diproses',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Callback berhasil diproses'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'SSO callback berhasil'
                      },
                      code: {
                        type: 'string',
                        example: 'auth_code_123456789'
                      },
                      state: {
                        type: 'string',
                        example: 'random_state_string'
                      },
                      redirect_uri: {
                        type: 'string',
                        example: 'http://localhost:3001/callback'
                      },
                      client_id: {
                        type: 'string',
                        example: 'test_client'
                      },
                      scope: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['read', 'write']
                      },
                      expires_in: {
                        type: 'integer',
                        example: 0
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Callback error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              examples: {
                callback_error: {
                  summary: 'Callback Error',
                  value: {
                    success: false,
                    message: 'Error dari SSO: User denied access'
                  }
                },
                missing_code: {
                  summary: 'Missing Code',
                  value: {
                    success: false,
                    message: 'Authorization code diperlukan'
                  }
                },
                invalid_code: {
                  summary: 'Invalid Code',
                  value: {
                    success: false,
                    message: 'Authorization code tidak valid'
                  }
                },
                expired_code: {
                  summary: 'Expired Code',
                  value: {
                    success: false,
                    message: 'Authorization code sudah expired'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

  '/auth/sso/stats': {
    get: {
      tags: ['SSO Authentication'],
      summary: 'Get SSO Statistics',
      description: 'Mendapatkan statistik sistem SSO',
      responses: {
        200: {
          description: 'Statistik berhasil diambil',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SSOStatsResponse'
              },
              examples: {
                stats_success: {
                  summary: 'Stats Success',
                  value: {
                    success: true,
                    message: 'Statistik sistem berhasil diambil',
                    data: {
                      active_tokens: 5,
                      active_refresh_tokens: 3,
                      pending_authorization_codes: 2,
                      registered_clients: 1,
                      registered_users: 2,
                      rate_limited_ips: 0,
                      failed_attempts_tracked: 0,
                      uptime: 3600.5,
                      memory_usage: {
                        rss: 50000000,
                        heapTotal: 20000000,
                        heapUsed: 15000000,
                        external: 1000000
                      },
                      timestamp: '2025-09-09T01:00:00.000Z'
                    }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  }
};

module.exports = ssoPaths;
