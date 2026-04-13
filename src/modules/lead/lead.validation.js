const Joi = require('joi');

const createLead = {
  body: Joi.object().keys({
    visitorId: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"visitorId" must be a valid Mongo ObjectId');
      }
      return value;
    }),
    eventId: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"eventId" must be a valid Mongo ObjectId');
      }
      return value;
    }),
    notes: Joi.string().allow('', null),
    rating: Joi.number().integer().min(1).max(5),
    status: Joi.string().valid('HOT', 'WARM', 'COLD').default('WARM'),
  }),
};

const getLeads = {
  query: Joi.object().keys({
    exhibitorId: Joi.string(),
    eventId: Joi.string(),
    status: Joi.string().valid('HOT', 'WARM', 'COLD'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLead = {
  params: Joi.object().keys({
    leadId: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"leadId" must be a valid Mongo ObjectId');
      }
      return value;
    }),
  }),
};

const deleteLead = {
  params: Joi.object().keys({
    leadId: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"leadId" must be a valid Mongo ObjectId');
      }
      return value;
    }),
  }),
};

module.exports = {
  createLead,
  getLeads,
  getLead,
  deleteLead,
};
