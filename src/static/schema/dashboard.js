const dashboardSchema = {
  DashboardData: {
    type: 'object',
    properties: {
      category_name: {
        type: 'string',
        description: 'Name of the category from categories table'
      },
      title: {
        type: 'string',
        description: 'Title of the PowerBI report'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'draft'],
        description: 'Status of the PowerBI report'
      },
      link: {
        type: 'string',
        description: 'Link to the PowerBI report'
      },
      file: {
        type: 'string',
        nullable: true,
        description: 'File URL of the PowerBI report'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Description of the PowerBI report'
      }
    },
    required: ['category_name', 'title', 'status', 'link']
  },
  GetDashboardRequest: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number for pagination'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
        description: 'Number of items per page'
      },
      search: {
        type: 'string',
        maxLength: 255,
        description: 'Search term for category name, title, or description'
      },
      sort_by: {
        type: 'string',
        enum: ['category_name', 'title', 'status', 'created_at', 'updated_at'],
        default: 'created_at',
        description: 'Field to sort by'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc',
        description: 'Sort order'
      },
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Filter by category ID'
      },
      category_name: {
        type: 'string',
        maxLength: 100,
        description: 'Filter by category name (from categories table)'
      },
      title: {
        type: 'string',
        maxLength: 200,
        description: 'Filter by PowerBI report title'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'draft'],
        description: 'Filter by PowerBI report status'
      }
    },
    example: {
      page: 1,
      limit: 10,
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      category_id: '',
      category_name: '',
      title: '',
      status: 'active'
    }
  },
  DashboardResponse: {
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
          $ref: '#/components/schemas/DashboardData'
        }
      },
      pagination: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            description: 'Current page number'
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages'
          },
          totalItems: {
            type: 'integer',
            description: 'Total number of items'
          },
          itemsPerPage: {
            type: 'integer',
            description: 'Items per page'
          },
          hasNextPage: {
            type: 'boolean',
            description: 'Whether there is a next page'
          },
          hasPrevPage: {
            type: 'boolean',
            description: 'Whether there is a previous page'
          }
        }
      }
    }
  },
  DashboardStats: {
    type: 'object',
    properties: {
      totalCategories: {
        type: 'integer',
        description: 'Total number of categories'
      },
      totalReports: {
        type: 'integer',
        description: 'Total number of PowerBI reports'
      },
      reportsByStatus: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Report status'
            },
            count: {
              type: 'integer',
              description: 'Number of reports with this status'
            }
          }
        }
      },
      reportsByCategory: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categoryName: {
              type: 'string',
              description: 'Category name'
            },
            totalReports: {
              type: 'integer',
              description: 'Number of reports in this category'
            }
          }
        }
      }
    }
  },
  DashboardStatsResponse: {
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
        $ref: '#/components/schemas/DashboardStats'
      }
    }
  },
  RecentActivity: {
    type: 'object',
    properties: {
      category_name: {
        type: 'string',
        description: 'Category name'
      },
      title: {
        type: 'string',
        description: 'PowerBI report title'
      },
      status: {
        type: 'string',
        description: 'PowerBI report status'
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
      }
    }
  },
  RecentActivitiesRequest: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Number of recent activities to fetch'
      }
    }
  },
  RecentActivitiesResponse: {
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
          $ref: '#/components/schemas/RecentActivity'
        }
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

module.exports = dashboardSchema;
