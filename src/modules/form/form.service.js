const FormTemplate = require('./formTemplate.model');
const Form = require('./form.model');
const ApiError = require('../../utils/customError');

/**
 * Create a new dynamic form for an event from a template
 * @param {ObjectId} templateId 
 * @param {ObjectId} eventId 
 * @returns {Promise<Form>}
 */
const createFormFromTemplate = async (templateId, eventId) => {
  const template = await FormTemplate.findById(templateId);
  if (!template) {
    throw new ApiError(404, 'Template not found');
  }

  // Check if form already exists for this event
  const existingForm = await Form.findOne({ eventId });
  if (existingForm) {
    throw new ApiError(400, 'Form already exists for this event. Please update the existing form.');
  }

  return Form.create({
    eventId,
    title: template.name,
    description: template.description,
    steps: template.steps,
    isActive: true,
  });
};

/**
 * Create a new dynamic form for an event
 * @param {Object} formBody 
 * @returns {Promise<Form>}
 */
const createForm = async (formBody) => {
  return Form.create(formBody);
};

/**
 * Get form by eventId
 * @param {ObjectId} eventId 
 * @returns {Promise<Form>}
 */
const getFormByEventId = async (eventId) => {
  return Form.findOne({ eventId, isActive: true });
};

/**
 * Update form by id
 * @param {ObjectId} formId 
 * @param {Object} updateBody 
 * @returns {Promise<Form>}
 */
const updateFormById = async (formId, updateBody) => {
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, 'Form not found');
  }
  Object.assign(form, updateBody);
  await form.save();
  return form;
};

/**
 * Delete form by id (Soft delete/Deactivate)
 * @param {ObjectId} formId 
 * @returns {Promise<Form>}
 */
const deleteFormById = async (formId) => {
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, 'Form not found');
  }
  form.isActive = false;
  await form.save();
  return form;
};

module.exports = {
  createForm,
  getFormByEventId,
  updateFormById,
  deleteFormById,
};
