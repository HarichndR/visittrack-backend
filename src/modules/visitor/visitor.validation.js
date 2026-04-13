const Joi = require('joi');

const createVisitor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    eventId: Joi.string().required(),
    avatarUrl: Joi.string().allow(''),
    ticketType: Joi.string().valid('Standard', 'VIP', 'VVIP', 'Exhibitor', 'Organizer'),
    profession: Joi.string().allow(''),
    interests: Joi.array().items(Joi.string().valid('Tech', 'Business', 'Finance', 'Manufacturing', 'Textile', 'Healthcare', 'AI', 'Marketing')),
  }),
};

const bulkUpload = {
  body: Joi.object().keys({
    eventId: Joi.string().required(),
  }),
};

const getVisitor = {
  params: Joi.object().keys({
    visitorId: Joi.string().required(),
  }),
};

const updateVisitor = {
  params: Joi.object().keys({
    visitorId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string(),
      status: Joi.string().valid('PENDING', 'CHECKED_IN', 'CHECKED_OUT'),
      avatarUrl: Joi.string().allow(''),
      ticketType: Joi.string().valid('Standard', 'VIP', 'VVIP', 'Exhibitor', 'Organizer'),
      profession: Joi.string().allow(''),
      interests: Joi.array().items(Joi.string().valid('Tech', 'Business', 'Finance', 'Manufacturing', 'Textile', 'Healthcare', 'AI', 'Marketing')),
    })
    .min(1),
};

module.exports = {
  createVisitor,
  bulkUpload,
  getVisitor,
  updateVisitor,
};
