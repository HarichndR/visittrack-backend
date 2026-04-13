const cache = require('./cache');

module.exports = {
  client: cache,
  connectRedis: cache.connect,
};
