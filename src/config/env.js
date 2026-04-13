const joi = require('joi');
require('dotenv').config();

const envSchema = joi.object({
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  PORT: joi.number().default(5001),
  MONGO_URI: joi.string().required().description('MongoDB connection string'),
  JWT_SECRET: joi.string().required().description('JWT Access Secret'),
  JWT_REFRESH_SECRET: joi.string().required().description('JWT Refresh Secret'),
  REDIS_URL: joi.string().required().description('Redis connection string'),
  CORS_ORIGIN: joi.string().default('http://localhost:3000'),
}).unknown().required();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGO_URI,
    options: {},
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpirationMinutes: 30,
    refreshExpirationDays: 7,
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  corsOrigin: envVars.CORS_ORIGIN,
};
