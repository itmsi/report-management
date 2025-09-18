const powerBiPaths = {
  '/powerbi/get': {
    post: {
      tags: ['PowerBI'],
      summary: 'Get PowerBI reports via POST',
      description: 'Get a paginated list of PowerBI reports with filters via POST method',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PowerBiGetRequest'
            }
          }
        }
      },
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
  '/powerbi/create': {
    post: {
      tags: ['PowerBI'],
      summary: 'Create PowerBI report via POST',
      description: 'Create a new PowerBI report with title, link, and category via alternative POST endpoint',
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
    }
  },
  '/powerbi/{id}': {
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
  }
};

module.exports = powerBiPaths;
