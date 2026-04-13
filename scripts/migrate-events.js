const mongoose = require('mongoose');
const config = require('../src/config/env');
const logger = require('../src/config/logger');
const Event = require('../src/modules/event/event.model');

const migrateEvents = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB for migration');

    const defaultHost = 'VisiTrack Events';
    const defaultBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';

    const result = await Event.updateMany(
      { $or: [{ host: { $exists: false } }, { banner: { $exists: false } }] },
      {
        $set: {
          host: defaultHost,
          banner: defaultBanner
        }
      }
    );

    logger.info(`Migration complete. Updated ${result.modifiedCount} events.`);
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateEvents();
