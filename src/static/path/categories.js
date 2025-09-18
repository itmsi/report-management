const categoriesPaths = {
  '/categories/get': {
    post: {
      tags: ['Categories'],
      summary: 'Get categories via POST method',
      description: 'Get a paginated list of categories with optional filters using POST method. Parameters are sent in request body.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/GetCategoriesRequest'
            }
          }
        }
      },
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
  '/categories/create': {
    post: {
      tags: ['Categories'],
      summary: 'Create category via POST method',
      description: 'Create a new category with name and optional description using POST method',
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
    }
  },
  '/categories/{id}': {
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
  }
};

module.exports = categoriesPaths;
