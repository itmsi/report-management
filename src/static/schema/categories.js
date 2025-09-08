const categoriesSchema = {
  Category: {
    type: 'object',
    properties: {
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the category'
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Category name'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Category description'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Last update timestamp'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp'
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User who created the category'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User who last updated the category'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User who deleted the category'
      }
    },
    required: ['category_id', 'name', 'created_at', 'is_delete']
  },
  CreateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Category name'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Category description'
      }
    },
    required: ['name']
  },
  UpdateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Category name'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Category description'
      }
    }
  },
  CategoryListResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Request success status'
      },
      message: {
        type: 'string',
        description: 'Response message'
      },
      data: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/Category'
        }
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            description: 'Current page number'
          },
          limit: {
            type: 'integer',
            description: 'Items per page'
          },
          total: {
            type: 'integer',
            description: 'Total number of items'
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages'
          }
        }
      }
    }
  },
  CategoryResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Request success status'
      },
      message: {
        type: 'string',
        description: 'Response message'
      },
      data: {
        $ref: '#/components/schemas/Category'
      }
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Request success status'
      },
      message: {
        type: 'string',
        description: 'Error message'
      },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: {
              type: 'string',
              description: 'Field name with error'
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  }
};

module.exports = categoriesSchema;
