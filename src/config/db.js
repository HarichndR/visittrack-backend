const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger'); // I'll create this next

const connectDB = async (retryCount = 5) => {
    try {
        const conn = await mongoose.connect(config.mongoose.url, config.mongoose.options);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        if (retryCount > 0) {
            logger.info(`Retrying connection in 5 seconds... (${retryCount} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectDB(retryCount - 1);
        }
        process.exit(1);
    }
};

module.exports = connectDB;
