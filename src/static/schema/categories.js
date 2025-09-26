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
      order_no: {
        type: 'integer',
        minimum: 0,
        description: 'Order number for sorting categories'
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
      },
      order_no: {
        type: 'integer',
        minimum: 0,
        default: 0,
        description: 'Order number for sorting categories'
      }
    },
    required: ['name']
  },
  GetCategoriesRequest: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Items per page'
      },
      search: {
        type: 'string',
        maxLength: 100,
        description: 'Search term for name or description'
      },
      sort_by: {
        type: 'string',
        enum: ['name', 'order_no', 'created_at', 'updated_at'],
        default: 'order_no',
        description: 'Sort field'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'asc',
        description: 'Sort order'
      },
      name: {
        type: 'string',
        maxLength: 100,
        description: 'Name'
      },
      order_no: {
        type: 'integer',
        minimum: 0,
        description: 'Order number filter'
      }
    },
    example: {
      page: 1,
      limit: 10,
      search: '',
      sort_by: 'name',
      sort_order: 'asc',
      name: ''
    }
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
      },
      order_no: {
        type: 'integer',
        minimum: 0,
        description: 'Order number for sorting categories'
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
