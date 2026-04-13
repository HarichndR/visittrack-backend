const FormTemplate = require('./formTemplate.model');
const Form = require('./form.model');
const ApiError = require('../../utils/customError');

/**
 * Create a reusable template from an existing event form
 * @param {ObjectId} formId 
 * @param {string} name 
 * @param {string} description 
 * @returns {Promise<FormTemplate>}
 */
const createTemplateFromForm = async (formId, name, description) => {
  const form = await Form.findById(formId);
  if (!form) {
    throw new ApiError(404, 'Event form not found');
  }

  return FormTemplate.create({
    name,
    description: description || form.description,
    steps: form.steps,
    isDefault: false,
  });
};

/**
 * Get all available form templates
 * @returns {Promise<FormTemplate[]>}
 */
const getTemplates = async () => {
  return FormTemplate.find().sort({ isDefault: -1, createdAt: -1 });
};

const getTemplateById = async (id) => {
  const template = await FormTemplate.findById(id);
  if (!template) {
    throw new ApiError(404, 'Template not found');
  }
  return template;
};

/**
 * Create a form template
 * @param {Object} templateBody 
 * @returns {Promise<FormTemplate>}
 */
const createTemplate = async (templateBody) => {
  return FormTemplate.create(templateBody);
};

/**
 * Update form template by id
 * @param {ObjectId} id 
 * @param {Object} updateBody 
 * @returns {Promise<FormTemplate>}
 */
const updateTemplateById = async (id, updateBody) => {
  const template = await getTemplateById(id);
  if (!template) {
    throw new ApiError(404, 'Template not found');
  }
  Object.assign(template, updateBody);
  await template.save();
  return template;
};

/**
 * Delete form template by id
 * @param {ObjectId} id 
 * @returns {Promise<FormTemplate>}
 */
const deleteTemplateById = async (id) => {
  const template = await getTemplateById(id);
  if (!template) {
    throw new ApiError(404, 'Template not found');
  }
  await template.deleteOne();
  return template;
};

module.exports = {
  createTemplateFromForm,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplateById,
  deleteTemplateById,
};
