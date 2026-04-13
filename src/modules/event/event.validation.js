const Joi = require('joi');

const createEvent = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().greater(Joi.ref('startDate')),
    location: Joi.string().required(),
    host: Joi.string().allow(''),
    banner: Joi.string().allow(''),
  }),
};

const getEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().required(), // Should be objectId ideally
  }),
};

const updateEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      location: Joi.string(),
      host: Joi.string().allow(''),
      banner: Joi.string().allow(''),
    })
    .min(1),
};

const deleteEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

module.exports = {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
};
