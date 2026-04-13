const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required(),
    role: Joi.string().valid('ADMIN', 'ORGANIZER', 'STAFF', 'EXHIBITOR', 'VISITOR'),
    organizationName: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    website: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const refreshToken = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  refreshToken,
};
