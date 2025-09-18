const dashboardPaths = {
  '/dashboard': {
    post: {
      tags: ['Dashboard'],
      summary: 'Get dashboard data',
      description: 'Retrieve dashboard data from categories and powerBis tables with filtering and pagination',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/GetDashboardRequest'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Dashboard data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/DashboardResponse'
              }
            }
          }
        },
        400: {
          description: 'Bad request - validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - invalid token',
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
  }
};

module.exports = dashboardPaths;
