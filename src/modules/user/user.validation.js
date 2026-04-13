const Joi = require('joi');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required(),
    role: Joi.string().required().valid('ADMIN', 'ORGANIZER', 'STAFF', 'EXHIBITOR', 'VISITOR'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().min(8),
      name: Joi.string(),
      profession: Joi.string().allow(''),
      interests: Joi.array().items(Joi.string()),
    })
    .min(1),
};

const updateProfile = {
  body: Joi.object()
    .keys({
      name: Joi.string(),
      profession: Joi.string().allow(''),
      interests: Joi.array().items(Joi.string()),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const submitOrganizerRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    businessName: Joi.string().required(),
    phone: Joi.string().required(),
    website: Joi.string().allow('', null),
    description: Joi.string().required(),
  }),
};

const approveOrganizerRequest = {
  params: Joi.object().keys({
    requestId: Joi.string().required().custom((value, helpers) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/)) {
        return helpers.message('"requestId" must be a valid Mongo ObjectId');
      }
      return value;
    }),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updateProfile,
  deleteUser,
  submitOrganizerRequest,
  approveOrganizerRequest,
};
