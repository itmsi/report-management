const info = {
  description: 'Report Management SSO Client API - Made with ❤ by <a href="https://github.com/abdulfalaq5" target="_blank">@abdulfalaq5.</a>',
  version: '1.0.0',
  title: 'Report Management SSO Client API Documentation',
  contact: {
    email: ''
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  }
}

const servers = [
  {
    url: '/api/v1/',
    description: 'Development server'
  },
  {
    url: 'https://',
    description: 'Gateway server'
  }
]

// Import schemas
const categoriesSchema = require('./schema/categories');
const powerBiSchema = require('./schema/powerBi');

// Import paths
const categoriesPaths = require('./path/categories');
const powerBiPaths = require('./path/powerBi');

// Combine all schemas
const schemas = {
  ...categoriesSchema,
  ...powerBiSchema
};

// Combine all paths
const paths = {
  ...categoriesPaths,
  ...powerBiPaths
};

const index = {
  openapi: '3.0.0',
  info,
  servers,
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas
  }
}

module.exports = {
  index
}
