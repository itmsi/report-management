const powerBiSchema = {
  PowerBi: {
    type: 'object',
    properties: {
      powerbi_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for the PowerBI report'
      },
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID this report belongs to'
      },
      title: {
        type: 'string',
        maxLength: 200,
        description: 'PowerBI report title'
      },
      link: {
        type: 'string',
        description: 'PowerBI report link'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'draft'],
        description: 'Report status'
      },
      file: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'File path for PowerBI report'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Report description'
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
        description: 'User who created the report'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User who last updated the report'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User who deleted the report'
      },
      category_name: {
        type: 'string',
        description: 'Category name (from join)'
      }
    },
    required: ['powerbi_id', 'category_id', 'title', 'link', 'status', 'created_at', 'is_delete']
  },
  CreatePowerBiRequest: {
    type: 'object',
    properties: {
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID this report belongs to'
      },
      title: {
        type: 'string',
        maxLength: 200,
        description: 'PowerBI report title'
      },
      link: {
        type: 'string',
        description: 'PowerBI report link'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'draft'],
        description: 'Report status'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Report description'
      },
      file: {
        type: 'string',
        format: 'binary',
        description: 'PowerBI report file (.pbix, .xlsx, .pdf, etc.)'
      }
    },
    required: ['category_id', 'title', 'link']
  },
  UpdatePowerBiRequest: {
    type: 'object',
    properties: {
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID this report belongs to'
      },
      title: {
        type: 'string',
        maxLength: 200,
        description: 'PowerBI report title'
      },
      link: {
        type: 'string',
        description: 'PowerBI report link'
      },
      status: {
        type: 'string',
        enum: ['active', 'inactive', 'draft'],
        description: 'Report status'
      },
      description: {
        type: 'string',
        nullable: true,
        maxLength: 1000,
        description: 'Report description'
      },
      file: {
        type: 'string',
        format: 'binary',
        description: 'PowerBI report file (.pbix, .xlsx, .pdf, etc.)'
      }
    }
  },
  PowerBiListResponse: {
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
          $ref: '#/components/schemas/PowerBi'
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
  PowerBiResponse: {
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
        $ref: '#/components/schemas/PowerBi'
      }
    }
  },
  PowerBiStatsResponse: {
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
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total number of reports'
          },
          active: {
            type: 'integer',
            description: 'Number of active reports'
          },
          inactive: {
            type: 'integer',
            description: 'Number of inactive reports'
          },
          draft: {
            type: 'integer',
            description: 'Number of draft reports'
          }
        }
      }
    }
  }
};

module.exports = powerBiSchema;
