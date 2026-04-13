const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const cache = require('./config/cache');
const logger = require('./utils/logger');

let server;

// Connect to Database
connectDB().then(() => {
    // Initialize In-memory Cache
    cache.connect().catch(err => logger.error(`Cache startup error: ${err.message}`));
    
    server = app.listen(config.port, () => {
        logger.info(`VisiTrack Server running on port ${config.port}`);
    });
});

const exitHandler = (options = { exit: false }) => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      if (options.exit) process.exit(1);
    });
  } else if (options.exit) {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler({ exit: true });
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(() => {
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
