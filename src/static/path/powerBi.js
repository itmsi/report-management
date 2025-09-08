const powerBiPaths = {
  '/api/v1/powerbi': {
    post: {
      tags: ['PowerBI'],
      summary: 'Create a new PowerBI report',
      description: 'Create a new PowerBI report with title, link, and category',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/CreatePowerBiRequest'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'PowerBI report created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiResponse'
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
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    },
    get: {
      tags: ['PowerBI'],
      summary: 'List PowerBI reports',
      description: 'Get a paginated list of PowerBI reports with optional filters',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search term for title, description, or category name',
          schema: {
            type: 'string',
            maxLength: 100
          }
        },
        {
          name: 'category_id',
          in: 'query',
          description: 'Filter by category ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by status',
          schema: {
            type: 'string',
            enum: ['active', 'inactive', 'draft']
          }
        },
        {
          name: 'sort_by',
          in: 'query',
          description: 'Sort field',
          schema: {
            type: 'string',
            enum: ['title', 'status', 'created_at', 'updated_at'],
            default: 'created_at'
          }
        },
        {
          name: 'sort_order',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc'
          }
        }
      ],
      responses: {
        200: {
          description: 'PowerBI reports retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiListResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  },
  '/api/v1/powerbi/{id}': {
    get: {
      tags: ['PowerBI'],
      summary: 'Get PowerBI report by ID',
      description: 'Get a specific PowerBI report by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'PowerBI report ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'PowerBI report retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiResponse'
              }
            }
          }
        },
        404: {
          description: 'PowerBI report not found'
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    },
    put: {
      tags: ['PowerBI'],
      summary: 'Update PowerBI report',
      description: 'Update a specific PowerBI report by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'PowerBI report ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              $ref: '#/components/schemas/UpdatePowerBiRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'PowerBI report updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiResponse'
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
              }
            }
          }
        },
        404: {
          description: 'PowerBI report not found'
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    },
    delete: {
      tags: ['PowerBI'],
      summary: 'Delete PowerBI report',
      description: 'Soft delete a specific PowerBI report by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'PowerBI report ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'PowerBI report deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'PowerBI report not found'
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  },
  '/api/v1/powerbi/{id}/restore': {
    post: {
      tags: ['PowerBI'],
      summary: 'Restore deleted PowerBI report',
      description: 'Restore a soft-deleted PowerBI report by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'PowerBI report ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'PowerBI report restored successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiResponse'
              }
            }
          }
        },
        404: {
          description: 'PowerBI report not found or already restored'
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  },
  '/api/v1/powerbi/category/{category_id}': {
    get: {
      tags: ['PowerBI'],
      summary: 'Get PowerBI reports by category',
      description: 'Get all PowerBI reports for a specific category',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'category_id',
          in: 'path',
          required: true,
          description: 'Category ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'PowerBI reports by category retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean'
                  },
                  message: {
                    type: 'string'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PowerBi'
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  },
  '/api/v1/powerbi/stats/overview': {
    get: {
      tags: ['PowerBI'],
      summary: 'Get PowerBI statistics',
      description: 'Get overview statistics of PowerBI reports',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'PowerBI statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PowerBiStatsResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  }
};

module.exports = powerBiPaths;
