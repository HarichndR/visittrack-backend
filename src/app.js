const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const config = require('./config/env');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const ApiError = require('./utils/customError');
const { authLimiter, apiLimiter } = require('./middleware/rateLimit.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// set security HTTP headers
app.use(helmet());

// limit repeated failed requests to auth endpoints
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1', apiLimiter);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors({
  origin: config.corsOrigin,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// v1 api docs
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// handle error
app.use(errorHandler);

module.exports = app;
