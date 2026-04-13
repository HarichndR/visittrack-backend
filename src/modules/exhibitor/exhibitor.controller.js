const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const exhibitorService = require('./exhibitor.service');
const ApiError = require('../../utils/customError');

const createExhibitor = asyncHandler(async (req, res) => {
  const exhibitor = await exhibitorService.createExhibitor(req.body);
  res.status(201).send(new ApiResponse(201, exhibitor, 'Exhibitor registered successfully'));
});

const getExhibitors = asyncHandler(async (req, res) => {
  const { eventId, page, limit } = req.query;
  const filter = eventId ? { eventId } : {};
  
  const result = await exhibitorService.queryExhibitors(filter, { page, limit });
  res.send(new ApiResponse(200, result, 'Exhibitors retrieved successfully'));
});

const getExhibitor = asyncHandler(async (req, res) => {
  const exhibitor = await exhibitorService.getExhibitorById(req.params.exhibitorId);
  if (!exhibitor) {
    throw new ApiError(404, 'Exhibitor not found');
  }
  res.send(new ApiResponse(200, exhibitor, 'Exhibitor retrieved successfully'));
});

const updateExhibitor = asyncHandler(async (req, res) => {
  const exhibitor = await exhibitorService.updateExhibitorById(req.params.exhibitorId, req.body);
  res.send(new ApiResponse(200, exhibitor, 'Exhibitor updated successfully'));
});

const deleteExhibitor = asyncHandler(async (req, res) => {
  await exhibitorService.deleteExhibitorById(req.params.exhibitorId);
  res.status(204).send(new ApiResponse(204, null, 'Exhibitor deleted successfully'));
});

const getMyExhibitor = asyncHandler(async (req, res) => {
  const exhibitor = await exhibitorService.getExhibitorByUserId(req.user._id);
  if (!exhibitor) {
    throw new ApiError(404, 'Exhibitor booth not found');
  }
  res.send(new ApiResponse(200, exhibitor, 'Booth data retrieved successfully'));
});

module.exports = {
  createExhibitor,
  getExhibitors,
  getExhibitor,
  getMyExhibitor,
  updateExhibitor,
  deleteExhibitor,
};
