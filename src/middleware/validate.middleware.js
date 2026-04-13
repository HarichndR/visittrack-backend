const Joi = require('joi');
const ApiError = require('../utils/customError');
const validator = require('validator');

const sanitize = (data) => {
  if (typeof data === 'string') {
    return validator.escape(data.trim());
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      // NoSQL Injection Protection: Prevent keys starting with $
      if (!key.startsWith('$')) {
        sanitized[key] = sanitize(data[key]);
      }
    }
    return sanitized;
  }
  return data;
};

const validate = (schema) => (req, res, next) => {
  const object = {};
  Object.keys(schema).forEach((key) => {
    if (req[key] && schema[key]) {
      object[key] = sanitize(req[key]);
    }
  });

  const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
