const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DMS API Documentation',
    version: '1.0.0',
    description: 'This API documentation is part of a bachelor thesis project for a Document Management System (DMS). It details the endpoints available for interaction with the DMS.',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
    termsOfService: 'http://example.com/terms/',
  },
  servers: [
    {
      url: 'https://localhost:8080/DMSSystemAPI',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './router.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = swaggerSpec;
