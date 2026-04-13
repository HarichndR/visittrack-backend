const formService = require('./form.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/apiResponse');
const ApiError = require('../../utils/customError');

const createForm = asyncHandler(async (req, res) => {
  const form = await formService.createForm(req.body);
  res.status(201).send(new ApiResponse(201, form, 'Form created successfully'));
});

const getFormByEvent = asyncHandler(async (req, res) => {
  const form = await formService.getFormByEventId(req.params.eventId);
  if (!form) {
    throw new ApiError(404, 'No active form found for this event');
  }
  res.send(new ApiResponse(200, form, 'Form retrieved successfully'));
});

const updateForm = asyncHandler(async (req, res) => {
  const form = await formService.updateFormById(req.params.formId, req.body);
  res.send(new ApiResponse(200, form, 'Form updated successfully'));
});

const deleteForm = asyncHandler(async (req, res) => {
  await formService.deleteFormById(req.params.formId);
  res.send(new ApiResponse(200, null, 'Form deleted successfully'));
});

const createFormFromTemplate = asyncHandler(async (req, res) => {
  const { templateId, eventId } = req.body;
  if (!templateId || !eventId) {
    throw new ApiError(400, 'templateId and eventId are required');
  }
  const form = await formService.createFormFromTemplate(templateId, eventId);
  res.status(201).send(new ApiResponse(201, form, 'Form created from template successfully'));
});

module.exports = {
  createForm,
  createFormFromTemplate,
  getFormByEvent,
  updateForm,
  deleteForm,
};
