const httpStatus = require('http-status');
const catchAsync = require('../../utils/asyncHandler');
const stallService = require('./stall.service');
const ApiResponse = require('../../utils/apiResponse');

const requestStall = catchAsync(async (req, res) => {
  const { eventId, companyName, notes } = req.body;
  const result = await stallService.requestStall(req.user._id, eventId, companyName, notes);
  res.status(httpStatus.CREATED).send(new ApiResponse(httpStatus.CREATED, result, 'Stall request submitted successfully'));
});

const getMyBookings = catchAsync(async (req, res) => {
  const result = await stallService.getExhibitorBookings(req.user._id);
  res.send(new ApiResponse(httpStatus.OK, result, 'Exhibitor bookings retrieved'));
});

const getEventBookings = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const result = await stallService.getEventStallBookings(eventId);
  res.send(new ApiResponse(httpStatus.OK, result, 'Event stall bookings retrieved'));
});

const approveStall = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { stallId } = req.body;
  const result = await stallService.approveStall(bookingId, stallId, req.user._id);
  res.send(new ApiResponse(httpStatus.OK, result, 'Stall approved and assigned'));
});

const manualAddStall = catchAsync(async (req, res) => {
  const { eventId, exhibitorEmail, stallId, companyName } = req.body;
  const result = await stallService.manualAddStall(req.user._id, eventId, exhibitorEmail, stallId, companyName);
  res.status(httpStatus.CREATED).send(new ApiResponse(httpStatus.CREATED, result, 'Stall added manually'));
});

module.exports = {
  requestStall,
  getMyBookings,
  getEventBookings,
  approveStall,
  manualAddStall
};
