const Joi = require('joi');

const createOrganization = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    bio: Joi.string().allow(''),
    logoUrl: Joi.string().allow(''),
    website: Joi.string().allow(''),
  }),
};

const updateOrganization = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    bio: Joi.string().allow(''),
    logoUrl: Joi.string().allow(''),
    website: Joi.string().allow(''),
    isActive: Joi.boolean(),
  }),
};

module.exports = {
  createOrganization,
  updateOrganization,
};
