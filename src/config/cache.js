const logger = require('../utils/logger');

/**
 * Simple in-memory cache system to replace Redis
 * Provides identical basic interface for easy swap-back if needed later.
 */

const storage = new Map();

const cache = {
  get: async (key) => {
    const entry = storage.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      storage.delete(key);
      return null;
    }
    return entry.value;
  },
  set: async (key, value, options = {}) => {
    const entry = {
      value,
      createdAt: Date.now(),
      expiresAt: options.EX ? Date.now() + options.EX * 1000 : null,
    };
    storage.set(key, entry);
  },
  del: async (key) => {
    return storage.delete(key);
  },
  /**
   * Cron-like cleanup to purge any expired leftover items
   */
  cleanup: async () => {
    const now = Date.now();
    let count = 0;
    let iterations = 0;
    for (const [key, entry] of storage.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        storage.delete(key);
        count++;
      }
      
      iterations++;
      if (iterations % 1000 === 0) {
        await new Promise(setImmediate);
      }
    }
    if (count > 0) {
      logger.info(`Cache Cron: Cleared ${count} expired items`);
    }
  },
  connect: async () => {
    logger.info('In-memory Cache Initialized');
    
    // Start periodic cleanup cron (every 2 minutes for smoother purging)
    setInterval(() => {
      cache.cleanup().catch(err => logger.error(`Cache cleanup error: ${err.message}`));
    }, 2 * 60 * 1000);

    return true;
  },
  on: (event, callback) => {
    if (event === 'connect') callback();
  }
};

module.exports = cache;
