const formTemplateService = require('./formTemplate.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/customError');

const createTemplateFromForm = asyncHandler(async (req, res) => {
  const { formId, name, description } = req.body;
  if (!formId || !name) {
    throw new ApiError(400, 'formId and name are required');
  }
  const template = await formTemplateService.createTemplateFromForm(formId, name, description);
  res.status(201).send(new ApiResponse(201, template, 'Template created from form successfully'));
});

const getTemplates = asyncHandler(async (req, res) => {
  const templates = await formTemplateService.getTemplates();
  res.send(new ApiResponse(200, templates, 'Templates retrieved successfully'));
});

const getTemplateById = asyncHandler(async (req, res) => {
  const template = await formTemplateService.getTemplateById(req.params.id);
  res.send(new ApiResponse(200, template, 'Template retrieved successfully'));
});

const createTemplate = asyncHandler(async (req, res) => {
  const template = await formTemplateService.createTemplate(req.body);
  res.status(201).send(new ApiResponse(201, template, 'Template created successfully'));
});

const updateTemplate = asyncHandler(async (req, res) => {
  const template = await formTemplateService.updateTemplateById(req.params.id, req.body);
  res.send(new ApiResponse(200, template, 'Template updated successfully'));
});

const deleteTemplate = asyncHandler(async (req, res) => {
  await formTemplateService.deleteTemplateById(req.params.id);
  res.send(new ApiResponse(200, null, 'Template deleted successfully'));
});

module.exports = {
  createTemplate,
  createTemplateFromForm,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
