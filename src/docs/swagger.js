const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config/env');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VisiTrack API Documentation',
    version: '1.0.0',
    description: 'Interactive OpenAPI documentation for the VisiTrack Event & Visitor Management Platform.',
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['src/modules/**/*.routes.js', 'src/modules/**/*.model.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
