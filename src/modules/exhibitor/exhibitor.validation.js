const Joi = require('joi');

const createExhibitor = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    company: Joi.string().required(),
    stallNumber: Joi.string().required(),
    eventId: Joi.string().required(),
    userId: Joi.string().required(),
    companyBio: Joi.string().allow(''),
    digitalAssets: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
    })),
    staff: Joi.array().items(Joi.string()),
  }),
};

const getExhibitor = {
  params: Joi.object().keys({
    exhibitorId: Joi.string().required(),
  }),
};

const updateExhibitor = {
  params: Joi.object().keys({
    exhibitorId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      company: Joi.string(),
      stallNumber: Joi.string(),
      status: Joi.string().valid('ACTIVE', 'INACTIVE'),
      companyBio: Joi.string().allow(''),
      digitalAssets: Joi.array().items(Joi.object().keys({
        name: Joi.string().required(),
        url: Joi.string().required(),
      })),
      staff: Joi.array().items(Joi.string()),
    })
    .min(1),
};

const deleteExhibitor = {
  params: Joi.object().keys({
    exhibitorId: Joi.string().required(),
  }),
};

module.exports = {
  createExhibitor,
  getExhibitor,
  updateExhibitor,
  deleteExhibitor,
};
