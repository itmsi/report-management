const categoriesPaths = {
  '/api/v1/categories': {
    post: {
      tags: ['Categories'],
      summary: 'Create a new category',
      description: 'Create a new category with name and optional description',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateCategoryRequest'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Category created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryResponse'
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
      tags: ['Categories'],
      summary: 'List categories',
      description: 'Get a paginated list of categories with optional filters',
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
          description: 'Search term for name or description',
          schema: {
            type: 'string',
            maxLength: 100
          }
        },
        {
          name: 'sort_by',
          in: 'query',
          description: 'Sort field',
          schema: {
            type: 'string',
            enum: ['name', 'created_at', 'updated_at'],
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
          description: 'Categories retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryListResponse'
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
  '/api/v1/categories/{id}': {
    get: {
      tags: ['Categories'],
      summary: 'Get category by ID',
      description: 'Get a specific category by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
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
          description: 'Category retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryResponse'
              }
            }
          }
        },
        404: {
          description: 'Category not found'
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
      tags: ['Categories'],
      summary: 'Update category',
      description: 'Update a specific category by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Category ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateCategoryRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Category updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryResponse'
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
          description: 'Category not found'
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
      tags: ['Categories'],
      summary: 'Delete category',
      description: 'Soft delete a specific category by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
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
          description: 'Category deleted successfully',
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
          description: 'Category not found'
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
  '/api/v1/categories/{id}/restore': {
    post: {
      tags: ['Categories'],
      summary: 'Restore deleted category',
      description: 'Restore a soft-deleted category by its ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
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
          description: 'Category restored successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryResponse'
              }
            }
          }
        },
        404: {
          description: 'Category not found or already restored'
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
  '/api/v1/categories/{id}/powerbi': {
    get: {
      tags: ['Categories'],
      summary: 'Get category with PowerBI data',
      description: 'Get a specific category with its PowerBI reports count',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
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
          description: 'Category with PowerBI data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryResponse'
              }
            }
          }
        },
        404: {
          description: 'Category not found'
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

module.exports = categoriesPaths;
